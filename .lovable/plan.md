# Elf Scenario Overhaul Plan

I'll do this in **two passes** so you can play-test between them. Pass 1 = bug fixes + core systems. Pass 2 = content (scenarios, tutorial, new researches).

---

## Pass 1 — Fixes & Core Systems

### Bug fixes
- **SSR crash**: harden `AudioEngine.js` so module load never touches `window` at top level (the current `typeof window` guard is fine, but I'll also defer `currentBGM`/`new Audio` access patterns and re-verify SSR).
- **"Sent into the complex after combat"**: trace the post-combat flow in `ElfScenario.jsx`. After a monster fight from "Explore Ruins", return the player to the **exploration screen** with their dungeon state intact, not the complex.
- **Dungeon persistence on flee**: when fleeing a dungeon, snapshot `(dungeonId, remainingEnemies, remainingLoot, currentRoom)` into state. Re-entering the same dungeon restores that snapshot. Clearing it wipes the snapshot.

### Eating & resting
- Rations: add an **"Eat ration"** button in the menu (outside combat) that consumes 1 ration and restores HP.
- Resting: small HP heal on rest in addition to current effects.

### Food / population scaling
- Food **consumption**: base × `(1 + 1·floor(civilians/5))` — i.e., doubles for every 5 civilians (5 civ = 2×, 10 civ = 3×, …). I'll confirm exact wording matches your intent ("doubles for every 5"); current spec reads as additive doubling, which is what I'll implement.
- Food **storage cap**: scales with population (e.g., `baseCap + civilians × perCivCap`).
- Tooltip on the food bar shows current consumption rate + cap.

### Mana acquisition (fix the chicken-and-egg)
- Add a **passive mana source** available from the start: e.g., a low-tier "Mana Wisp" found rarely while exploring ruins (no research required), and/or a small per-day mana trickle from a starter building.
- Keep "Mana Siphoning" research as the **scaling** option, not the gate.

### Combat encounter rate
- Lower base monster-encounter chance during "Explore Ruins" in early game (first N days or below threshold pop), ramping up over time.

### Federation Capital gate
- Add requirement: **≥15 artifacts AND ≥5 mana** to enter. Show requirement clearly on the entry button with a locked state if unmet.

### Exo-stim rebalance
- Change "Exo-Stim: 50% damage to Giants" → **"+25% damage to all monsters"** (since giants aren't a recurring foe). I'll note this as the simpler choice; if you'd rather I add Giants as a rare biome encounter instead, say the word and I'll do that in Pass 2.

---

## Pass 2 — Content & UX

### Notice-bar scenario UI (new component)
- Distinct visual style from regular toasts (amber/red bordered banner pinned top-center).
- **2-second click delay** — button is disabled with a countdown, then enables.
- Used for all event scenarios below.

### Civilian problem scenarios (random, gated by population)
- "Needs a home" — costs X materials to resolve (or civilian leaves / morale drop).
- "Needs warmth" — must upgrade generator (or pay fuel).
- "Needs food" — must have ≥ threshold of meat OR rations OR vegetables (any one).

### Refugee scenarios
- Random groups arrive: solo, couple, family, friends, larger group.
- Player chooses **Accept** (pop +N, food strain) or **Refuse** (small morale hit).

### Bandit scenarios
- Disguised as refugees OR open raid. Combat encounter or resource loss if accepted/ignored.

### Tutorial info button
- Bottom-left circular **(i)** button.
- Opens a panel with tabs: **Buildings / Research / Resources / Threats**.
- Each entry: what it does, what it costs, what it produces — **no strategy hints**, just ingredients.

### New buildings + researches (a few fitting additions)
- Watchtower (reduces bandit raid damage).
- Cistern (water storage; pairs with a "Filtration" research).
- "Cold Resistance Training" research (slower freeze in storms).
- "Ration Refinement" research (rations heal more, weigh less).
- Exact list trimmed during implementation to keep balance sane.

---

## Files I'll touch
- `src/game/ElfScenario.jsx` — most changes
- `src/game/AudioEngine.js` — SSR hardening
- `src/game/UIComponents.jsx` — NoticeBar component, InfoButton
- `src/game/aleria.css` — notice-bar styles, info panel
- Possibly small additions to `GameData.js` for new buildings/researches

## Open questions
1. **Exo-stim**: rebalance to "+25% all monsters", or add Giants as rare encounter?
2. **Notice-bar delay**: 2s exactly, or accept 2-3s range?
3. **Refugee rejection**: morale penalty, or no consequence (just lost opportunity)?

If you're happy with the plan, I'll start Pass 1 immediately. Answer the open questions in your reply (or just say "go" with defaults: exo-stim rebalance, 2s exact, small morale hit on refusal).
