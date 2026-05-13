import { useEffect, useMemo, useRef, useState } from "react";

let actx = null;
function getACtx() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!actx && AudioContext) actx = new AudioContext();
  return actx;
}
function tone(f, t = "sine", d = 0.15, v = 0.1, dl = 0) {
  try {
    const c = getACtx();
    if (!c) return;
    const g = c.createGain();
    const o = c.createOscillator();
    o.type = t;
    o.frequency.value = f;
    g.gain.setValueAtTime(0.001, c.currentTime + dl);
    g.gain.linearRampToValueAtTime(v, c.currentTime + dl + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dl + d);
    o.connect(g);
    g.connect(c.destination);
    o.start(c.currentTime + dl);
    o.stop(c.currentTime + dl + d + 0.05);
  } catch {
    // Audio is optional; browsers may block it before first user gesture.
  }
}
function noise(d = 0.1, v = 0.1, ff = 400) {
  try {
    const c = getACtx();
    if (!c) return;
    const bs = c.createBufferSource();
    const buf = c.createBuffer(1, c.sampleRate * d, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    bs.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = ff;
    const g = c.createGain();
    g.gain.setValueAtTime(v, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d);
    bs.connect(f);
    f.connect(g);
    g.connect(c.destination);
    bs.start();
  } catch {
    // Optional SFX.
  }
}
const SFX = {
  click: () => tone(520, "square", 0.05, 0.07),
  attack: () => {
    tone(180, "sawtooth", 0.1, 0.14);
    tone(130, "sawtooth", 0.07, 0.1, 0.06);
  },
  hit: () => {
    tone(90, "square", 0.1, 0.18);
    noise(0.05, 0.1, 350);
  },
  guard: () => {
    tone(400, "triangle", 0.12, 0.09);
    tone(500, "triangle", 0.09, 0.07, 0.05);
  },
  reward: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, "triangle", 0.14, 0.11, i * 0.09)),
  spell: () => [350, 440, 550, 660].forEach((f, i) => tone(f, "sine", 0.18, 0.09, i * 0.07)),
  buy: () => {
    tone(660, "triangle", 0.09, 0.11);
    tone(880, "triangle", 0.07, 0.09, 0.05);
  },
  church: () => [300, 400, 500, 600, 500, 400].forEach((f, i) => tone(f, "sine", 0.2, 0.07, i * 0.09)),
  defeat: () => [220, 180, 140, 100].forEach((f, i) => tone(f, "sawtooth", 0.22, 0.11, i * 0.11)),
  warn: () => {
    tone(200, "sawtooth", 0.3, 0.2);
    tone(160, "sawtooth", 0.3, 0.2, 0.15);
  },
  siphon: () => tone(600, "sine", 0.08, 0.12),
  flee: () => {
    tone(300, "sawtooth", 0.1, 0.15);
    tone(200, "sawtooth", 0.12, 0.15, 0.08);
  },
  rankup: () => [400, 500, 600, 800, 1000].forEach((f, i) => tone(f, "triangle", 0.15, 0.12, i * 0.08)),
  roar: () => {
    tone(80, "sawtooth", 0.6, 0.25);
    tone(60, "sawtooth", 0.6, 0.2, 0.1);
    tone(45, "sawtooth", 0.6, 0.15, 0.2);
  },
  lumen: () => [1200, 1500, 1800].forEach((f, i) => tone(f, "sine", 0.4, 0.08, i * 0.1)),
  cry: () => {
    if (Math.random() < 0.5) {
      tone(140, "sawtooth", 0.18, 0.18);
      tone(110, "sawtooth", 0.22, 0.15, 0.05);
      noise(0.18, 0.12, 200);
    } else {
      tone(280, "sawtooth", 0.16, 0.16);
      tone(220, "sawtooth", 0.2, 0.14, 0.04);
      noise(0.15, 0.1, 300);
    }
  },
  victory: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, "triangle", 0.3, 0.13, i * 0.13)),
  spin: () => {
    for (let i = 0; i < 20; i++) tone(400 + i * 30, "square", 0.05, 0.06, i * 0.07);
  },
  jackpot: () => [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(f, "triangle", 0.2, 0.12, i * 0.1)),
  craft: () => {
    tone(440, "triangle", 0.1, 0.1);
    tone(550, "triangle", 0.12, 0.1, 0.08);
  },
  dullCraft: () => {
    tone(170, "sawtooth", 0.08, 0.08);
    noise(0.05, 0.08, 180);
  },
  waveMusic: () => {
    tone(58, "sawtooth", 1.4, 0.08);
    tone(87, "sine", 1.2, 0.05, 0.12);
    tone(116, "triangle", 1.1, 0.035, 0.26);
  },
  bossMusic: (phase = 1) => {
    const root = [196, 220, 247][phase - 1] || 247;
    tone(root / 4, "sine", 1.6, 0.08);
    tone(root / 2, "triangle", 1.3, 0.06, 0.18);
    tone(root, "sine", 1.1, 0.055, 0.42);
    if (phase >= 2) tone(root * 1.5, "triangle", 0.9, 0.05, 0.62);
    if (phase >= 3) tone(root * 2, "sine", 0.8, 0.055, 0.78);
  },
};

const RACES = [
  { id: "human", name: "Human", locked: false, desc: "Versatile. No special advantages.", hpBonus: 0, atkBonus: 0, defBonus: 0, dodge: 5, mpBonus: 0, canSpell: true },
  { id: "equar", name: "Equar", locked: false, desc: "Small, sharp, fast. Merchants and gamblers.", hpBonus: -5, atkBonus: 2, defBonus: 0, dodge: 28, mpBonus: 0, canSpell: true, canGamble: true, canMerchant: true },
  { id: "tetrabrachian", name: "Tetrabrachian", locked: false, desc: "Four-armed and powerfully built. No spellwork.", hpBonus: 15, atkBonus: 3, defBonus: 1, dodge: 5, mpBonus: 0, canSpell: false },
  { id: "lizardman", name: "Lizardman", locked: true, desc: "Locked. Coming later." },
  { id: "tenebrim", name: "Tenebrim", locked: true, unlockVal: 2, desc: "Locked. Clear Doomsday twice.", hpBonus: 25, atkBonus: 5, defBonus: 2, dodge: 5, mpBonus: 0, canSpell: false },
  { id: "devil", name: "Devil", locked: false, desc: "Starts in the Underworld. No churches.", hpBonus: 5, atkBonus: 2, defBonus: 1, dodge: 8, mpBonus: 40, canSpell: true },
  { id: "beastkin", name: "Beastkin", locked: true, unlockVal: 1, desc: "Locked. Clear Doomsday once." },
  { id: "elf", name: "Elf", locked: true, unlockVal: 3, desc: "Locked. Clear Doomsday three times." },
];
const ORIGINS = [
  { id: "traveler", name: "Wandering contractor", desc: "On the road long enough that picking up work was inevitable." },
  { id: "youth", name: "Youth leaving home", desc: "Left to earn money or find independence." },
];
const CLASSES_BASE = [
  { id: "adventurer", name: "Adventurer", org: "Alabastrine Guild", desc: "Earnings scale by rank. Hunter Association closes forever." },
  { id: "hunter", name: "Hunter", org: "Hunter Association", desc: "Better flat pay, no inactivity rules. Guild closes forever." },
];
const CLASS_MERCHANT = { id: "merchant", name: "Merchant", org: "Independent", desc: "Craft and sell items. Equars only." };
const ADV_RANKS = ["Bronze", "Iron", "Silver", "Gold", "Diamond", "Platinum"];
const RANK_THRESHOLDS = [80, 250, 600, 1400, 3000];
const RANK_MULT = [1, 1.15, 1.35, 1.6, 2, 2.5];
const RANK_GRACE = { 0: [5, 10, 15], 1: [7, 14, 21], 2: [10, 20, 30], 3: [14, 28, 42], 4: [20, 40, 60], 5: null };

const MONSTERS = [
  { id: "cur", name: "Mana-touched cur", star: 1, desc: "A lean dog with luminous eyes.", hp: 35, atk: 7, def: 1, reward: { xp: 28, bronze: 6 } },
  { id: "crawler", name: "Tunnel crawler", star: 1, desc: "Flat, six-limbed.", hp: 50, atk: 10, def: 3, reward: { xp: 40, bronze: 9 } },
  { id: "wanderer", name: "Gaunt wanderer", star: 2, desc: "Something that used to be human.", hp: 65, atk: 14, def: 2, reward: { xp: 55, bronze: 14 } },
  { id: "brute", name: "Stone-backed brute", star: 3, desc: "Mineral-fused quadruped.", hp: 100, atk: 19, def: 11, reward: { xp: 90, bronze: 28 } },
  { id: "veilstalker", name: "Veilstalker", star: 3, desc: "Translucent and fast.", hp: 80, atk: 24, def: 5, reward: { xp: 105, bronze: 35 } },
  { id: "mana_horror", name: "Mana horror", star: 4, desc: "Corrupted mana given shape.", hp: 140, atk: 30, def: 8, reward: { xp: 160, bronze: 60 } },
  { id: "deep_stalker", name: "Deep stalker", star: 5, desc: "It should not be on the surface.", hp: 200, atk: 40, def: 15, reward: { xp: 250, bronze: 110 } },
];
const UW_MONSTERS = [
  { id: "uw_fiend", name: "Mana fiend", star: 3, desc: "Aggressive in dense mana.", hp: 110, atk: 22, def: 8, reward: { xp: 80, bronze: 22 } },
  { id: "uw_crusher", name: "Depth crusher", star: 4, desc: "Enormous and fast.", hp: 160, atk: 32, def: 14, reward: { xp: 140, bronze: 48 } },
  { id: "uw_horror", name: "Abyssal horror", star: 5, desc: "Ancient and wrong.", hp: 230, atk: 45, def: 18, reward: { xp: 240, bronze: 95 } },
];
const M_ACT = {
  cur: [{ name: "Lunge bite", dmg: [7, 11] }, { name: "Snarl", dmg: [0, 0], effect: "debuff_atk" }],
  crawler: [{ name: "Claw rake", dmg: [10, 16] }],
  wanderer: [{ name: "Wild claw", dmg: [12, 18] }, { name: "Mana surge", dmg: [16, 22] }],
  brute: [{ name: "Ground slam", dmg: [18, 26] }, { name: "Charge", dmg: [22, 30] }],
  veilstalker: [{ name: "Sudden strike", dmg: [20, 28] }, { name: "Vanish", dmg: [0, 0], effect: "dodge_next" }, { name: "Rend", dmg: [24, 32] }],
  mana_horror: [{ name: "Mana slam", dmg: [26, 36] }, { name: "Drain", dmg: [14, 20], effect: "drain_mp" }, { name: "Surge", dmg: [30, 40] }],
  deep_stalker: [{ name: "Deep rend", dmg: [36, 48] }, { name: "Crush", dmg: [40, 52] }],
  uw_fiend: [{ name: "Mana surge", dmg: [20, 28] }, { name: "Drain", dmg: [14, 22], effect: "drain_mp" }],
  uw_crusher: [{ name: "Crush slam", dmg: [30, 42] }, { name: "Rush", dmg: [34, 46] }],
  uw_horror: [{ name: "Abyss rend", dmg: [42, 56] }, { name: "Surge", dmg: [48, 62] }],
};

const SURFACE_SPELLS = [
  { id: "elem_theory", name: "Elemental theory", prereq: null, progress: 0, learned: false, replaces: null, desc: "The foundation.", combatUse: null },
  { id: "fire_1", name: "Fire Lv.1", prereq: "elem_theory", progress: 0, learned: false, replaces: null, desc: "Heat and flame-pressure.", combatUse: { label: "Fire Lv.1", dmg: [18, 26], mpCost: 14 } },
  { id: "fire_2", name: "Fire Lv.2", prereq: "fire_1", progress: 0, learned: false, replaces: "fire_1", desc: "Greater output.", combatUse: { label: "Fire Lv.2", dmg: [30, 42], mpCost: 22 } },
  { id: "water_1", name: "Water Lv.1", prereq: "elem_theory", progress: 0, learned: false, replaces: null, desc: "Pressurized mana-water.", combatUse: { label: "Water Lv.1", dmg: [14, 20], mpCost: 10 } },
  { id: "water_2", name: "Water Lv.2", prereq: "water_1", progress: 0, learned: false, replaces: "water_1", desc: "Sustained stream.", combatUse: { label: "Water Lv.2", dmg: [24, 34], mpCost: 17 } },
];
const DEVIL_SPELLS = [
  { id: "elem_theory", name: "Elemental theory", prereq: null, progress: 100, learned: true, replaces: null, desc: "Innate.", combatUse: null },
  { id: "fire_1", name: "Fire Lv.1", prereq: "elem_theory", progress: 100, learned: true, replaces: null, desc: "Innate heat.", combatUse: { label: "Fire Lv.1", dmg: [18, 26], mpCost: 10 } },
  { id: "fire_2", name: "Fire Lv.2", prereq: "fire_1", progress: 0, learned: false, replaces: "fire_1", desc: "Intensified.", combatUse: { label: "Fire Lv.2", dmg: [30, 42], mpCost: 16 } },
  { id: "illusion_1", name: "Illusion Lv.1", prereq: "elem_theory", progress: 0, learned: false, replaces: null, desc: "Confuses for 1 turn.", combatUse: { label: "Illusion Lv.1", dmg: [0, 0], mpCost: 12, effect: "confuse", turns: 1 } },
  { id: "illusion_2", name: "Illusion Lv.2", prereq: "illusion_1", progress: 0, learned: false, replaces: "illusion_1", desc: "Stuns for 2 turns.", combatUse: { label: "Illusion Lv.2", dmg: [0, 0], mpCost: 20, effect: "stun", turns: 2 } },
];
const WEAPONS = [
  { id: "fists", name: "Bare hands", atk: 0, price: 0 },
  { id: "knife", name: "Short knife", atk: 4, price: 80 },
  { id: "sword", name: "Iron sword", atk: 10, price: 220 },
  { id: "axe", name: "Hand axe", atk: 14, price: 380 },
  { id: "greatsword", name: "Greatsword", atk: 22, price: 700 },
  { id: "steelsword", name: "Steel longsword", atk: 30, price: 1400 },
  { id: "warhammer", name: "Warhammer", atk: 38, price: 2200 },
  { id: "runed_blade", name: "Runed blade", atk: 48, price: 4500 },
];
const ARMORS = [
  { id: "none", name: "No armor", def: 0, price: 0 },
  { id: "leather", name: "Leather vest", def: 4, price: 120 },
  { id: "chainmail", name: "Chainmail", def: 9, price: 350 },
  { id: "plate", name: "Plate cuirass", def: 16, price: 800 },
  { id: "reinforced", name: "Reinforced plate", def: 24, price: 1700 },
  { id: "crystal", name: "Crystal-laced harness", def: 34, price: 3600 },
  { id: "warden", name: "Warden regalia", def: 48, price: 7000 },
];
const POTIONS = [
  { id: "hp_low", name: "Health Low", stat: "hp", val: 30, price: 25 },
  { id: "hp_med", name: "Health Mid", stat: "hp", val: 70, price: 60 },
  { id: "hp_high", name: "Health High", stat: "hp", val: 150, price: 130 },
  { id: "mp_low", name: "Mana Low", stat: "mp", val: 20, price: 30 },
  { id: "mp_med", name: "Mana Mid", stat: "mp", val: 50, price: 75 },
  { id: "mp_high", name: "Mana High", stat: "mp", val: 120, price: 160 },
  { id: "sta_low", name: "Stamina Low", stat: "stamina", val: 25, price: 20 },
  { id: "sta_med", name: "Stamina Mid", stat: "stamina", val: 60, price: 55 },
  { id: "sta_high", name: "Stamina High", stat: "stamina", val: 140, price: 120 },
];
const TOOLS = [
  { id: "focus", name: "Apprentice focus", stat: "maxMp", val: 15, price: 300, desc: "+15 max MP" },
  { id: "mana_crystal", name: "Mana crystal pendant", stat: "maxMp", val: 35, price: 850, desc: "+35 max MP" },
  { id: "core_focus", name: "Core focus", stat: "maxMp", val: 80, price: 2200, desc: "+80 max MP" },
  { id: "hp_charm", name: "Vitality charm", stat: "maxHp", val: 30, price: 600, desc: "+30 max HP" },
  { id: "hp_amulet", name: "Heartwood amulet", stat: "maxHp", val: 80, price: 1900, desc: "+80 max HP" },
];
const SLEEP = [
  { id: "camp", name: "Camp outdoors", cost: 0, doom: 0.28, hp: 0.45, mp: 0.15, sta: 0.5, spell: 0.7, desc: "Free but rough." },
  { id: "inn", name: "Inn room", cost: 25, doom: 0.16, hp: 1, mp: 0.55, sta: 1, spell: 1 },
  { id: "luxury_inn", name: "Luxury inn", cost: 80, doom: 0.1, hp: 1, mp: 1, sta: 1, spell: 1.2 },
  { id: "rented_house", name: "Rented house", cost: 200, doom: 0.06, hp: 1, mp: 1, sta: 1, spell: 1.4 },
  { id: "owned_house", name: "Owned house", cost: 0, doom: 0.03, hp: 1, mp: 1, sta: 1, spell: 1.6, own: true },
];
const HOUSE_PRICE = 8000;
const SKILLS = [
  { id: "first_blood", name: "First blood", reqType: "kills", reqVal: 3, reqLabel: "Slay 3 monsters", desc: "+2 attack.", effect: "passive_atk", val: 2 },
  { id: "hardened", name: "Hardened", reqType: "nearDeath", reqVal: 3, reqLabel: "Win 3 fights at near-death", desc: "-3 incoming damage.", effect: "passive_def", val: 3 },
  { id: "iron_will", name: "Iron will", reqType: "kills", reqVal: 10, reqLabel: "Slay 10 monsters", desc: "+20 max HP.", effect: "passive_hp", val: 20 },
  { id: "sharp_eye", name: "Sharp eye", reqType: "kills", reqVal: 25, reqLabel: "Slay 25 monsters", desc: "+5% dodge.", effect: "passive_dodge", val: 5 },
  { id: "merchant_blood", name: "Merchant blood", reqType: "earned", reqVal: 500, reqLabel: "Earn 500 Bronze", desc: "Shop prices -5%.", effect: "shop_discount", val: 0.05 },
  { id: "endurance", name: "Endurance", reqType: "earned", reqVal: 1500, reqLabel: "Earn 1500 Bronze", desc: "+25 max stamina.", effect: "passive_sta", val: 25 },
  { id: "combat_focus", name: "Combat focus", reqType: "kills", reqVal: 50, reqLabel: "Slay 50 monsters", desc: "Strike +4 damage.", effect: "strike_bonus", val: 4 },
  { id: "mana_well", name: "Mana well", reqType: "spellsLearned", reqVal: 2, reqLabel: "Learn 2 spells", desc: "+30 max MP.", effect: "passive_mp", val: 30 },
  { id: "battle_scars", name: "Battle scars", reqType: "nearDeath", reqVal: 6, reqLabel: "Win 6 near-death fights", desc: "Heavy attacks +5.", effect: "heavy_bonus", val: 5 },
  { id: "survivor", name: "Survivor", reqType: "days", reqVal: 30, reqLabel: "Survive 30 days", desc: "-5 incoming damage.", effect: "passive_def", val: 5 },
  { id: "hunter_instinct", name: "Hunter instinct", reqType: "kills", reqVal: 100, reqLabel: "Slay 100 monsters", desc: "+6 attack.", effect: "passive_atk", val: 6 },
  { id: "merchant_eye", name: "Merchant eye", reqType: "earned", reqVal: 5000, reqLabel: "Earn 5000 Bronze", desc: "Shop prices -12%.", effect: "shop_discount", val: 0.12 },
];
const PHYS_ATTACKS = [
  { id: "strike", name: "Strike", dmg: [0, 6], desc: "Direct attack." },
  { id: "heavy", name: "Heavy blow", dmg: [8, 16], desc: "20 stamina.", staminaCost: 20 },
];
const TET_ATTACKS = [
  { id: "strike", name: "Strike", dmg: [0, 6], desc: "Single-arm jab." },
  { id: "double_slash", name: "Double slash", dmg: [8, 14], desc: "Two arms. 10 stamina.", staminaCost: 10 },
  { id: "quad_flurry", name: "Quad flurry", dmg: [5, 9], desc: "Four quick hits. 26 stamina.", staminaCost: 26, hits: 4 },
  { id: "power_strike", name: "Four-arm power strike", dmg: [18, 28], desc: "30 stamina. Lower accuracy.", staminaCost: 30, accuracy: 0.74 },
  { id: "crushing_grapple", name: "Crushing grapple", dmg: [12, 20], desc: "Pin and crush. 15 stamina.", staminaCost: 15 },
];
const RACE_ATTACKS = {
  human: [{ id: "riposte", name: "Riposte", dmg: [6, 13], desc: "Counter-trained cut. 12 stamina.", staminaCost: 12 }],
  equar: [{ id: "needle_flurry", name: "Needle flurry", dmg: [3, 7], desc: "Three precise hits. 16 stamina.", staminaCost: 16, hits: 3 }],
  tenebrim: [{ id: "bone_breaker", name: "Bone breaker", dmg: [15, 25], desc: "Heavy wild strike. 24 stamina.", staminaCost: 24 }],
  devil: [{ id: "horn_rush", name: "Horn rush", dmg: [10, 18], desc: "Close-range rush. 18 stamina.", staminaCost: 18 }],
};
const DIFFICULTIES = {
  easy: { name: "Easy", desc: "Lower enemy damage, higher earnings.", enemyAtk: 0.75, enemyHp: 0.85, reward: 1.35, unlocked: true },
  normal: { name: "Normal", desc: "Baseline balance. Future contracts will use two enemies.", enemyAtk: 1, enemyHp: 1, reward: 1, unlocked: true },
  hard: { name: "Hard", desc: "Enemies hit harder. Lower rewards. One life warning applies.", enemyAtk: 1.25, enemyHp: 1.18, reward: 0.75, unlocked: true, permadeath: true },
  insanity: { name: "Insanity", desc: "Locked until the Lumenari falls. Three enemies and one life.", enemyAtk: 1.6, enemyHp: 1.45, reward: 0.55, unlocked: false, permadeath: true },
};
const LOG_C = { info: "rgba(200,192,248,0.6)", dmg: "#e85c3a", heal: "#3ec995", sys: "rgba(230,225,255,0.9)", reward: "#e0a523", spell: "#a89df0", lumen: "#ffd966" };

function fmtCoin(b) {
  if (b <= 0) return "0 Bronze";
  const g = Math.floor(b / 10000);
  const s = Math.floor((b % 10000) / 100);
  const br = b % 100;
  return [[g, "Gold"], [s, "Silver"], [br, "Bronze"]].filter(([v], i) => v > 0 || i === 2).map(([v, n]) => `${v} ${n}`).join(", ");
}
function roll(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function Bar({ val, max, color, h = 6 }) {
  const p = Math.max(0, Math.min(100, Math.round((val / Math.max(1, max)) * 100)));
  return <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 3, height: h, overflow: "hidden", flex: 1 }}><div style={{ width: `${p}%`, height: "100%", background: color, boxShadow: `0 0 8px ${color}66`, transition: "width .25s ease" }} /></div>;
}
function Tag({ children, color = "#5b4fd4", glow }) {
  return <span style={{ display: "inline-flex", alignItems: "center", minHeight: 22, padding: "3px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 800, background: `linear-gradient(180deg,${color}2e,${color}14)`, color, border: `1px solid ${color}55`, boxShadow: glow ? `0 0 18px ${color}66, inset 0 1px 0 rgba(255,255,255,.12)` : "inset 0 1px 0 rgba(255,255,255,.08)", whiteSpace: "nowrap", letterSpacing: ".015em" }}>{children}</span>;
}
function Panel({ children, style, onClick }) {
  return <div className={onClick ? "panel panel-clickable" : "panel"} onClick={onClick} style={style}>{children}</div>;
}
function Btn({ children, onClick, variant = "default", disabled, small, full }) {
  const V = {
    default: ["rgba(255,255,255,0.07)", "rgba(220,215,255,0.85)"],
    primary: ["linear-gradient(180deg,#6b5fe4,#5141c4)", "#fff"],
    danger: ["linear-gradient(180deg,#c84838,#a02828)", "#fff"],
    success: ["linear-gradient(180deg,#2a9c69,#168753)", "#fff"],
    amber: ["linear-gradient(180deg,#a8740c,#8a5c08)", "#fff"],
    ghost: ["transparent", "rgba(200,192,248,0.55)"],
    gold: ["linear-gradient(180deg,#e8b938,#c89518)", "#1a0e00"],
  };
  const [bg, cl] = V[variant] || V.default;
  return <button className={`btn btn-${variant}${small ? " btn-small" : ""}`} disabled={disabled} onClick={(e) => { e.stopPropagation(); if (!disabled) { SFX.click(); onClick?.(); } }} style={{ "--btn-bg": bg, "--btn-color": cl, width: full ? "100%" : "auto" }}>{children}</button>;
}
function CoinBar({ bronze }) {
  return <div className="coin-bar"><span>Wallet</span><strong>{fmtCoin(bronze)}</strong></div>;
}
function Ton618BG() {
  return <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at center,#1a0030 0%,#0a000d 52%,#000 100%)", zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
    <style>{`
      @keyframes tonRotate{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
      @keyframes tonReverse{from{transform:translate(-50%,-50%) rotate(360deg)}to{transform:translate(-50%,-50%) rotate(0deg)}}
      @keyframes tonPulse{0%,100%{opacity:.55;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.04)}}
      @keyframes starfall{from{transform:translateY(-10vh)}to{transform:translateY(110vh)}}
    `}</style>
    {[920, 680, 460, 290, 200].map((s, i) => <div key={s} style={{ position: "absolute", left: "50%", top: "50%", width: s, height: s, borderRadius: "50%", border: `${i + 2}px solid ${["rgba(180,80,255,.18)", "rgba(220,80,180,.25)", "rgba(255,100,160,.32)", "rgba(255,180,80,.45)", "rgba(255,220,100,.75)"][i]}`, boxShadow: `0 0 ${50 + i * 10}px ${["rgba(180,80,255,.25)", "rgba(220,80,180,.35)", "rgba(255,80,140,.45)", "rgba(255,140,40,.55)", "rgba(255,220,80,.8)"][i]}`, animation: `${i % 2 ? "tonReverse" : "tonRotate"} ${60 - i * 9}s linear infinite` }} />)}
    <div style={{ position: "absolute", left: "50%", top: "50%", width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,#000 50%,rgba(20,0,30,.9) 80%,transparent 100%)", transform: "translate(-50%,-50%)", boxShadow: "0 0 45px #000,inset 0 0 30px #000", animation: "tonPulse 4s ease infinite" }} />
    {Array.from({ length: 20 }).map((_, i) => <div key={i} style={{ position: "absolute", left: `${Math.random() * 100}%`, top: 0, width: 2, height: 8, background: "linear-gradient(180deg,transparent,#fff,transparent)", animation: `starfall ${4 + Math.random() * 4}s linear infinite`, animationDelay: `${Math.random() * 5}s`, opacity: 0.5 }} />)}
  </div>;
}
function Confetti() {
  const colors = ["#ffd966", "#e85c3a", "#3ec995", "#a89df0", "#e0a523", "#ff6bcb"];
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, overflow: "hidden" }}>
    <style>{`@keyframes cfall{from{transform:translateY(-10vh) rotate(0deg)}to{transform:translateY(110vh) rotate(720deg)}}`}</style>
    {Array.from({ length: 80 }).map((_, i) => <div key={i} style={{ position: "absolute", left: `${Math.random() * 100}%`, top: 0, width: 6 + Math.random() * 9, height: 3 + Math.random() * 5, background: colors[i % colors.length], animation: `cfall ${2 + Math.random() * 3}s linear infinite`, animationDelay: `${Math.random() * 1.8}s`, borderRadius: 2 }} />)}
  </div>;
}

export default function App() {
  const [screen, setScreen] = useState("race");
  const [race, setRace] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [cls, setCls] = useState(null);
  const [tenebrimStart, setTenebrimStart] = useState(null);
  const [stats, setStats] = useState({ hp: 100, maxHp: 100, mp: 60, maxMp: 60, stamina: 80, maxStamina: 80 });
  const [xp, setXp] = useState(0);
  const [bronze, setBronze] = useState(80);
  const [totalEarned, setTotalEarned] = useState(0);
  const [weapon, setWeapon] = useState(WEAPONS[0]);
  const [weapon2, setWeapon2] = useState(WEAPONS[0]);
  const [armor, setArmor] = useState(ARMORS[0]);
  const [ownedWeaponIds, setOwnedWeaponIds] = useState(["fists"]);
  const [ownedArmorIds, setOwnedArmorIds] = useState(["none"]);
  const [myTools, setMyTools] = useState([]);
  const [potions, setPotions] = useState([]);
  const [log, setLog] = useState([]);
  const [combat, setCombat] = useState(null);
  const [combatPhase, setCombatPhase] = useState("player");
  const [guardActive, setGuardActive] = useState(false);
  const [enemyDodging, setEnemyDodging] = useState(false);
  const [enemyStunned, setEnemyStunned] = useState(0);
  const [playerAtkDebuff, setPlayerAtkDebuff] = useState(0);
  const [combatResult, setCombatResult] = useState(null);
  const [combatOrigin, setCombatOrigin] = useState("overworld");
  const [nearDeathWins, setNearDeathWins] = useState(0);
  const [totalKills, setTotalKills] = useState(0);
  const [unlockedSkills, setUnlockedSkills] = useState([]);
  const [revealedSkills, setRevealedSkills] = useState([]);
  const [spells, setSpells] = useState(SURFACE_SPELLS.map((s) => ({ ...s })));
  const [spellStudiedToday, setSpellStudiedToday] = useState({});
  const [doomsday, setDoomsday] = useState(1);
  const [day, setDay] = useState(1);
  const [doomsdaysCleared, setDoomsdaysCleared] = useState(0);
  const [postDoomsday, setPostDoomsday] = useState(false);
  const [daysSinceContract, setDaysSinceContract] = useState(0);
  const [advRankIdx, setAdvRankIdx] = useState(0);
  const [hasBadge, setHasBadge] = useState(true);
  const [hunterStars, setHunterStars] = useState(1);
  const [churchCost] = useState(15);
  const [notif, setNotif] = useState(null);
  const [tab, setTab] = useState("map");
  const [devilRep, setDevilRep] = useState(0);
  const [nobleInvite, setNobleInvite] = useState(false);
  const [leftUnderworld, setLeftUnderworld] = useState(false);
  const [declinedInvite, setDeclinedInvite] = useState(false);
  const [doomsdayTriggered, setDoomsdayTriggered] = useState(false);
  const [showCutscene, setShowCutscene] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [housing, setHousing] = useState("inn");
  const [ownsHouse, setOwnsHouse] = useState(false);
  const [physicalLevel, setPhysicalLevel] = useState(0);
  const [endgameWave, setEndgameWave] = useState(0);
  const [endgameMonsters, setEndgameMonsters] = useState([]);
  const [allies, setAllies] = useState(0);
  const [lumenari, setLumenari] = useState(null);
  const [lumenariPhase, setLumenariPhase] = useState(1);
  const [lumenCombatPhase, setLumenCombatPhase] = useState("player");
  const [qteActive, setQteActive] = useState(false);
  const [qteSequence, setQteSequence] = useState([]);
  const [qteIdx, setQteIdx] = useState(0);
  const [golems, setGolems] = useState([]);
  const [siphonNodes, setSiphonNodes] = useState([]);
  const [siphonScore, setSiphonScore] = useState(0);
  const [siphonActive, setSiphonActive] = useState(false);
  const [siphonTime, setSiphonTime] = useState(30);
  const [siphonResult, setSiphonResult] = useState(null);
  const [slaveTask, setSlaveTask] = useState(null);
  const [slaveProgress, setSlaveProgress] = useState(0);
  const [slaveDay, setSlaveDay] = useState(0);
  const [escapeReady, setEscapeReady] = useState(false);
  const [craftedShop, setCraftedShop] = useState([]);
  const [trainTargets, setTrainTargets] = useState([]);
  const [trainScore, setTrainScore] = useState(0);
  const [trainTime, setTrainTime] = useState(20);
  const [trainActive, setTrainActive] = useState(false);
  const [trainResult, setTrainResult] = useState(null);
  const [craftMaterials, setCraftMaterials] = useState({ herb: 0, metal: 0, crystal: 0 });
  const [craftActive, setCraftActive] = useState(false);
  const [craftSequence, setCraftSequence] = useState([]);
  const [craftStep, setCraftStep] = useState(0);
  const [craftErrors, setCraftErrors] = useState(0);
  const [craftResult, setCraftResult] = useState(null);
  const [slotResult, setSlotResult] = useState([0, 0, 0]);
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [bjPlayer, setBjPlayer] = useState([]);
  const [bjDealer, setBjDealer] = useState([]);
  const [bjBet, setBjBet] = useState(0);
  const [bjState, setBjState] = useState("idle");
  const [bjResult, setBjResult] = useState(null);
  const [gambleMsg, setGambleMsg] = useState(null);
  const [difficulty, setDifficulty] = useState("normal");
  const [savedAt, setSavedAt] = useState(null);
  const logRef = useRef(null);
  const siphonTickRef = useRef(null);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);
  function notify(msg, color = "#5b4fd4") {
    setNotif({ msg, color });
    setTimeout(() => setNotif(null), 2300);
  }
  function addLog(msg, type = "info") {
    setLog((l) => [...l.slice(-70), { msg, type, id: Date.now() + Math.random() }]);
  }
  function getSkillVal(effect) {
    return unlockedSkills.filter((s) => s.effect === effect).reduce((sum, s) => sum + (s.val || 0), 0);
  }
  function shopDiscount() {
    return Math.min(0.4, getSkillVal("shop_discount"));
  }
  function adjustedPrice(p) {
    return Math.max(0, Math.round(p * (1 - shopDiscount())));
  }
  function difficultyCfg() {
    return DIFFICULTIES[difficulty] || DIFFICULTIES.normal;
  }
  function canUseDifficulty(id) {
    return id !== "insanity" || doomsdaysCleared > 0 || postDoomsday;
  }
  function starIcons(star) {
    return Array.from({ length: 5 }, (_, i) => <span key={i} className={i < star ? "star-on" : "star-off"}>*</span>);
  }
  function availablePhysicalAttacks() {
    if (race?.id === "tetrabrachian") return TET_ATTACKS;
    return [...PHYS_ATTACKS, ...(RACE_ATTACKS[race?.id] || [])];
  }
  function saveProgress(targetScreen = screen) {
    const payload = {
      screen: targetScreen,
      race, origin, cls, tenebrimStart, stats, xp, bronze, totalEarned,
      weapon, weapon2, armor, ownedWeaponIds, ownedArmorIds, myTools, potions,
      nearDeathWins, totalKills, unlockedSkills, revealedSkills, spells,
      doomsday, day, doomsdaysCleared, postDoomsday, daysSinceContract,
      advRankIdx, hasBadge, hunterStars, housing, ownsHouse, physicalLevel,
      craftedShop, devilRep, leftUnderworld, declinedInvite, difficulty
    };
    localStorage.setItem("aleria_save", JSON.stringify(payload));
    setSavedAt(new Date().toLocaleTimeString());
    notify("Progress saved.", "#3ec995");
  }
  function loadProgress() {
    const raw = localStorage.getItem("aleria_save");
    if (!raw) return notify("No save found.", "#b83a2a");
    try {
      const s = JSON.parse(raw);
      setRace(s.race); setOrigin(s.origin); setCls(s.cls); setTenebrimStart(s.tenebrimStart);
      setStats(s.stats); setXp(s.xp || 0); setBronze(s.bronze ?? 80); setTotalEarned(s.totalEarned || 0);
      setWeapon(s.weapon || WEAPONS[0]); setWeapon2(s.weapon2 || WEAPONS[0]); setArmor(s.armor || ARMORS[0]);
      setOwnedWeaponIds(s.ownedWeaponIds || ["fists"]); setOwnedArmorIds(s.ownedArmorIds || ["none"]);
      setMyTools(s.myTools || []); setPotions(s.potions || []); setNearDeathWins(s.nearDeathWins || 0);
      setTotalKills(s.totalKills || 0); setUnlockedSkills(s.unlockedSkills || []); setRevealedSkills(s.revealedSkills || []);
      setSpells(s.spells || SURFACE_SPELLS.map((sp) => ({ ...sp }))); setDoomsday(s.doomsday ?? 1); setDay(s.day || 1);
      setDoomsdaysCleared(s.doomsdaysCleared || 0); setPostDoomsday(!!s.postDoomsday); setDaysSinceContract(s.daysSinceContract || 0);
      setAdvRankIdx(s.advRankIdx || 0); setHasBadge(s.hasBadge ?? true); setHunterStars(s.hunterStars || 1);
      setHousing(s.housing || "inn"); setOwnsHouse(!!s.ownsHouse); setPhysicalLevel(s.physicalLevel || 0);
      setCraftedShop(s.craftedShop || []); setDevilRep(s.devilRep || 0); setLeftUnderworld(!!s.leftUnderworld);
      setDeclinedInvite(!!s.declinedInvite); setDifficulty(s.difficulty || "normal");
      setCombat(null); setCombatResult(null); setShowVictory(false); setScreen(s.screen || "overworld"); setTab("map");
      notify("Progress loaded.", "#3ec995");
    } catch {
      notify("Save could not be loaded.", "#b83a2a");
    }
  }
  function returnMainMenu() {
    saveProgress("overworld");
    setScreen("race");
    setTab("map");
  }
  function selectedSleepOption() {
    return SLEEP.find((o) => o.id === housing) || SLEEP[1];
  }
  function chooseSleepOption(option) {
    const opt = SLEEP.find((o) => o.id === option);
    if (!opt) return;
    if (opt.id === "owned_house" && !ownsHouse) return notify("You do not own a house.", "#b83a2a");
    setHousing(option);
    notify(`Sleep spot selected: ${opt.name}`, "#3ec995");
    setScreen("overworld");
    setTab("overworld");
  }
  const skillCtx = useMemo(() => ({ kills: totalKills, nearDeath: nearDeathWins, earned: totalEarned, days: day, spellsLearned: spells.filter((s) => s.learned).length }), [totalKills, nearDeathWins, totalEarned, day, spells]);
  const nextSkill = SKILLS.find((sk) => !unlockedSkills.some((u) => u.id === sk.id));

  useEffect(() => {
    SKILLS.forEach((sk) => {
      if (unlockedSkills.some((u) => u.id === sk.id)) return;
      if ((skillCtx[sk.reqType] || 0) >= sk.reqVal) {
        setUnlockedSkills((prev) => [...prev, sk]);
        notify(`Skill unlocked: ${sk.name}`, "#a89df0");
        addLog(`Skill stirs: ${sk.name}. Church reveals the effect.`, "sys");
        if (sk.effect === "passive_hp") setStats((s) => ({ ...s, maxHp: s.maxHp + sk.val, hp: s.hp + sk.val }));
        if (sk.effect === "passive_mp") setStats((s) => ({ ...s, maxMp: s.maxMp + sk.val, mp: s.mp + sk.val }));
        if (sk.effect === "passive_sta") setStats((s) => ({ ...s, maxStamina: s.maxStamina + sk.val, stamina: s.stamina + sk.val }));
      }
    });
  }, [skillCtx, unlockedSkills]);

  useEffect(() => {
    if (doomsday >= 10 && !doomsdayTriggered && !postDoomsday) {
      setDoomsdayTriggered(true);
      setShowCutscene(true);
      SFX.roar();
      setTimeout(() => { setShowCutscene(false); startEndgameWave(0); }, 3600);
    }
  }, [doomsday, doomsdayTriggered, postDoomsday]);

  useEffect(() => {
    if (race?.id === "devil" && devilRep >= 8 && !nobleInvite && !leftUnderworld && !declinedInvite) {
      setNobleInvite(true);
      notify("A noble has heard of your reputation.", "#c8911a");
      addLog("A messenger arrives bearing a noble seal.", "sys");
    }
  }, [devilRep, race, nobleInvite, leftUnderworld, declinedInvite]);

  function pickRace(r) {
    const unlocked = !r.locked || (r.unlockVal && doomsdaysCleared >= r.unlockVal);
    if (!unlocked) {
      notify(r.desc, "#9a6c10");
      return;
    }
    setRace(r);
    setStats({ hp: 100 + r.hpBonus, maxHp: 100 + r.hpBonus, mp: 60 + (r.mpBonus || 0), maxMp: 60 + (r.mpBonus || 0), stamina: 80, maxStamina: 80 });
    if (r.id === "devil") {
      setSpells(DEVIL_SPELLS.map((s) => ({ ...s })));
      setScreen("devil_intro");
    } else if (r.id === "tenebrim") {
      const start = Math.random() < 0.5 ? "slave" : "tribe";
      setTenebrimStart(start);
      setScreen(start === "slave" ? "tenebrim_slave" : "tenebrim_tribe");
    } else setScreen("origin");
  }
  function pickOrigin(o) { setOrigin(o); setScreen("class"); }
  function pickClass(c) { setCls(c); setScreen("intro"); }
  function beginGame() { setScreen("overworld"); setTab("map"); addLog("You take your first steps into contract work.", "sys"); }
  function beginUnderworld() { setScreen("underworld"); setTab("under_map"); addLog("Sector Three. Your shift begins.", "sys"); }
  function acceptNobleInvite() {
    setNobleInvite(false);
    setLeftUnderworld(true);
    setSpells((prev) => prev.map((s) => s.combatUse ? { ...s, combatUse: { ...s.combatUse, mpCost: Math.round(s.combatUse.mpCost * 1.6) } } : s));
    addLog("You accept. Surface mana dims your spells.", "sys");
    setScreen("devil_class");
  }
  function declineNobleInvite() {
    setNobleInvite(false);
    setDeclinedInvite(true);
    notify("You remain below. Threats escalate.", "#b83a2a");
    addLog("You decline. The Underworld grows more dangerous.", "sys");
  }
  function doSleep(option) {
    const opt = SLEEP.find((o) => o.id === option);
    if (opt.id === "owned_house" && !ownsHouse) return notify("You do not own a house.", "#b83a2a");
    if (opt.cost > 0 && bronze < opt.cost) return notify(`Need ${opt.cost} Bronze.`, "#b83a2a");
    if (opt.cost > 0) setBronze((b) => b - opt.cost);
    setHousing(option);
    setStats((s) => ({ ...s, hp: Math.min(s.maxHp, s.hp + Math.round(s.maxHp * opt.hp)), mp: Math.min(s.maxMp, s.mp + Math.round(s.maxMp * opt.mp)), stamina: Math.min(s.maxStamina, s.stamina + Math.round(s.maxStamina * opt.sta)) }));
    setSpellStudiedToday({});
    const nd = day + 1;
    setDay(nd);
    const dsc = daysSinceContract + 1;
    setDaysSinceContract(dsc);
    if (cls?.id === "adventurer" && hasBadge) {
      const grace = RANK_GRACE[advRankIdx];
      if (grace && dsc >= grace[2]) {
        if (advRankIdx === 0) setHasBadge(false);
        else { setAdvRankIdx((i) => i - 1); setDaysSinceContract(0); }
        notify("Guild penalty for inactivity.", "#b83a2a");
      } else if (grace && (dsc === grace[0] || dsc === grace[1])) notify("Guild inactivity warning.", "#c8911a");
    }
    if (!postDoomsday) setDoomsday((d) => Math.min(10, d + opt.doom));
    addLog(`You sleep at: ${opt.name}. Day ${nd}.`, "sys");
  }
  function buyHouse() {
    if (bronze < HOUSE_PRICE) return notify(`Need ${HOUSE_PRICE} Bronze.`, "#b83a2a");
    setBronze((b) => b - HOUSE_PRICE);
    setOwnsHouse(true);
    notify("You bought a house.", "#3ec995");
    SFX.buy();
  }
  function getPotionStacks() {
    const map = {};
    potions.forEach((p) => { if (map[p.id]) map[p.id].count++; else map[p.id] = { ...p, count: 1 }; });
    return Object.values(map);
  }
  function usePotion(p) {
    const maxKey = `max${p.stat.charAt(0).toUpperCase()}${p.stat.slice(1)}`;
    setStats((s) => ({ ...s, [p.stat]: Math.min(s[maxKey], s[p.stat] + p.val) }));
    setPotions((prev) => {
      const i = prev.findIndex((x) => x.id === p.id);
      if (i < 0) return prev;
      const n = [...prev];
      n.splice(i, 1);
      return n;
    });
    addLog(`Used ${p.name}: +${p.val} ${p.stat}.`, "heal");
  }
  function studySpell(id) {
    if (!race?.canSpell) return notify("Your kind does not work with spells.", "#9a6c10");
    if (spellStudiedToday[id]) return notify("Already studied today.", "#9a6c10");
    const mult = SLEEP.find((o) => o.id === housing)?.spell || 1;
    SFX.spell();
    setSpells((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const np = Math.min(100, s.progress + Math.floor((Math.random() * 7 + 4) * mult));
      if (np >= 100 && !s.learned) {
        SFX.reward();
        notify(`Learned: ${s.name}`, "#5b4fd4");
        setStats((st) => ({ ...st, maxMp: st.maxMp + 8, mp: st.mp + 8 }));
      }
      addLog(`Studied ${s.name}: ${np}/100.`, "spell");
      return { ...s, progress: np, learned: np >= 100 };
    }));
    setSpellStudiedToday((p) => ({ ...p, [id]: true }));
  }
  function visibleSpells() {
    return spells.filter((s) => !spells.find((x) => x.replaces === s.id && x.learned));
  }
  function visitChurch(skillId) {
    if (race?.id === "devil") return notify("Devils do not enter churches.", "#b83a2a");
    if (bronze < churchCost) return notify(`Need ${churchCost} Bronze.`, "#b83a2a");
    if (revealedSkills.includes(skillId)) return;
    setBronze((b) => b - churchCost);
    setRevealedSkills((prev) => [...prev, skillId]);
    SFX.church();
    notify("Skill revealed.", "#5b4fd4");
  }
  function getBonusAtk() { return weapon.atk + (race?.id === "tetrabrachian" ? weapon2.atk : 0) + (race?.atkBonus || 0) + physicalLevel + getSkillVal("passive_atk"); }
  function getBonusDef() { return armor.def + (race?.defBonus || 0) + getSkillVal("passive_def") + (race?.id === "tetrabrachian" && weapon2.id !== "fists" ? -3 : 0); }
  function rollDodge() { return Math.random() * 100 < ((race?.dodge || 5) + getSkillVal("passive_dodge")); }
  function startCombat(isUnderworld) {
    if (leftUnderworld && isUnderworld) isUnderworld = false;
    setCombatOrigin(isUnderworld ? "underworld" : "overworld");
    const pool = isUnderworld ? UW_MONSTERS : MONSTERS.filter((m) => m.star <= (postDoomsday ? 5 : doomsday < 3 ? 2 : doomsday < 6 ? 3 : doomsday < 8 ? 4 : 5));
    const base = pool[Math.floor(Math.random() * pool.length)];
    const diff = difficultyCfg();
    const hpScale = (isUnderworld ? 1.35 : 1) + doomsday * 0.07 + (declinedInvite ? 0.4 : 0);
    const atkScale = (isUnderworld ? 1.3 : 1) + doomsday * 0.05 + (declinedInvite ? 0.35 : 0);
    launchCombat({ ...base, hp: Math.round(base.hp * hpScale * diff.enemyHp), maxHp: Math.round(base.hp * hpScale * diff.enemyHp), atk: Math.round(base.atk * atkScale * diff.enemyAtk), def: base.def });
  }
  function launchCombat(m) {
    setCombat(m);
    setGuardActive(false);
    setEnemyDodging(false);
    setEnemyStunned(0);
    setPlayerAtkDebuff(0);
    setCombatPhase("player");
    setCombatResult(null);
    setLog([{ msg: `A ${m.name} (${"*".repeat(m.star)}). ${m.desc}`, type: "sys", id: Date.now() }]);
    setScreen("combat");
    setDaysSinceContract(0);
    if (race?.id === "devil" && !leftUnderworld) setDevilRep((r) => r + 1);
  }
  function flee() {
    const cost = Math.ceil(bronze * 0.05);
    setBronze((b) => Math.max(0, b - cost));
    addLog(`You flee. Lost ${cost} Bronze.`, "sys");
    setScreen(combatOrigin);
    setTab(combatOrigin === "underworld" ? "under_map" : "map");
    SFX.flee();
  }
  function playerAct(action) {
    if (combatPhase !== "player") return;
    let ns = { ...stats };
    let nm = { ...combat };
    let newGuard = false;
    if (action.staminaCost && ns.stamina < action.staminaCost) return notify("Not enough stamina.", "#b83a2a");
    if (action.mpCost && ns.mp < action.mpCost) return notify("Not enough mana.", "#b83a2a");
    if (action.id === "guard") {
      newGuard = true;
      SFX.guard();
      addLog("You brace.", "info");
    } else if (action.id === "focus") {
      ns.stamina = Math.min(ns.maxStamina, ns.stamina + 15);
      addLog("Breath steadied.", "heal");
    } else if (action.effect === "confuse" || action.effect === "stun") {
      ns.mp -= action.mpCost;
      setEnemyStunned(action.turns || 1);
      SFX.spell();
      addLog(`${action.name}: enemy disabled.`, "spell");
    } else if (action.accuracy && Math.random() > action.accuracy) {
      if (action.staminaCost) ns.stamina -= action.staminaCost;
      addLog(`${action.name}: missed.`, "info");
    } else {
      const hits = action.hits || 1;
      let total = 0;
      for (let i = 0; i < hits; i++) {
        let bonus = getBonusAtk();
        if (action.id === "strike") bonus += getSkillVal("strike_bonus");
        if (action.id === "heavy") bonus += getSkillVal("heavy_bonus");
        const dmg = Math.max(1, roll(action.dmg?.[0] || 0, action.dmg?.[1] || 8) + bonus + playerAtkDebuff - nm.def);
        nm.hp = Math.max(0, nm.hp - dmg);
        total += dmg;
        if (nm.hp <= 0) break;
      }
      if (action.staminaCost) ns.stamina -= action.staminaCost;
      if (action.mpCost) ns.mp -= action.mpCost;
      SFX.attack();
      addLog(`${action.name}: ${total}${hits > 1 ? ` (${hits} hits)` : ""}.`, "dmg");
    }
    setGuardActive(newGuard);
    setPlayerAtkDebuff(0);
    setStats(ns);
    setCombat(nm);
    if (nm.hp <= 0) return endCombat(ns);
    setCombatPhase("enemy");
    setTimeout(() => enemyTurn(nm, ns, newGuard), 650);
  }
  function enemyTurn(monster, ps, guarded) {
    if (enemyStunned > 0) {
      setEnemyStunned((e) => e - 1);
      addLog(`${monster.name} cannot act.`, "info");
      setCombatPhase("player");
      return;
    }
    const action = (M_ACT[monster.id] || M_ACT.cur)[Math.floor(Math.random() * (M_ACT[monster.id] || M_ACT.cur).length)];
    let ns = { ...ps };
    if (action.dmg?.[1] > 0) {
      if (enemyDodging) {
        addLog(`${monster.name} misses.`, "info");
        setEnemyDodging(false);
      } else if (rollDodge()) addLog(`You evade ${monster.name}.`, "heal");
      else {
        const dmg = Math.max(1, roll(action.dmg[0], action.dmg[1]) + Math.round(monster.atk * 0.35) - getBonusDef() - (guarded ? 6 : 0));
        ns.hp = Math.max(0, ns.hp - dmg);
        if (action.effect === "drain_mp") ns.mp = Math.max(0, ns.mp - 10);
        SFX.hit();
        addLog(`${monster.name}: ${dmg}.`, "dmg");
      }
    } else if (action.effect === "dodge_next") setEnemyDodging(true);
    else if (action.effect === "debuff_atk") setPlayerAtkDebuff(-3);
    setStats(ns);
    if (ns.hp <= 0) {
      SFX.defeat();
      setCombatPhase("result");
      setCombatResult("lose");
      addLog("You collapse.", "sys");
      return;
    }
    setCombatPhase("player");
  }
  function endCombat(fs) {
    setCombatPhase("result");
    setCombatResult("win");
    const r = combat.reward;
    const rankMult = cls?.id === "adventurer" ? RANK_MULT[advRankIdx] : cls?.id === "hunter" ? 1.5 : 1;
    const bonus = Math.round(r.bronze * (1 + (postDoomsday ? 0 : doomsday * 0.08)) * rankMult * difficultyCfg().reward);
    setXp((x) => x + r.xp);
    setBronze((b) => b + bonus);
    setTotalEarned((t) => t + bonus);
    setTotalKills((k) => k + 1);
    if (!postDoomsday) setDoomsday((d) => Math.min(10, d + 0.25));
    SFX.reward();
    addLog(`Victory. +${r.xp} XP, +${bonus} Bronze.`, "reward");
    if (cls?.id === "adventurer" && hasBadge && advRankIdx < 5 && xp + r.xp >= RANK_THRESHOLDS[advRankIdx]) {
      setAdvRankIdx((i) => i + 1);
      SFX.rankup();
    }
    if (cls?.id === "hunter") setHunterStars(Math.min(5, Math.floor((xp + r.xp) / 300) + 1));
    if (fs.hp <= fs.maxHp * 0.15) setNearDeathWins((n) => n + 1);
  }
  function startSiphon() {
    setSiphonNodes(Array.from({ length: 6 }, (_, i) => ({ id: i, level: Math.random() * 30 + 10, rising: Math.random() * 1.8 + 1 + doomsday * 0.12 })));
    setSiphonScore(0);
    setSiphonActive(true);
    setSiphonTime(30);
    setSiphonResult(null);
    setScreen("siphon");
  }
  useEffect(() => {
    if (!siphonActive) return;
    siphonTickRef.current = setInterval(() => {
      setSiphonNodes((prev) => prev.map((n) => ({ ...n, level: Math.min(100, n.level + n.rising), danger: n.level > 80 })));
      setSiphonTime((t) => {
        if (t <= 1) {
          clearInterval(siphonTickRef.current);
          setSiphonActive(false);
          setSiphonResult("complete");
          return 0;
        }
        return t - 1;
      });
    }, 700);
    return () => clearInterval(siphonTickRef.current);
  }, [siphonActive]);
  function tapNode(id) {
    if (!siphonActive) return;
    setSiphonNodes((prev) => prev.map((n) => n.id === id ? { ...n, level: Math.max(0, n.level - 40) } : n));
    setSiphonScore((s) => s + 10);
    SFX.siphon();
  }
  function finishSiphonReward() {
    const overflow = siphonNodes.filter((n) => n.level >= 100).length;
    if (overflow > 0 && !postDoomsday) setDoomsday((d) => Math.min(10, d + overflow * 0.45));
    const reward = Math.round(siphonScore * 0.8 + 20);
    setBronze((b) => b + reward);
    setTotalEarned((t) => t + reward);
    setDevilRep((r) => r + (overflow === 0 ? 2 : 1));
    addLog(`Shift done. +${reward} Bronze.`, "reward");
  }
  useEffect(() => { if (siphonResult === "complete") finishSiphonReward(); }, [siphonResult]);
  function leaveSiphon() {
    clearInterval(siphonTickRef.current);
    setSiphonActive(false);
    setSiphonResult(null);
    setScreen(race?.id === "devil" && !leftUnderworld ? "underworld" : "overworld");
    setTab(race?.id === "devil" && !leftUnderworld ? "under_map" : "map");
  }
  function startSlaveWork() {
    const tasks = ["Carry crates", "Scrub stone floors", "Haul water", "Sort manifests"];
    setSlaveTask(tasks[Math.floor(Math.random() * tasks.length)]);
    setSlaveProgress(0);
  }
  function doSlaveWork() {
    const np = Math.min(100, slaveProgress + roll(18, 40));
    setSlaveProgress(np);
    if (np >= 100) {
      const nd = slaveDay + 1;
      setSlaveDay(nd);
      setSlaveProgress(0);
      if (nd >= 3) setEscapeReady(true);
      else startSlaveWork();
    }
  }
  function doEscape() {
    setCls({ id: "wanderer", name: "Wanderer", org: "Self-trained" });
    setScreen("intro_tenebrim");
  }
  function startEndgameWave(waveIdx) {
    SFX.waveMusic();
    setEndgameWave(waveIdx);
    const stars = [3, 3, 4, 4, 5];
    const pool = MONSTERS.filter((m) => m.star === stars[waveIdx] || m.star === stars[waveIdx] - 1);
    setEndgameMonsters(Array.from({ length: 3 }, () => {
      const b = pool[Math.floor(Math.random() * pool.length)];
      const sc = 1.5 + waveIdx * 0.2;
      return { ...b, id: `${b.id}_${Math.random()}`, hp: Math.round(b.hp * sc), maxHp: Math.round(b.hp * sc), atk: Math.round(b.atk * sc), def: b.def };
    }));
    setCombatResult(null);
    setScreen("endgame_combat");
    setLog([{ msg: `Wave ${waveIdx + 1}/5.`, type: "sys", id: Date.now() }]);
  }
  function recruitAlly() {
    const cost = 120 + allies * 40;
    if (bronze < cost) return notify(`Need ${cost} Bronze.`, "#b83a2a");
    setBronze((b) => b - cost);
    setAllies((a) => a + 1);
    SFX.cry();
  }
  function endgameAttack(idx) {
    const targets = [...endgameMonsters];
    if (targets[idx].hp <= 0) return;
    const dmg = Math.max(1, getBonusAtk() + roll(10, 24) - targets[idx].def);
    targets[idx].hp -= dmg;
    let allyHits = 0;
    for (let i = 0; i < allies; i++) {
      const alive = targets.filter((t) => t.hp > 0);
      if (!alive.length) break;
      const t = alive[Math.floor(Math.random() * alive.length)];
      const ad = Math.max(1, roll(15, 24) - t.def);
      t.hp -= ad;
      allyHits += ad;
    }
    setEndgameMonsters(targets);
    addLog(`You: ${dmg}. Allies: ${allyHits}.`, "dmg");
    if (targets.every((t) => t.hp <= 0)) {
      if (endgameWave >= 4) setTimeout(() => startLumenari(), 900);
      else setTimeout(() => startEndgameWave(endgameWave + 1), 900);
      return;
    }
    let ns = { ...stats };
    targets.filter((t) => t.hp > 0).forEach((m) => { if (!rollDodge()) ns.hp = Math.max(0, ns.hp - Math.max(1, roll(10, 24) + Math.round(m.atk * 0.15) - getBonusDef())); });
    setStats(ns);
    SFX.hit();
    if (ns.hp <= 0) { setCombatResult("lose"); SFX.defeat(); }
  }
  const LUMEN_PHASE_HP = { 1: 320, 2: 390, 3: 460 };
  const LUMEN_PHASE_DEF = { 1: 34, 2: 42, 3: 52 };
  function startLumenari() {
    setLumenari({ phaseHp: LUMEN_PHASE_HP[1], phaseMaxHp: LUMEN_PHASE_HP[1], def: LUMEN_PHASE_DEF[1] });
    setLumenariPhase(1);
    setLumenCombatPhase("player");
    setQteActive(false);
    setCombatResult(null);
    setGolems([{ id: "g0", hp: 130, maxHp: 130 }, { id: "g1", hp: 130, maxHp: 130 }, { id: "g2", hp: 130, maxHp: 130 }]);
    setScreen("lumenari");
    setLog([{ msg: "The sky cracks open. The Lumenari descends.", type: "lumen", id: Date.now() }]);
    SFX.lumen();
    SFX.bossMusic(1);
  }
  function lumenariAttack(action) {
    if (lumenCombatPhase !== "player" || combatResult || qteActive) return;
    let ns = { ...stats };
    let nl = { ...lumenari };
    if (action.staminaCost && ns.stamina < action.staminaCost) return notify("Not enough stamina.", "#b83a2a");
    if (action.mpCost && ns.mp < action.mpCost) return notify("Not enough mana.", "#b83a2a");
    const dmg = Math.max(1, roll(action.dmg?.[0] || 0, action.dmg?.[1] || 8) + getBonusAtk() - nl.def);
    if (action.staminaCost) ns.stamina -= action.staminaCost;
    if (action.mpCost) ns.mp -= action.mpCost;
    nl.phaseHp = Math.max(0, nl.phaseHp - dmg);
    if (allies > 0) {
      const ad = Math.max(0, Math.round(allies * (5 + Math.random() * 5) * (1 - lumenariPhase * 0.08)));
      nl.phaseHp = Math.max(0, nl.phaseHp - ad);
      addLog(`Allies: ${ad}.`, "info");
    }
    addLog(`${action.name}: ${dmg}.`, "dmg");
    SFX.attack();
    setStats(ns);
    if (nl.phaseHp <= 0) {
      if (lumenariPhase < 3) {
        const next = lumenariPhase + 1;
        setLumenariPhase(next);
        nl = { phaseHp: LUMEN_PHASE_HP[next], phaseMaxHp: LUMEN_PHASE_HP[next], def: LUMEN_PHASE_DEF[next] };
        addLog(`Phase ${next}.`, "lumen");
        SFX.lumen();
        SFX.bossMusic(next);
      } else {
        setLumenari(nl);
        setCombatResult("win");
        setShowVictory(true);
        SFX.victory();
        return;
      }
    }
    setLumenari(nl);
    setLumenCombatPhase("enemy");
    setTimeout(() => lumenariEnemyTurn(ns), 650);
  }
  function lumenariEnemyTurn(ps) {
    let ns = { ...ps };
    if (allies > 0 && Math.random() < 0.25 + lumenariPhase * 0.08) {
      setAllies((a) => Math.max(0, a - 1));
      addLog("Light claims an ally.", "sys");
    }
    if (lumenariPhase === 1) {
      if (!rollDodge()) {
        const dmg = Math.max(1, roll(32, 48) - getBonusDef());
        ns.hp = Math.max(0, ns.hp - dmg);
        ns.mp = Math.max(0, ns.mp - 15);
        addLog(`Touch: ${dmg}, -15 MP.`, "dmg");
      }
    } else {
      const seq = Array.from({ length: lumenariPhase === 2 ? 4 : 3 }, () => ["<", ">", "^", "v"][Math.floor(Math.random() * 4)]);
      if (lumenariPhase === 3) {
        const aliveGolems = golems.filter((g) => g.hp > 0).length;
        if (aliveGolems > 0) ns.hp = Math.max(0, ns.hp - Math.max(1, aliveGolems * roll(16, 23) - getBonusDef()));
      }
      setQteSequence(seq);
      setQteIdx(0);
      setQteActive(true);
      setStats(ns);
      return;
    }
    setStats(ns);
    if (ns.hp <= 0) {
      setCombatResult("lose");
      setLumenCombatPhase("result");
      SFX.defeat();
    } else setLumenCombatPhase("player");
  }
  function qteInput(dir) {
    if (!qteActive) return;
    if (dir === qteSequence[qteIdx]) {
      if (qteIdx + 1 >= qteSequence.length) {
        setQteActive(false);
        setLumenCombatPhase("player");
        addLog("Evaded.", "heal");
      } else setQteIdx((i) => i + 1);
    } else {
      setQteActive(false);
      const dmg = Math.max(1, roll(42, 58) - getBonusDef());
      setStats((s) => ({ ...s, hp: Math.max(0, s.hp - dmg) }));
      setLumenCombatPhase("player");
      addLog(`Light spears: ${dmg}.`, "dmg");
      SFX.hit();
    }
  }
  useEffect(() => {
    if (!qteActive) return;
    const map = { ArrowLeft: "<", ArrowRight: ">", ArrowUp: "^", ArrowDown: "v" };
    const onKey = (e) => {
      if (!map[e.key]) return;
      e.preventDefault();
      qteInput(map[e.key]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [qteActive, qteIdx, qteSequence]);
  function attackGolem(idx) {
    if (lumenCombatPhase !== "player" || qteActive) return;
    const ng = [...golems];
    ng[idx] = { ...ng[idx], hp: Math.max(0, ng[idx].hp - Math.max(1, getBonusAtk() + roll(8, 20))) };
    setGolems(ng);
    SFX.attack();
  }
  function continuePostDoomsday() {
    setShowVictory(false);
    setPostDoomsday(true);
    setDoomsdaysCleared((d) => d + 1);
    setDoomsday(0);
    setDoomsdayTriggered(false);
    setStats((s) => ({ ...s, hp: s.maxHp, mp: s.maxMp, stamina: s.maxStamina }));
    setScreen(race?.id === "devil" && !leftUnderworld ? "underworld" : "overworld");
    setTab("map");
  }
  function restartWithNewRace() {
    const cleared = doomsdaysCleared + 1;
    setDoomsdaysCleared(cleared);
    setRace(null); setOrigin(null); setCls(null); setTenebrimStart(null);
    setStats({ hp: 100, maxHp: 100, mp: 60, maxMp: 60, stamina: 80, maxStamina: 80 });
    setXp(0); setBronze(80); setTotalEarned(0); setWeapon(WEAPONS[0]); setWeapon2(WEAPONS[0]); setArmor(ARMORS[0]); setOwnedWeaponIds(["fists"]); setOwnedArmorIds(["none"]); setMyTools([]); setPotions([]); setLog([]);
    setCombat(null); setCombatResult(null); setNearDeathWins(0); setTotalKills(0); setUnlockedSkills([]); setRevealedSkills([]); setSpells(SURFACE_SPELLS.map((s) => ({ ...s }))); setSpellStudiedToday({});
    setDoomsday(1); setDay(1); setPostDoomsday(false); setDoomsdayTriggered(false); setDaysSinceContract(0); setAdvRankIdx(0); setHasBadge(true); setHunterStars(1);
    setDevilRep(0); setNobleInvite(false); setLeftUnderworld(false); setDeclinedInvite(false); setAllies(0); setShowVictory(false); setScreen("race");
  }
  function startTraining() {
    setTrainTargets([]); setTrainScore(0); setTrainTime(20); setTrainActive(true); setTrainResult(null); setScreen("training");
  }
  useEffect(() => {
    if (!trainActive) return;
    const tick = setInterval(() => {
      setTrainTime((t) => {
        if (t <= 1) { clearInterval(tick); setTrainActive(false); setTrainResult("done"); return 0; }
        return t - 1;
      });
      setTrainTargets((prev) => {
        const filtered = prev.filter((t) => Date.now() - t.born < 1500);
        if (Math.random() < 0.7 && filtered.length < 4) filtered.push({ id: Date.now() + Math.random(), x: Math.random() * 80 + 10, y: Math.random() * 70 + 15, born: Date.now() });
        return filtered;
      });
    }, 300);
    return () => clearInterval(tick);
  }, [trainActive]);
  useEffect(() => {
    if (trainResult === "done") {
      const gain = Math.floor(trainScore / 4);
      if (gain > 0) setPhysicalLevel((p) => p + gain);
      addLog(`Training: +${gain} physical.`, gain > 0 ? "reward" : "sys");
    }
  }, [trainResult]);
  function finishCraft(errors) {
    let q = errors === 0 && Math.random() < 0.05 ? "masterwork" : errors === 0 ? "excellent" : errors <= 1 ? "fine" : errors <= 2 ? "adequate" : "poor";
    const prices = { poor: [8, 5], adequate: [25, 18], fine: [80, 55], excellent: [200, 140], masterwork: [1200, 850] };
    const [buyPrice, sellPrice] = prices[q];
    setBronze((b) => b + sellPrice);
    setTotalEarned((t) => t + sellPrice);
    if (q === "masterwork") setCraftedShop((prev) => [...prev, { id: `craft_${Date.now()}`, name: "Masterwork artifact", atk: roll(30, 50), price: buyPrice, desc: "Forged by your hands." }]);
    setCraftResult(q);
    SFX.craft();
  }
  function startCrafting() {
    if (craftMaterials.herb < 1 && craftMaterials.metal < 1 && craftMaterials.crystal < 1) return notify("Need materials.", "#b83a2a");
    setCraftMaterials((m) => ({ herb: Math.max(0, m.herb - 1), metal: Math.max(0, m.metal - 1), crystal: Math.max(0, m.crystal - 1) }));
    setCraftSequence(Array.from({ length: 5 }, () => ["hammer", "fold", "quench", "temper", "etch"][Math.floor(Math.random() * 5)]));
    setCraftStep(0); setCraftErrors(0); setCraftActive(true); setCraftResult(null);
  }
  function craftAction(a) {
    const bad = a !== craftSequence[craftStep];
    const errors = craftErrors + (bad ? 1 : 0);
    if (bad) setCraftErrors(errors); else SFX.craft();
    if (craftStep + 1 >= craftSequence.length) { setCraftActive(false); finishCraft(errors); }
    else setCraftStep((s) => s + 1);
  }
  const SLOT_SYM = ["Cherry", "Bell", "Gem", "Star", "Moon", "Dragon"];
  function spinSlot(bet) {
    if (bronze < bet) return notify("Not enough.", "#b83a2a");
    setBronze((b) => b - bet);
    setSlotSpinning(true);
    SFX.spin();
    setTimeout(() => {
      const final = [roll(0, 5), roll(0, 5), roll(0, 5)];
      setSlotResult(final);
      setSlotSpinning(false);
      if (final[0] === final[1] && final[1] === final[2]) {
        const win = bet * (final[0] === 5 ? 20 : final[0] === 4 ? 10 : 5);
        setBronze((b) => b + win); setTotalEarned((t) => t + win); SFX.jackpot();
        setGambleMsg(`Slot jackpot: +${win} Bronze`);
      } else if (new Set(final).size < 3) { const win = bet * 2; setBronze((b) => b + win); setTotalEarned((t) => t + win); setGambleMsg(`Slot pair: +${win} Bronze`); }
      else setGambleMsg(`Slots lost ${bet} Bronze`);
    }, 900);
  }
  const WHEEL_SLOTS = [{ m: 0, c: "#444" }, { m: 2, c: "#3ec995" }, { m: 0, c: "#444" }, { m: 1.5, c: "#a89df0" }, { m: 0, c: "#444" }, { m: 5, c: "#e0a523" }, { m: 0, c: "#444" }, { m: 10, c: "#ff6bcb" }];
  function spinWheel(bet) {
    if (wheelSpinning || bronze < bet) return;
    setBronze((b) => b - bet); setWheelSpinning(true); SFX.spin();
    const final = wheelAngle + 1080 + Math.random() * 360;
    setWheelAngle(final);
    setTimeout(() => {
      const slot = Math.floor(((360 - (((final % 360) + 360) % 360)) % 360) / 45);
      const mult = WHEEL_SLOTS[slot].m;
      if (mult > 0) { const win = Math.round(bet * mult); setBronze((b) => b + win); setTotalEarned((t) => t + win); setGambleMsg(`Wheel ${mult}x: +${win} Bronze`); if (mult >= 5) SFX.jackpot(); }
      else setGambleMsg(`Wheel lost ${bet} Bronze`);
      setWheelSpinning(false);
    }, 1800);
  }
  function drawCard() { const v = roll(1, 13); return v > 10 ? 10 : v === 1 ? 11 : v; }
  function handVal(h) { let v = h.reduce((s, c) => s + c, 0); let aces = h.filter((c) => c === 11).length; while (v > 21 && aces > 0) { v -= 10; aces--; } return v; }
  function bjStart(bet) {
    if (bronze < bet) return;
    const p = [drawCard(), drawCard()];
    const d = [drawCard(), drawCard()];
    setBronze((b) => b - bet); setBjBet(bet); setBjPlayer(p); setBjDealer(d); setBjState("player"); setBjResult(null);
    if (handVal(p) === 21) bjFinish(p, d, "blackjack", bet);
  }
  function bjHit() { const np = [...bjPlayer, drawCard()]; setBjPlayer(np); if (handVal(np) > 21) bjFinish(np, bjDealer, "bust"); }
  function bjStand() { const d = [...bjDealer]; while (handVal(d) < 17) d.push(drawCard()); setBjDealer(d); bjFinish(bjPlayer, d, "stand"); }
  function bjFinish(p, d, reason, bet = bjBet) {
    const pv = handVal(p), dv = handVal(d);
    let outcome = "Dealer wins", payout = 0;
    if (reason === "bust") outcome = "Bust";
    else if (reason === "blackjack") { outcome = "Blackjack"; payout = Math.round(bet * 2.5); }
    else if (dv > 21 || pv > dv) { outcome = dv > 21 ? "Dealer bust" : "You win"; payout = bet * 2; }
    else if (pv === dv) { outcome = "Push"; payout = bet; }
    if (payout > 0) { setBronze((b) => b + payout); setTotalEarned((t) => t + payout); }
    setGambleMsg(`${outcome}${payout ? `: +${payout} Bronze` : ""}`);
    setBjState("done"); setBjResult({ outcome, payout, pv, dv });
  }

  const BG = "linear-gradient(160deg,#0a0814 0%,#100e1d 50%,#0d0b1a 100%)";
  const notifEl = notif && <div style={{ position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 200, background: notif.color, color: "#fff", padding: "8px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{notif.msg}</div>;

  function Header({ underworld = false }) {
    const ddCol = doomsday < 4 ? "#3ec995" : doomsday < 7 ? "#e0a523" : "#e85c3a";
    return <>
      {notifEl}
      <div className="topbar">
        <b className={underworld ? "brand brand-underworld" : "brand"}>{underworld ? "Underworld" : "Aleria"}</b>
        <div className="stat-strip">
          {[["HP", stats.hp, stats.maxHp, "#e85c3a"], ["MP", stats.mp, stats.maxMp, "#a89df0"], ["Sta", stats.stamina, stats.maxStamina, "#3ec995"]].map(([l, v, m, c]) => <div className="stat-pill" key={l}><span>{l} {v}/{m}</span><Bar val={v} max={m} color={c} h={5} /></div>)}
          {!postDoomsday ? <div className="stat-pill doom-pill"><span style={{ color: ddCol }}>Doom {Math.round(doomsday * 10)}%</span><Bar val={doomsday} max={10} color={ddCol} h={5} /></div> : <Tag color="#3ec995" glow>Freeplay</Tag>}
        </div>
        <span className="meta-chip">Day {day}</span>
        <span className="meta-chip">{xp} XP</span>
        <span className="meta-chip">{DIFFICULTIES[difficulty]?.name || "Normal"}</span>
        {cls?.id === "adventurer" && hasBadge && <Tag color="#e0a523">{ADV_RANKS[advRankIdx]}</Tag>}
        {cls?.id === "hunter" && <Tag color="#7c6fd4">*{hunterStars}</Tag>}
        <Btn small variant="ghost" onClick={() => saveProgress()}>Save</Btn>
        <Btn small variant="ghost" onClick={returnMainMenu}>Menu</Btn>
      </div>
      <div className="wallet-row"><CoinBar bronze={bronze} /></div>
    </>;
  }
  function Tabs({ items }) {
    return <div className="nav-tabs">{items.map((t) => <button className={screen === (t.screen || t.id) ? "active" : ""} key={t.id} onClick={() => { SFX.click(); setScreen(t.screen || t.id); setTab(t.id); }}>{t.label}</button>)}</div>;
  }
  function SectionHdr({ children }) { return <p style={{ fontSize: 13, color: "rgba(200,192,248,.55)", margin: "20px 0 8px", fontWeight: 700 }}>{children}</p>; }
  function ShopView() {
    const weapons = [...WEAPONS, ...craftedShop];
    return <div><h2>Shop</h2><p style={{ fontSize: 12, color: "rgba(200,192,248,.5)" }}>Balance: {fmtCoin(bronze)} {shopDiscount() > 0 && <span style={{ color: "#3ec995" }}> - {Math.round(shopDiscount() * 100)}% off</span>}</p>
      <SectionHdr>Primary weapon</SectionHdr><ItemList items={weapons} equipped={weapon} ownedIds={ownedWeaponIds} statKey="atk" label="ATK" onEquip={(w, owned) => { if (!owned) { const p = adjustedPrice(w.price); setBronze((b) => b - p); setOwnedWeaponIds((ids) => [...new Set([...ids, w.id])]); } setWeapon(w); SFX.buy(); }} />
      {race?.id === "tetrabrachian" && <><SectionHdr>Secondary weapon <span style={{ color: "#e0a523", fontSize: 10 }}>-3 DEF</span></SectionHdr><ItemList items={WEAPONS} equipped={weapon2} ownedIds={ownedWeaponIds} statKey="atk" label="ATK" onEquip={(w, owned) => { if (!owned) { const p = adjustedPrice(w.price); setBronze((b) => b - p); setOwnedWeaponIds((ids) => [...new Set([...ids, w.id])]); } setWeapon2(w); SFX.buy(); }} /></>}
      <SectionHdr>Armor</SectionHdr><ItemList items={ARMORS} equipped={armor} ownedIds={ownedArmorIds} statKey="def" label="DEF" onEquip={(a, owned) => { if (!owned) { const p = adjustedPrice(a.price); setBronze((b) => b - p); setOwnedArmorIds((ids) => [...new Set([...ids, a.id])]); } setArmor(a); SFX.buy(); }} />
      <SectionHdr>Foci & Charms</SectionHdr><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 8 }}>{TOOLS.map((t) => { const owned = myTools.some((x) => x.id === t.id); const price = adjustedPrice(t.price); return <Panel key={t.id} style={{ opacity: owned || bronze >= price ? 1 : .45 }}><b>{t.name}</b><p style={{ fontSize: 11, color: "rgba(200,192,248,.5)" }}>{t.desc}</p>{owned ? <Tag color="#3ec995">Owned</Tag> : <Btn small disabled={bronze < price} onClick={() => { setBronze((b) => b - price); setMyTools((p) => [...p, t]); setStats((s) => ({ ...s, [t.stat]: s[t.stat] + t.val })); }}>{price} B</Btn>}</Panel>; })}</div>
      <SectionHdr>Potions</SectionHdr><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 8 }}>{POTIONS.map((p) => { const price = adjustedPrice(p.price); return <Panel key={p.id} style={{ opacity: bronze >= price ? 1 : .45 }}><b>{p.name}</b><p style={{ fontSize: 11, color: "rgba(200,192,248,.5)" }}>+{p.val} {p.stat}</p><Btn small variant="success" disabled={bronze < price} onClick={() => { setBronze((b) => b - price); setPotions((prev) => [...prev, p]); }}>{price} B</Btn></Panel>; })}</div></div>;
  }
  function ItemList({ items, equipped, ownedIds, statKey, label, onEquip }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{items.map((it) => { const equippedNow = equipped.id === it.id; const owned = ownedIds.includes(it.id); const price = adjustedPrice(it.price); return <Panel key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, opacity: equippedNow || owned || bronze >= price ? 1 : .45 }}><div style={{ flex: 1 }}><b>{it.name}</b> <span style={{ color: "rgba(200,192,248,.45)", fontSize: 11 }}>+{it[statKey] || 0} {label}</span>{it.desc && <p style={{ fontSize: 11, color: "rgba(200,192,248,.4)" }}>{it.desc}</p>}</div>{equippedNow ? <Tag color="#3ec995">Equipped</Tag> : <Btn small variant={owned ? "primary" : "amber"} disabled={!owned && bronze < price} onClick={() => onEquip(it, owned)}>{owned ? "Equip" : price === 0 ? "Equip" : `${price} B`}</Btn>}</Panel>; })}</div>;
  }
  function SpellsTab() {
    if (!race?.canSpell) return <div><h2>Spells</h2><p>Your kind does not work with spells.</p></div>;
    return <div><h2>Spell research</h2><p style={{ color: "rgba(200,192,248,.45)", fontSize: 12 }}>Sleep quality changes research speed.</p><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{visibleSpells().map((sp) => { const prereq = sp.prereq === null || spells.find((s) => s.id === sp.prereq)?.learned; const studied = spellStudiedToday[sp.id]; return <Panel key={sp.id} style={{ opacity: prereq || sp.learned ? 1 : .35 }}><div style={{ display: "flex", justifyContent: "space-between" }}><b style={{ color: sp.learned ? "#3ec995" : "#d4cbf8" }}>{sp.name}</b><span style={{ fontSize: 11 }}>{sp.learned ? "Learned" : prereq ? `${sp.progress}/100` : "Locked"}</span></div><p style={{ fontSize: 12, color: "rgba(200,192,248,.55)" }}>{sp.desc}</p>{prereq && !sp.learned && <><Bar val={sp.progress} max={100} color="#a89df0" /><div style={{ marginTop: 10 }}><Btn small disabled={studied} onClick={() => studySpell(sp.id)}>{studied ? "Studied" : "Study"}</Btn></div></>}{sp.learned && sp.combatUse && <Tag color="#a89df0">{sp.combatUse.mpCost} MP</Tag>}</Panel>; })}</div></div>;
  }
  function SkillsTab() {
    return <div><h2>Skills</h2><p style={{ color: "rgba(200,192,248,.45)", fontSize: 12 }}>Requirements are visible. Church reveals effects.</p><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{SKILLS.map((sk) => { const unlocked = unlockedSkills.some((u) => u.id === sk.id); const revealed = revealedSkills.includes(sk.id); const cur = Math.min(skillCtx[sk.reqType] || 0, sk.reqVal); return <Panel key={sk.id}><div style={{ display: "flex", justifyContent: "space-between" }}><b style={{ color: unlocked ? "#a89df0" : "#d4cbf8" }}>{sk.name}</b>{unlocked ? <Tag color="#3ec995">Unlocked</Tag> : <span style={{ fontSize: 11 }}>{cur}/{sk.reqVal}</span>}</div><p style={{ fontSize: 11, color: "rgba(200,192,248,.55)" }}>{sk.reqLabel}</p>{!unlocked && <Bar val={cur} max={sk.reqVal} color="#a89df0" />}{unlocked && <p style={{ fontSize: 12, color: revealed ? "#a89df0" : "rgba(200,192,248,.35)" }}>{revealed ? sk.desc : "Effect hidden. Visit church."}</p>}</Panel>; })}</div></div>;
  }
  function ChurchTab() {
    if (race?.id === "devil") return <div><h2>Church</h2><p>Devils do not enter churches.</p></div>;
    const hidden = unlockedSkills.filter((s) => !revealedSkills.includes(s.id));
    return <div><h2>Church of Ucliat</h2><p style={{ fontSize: 12, color: "rgba(200,192,248,.5)" }}>Reveal an unlocked Skill for {churchCost} Bronze.</p>{hidden.length === 0 ? <p>No undisclosed Skills.</p> : hidden.map((sk) => <Panel key={sk.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><b style={{ flex: 1 }}>{sk.name}</b><Btn small disabled={bronze < churchCost} onClick={() => visitChurch(sk.id)}>{churchCost} B</Btn></Panel>)}</div>;
  }
  function SleepTab() {
    return <div><h2>Sleep</h2><p style={{ color: "rgba(200,192,248,.55)", fontSize: 13 }}>Choose where you will sleep. The actual rest button appears on the Map so your lodging choice stays visible during play.</p><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{SLEEP.map((o) => {
      const selected = housing === o.id;
      const locked = o.id === "owned_house" && !ownsHouse;
      return <Panel key={o.id} style={{ borderColor: selected ? "rgba(62,201,149,.7)" : "rgba(255,255,255,.08)", background: selected ? "linear-gradient(135deg,rgba(62,201,149,.12),rgba(168,157,240,.05))" : undefined, opacity: locked ? .45 : 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}><b>{o.name}</b><div style={{ display: "flex", gap: 6, alignItems: "center" }}>{selected && <Tag color="#3ec995" glow>Selected</Tag>}{o.cost > 0 && <Tag color="#a8740c">{o.cost} B/night</Tag>}</div></div>
        <p style={{ fontSize: 12, color: "rgba(200,192,248,.58)" }}>{o.desc || "Comfortable rest."}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}><Tag color="#e85c3a">Doom +{o.doom}</Tag><Tag color="#3ec995">Recovery {Math.round(o.hp * 100)}%</Tag><Tag color="#a89df0">Spell {Math.round(o.spell * 100)}%</Tag></div>
        <Btn small variant={selected ? "success" : "primary"} disabled={locked} onClick={() => chooseSleepOption(o.id)}>{selected ? "Current lodging" : "Select lodging"}</Btn>
      </Panel>;
    })}</div>{!ownsHouse && <Panel style={{ marginTop: 12, borderColor: "rgba(232,185,56,.35)" }}><b>Buy a house</b><p>{fmtCoin(HOUSE_PRICE)}</p><Btn variant="amber" disabled={bronze < HOUSE_PRICE} onClick={buyHouse}>Buy</Btn></Panel>}</div>;
  }
  function GamblingTab() {
    const Card = ({ value, hidden }) => <span className={hidden ? "play-card hidden-card" : "play-card"}>{hidden ? "?" : value}</span>;
    return <div><h2 style={{ color: "#ff6bcb" }}>Gambling Den</h2>{gambleMsg && <Panel style={{ marginBottom: 12, borderColor: "rgba(255,107,203,.35)" }}><b style={{ color: "#ff6bcb" }}>{gambleMsg}</b></Panel>}<Panel style={{ marginBottom: 12 }}><b>Slot Machine</b><div className={slotSpinning ? "slot-reels spinning" : "slot-reels"}>{slotResult.map((s, i) => <div key={i} className="slot-reel">{SLOT_SYM[s]}</div>)}</div>{[10, 50, 200].map((b) => <Btn key={b} small variant="amber" disabled={slotSpinning || bronze < b} onClick={() => spinSlot(b)}>Bet {b}</Btn>)}</Panel><Panel style={{ marginBottom: 12 }}><b>Wheel</b><div className="wheel-wrap"><div className="wheel-pin" /><div className="gamble-wheel" style={{ transform: `rotate(${wheelAngle}deg)`, background: `conic-gradient(${WHEEL_SLOTS.map((s, i) => `${s.c} ${i * 45}deg ${(i + 1) * 45}deg`).join(",")})` }} /></div>{[10, 20, 100, 500].map((b) => <Btn key={b} small disabled={wheelSpinning || bronze < b} onClick={() => spinWheel(b)}>Spin {b}</Btn>)}</Panel><Panel><b>Blackjack</b>{bjState === "idle" ? <div style={{ marginTop: 10 }}>{[50, 200, 1000].map((b) => <Btn key={b} small variant="success" disabled={bronze < b} onClick={() => bjStart(b)}>Bet {b}</Btn>)}</div> : <div><p>Dealer {bjState === "player" ? "" : `(${handVal(bjDealer)})`}</p><div className="card-row">{bjDealer.map((c, i) => <Card key={i} value={c} hidden={bjState === "player" && i > 0} />)}</div><p>You ({handVal(bjPlayer)})</p><div className="card-row">{bjPlayer.map((c, i) => <Card key={i} value={c} />)}</div>{bjState === "player" ? <><Btn small onClick={bjHit}>Hit</Btn><Btn small variant="amber" onClick={bjStand}>Stand</Btn></> : <><p>{bjResult?.outcome} {bjResult?.payout ? `+${bjResult.payout}` : ""}</p><Btn small onClick={() => setBjState("idle")}>New hand</Btn></>}</div>}</Panel></div>;
  }
  function MerchantTab() {
    return <div><h2 style={{ color: "#ffd966" }}>Workshop</h2><Panel style={{ marginBottom: 12 }}><b>Materials</b><div style={{ display: "flex", gap: 8, margin: "10px 0" }}><Tag color="#3ec995">Herb x{craftMaterials.herb}</Tag><Tag color="#a8740c">Metal x{craftMaterials.metal}</Tag><Tag color="#a89df0">Crystal x{craftMaterials.crystal}</Tag></div>{[["herb", 15], ["metal", 35], ["crystal", 80]].map(([m, c]) => <Btn key={m} small disabled={bronze < c} onClick={() => { setBronze((b) => b - c); setCraftMaterials((x) => ({ ...x, [m]: x[m] + 1 })); }}>Buy {m} ({c})</Btn>)}</Panel>{!craftActive && !craftResult && <Panel><p>Five-step crafting. Match the action shown.</p><Btn variant="amber" onClick={startCrafting}>Begin</Btn></Panel>}{craftActive && <Panel><h3>Step {craftStep + 1}/5</h3><p>Match: <b style={{ color: "#ffd966" }}>{craftSequence[craftStep]}</b></p>{["hammer", "fold", "quench", "temper", "etch"].map((a) => <Btn key={a} small variant="amber" onClick={() => craftAction(a)}>{a}</Btn>)}<p>Errors: {craftErrors}</p></Panel>}{craftResult && <Panel><h3>{craftResult.toUpperCase()}</h3><p>{craftResult === "masterwork" ? "Added to shop." : "Sold."}</p><Btn small onClick={() => setCraftResult(null)}>Continue</Btn></Panel>}</div>;
  }

  if (showCutscene) return <div style={{ minHeight: "100vh", background: "radial-gradient(circle,#3a0a0a,#000 70%)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ textAlign: "center" }}><h1 style={{ fontSize: 44, color: "#e85c3a", textShadow: "0 0 30px #e85c3a" }}>The Doomsday Has Come</h1><p>The earth screams. Monsters pour from below.</p></div></div>;
  if (showVictory) return <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#1a0530,#3a0a4a,#1a0530)", position: "relative" }}><Confetti /><div style={{ position: "relative", zIndex: 60, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}><Panel style={{ maxWidth: 560, textAlign: "center", background: "rgba(0,0,0,.55)", border: "2px solid #ffd966", boxShadow: "0 0 60px rgba(255,217,102,.45)" }}><h1 style={{ fontSize: 42, color: "#ffd966" }}>VICTORY</h1><p>The Lumenari has fallen. Your progress can now be saved, and Insanity difficulty is unlocked.</p><p style={{ color: "#3ec995" }}>Doomsdays cleared: {doomsdaysCleared + 1}</p><Btn full variant="gold" onClick={() => { saveProgress("overworld"); continuePostDoomsday(); }}>Continue this life</Btn><div style={{ height: 10 }} /><Btn full onClick={restartWithNewRace}>Start with another race</Btn><div style={{ height: 10 }} /><Btn full variant="ghost" onClick={() => { saveProgress("overworld"); setShowVictory(false); setScreen("race"); }}>Save and main menu</Btn></Panel></div></div>;
  if (screen === "race") return <div style={{ minHeight: "100vh", position: "relative" }}><Ton618BG /><div style={{ position: "relative", zIndex: 1, padding: "3rem 1.5rem" }}><div style={{ maxWidth: 980, margin: "0 auto" }}><div style={{ textAlign: "center", marginBottom: 28 }}><h1 style={{ fontSize: 44, color: "#fff", textShadow: "0 0 40px rgba(220,80,200,.7)" }}>Aleria: Contractor</h1><p style={{ color: "rgba(255,180,220,.65)", letterSpacing: ".1em" }}>CHOOSE DIFFICULTY AND RACE</p><div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginTop: 14 }}>{Object.entries(DIFFICULTIES).map(([id, d]) => { const unlocked = canUseDifficulty(id); return <button key={id} disabled={!unlocked} onClick={() => setDifficulty(id)} className={difficulty === id ? "difficulty-card active" : "difficulty-card"}><b>{d.name}</b><span>{unlocked ? d.desc : "Locked until Lumenari is defeated."}</span>{d.permadeath && <em>One-life warning</em>}</button>; })}</div><div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>{doomsdaysCleared > 0 && <Tag color="#ffd966">Doomsdays cleared: {doomsdaysCleared}</Tag>}<Btn small variant="ghost" onClick={loadProgress}>Load save</Btn></div></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>{RACES.map((r) => { const unlocked = !r.locked || (r.unlockVal && doomsdaysCleared >= r.unlockVal); return <Panel key={r.id} onClick={() => pickRace(r)} style={{ opacity: unlocked ? 1 : .35, background: unlocked ? "linear-gradient(160deg,rgba(120,60,180,.2),rgba(60,30,90,.08))" : "rgba(20,10,30,.4)", borderColor: unlocked ? "rgba(220,180,255,.3)" : "rgba(255,255,255,.06)" }}><div style={{ display: "flex", justifyContent: "space-between" }}><h3>{r.name}</h3>{!unlocked && <span style={{ fontSize: 10 }}>LOCKED</span>}</div><p style={{ color: "rgba(230,210,255,.7)", fontSize: 13 }}>{r.desc}</p>{unlocked && <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{r.hpBonus !== 0 && <Tag color="#e85c3a">{r.hpBonus > 0 ? "+" : ""}{r.hpBonus} HP</Tag>}{r.atkBonus > 0 && <Tag color="#e0a523">+{r.atkBonus} ATK</Tag>}{r.dodge > 10 && <Tag color="#3ec995">{r.dodge}% Dodge</Tag>}{r.canGamble && <Tag color="#ff6bcb">Gambler</Tag>}{r.canMerchant && <Tag color="#ffd966">Merchant</Tag>}{r.canSpell === false && <Tag color="#888">No spells</Tag>}</div>}</Panel>; })}</div></div></div></div>;
  if (screen === "devil_intro") return <Story tag="Devil - Underworld" color="#a8740c" title="Siphoning Station - Sector Three" text={"The station smells of mineral heat and crystal dust.\n\nAmber means manageable. Red means you are already behind.\n\nYou have never seen the surface."} action="Begin shift" onAction={beginUnderworld} />;
  if (screen === "devil_class") return <Choice title="Choose a surface path" tag="Devil - Surface" items={CLASSES_BASE} onPick={(c) => { setCls(c); setScreen("overworld"); setTab("map"); }} />;
  if (screen === "tenebrim_slave") return <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0d0a0a,#150f0f)", padding: 32 }}><div style={{ maxWidth: 540, margin: "0 auto" }}><Tag color="#b83a2a">Tenebrim - Slave</Tag><h2>Elysandria - Lower Estate</h2><p>You were sold before you understood what it meant.{escapeReady ? " An opportunity has appeared." : ""}</p>{!slaveTask && !escapeReady && <Btn variant="danger" onClick={startSlaveWork}>Begin labor</Btn>}{slaveTask && !escapeReady && <Panel><p>Day {slaveDay + 1}/3</p><b>{slaveTask}</b><Bar val={slaveProgress} max={100} color="#b83a2a" h={10} /><div style={{ marginTop: 14 }}><Btn variant="danger" onClick={doSlaveWork}>Work</Btn></div></Panel>}{escapeReady && <Panel><b>Escape window</b><p>The gate is unwatched.</p><Btn variant="amber" onClick={doEscape}>Run</Btn></Panel>}</div></div>;
  if (screen === "tenebrim_tribe") return <Story tag="Tenebrim - Menfor Tribe" color="#3ec995" title="Forest Encampment" text={"You grew up among your own. Elders speak of Aleria's wider world only in warnings.\n\nYou have decided to leave."} action="Leave the tribe" onAction={() => { setCls({ id: "wanderer", name: "Wanderer", org: "Self-trained" }); setScreen("intro_tenebrim"); }} />;
  if (screen === "intro_tenebrim") return <Story tag="Tenebrim - Wanderer" color="#3ec995" title="Secluded Forest" text={"No guild. No bounty board. Just the woods.\n\nTrain alone. Get stronger or die."} action="Begin" onAction={beginGame} />;
  if (screen === "origin") return <Choice title="Where are you coming from?" tag={race?.name} items={ORIGINS} onPick={pickOrigin} />;
  if (screen === "class") return <Choice title="Choose your path" tag={race?.name} items={race?.canMerchant ? [...CLASSES_BASE, CLASS_MERCHANT] : CLASSES_BASE} onPick={pickClass} />;
  if (screen === "intro") return <Story tag={`${race?.name} - ${cls?.name}`} color="#5b4fd4" title="Elysandria" text={origin?.id === "youth" ? "The road from home took four days. The lower district is loud and warm." : "The contract board outside the guild smells like old rain and wood resin."} action="Begin" onAction={beginGame} />;
  if (screen === "siphon") return <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#080810,#0d0c18)" }}><Header underworld /><main style={{ maxWidth: 620, margin: "0 auto", padding: 18 }}>{!siphonResult ? <><p>Click nodes before they overflow. Time: {siphonTime}s. Score: {siphonScore}</p><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>{siphonNodes.map((n) => { const pct = Math.round(n.level); const col = n.level > 80 ? "#e85c3a" : n.level > 55 ? "#e0a523" : "#a89df0"; return <Panel key={n.id} onClick={() => tapNode(n.id)} style={{ textAlign: "center", borderColor: col }}><div style={{ height: 90, display: "flex", alignItems: "flex-end", justifyContent: "center" }}><div style={{ width: 32, height: `${pct}%`, background: col, minHeight: 4 }} /></div><b style={{ color: col }}>{pct}%</b></Panel>; })}</div><div style={{ marginTop: 12 }}><Btn variant="ghost" onClick={leaveSiphon}>Leave</Btn></div></> : <Panel><h2>Shift complete</h2><p>Score: {siphonScore}</p><Btn onClick={leaveSiphon}>Continue</Btn></Panel>}</main></div>;
  if (screen === "training") return <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#10180c,#0e1408)" }}><Header /><main style={{ maxWidth: 760, margin: "0 auto", padding: 18 }}>{!trainResult ? <><p>Time: {trainTime}s. Hits: {trainScore}. Every 4 hits = +1 physical level.</p><div style={{ position: "relative", height: 380, border: "1px solid rgba(62,201,149,.25)", borderRadius: 8, background: "rgba(20,40,20,.3)", overflow: "hidden" }}>{trainTargets.map((t) => <button key={t.id} onClick={() => { setTrainTargets((p) => p.filter((x) => x.id !== t.id)); setTrainScore((s) => s + 1); SFX.hit(); }} style={{ position: "absolute", left: `${t.x}%`, top: `${t.y}%`, width: 50, height: 50, borderRadius: "50%", border: "2px solid #fff", background: "radial-gradient(circle,#3ec995,#1a7a4f)", transform: "translate(-50%,-50%)", cursor: "pointer" }} />)}</div></> : <Panel><h2>Training complete</h2><p>Hits: {trainScore}. Physical level: +{physicalLevel}</p><Btn onClick={() => { setScreen("overworld"); setTab("map"); }}>Continue</Btn></Panel>}</main></div>;
  if (screen === "underworld") return <Hub underworld />;
  if (["overworld", "shop", "spells", "skills", "church", "guild", "sleep", "gambling", "merchant", "training_tab"].includes(screen)) return <Hub />;
  if (screen === "combat") return <CombatScreen />;
  if (screen === "endgame_combat") return <EndgameScreen />;
  if (screen === "lumenari") return <LumenariScreen />;
  return null;

  function Story({ tag, color, title, text, action, onAction }) {
    return <div style={{ minHeight: "100vh", background: BG, padding: "3rem 1.5rem" }}><div style={{ maxWidth: 560, margin: "0 auto" }}><Tag color={color}>{tag}</Tag><h2>{title}</h2><p style={{ whiteSpace: "pre-line", lineHeight: 1.9, color: "rgba(220,215,255,.75)" }}>{text}</p><Btn onClick={onAction}>{action}</Btn></div></div>;
  }
  function Choice({ title, tag, items, onPick }) {
    return <div style={{ minHeight: "100vh", background: BG, padding: "2.5rem 1.5rem" }}><div style={{ maxWidth: 600, margin: "0 auto" }}><Tag>{tag}</Tag><h2>{title}</h2><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{items.map((it) => <Panel key={it.id} onClick={() => onPick(it)}><div style={{ display: "flex", justifyContent: "space-between" }}><b>{it.name}</b>{it.org && <span style={{ fontSize: 11, color: "rgba(200,192,248,.45)" }}>{it.org}</span>}</div><p style={{ color: "rgba(200,192,248,.6)", fontSize: 13 }}>{it.desc}</p></Panel>)}</div></div></div>;
  }
  function Hub({ underworld = false }) {
    const tabs = underworld ? [{ id: "under_map", label: "Map", screen: "underworld" }, { id: "under_shop", label: "Shop", screen: "underworld" }, { id: "under_spells", label: "Spells", screen: "underworld" }] : [{ id: "overworld", label: "Map" }, { id: "shop", label: "Shop" }, { id: "sleep", label: "Sleep" }, { id: "skills", label: "Skills" }];
    if (!underworld && race?.canSpell) tabs.splice(2, 0, { id: "spells", label: "Spells" });
    if (!underworld && !race?.canSpell) tabs.push({ id: "training_tab", label: "Train" });
    if (!underworld && race?.id !== "devil") tabs.push({ id: "church", label: "Church" });
    if (!underworld && cls?.id === "adventurer") tabs.push({ id: "guild", label: "Guild" });
    if (!underworld && postDoomsday && race?.canGamble) tabs.push({ id: "gambling", label: "Gambling" });
    if (!underworld && ((postDoomsday && race?.canMerchant) || cls?.id === "merchant")) tabs.push({ id: "merchant", label: "Craft" });
    return <div className={underworld ? "app-shell underworld-shell" : "app-shell"}><Header underworld={underworld} /><Tabs items={tabs} /><main className="page-wrap">{underworld && tab === "under_map" && <div>{nobleInvite && !declinedInvite && <Panel style={{ marginBottom: 14, borderColor: "rgba(232,185,56,.5)" }}><b style={{ color: "#e8c878" }}>A noble's invitation</b><p>Accepting means leaving the Underworld permanently.</p><Btn variant="amber" onClick={acceptNobleInvite}>Accept</Btn><Btn variant="ghost" onClick={declineNobleInvite}>Decline</Btn></Panel>}<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}><Panel onClick={startSiphon}><b>Siphoning shift</b><p>Manage mana nodes.</p><Btn small onClick={startSiphon}>Start</Btn></Panel><Panel onClick={() => startCombat(true)}><b style={{ color: "#e85c3a" }}>Hunt monsters{declinedInvite ? " !" : ""}</b><p>{declinedInvite ? "Threats are much harder." : "Cull sector threats."}</p><Btn small variant="danger" onClick={() => startCombat(true)}>Hunt</Btn></Panel><Panel onClick={() => doSleep("inn")}><b>Sleep</b><p>Rest in quarters.</p><Btn small variant="success" onClick={() => doSleep("inn")}>Sleep</Btn></Panel></div><LogBox /></div>}{underworld && tab === "under_shop" && <ShopView />}{underworld && tab === "under_spells" && <SpellsTab />}{!underworld && screen === "overworld" && <div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}><Panel onClick={() => startCombat(false)}><b style={{ color: "#e85c3a" }}>Contract board</b><p>{postDoomsday ? "Freeplay work." : "Routine patrol."}</p>{nextSkill && <p style={{ fontSize: 11, color: "#a89df0" }}>Next skill: {Math.min(skillCtx[nextSkill.reqType] || 0, nextSkill.reqVal)}/{nextSkill.reqVal}</p>}<Btn small variant="danger" onClick={() => startCombat(false)}>Take</Btn></Panel><SleepShortcut />{!race?.canSpell && <Panel onClick={startTraining}><b>Combat training</b><p>Raise physical level.</p><Btn small variant="amber" onClick={startTraining}>Train</Btn></Panel>}</div><PotionRow /><LogBox /></div>}{!underworld && screen === "shop" && <ShopView />}{!underworld && screen === "spells" && <SpellsTab />}{!underworld && screen === "skills" && <SkillsTab />}{!underworld && screen === "church" && <ChurchTab />}{!underworld && screen === "sleep" && <SleepTab />}{!underworld && screen === "gambling" && <GamblingTab />}{!underworld && screen === "merchant" && <MerchantTab />}{!underworld && screen === "training_tab" && <div><h2>Combat training</h2><p>Physical level: +{physicalLevel}</p><Btn variant="amber" onClick={startTraining}>Begin</Btn></div>}{!underworld && screen === "guild" && <div><h2>Alabastrine Guild</h2><Panel><h3>{hasBadge ? ADV_RANKS[advRankIdx] : "Badge revoked"}</h3>{advRankIdx < 5 && hasBadge && <><Bar val={Math.min(xp, RANK_THRESHOLDS[advRankIdx])} max={RANK_THRESHOLDS[advRankIdx]} color="#e0a523" h={8} /><p>{xp}/{RANK_THRESHOLDS[advRankIdx]} XP. Earnings x{RANK_MULT[advRankIdx].toFixed(2)}</p></>}</Panel></div>}</main></div>;
  }
  function SleepShortcut() {
    const opt = selectedSleepOption();
    const cannotAfford = opt.cost > 0 && bronze < opt.cost;
    return <Panel style={{ borderColor: "rgba(62,201,149,.32)", background: "linear-gradient(135deg,rgba(62,201,149,.1),rgba(168,157,240,.05))" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}><b>Sleep</b><Tag color="#3ec995">{opt.name}</Tag></div>
      <p style={{ fontSize: 12, color: "rgba(200,192,248,.6)" }}>{opt.cost > 0 ? `${opt.cost} Bronze tonight.` : "No cost tonight."} Doomsday +{opt.doom}.</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Btn small variant="success" disabled={cannotAfford} onClick={() => doSleep(opt.id)}>{cannotAfford ? "Need Bronze" : "Sleep here"}</Btn><Btn small variant="ghost" onClick={() => setScreen("sleep")}>Change</Btn></div>
    </Panel>;
  }
  function PotionRow() {
    return potions.length > 0 && <Panel style={{ marginTop: 10 }}><b style={{ fontSize: 11 }}>Potions</b><div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>{getPotionStacks().map((p) => <Btn key={p.id} small variant="success" onClick={() => usePotion(p)}>{p.name} x{p.count}</Btn>)}</div></Panel>;
  }
  function LogBox() {
    return log.length > 0 && <div ref={logRef} style={{ maxHeight: 130, overflowY: "auto", padding: 10, border: "1px solid rgba(255,255,255,.06)", borderRadius: 8, fontSize: 12, lineHeight: 1.8, marginTop: 10 }}>{log.map((l) => <div key={l.id} style={{ color: LOG_C[l.type] || "#ccc" }}>{l.msg}</div>)}</div>;
  }
  function CombatScreen() {
    const learned = visibleSpells().filter((s) => s.learned && s.combatUse);
    const base = availablePhysicalAttacks();
    const actions = [...base, { id: "guard", name: "Guard", desc: "Reduce next hit." }, { id: "focus", name: "Focus", desc: "+15 stamina." }, ...(race?.canSpell ? learned.map((s) => ({ id: s.id, name: s.combatUse.label, dmg: s.combatUse.dmg, mpCost: s.combatUse.mpCost, desc: "Spell.", isSpell: true, effect: s.combatUse.effect, turns: s.combatUse.turns })) : [])];
    return <div className="combat-shell"><div className="combat-top"><div><b>Combat</b>{combat && <span className="combat-name">{starIcons(combat.star)} {combat.name}</span>}</div>{combatPhase === "player" && !combatResult && <button className="flee-button" onClick={flee}>FLEE (5%)</button>}</div><main className="combat-wrap"><div className="combat-cards"><Panel><b className="combat-label">YOU</b>{[["HP", stats.hp, stats.maxHp, "#e85c3a"], ["MP", stats.mp, stats.maxMp, "#a89df0"], ["Sta", stats.stamina, stats.maxStamina, "#3ec995"]].map(([l, v, m, c]) => <div key={l} className="combat-bar"><span>{l} {v}/{m}</span><Bar val={v} max={m} color={c} /></div>)}</Panel>{combat && <Panel><b className="combat-label">{combat.name.toUpperCase()}</b><div className="combat-bar"><span>HP {combat.hp}/{combat.maxHp}</span><Bar val={combat.hp} max={combat.maxHp} color={combat.star >= 3 ? "#e0a523" : "#e85c3a"} /></div><div className="star-row">{starIcons(combat.star)}</div>{enemyStunned > 0 && <Tag color="#a89df0">Stunned</Tag>}</Panel>}</div><LogBox /><PotionRow />{combatResult ? <div style={{ marginTop: 12 }}>{combatResult === "win" ? <Btn variant="success" onClick={() => { setScreen(combatOrigin); setTab(combatOrigin === "underworld" ? "under_map" : "map"); }}>Return</Btn> : <Btn variant="danger" onClick={() => { setStats((s) => ({ ...s, hp: Math.round(s.maxHp * .4), stamina: Math.round(s.maxStamina * .5) })); setScreen(combatOrigin); setTab(combatOrigin === "underworld" ? "under_map" : "map"); }}>Respawn</Btn>}</div> : combatPhase === "player" ? <div className="action-grid">{actions.map((a) => <button className={`action-card ${a.isSpell ? "spell-action" : ""}`} key={a.id} disabled={(a.staminaCost && stats.stamina < a.staminaCost) || (a.mpCost && stats.mp < a.mpCost)} onClick={() => playerAct(a)}><b>{a.name}</b><span>{a.desc}</span><div>{a.staminaCost && <Tag color="#3ec995">{a.staminaCost} Sta</Tag>}{a.mpCost && <Tag color="#a89df0">{a.mpCost} MP</Tag>}</div></button>)}</div> : <p>Enemy acting...</p>}</main></div>;
  }
  function EndgameScreen() {
    return <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#1a0808,#2a1010)" }}><Header /><main style={{ maxWidth: 800, margin: "0 auto", padding: 18 }}><div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}><h2 style={{ color: "#e85c3a", flex: 1 }}>DOOMSDAY Wave {endgameWave + 1}/5</h2><Tag color="#3ec995">Allies {allies}</Tag><Btn small variant="amber" disabled={bronze < 120 + allies * 40} onClick={recruitAlly}>Recruit {120 + allies * 40} B</Btn></div><PotionRow /><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 10 }}>{endgameMonsters.map((m, i) => <Panel key={m.id} onClick={m.hp > 0 ? () => endgameAttack(i) : undefined} style={{ opacity: m.hp > 0 ? 1 : .35, borderColor: "rgba(232,92,58,.3)" }}><b>{m.name}</b><Bar val={Math.max(0, m.hp)} max={m.maxHp} color="#e85c3a" /><p>{Math.max(0, m.hp)}/{m.maxHp}</p></Panel>)}</div><LogBox />{combatResult === "lose" && <Btn variant="danger" onClick={() => { setStats((s) => ({ ...s, hp: s.maxHp, mp: s.maxMp })); startEndgameWave(endgameWave); }}>Retry</Btn>}</main></div>;
  }
  function LumenariScreen() {
    const learned = visibleSpells().filter((s) => s.learned && s.combatUse);
    const base = race?.id === "tetrabrachian" ? TET_ATTACKS : PHYS_ATTACKS.slice(0, 3);
    const actions = [...base, ...(race?.canSpell ? learned.map((s) => ({ id: s.id, name: s.combatUse.label, dmg: s.combatUse.dmg || [10, 18], mpCost: s.combatUse.mpCost, isSpell: true })) : [])];
    const canAct = lumenCombatPhase === "player" && !combatResult && !qteActive;
    return <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at top,#1a0a30 0%,#080010 60%,#000 100%)", display: "flex", flexDirection: "column" }}><style>{`@keyframes rain{0%{transform:translateY(-10vh);opacity:0}40%{opacity:1}100%{transform:translateY(110vh);opacity:0}}`}</style>{lumenariPhase >= 2 && Array.from({ length: 16 }).map((_, i) => <div key={i} style={{ position: "fixed", left: `${3 + i * 6}%`, top: 0, width: 2, height: 60, background: "linear-gradient(180deg,transparent,#ffd966,transparent)", animation: `rain ${1 + Math.random() * 1.7}s linear infinite`, animationDelay: `${Math.random() * 2}s` }} />)}{lumenari && <div style={{ padding: "18px 22px", background: "rgba(0,0,0,.75)", borderBottom: "1px solid rgba(255,217,102,.45)", boxShadow: "0 0 90px rgba(255,217,102,.28)" }}><div style={{ display: "flex", justifyContent: "space-between" }}><h1 style={{ margin: 0, color: "#ffd966" }}>LUMENARI</h1><div><Tag color="#e85c3a">Phase {lumenariPhase}</Tag> <Tag color="#3ec995">Allies {allies}</Tag></div></div><Bar val={lumenari.phaseHp} max={lumenari.phaseMaxHp} color="#ffd966" h={14} /></div>}<div style={{ flex: 1, display: "flex" }}><main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18, padding: 20 }}>{qteActive && <Panel style={{ textAlign: "center", border: "2px solid #ffd966", background: "rgba(255,217,102,.1)" }}><h2 style={{ color: "#ffd966" }}>EVADE</h2><div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 14 }}>{qteSequence.map((d, i) => <span key={i} style={{ width: 40, height: 40, display: "grid", placeItems: "center", borderRadius: 8, border: `2px solid ${i === qteIdx ? "#ffd966" : "rgba(255,217,102,.25)"}`, color: i < qteIdx ? "#3ec995" : "#ffd966" }}>{d}</span>)}</div>{["^", "<", "v", ">"].map((d) => <Btn key={d} variant="gold" onClick={() => qteInput(d)}>{d}</Btn>)}</Panel>}{!qteActive && lumenariPhase === 3 && <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, width: "100%", maxWidth: 430 }}>{golems.map((g, i) => <Panel key={g.id} onClick={g.hp > 0 ? () => attackGolem(i) : undefined} style={{ opacity: g.hp > 0 ? 1 : .3, textAlign: "center" }}><b>Golem {i + 1}</b><Bar val={g.hp} max={g.maxHp} color="#a8744c" /></Panel>)}</div>}{!qteActive && !combatResult && <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(actions.length, 3)},1fr)`, gap: 12, width: "100%", maxWidth: 520 }}>{actions.map((a) => <button key={a.id} disabled={!canAct || (a.staminaCost && stats.stamina < a.staminaCost) || (a.mpCost && stats.mp < a.mpCost)} onClick={() => lumenariAttack(a)} style={{ padding: "22px 12px", borderRadius: 10, border: "1px solid rgba(255,217,102,.45)", background: "rgba(255,217,102,.08)", color: "#ffd966", opacity: !canAct ? .35 : 1, cursor: "pointer" }}><b>{a.name}</b></button>)}</div>}<p style={{ color: lumenCombatPhase === "player" ? "#ffd966" : "#e85c3a" }}>{qteActive ? "INPUT REQUIRED" : lumenCombatPhase === "player" ? "YOUR TURN" : "LUMENARI ACTING"}</p></main><aside style={{ width: 220, background: "rgba(0,0,0,.5)", borderLeft: "1px solid rgba(255,217,102,.15)", padding: 14 }}><b style={{ color: "#ffd966" }}>YOU</b>{[["HP", stats.hp, stats.maxHp, "#e85c3a"], ["MP", stats.mp, stats.maxMp, "#a89df0"], ["Sta", stats.stamina, stats.maxStamina, "#3ec995"]].map(([l, v, m, c]) => <div key={l} style={{ marginTop: 10 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span>{l}</span><span>{v}/{m}</span></div><Bar val={v} max={m} color={c} h={7} /></div>)}<div style={{ marginTop: 16 }}><b style={{ color: "#3ec995", fontSize: 11 }}>POTIONS</b>{getPotionStacks().map((p) => <button key={p.id} onClick={() => usePotion(p)} style={{ display: "block", width: "100%", marginTop: 6, padding: 7, borderRadius: 6, border: "1px solid rgba(62,201,149,.3)", background: "rgba(62,201,149,.1)", color: "#3ec995", cursor: "pointer" }}>{p.name} x{p.count}</button>)}</div><LogBox /></aside></div></div>;
  }
}
