#!/usr/bin/env python3
"""Generate visual-novel sprites with an image model (Gemini by default).

Style comes from the reference images in tools/sprites/references/ (local only,
gitignored). For each character a neutral base sprite is generated first; every
expression is then made by editing that base, so the character stays consistent.

Usage (key in API_KEY, never commit it):
  python3 tools/sprites/generate_sprites.py                 # all characters
  python3 tools/sprites/generate_sprites.py light_kagami    # one character
  python3 tools/sprites/generate_sprites.py --model gemini-3-pro-image-preview light_kagami
  python3 tools/sprites/generate_sprites.py --keep-base light_kagami   # redo expressions only
  python3 tools/sprites/generate_sprites.py --keep-base --only deadpan,smug light_kagami

By default requests go to an OpenAI-compatible relay (API_BASE_URL, default
https://aiapi.world/v1). Pass --google to call Google's Gemini API directly
with an AIza... key instead.

Output: public/sprites/<id>/<expression>.png (transparent) and sheet.png.
"""

import argparse
import base64
import io
import json
import mimetypes
import os
import re
import sys
import urllib.error
import urllib.request
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
REF_DIR = HERE / "references"
OUT_DIR = ROOT / "public" / "sprites"
API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
DEFAULT_BASE_URL = "https://aiapi.world/v1"
DATA_URL = re.compile(r"data:(image/[\w.+-]+);base64,([A-Za-z0-9+/=]+)")
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def encode(path):
    return mimetypes.guess_type(path.name)[0] or "image/png", base64.b64encode(path.read_bytes()).decode()


def load_references():
    refs = sorted(p for p in REF_DIR.glob("*") if p.suffix.lower() in IMAGE_EXTS)
    return refs, [encode(p) for p in refs]


def base_prompt(spec, char):
    return "\n".join([
        "The attached images are STYLE REFERENCES ONLY. Match their line quality, shading method, colour palette, "
        "proportions and overall rendering as closely as possible. Do not copy their characters, outfits or backgrounds.",
        spec["style_guard"],
        spec["sprite_layout"],
        f"Character: {char['description']}",
        f"Expression: {char['expressions'][0]}",
    ])


def expression_prompt(spec, char, expression):
    return "\n".join([
        "The FIRST attached image is the character sprite to edit. The other images are style references.",
        "Redraw the exact same character sprite: identical character, outfit, framing, scale, camera angle, lighting, "
        "colours and rendering style, same flat pure-white background. Do not add, remove or restyle any clothing or accessory "
        "(no tie, jacket stays open, earbuds stay).",
        f"Change ONLY the facial expression and, if described, the hand gesture, to: {expression}",
        "Make the expression strong and readable at a glance, the way a visual novel needs it.",
        spec["style_guard"],
        "No text, no labels, no watermark.",
    ])


def post_json(url, headers, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", **headers})
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        sys.exit(f"API error {e.code}: {e.read().decode()[:500]}")


def call_relay(base_url, model, key, prompt, images):
    """OpenAI-compatible chat/completions; relays return the image as a data URL in the message."""
    content = [{"type": "image_url", "image_url": {"url": f"data:{m};base64,{d}"}} for m, d in images]
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


def call_google(model, key, prompt, images):
    parts = [{"inline_data": {"mime_type": m, "data": d}} for m, d in images]
    body = {
        "contents": [{"role": "user", "parts": [*parts, {"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "3:4"}},
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
    return defringe(img)


def defringe(img, band=5, light=200):
    """Remove the white halo/outline left around the cutout, then feather the edge."""
    alpha = img.getchannel("A")
    near_edge = alpha.point(lambda a: 255 if a < 128 else 0).filter(ImageFilter.MaxFilter(band * 2 + 1))
    gray = img.convert("L")
    halo = Image.eval(gray, lambda v: 255 if v >= light else 0)
    cut = Image.composite(Image.new("L", img.size, 0), alpha, Image.composite(halo, Image.new("L", img.size, 0), near_edge))
    img.putalpha(cut.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6)))
    return img


def save_sprite(raw, path):
    img = Image.open(io.BytesIO(raw))
    img.convert("RGB").save(path.with_suffix(".raw.png"))
    remove_white_bg(img).save(path)


def build_sheet(paths, out):
    """Lay the transparent sprites side by side at a common height."""
    sprites = [Image.open(p) for p in paths]
    h = min(s.height for s in sprites)
    sprites = [s.resize((round(s.width * h / s.height), h)) for s in sprites]
    sheet = Image.new("RGBA", (sum(s.width for s in sprites), h), (0, 0, 0, 0))
    x = 0
    for s in sprites:
        sheet.paste(s, (x, 0))
        x += s.width
    sheet.save(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*", help="character ids from characters.json (default: all)")
    ap.add_argument("--model", default=os.environ.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image"))
    ap.add_argument("--google", action="store_true", help="call Google's Gemini API directly")
    ap.add_argument("--keep-base", action="store_true", help="reuse an existing base sprite")
    ap.add_argument("--only", default="", help="comma-separated expressions to (re)generate")
    args = ap.parse_args()

    key = os.environ.get("API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("Set API_KEY first.")
    base_url = os.environ.get("API_BASE_URL", DEFAULT_BASE_URL)
    refs, ref_images = load_references()
    if not refs:
        sys.exit(f"Add style reference images to {REF_DIR} first (no references = generic style).")
    print(f"Using {len(refs)} reference image(s): {', '.join(p.name for p in refs)}")

    def generate(prompt, images):
        if args.google:
            return call_google(args.model, key, prompt, images)
        return call_relay(base_url, args.model, key, prompt, images)

    spec = json.loads((HERE / "characters.json").read_text())
    chars = [c for c in spec["characters"] if not args.ids or c["id"] in args.ids]
    if not chars:
        sys.exit("No matching character ids.")

    for char in chars:
        out = OUT_DIR / char["id"]
        out.mkdir(parents=True, exist_ok=True)
        labels = [e.split(":")[0].strip().replace(" ", "_") for e in char["expressions"]]
        base = out / f"{labels[0]}.png"
        if not (args.keep_base and base.exists()):
            print(f"{char['name']}: base sprite ({labels[0]})")
            save_sprite(generate(base_prompt(spec, char), ref_images), base)
        anchor = encode(base.with_suffix(".raw.png"))
        only = set(filter(None, args.only.split(",")))
        for label, expression in zip(labels[1:], char["expressions"][1:]):
            if only and label not in only:
                continue
            print(f"{char['name']}: {label}")
            save_sprite(generate(expression_prompt(spec, char, expression), [anchor, *ref_images]), out / f"{label}.png")
        for raw in out.glob("*.raw.png"):
            if raw != base.with_suffix(".raw.png"):
                raw.unlink()
        build_sheet([out / f"{label}.png" for label in labels if (out / f"{label}.png").exists()], out / "sheet.png")
        print(f"  -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
