#!/usr/bin/env python3
"""Generate visual-novel sprite sheets with the Gemini image API.

Style comes from the reference images in tools/sprites/references/ (e.g. pins
saved from Pinterest). They are sent with every request so the output follows
them instead of a generic default look.

Usage (key in API_KEY, never commit it):
  python3 tools/sprites/generate_sprites.py                 # all characters
  python3 tools/sprites/generate_sprites.py light_kagami    # one character
  python3 tools/sprites/generate_sprites.py --model <image-model> light_kagami

By default requests go to an OpenAI-compatible relay (API_BASE_URL, default
https://aiapi.world/v1). Pass --google to call Google's Gemini API directly
with an AIza... key instead.

Output: public/sprites/<id>/sheet.png plus one transparent PNG per expression.
"""

import argparse
import base64
import json
import mimetypes
import os
import re
import sys
import urllib.error
import urllib.request
from collections import deque
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
REF_DIR = HERE / "references"
OUT_DIR = ROOT / "public" / "sprites"
API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
DEFAULT_BASE_URL = "https://aiapi.world/v1"
DATA_URL = re.compile(r"data:(image/[\w.+-]+);base64,([A-Za-z0-9+/=]+)")
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def load_references():
    refs = sorted(p for p in REF_DIR.glob("*") if p.suffix.lower() in IMAGE_EXTS)
    images = []
    for p in refs:
        mime = mimetypes.guess_type(p.name)[0] or "image/png"
        images.append((mime, base64.b64encode(p.read_bytes()).decode()))
    return refs, images


def build_prompt(spec, char):
    labels = [e.split(":")[0] for e in char["expressions"]]
    lines = [
        "The attached images are STYLE REFERENCES ONLY. Match their line quality, shading method, "
        "colour palette, proportions and overall rendering as closely as possible. Do not copy their characters.",
        spec["style_guard"],
        spec["sheet_layout"].format(count=len(labels)),
        f"Character: {char['description']}",
        "Expressions, left to right:",
        *[f"{i + 1}. {e}" for i, e in enumerate(char["expressions"])],
    ]
    return "\n".join(lines), labels


def post_json(url, headers, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", **headers})
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        sys.exit(f"API error {e.code}: {e.read().decode()[:500]}")


def call_relay(base_url, model, key, prompt, ref_images):
    """OpenAI-compatible chat/completions; relays return the image as a data URL in the message."""
    content = [{"type": "image_url", "image_url": {"url": f"data:{m};base64,{d}"}} for m, d in ref_images]
    content.append({"type": "text", "text": prompt})
    data = post_json(
        base_url.rstrip("/") + "/chat/completions",
        {"Authorization": f"Bearer {key}"},
        {"model": model, "messages": [{"role": "user", "content": content}], "modalities": ["image", "text"]},
    )
    match = DATA_URL.search(json.dumps(data.get("choices", [])).replace("\\/", "/"))
    if not match:
        sys.exit(f"No image returned (is '{model}' an image model?): {json.dumps(data)[:500]}")
    return base64.b64decode(match.group(2))


def call_google(model, key, prompt, ref_images):
    ref_parts = [{"inline_data": {"mime_type": m, "data": d}} for m, d in ref_images]
    body = {
        "contents": [{"role": "user", "parts": [*ref_parts, {"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "21:9"}},
    }
    data = post_json(API.format(model=model), {"x-goog-api-key": key}, body)
    for cand in data.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            blob = part.get("inlineData") or part.get("inline_data")
            if blob:
                return base64.b64decode(blob["data"])
    sys.exit(f"No image returned: {json.dumps(data)[:500]}")


def remove_white_bg(img, tol=18):
    """Flood-fill near-white pixels from the edges to transparency (keeps white inside the character)."""
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    seen = set()
    queue = deque([(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)])
    while queue:
        x, y = queue.popleft()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h):
            continue
        seen.add((x, y))
        r, g, b, _ = px[x, y]
        if min(r, g, b) < 255 - tol:
            continue
        px[x, y] = (255, 255, 255, 0)
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return img


def slice_sheet(sheet_path, labels, out):
    """Cut the sheet at the empty columns between sprites; fall back to equal-width cells."""
    img = remove_white_bg(Image.open(sheet_path))
    w, h = img.size
    alpha = img.getchannel("A")
    filled = [any(alpha.getpixel((x, y)) for y in range(0, h, 4)) for x in range(w)]
    spans, start = [], None
    for x, f in enumerate(filled + [False]):
        if f and start is None:
            start = x
        elif not f and start is not None:
            if x - start > w // (len(labels) * 4):
                spans.append((start, x))
            start = None
    if len(spans) != len(labels):
        cell = w / len(labels)
        spans = [(round(i * cell), round((i + 1) * cell)) for i in range(len(labels))]
        print(f"  note: found irregular gaps, used equal cells for {out.name}")
    for (x0, x1), label in zip(spans, labels):
        crop = img.crop((x0, 0, x1, h))
        crop = crop.crop(crop.getbbox() or (0, 0, crop.width, crop.height))
        crop.save(out / f"{label}.png")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*", help="character ids from characters.json (default: all)")
    ap.add_argument("--model", default=os.environ.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image"))
    ap.add_argument("--google", action="store_true", help="call Google's Gemini API directly")
    ap.add_argument("--no-slice", action="store_true")
    args = ap.parse_args()

    key = os.environ.get("API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("Set API_KEY first.")
    base_url = os.environ.get("API_BASE_URL", DEFAULT_BASE_URL)
    refs, ref_images = load_references()
    if not refs:
        sys.exit(f"Add style reference images to {REF_DIR} first (no references = generic style).")
    print(f"Using {len(refs)} reference image(s): {', '.join(p.name for p in refs)}")

    spec = json.loads((HERE / "characters.json").read_text())
    chars = [c for c in spec["characters"] if not args.ids or c["id"] in args.ids]
    if not chars:
        sys.exit("No matching character ids.")

    for char in chars:
        print(f"Generating {char['name']} ...")
        prompt, labels = build_prompt(spec, char)
        out = OUT_DIR / char["id"]
        out.mkdir(parents=True, exist_ok=True)
        sheet = out / "sheet.png"
        if args.google:
            image = call_google(args.model, key, prompt, ref_images)
        else:
            image = call_relay(base_url, args.model, key, prompt, ref_images)
        sheet.write_bytes(image)
        (out / "prompt.txt").write_text(prompt)
        if not args.no_slice:
            slice_sheet(sheet, labels, out)
        print(f"  -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
