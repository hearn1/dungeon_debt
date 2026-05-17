# M20.2 — Claude Design Handoff Brief

**Purpose of this document.** This is a self-contained brief to hand to **Claude design** (a separate session). It has no access to this repository, so everything it needs is written here. The deliverable we want back from Claude design is **HTML/JSX reference mockups** for five views of a Unity game, expressing **one shared visual system**, plus a short written rationale per view.

These mockups are **visual reference only**. They will be hand-translated back into Unity uGUI in a later implementation slice (M20.3+). They are not shipped, not embedded, and do not introduce a web/React UI layer into the game.

Read alongside:
- `SCREENSHOT_MANIFEST.md` (same folder) — the exact list of current-state screenshots, captured into the repo's `Design/Inputs/` folder. Those screenshots show the *current* look; this brief defines the *problem* and the *target*.
- Return mockups + rationale into a `mockups/` folder next to this brief (`Design/M20.2/mockups/`).

---

## 1. What Dungeon Debt is (one-pager)

Dungeon Debt is a single-player 2D fantasy **auto-battler economy roguelite** prototype built in Unity. The player recruits heroes, positions them in a 5-slot formation, picks a payroll risk, fights an auto-resolved combat, then pays upkeep — trying to avoid **debt bankruptcy**.

Per-round core loop (unchanged, do not redesign the loop):

> **Scout → Shop → Payroll Choice → Formation → Auto-Combat → Reward → Upkeep → Rival Update**

Resources the player tracks the whole run: **Gold**, **Debt**, **Morale**, plus active **Relics** and a difficulty preset label.

Debt has four readable status tiers the UI already surfaces by name: **Stable** (0–5), **Strained** (6–11), **Dangerous** (12–19), **Critical** (20+). Debt is the central pressure; its status must always read at a glance.

### The change that triggered this brief: the run is now twice as long and acts have identity

Originally the game was a **10-round single dungeon**. It is now a **20-round, 2-act run** (and the structure is being built to scale to Acts 3/4/5 later):

- **Act 1 = rounds 1–10**, the original dungeon. It is the "intro" act with no strong theme.
- **Act 2 = rounds 11–20**, a new **demonic-themed** act with its own enemies and final boss.
- Each act has the same 10-slot rhythm: dungeon fights, **three rival-guild fights** (one each vs. guilds *Frugal*, *Greedy*, *Carry*, in rising difficulty), and a **capstone Final Boss** at the act's last round that **awards a Relic**.
- Future acts (3/4/5) will each get their own distinct environment/theme identity (demonic is Act 2's; later themes TBD). The visual system you design must **scale to N themed acts**, not hardcode "Act 1 / Act 2".

The views below were all designed for the old 10-round, single-act, no-theme game. They must now stay legible across a 20-round run with distinct per-act identity, and be ready for Acts 3–5.

---

## 2. Hard constraints — design INSIDE this box

These are non-negotiable. A beautiful mockup that violates these is unusable because it cannot be built in this project. Treat each as MUST / MUST NOT.

**Rendering & layout**
- Target/reference resolution is **1920×1080, 16:9 only**. Design to that canvas. (User screenshots are snipping-tool crops at arbitrary size — use them for *content/context*, not pixel measurement.)
- The game UI is Unity **uGUI** (Canvas + RectTransform + bitmap/Text labels). Mockups must be expressible as rectangles, solid fills, simple borders, text, and static images. **No CSS that has no uGUI equivalent**: no gradients-as-core-meaning (a flat fallback must read fine), no box-shadow-dependent legibility, no blend modes, no SVG filters, no web fonts as a requirement (use a generic sans; treat font as swappable).
- **Single screen, panel-swap.** Each view is one panel toggled on/off by a central UI manager. Do not propose multi-window, modals stacking, drawers, or routed pages. A view may have internal regions, but it is one panel.
- **Mouse-only.** Interaction is uGUI button clicks. No hover-only information, no keyboard shortcuts, no drag unless it already exists (Formation has click-to-swap, not drag).

**Motion & effects (very strict — this project deliberately has almost none)**
- **No tween libraries, no animation framework.** The only motion that exists is one hand-coded effect sprite that slides source→target in combat.
- **DO NOT propose:** particles, VFX, screen shake, glow/bloom, animated gradients, looping idle animation, parallax, easing-heavy transitions, confetti, or audio. Color flashes and a static state change are the entire motion budget.
- Combat attack/heal/enchant visuals are limited to **exactly 5 shared effect sprites** (`melee_stab`, `arrow`, `fireball`, `heal`, `enchant`) reused by all units. Do not design per-enemy or per-hero unique attack art.

**Art**
- **Placeholder art only.** One static base sprite per hero/enemy, solid-color blocks, simple role-color chips, text. No illustrated backgrounds, no rigged characters, no rendered scenes. Per-act "theme" must be conveyed with **color, label, iconography-as-simple-glyph, and layout** — NOT with painted environment art.

**Scope (do not invent game features in the UI)**
- Do not add: a map, branching paths, a campaign/act-select screen, save/load, meta progression, equipment/inventory, a tutorial, new resources, new stats, or new combat mechanics. You are reskinning/reorganizing existing information, not designing new systems.
- Everything shown in a mockup must correspond to data the game already has (listed per-view below). If a view feels empty, improve hierarchy/density — do not add fictional data.

**Architecture intent**
- Panels are **presentation only**: they display state and raise click events. Don't imply client-side logic, computed/derived analytics, charts, or animation-driven state.

---

## 3. What we want back from Claude design

1. **One shared visual system** across all five views: a small type scale, a core palette, a consistent **per-act identity treatment** (how "which act + theme" is shown without painted art — e.g. an act accent color + a short theme word + a run-progress indicator), consistent panel chrome, consistent button styling, consistent status/severity color language (esp. the four debt tiers).
2. **Per-view mockups** applying that system: one HTML (or JSX) artifact per view, at the 1920×1080 reference aspect. Static is fine; if you use React/JSX keep it dependency-light and presentational.
3. A short **rationale per view**: what the multi-act/20-round problem was and how the redesign solves it, in a few sentences. Call out anything you intentionally left for implementation.
4. Stay within Section 2 at all times. If a constraint blocks an idea, pick the in-budget option and note the tradeoff.

Deliver as files we can drop next to this brief (e.g. `mockups/scout.html`, `mockups/run-header.html`, …) plus a `RATIONALE.md`. One unified `index.html` linking them is welcome but optional.

---

## 4. The five views

For each: **(a)** what it is and the exact data it currently shows (from the live code), **(b)** the 20-round / multi-act problem, **(c)** what must stay the same, **(d)** acceptance criteria the eventual Unity implementation will be checked against. Design to satisfy (d).

Priority order for the implementation that follows: **Run Header and Scout are highest priority** (most affected by length + acts) and will be implemented first; the others follow. Design all five as one system regardless.

---

### 4.1 Run Header / Run Contract  ⭐ highest priority

**(a) What it is / current data.** A persistent thin bar pinned to the top of the screen during the whole run (visible in Scout/Shop/Payroll/Formation/Combat/Reward states). Current layout is a single 80px-tall row split into four equal columns plus a thin secondary line:

- Column 1 (left): `"Act 2 - Round 4/10 - Predatory Interest"` — act label, round-**within-act**/rounds-in-act, optional difficulty-preset name.
- Column 2: `"Gold 37"`
- Column 3: `"Debt 14 (Dangerous)"` — raw debt plus its status-tier word inline in parentheses.
- Column 4 (right): `"Morale 5"`
- Thin line below, full width, small font: `"Relics: <name>, <name>, ..."` — empty if none; grows with each relic earned (capstones award relics, so up to ~4–5 by end of a 20-round run).

**(b) Problem at 20 rounds / multi-act.**
- "Round 4/10" is round-within-act. There is **no whole-run progress** sense (am I 4/20 or 14/20?) and **no clear act position** (which act of how many, how far in).
- Per-act **identity/theme** (Act 2 = demonic) is invisible — it's just the text "Act 2".
- Debt status is the single most important readability element but is buried as a parenthetical with no severity color; "Dangerous" and "Stable" look identical.
- The relics line is an ever-growing comma string with no cap/wrap strategy; by late Act 2 it can overrun.
- Four equal columns waste space on Morale/Gold while under-serving act-progress and debt-status.

**(c) Must stay the same.** Still one thin top bar (not a sidebar, not a HUD overlay over content). Still shows, at minimum: act position, round, gold, debt + debt status, morale, active relics. Still presentation-only. Still readable at the 1920-wide reference with placeholder fonts.

**(d) Implementation acceptance criteria.**
1. The header communicates **both** whole-run position and act position (e.g. act N of total + round within act + a run-progress sense) without a second screen.
2. **Debt status tier is the dominant readability element** and uses a consistent severity color language shared with other views (Stable→Critical).
3. Per-act identity is shown with a compact, **theme-swappable** treatment (accent + short theme word/glyph), defined so Acts 3–5 only supply new color+word, no relayout.
4. Active relics remain visible but have a defined behavior when many exist (cap + "+N", wrap, or compact chips) so the bar never overflows at end of a 20-round run.
5. Layout is fixed-height top chrome compatible with the existing screen-region split (it must not grow into the panel area below).

---

### 4.2 Scout  ⭐ high priority

**(a) What it is / current data.** A full-panel pre-fight briefing shown in the `Scout` state, before Shop. Current fixed-offset layout, centered ~700px content column:

- Title: `"Act 2 Round 4 - Gloom Bat"` (act label + round-within-act + encounter display name).
- Type line (italic): `"Act 2 - Dungeon"` / `"Act 2 - Rival Ghost"` / `"Act 2 - Final Boss"`.
- Scout text: a paragraph describing the fight's tactical problem.
- Reward: `"Reward: 12 gold"` (gold only).
- Danger: `"Danger: Backline pressure"` (a single category string; can be empty).
- A centered row of enemy cards (each shows the enemy's placeholder sprite + stats).
- Button: `"Continue to Shop"`.

Design intent from the game design doc: Scout should make the player think *"what is this fight asking me to solve?"* — it must present a clear tactical problem (enemy type: dungeon vs. rival guild; main threat; danger; reward).

**(b) Problem at 20 rounds / multi-act.**
- No sense of **where this fight sits in the act or run** (is this a mid-act dungeon or the round-20 capstone?).
- **Rival-guild fights vs. dungeon fights vs. the act capstone read identically** — only a small italic "Rival Ghost"/"Final Boss" word distinguishes them. Across 20 rounds with 6 guild fights + 2 capstones, the player can't quickly tell "this is the hard guild fight" or "this is the boss that drops a relic."
- The act's **theme/identity** (demonic in Act 2) isn't expressed; every act's scout looks the same.
- The **capstone awards a relic** — that's a major moment with zero emphasis here.
- "Danger" is one string; "what is this asking me to solve" deserves stronger hierarchy than reward gold.

**(c) Must stay the same.** Still a single full panel ending in one "Continue to Shop" button. Still shows encounter name, type (dungeon vs. guild vs. boss), the scout/threat text, danger category, reward, and the enemy lineup. Still mouse-only, one action. Don't add pre-fight choices or new data the game doesn't have.

**(d) Implementation acceptance criteria.**
1. At a glance the player can classify the fight: **dungeon vs. rival-guild (which guild) vs. act capstone**, with the guild identity and the capstone/relic moment visually distinct from a normal dungeon fight.
2. Encounter position is clear: which act (themed), round within act, and sense of run progress.
3. The tactical problem (scout text + danger) has clear visual primacy over the reward number.
4. When the encounter is the capstone, the **relic reward** is communicated as a notable beat.
5. The act theme treatment matches the shared system (same accent/word approach as the Run Header) and is theme-swappable for Acts 3–5.

---

### 4.3 End / Act Transition

**(a) What it is / current data.** A full-screen overlay shown on `Victory` or `Defeat`. It already has three modes (logic exists, copy is generic):
- **Act-clear handoff** (won an act but more acts remain): title `"Act 1 Clear"` (green), reason `"Act 1 cleared. The rival guilds regroup for Act 2."`, stats block (act/round, Gold, Debt, Morale), button labeled `"Continue to Act 2"`.
- **Final victory** (won the last act): title `"Victory"`, reason `"All rival guilds defeated. Act 2 complete - the run is won."`, same stats, button `"Main Menu"`.
- **Defeat**: title `"Defeat"` (red), reason = the run's end reason (e.g. debt/morale), same stats, button `"Main Menu"`.

**(b) Problem at 20 rounds / multi-act.**
- The act-clear handoff is the **seam between two themed acts** but conveys no identity: it doesn't say what you just survived or **preview the next act's theme** (e.g. "Act 2: the dungeon turns demonic"). It's a flat congratulatory line.
- A 20-round run is a real arc; the end screens show only current Gold/Debt/Morale, **no run-spanning recap** (acts cleared, relics earned, how close debt came to bankruptcy).
- Three modes share one flat layout; the **emotional beats differ** (mid-run momentum vs. full win vs. loss) but look the same.
- Must scale to Acts 3–5: the handoff is reused at every act boundary, so it needs a generic "Act N cleared → Act N+1 (theme)" structure, not Act-1-specific copy.

**(c) Must stay the same.** Still a single full-screen overlay with exactly one forward button (Continue to next act / Main Menu). Still covers the three existing modes (act-clear, final victory, defeat). Still uses only existing run data (act, round, gold, debt, morale, relics, end reason). No leaderboards/score/unlocks.

**(d) Implementation acceptance criteria.**
1. The act-clear handoff clearly frames it as a transition and **previews the next act's identity/theme** using the shared act treatment (theme word + accent), generically for any Act N→N+1.
2. The three modes (act-clear, final victory, defeat) are visually differentiated to match their emotional beat while staying one layout family.
3. End/victory/defeat shows a concise **run recap** (at least: acts cleared, final Gold/Debt + debt status, morale, relics earned) drawn only from existing data.
4. No hardcoded "Act 1"/"Act 2" literals in the design — copy is parameterized by act number + theme so Acts 3–5 need only data.
5. Exactly one primary action button; label reflects mode (advance vs. return).

---

### 4.4 Reward Summary

**(a) What it is / current data.** A panel shown in the `Reward` state after combat resolves, before the next round. One title + one large left-aligned text block + a Continue button. The body is a flat stack of lines, conditionally including:
- `Combat: Win/Loss`
- `Gold gained: +N`
- `Morale change: +/-N`
- Payroll summary line (if a non-standard payroll action was used)
- `Active relics: ...` and `Relic bonus: +N gold` (if relics)
- `Veterancy: ...` (if any hero tiered up)
- `Upkeep due / Upkeep paid / Upkeep shortfall`
- `Interest charged / Interest paid / Interest to debt`
- `Debt status: <tier>`
- `Final: Gold X / Debt Y / Morale Z`
- An appended sentence warning if debt pressure is high.

**(b) Problem at 20 rounds / multi-act.**
- It's a **wall of ~13 equally-weighted lines**. The player sees this up to 20 times per run; the important outcomes (did debt get worse? did I gain a relic? did I clear the act?) are not prioritized.
- It does **not distinguish** a normal round's reward from **the capstone round** (which clears the act and awards a relic) — the single biggest reward moment is the same wall of text.
- Debt status change (e.g. Strained→Dangerous) is just one line among many, despite being the core pressure.
- The relic-earned moment (capstone) has no emphasis distinct from a passive "relic bonus gold" line.

**(c) Must stay the same.** Still a single panel ending in one Continue button. Still reports the same facts (combat result, gold, morale, payroll effect, relic, veterancy, upkeep breakdown, interest breakdown, debt status, final resources). Don't drop data — reorganize and prioritize it. Presentation-only.

**(d) Implementation acceptance criteria.**
1. Outcomes are **prioritized by impact**, not a flat list: the headline (win/loss, net gold, debt-status change) reads first; the detailed upkeep/interest breakdown is secondary.
2. A **debt-status change** this round is visually surfaced using the shared severity color language.
3. The **capstone/act-clear reward state** (relic earned + act cleared) is a visually distinct, celebratory variant of the same panel — distinguishable at a glance from a normal round.
4. All currently-shown fields remain present (possibly grouped/collapsed visually) — nothing is removed.
5. One Continue button; the panel fits the existing reward screen region without scrolling at the 1920×1080 reference for a worst-case (all sections present) round.

---

### 4.5 Combat  (re-skin to the shared system — NOT a rebuild)

**Important:** Combat was recently rebuilt and is the densest, most fragile view. We are **not** redesigning combat's structure. We want it **re-skinned to conform to the shared visual system**, plus a flag of any 20-round/multi-act legibility issues you spot. Do not propose a new combat layout, new mechanics, or more than the existing 5 shared effect sprites.

**(a) What it is / current data.** Full panel in the `Combat` state. Four stacked horizontal rows of unit cards, top to bottom: **Enemy Back**, **Enemy Front**, **Hero Front**, **Hero Back** (front rows = 2 slots, back rows = 3 slots). Each unit card shows: placeholder portrait sprite, name, HP (current/max bar), attack, small color+letter **status indicators** (six statuses: Guarded/Burned/Poisoned/Marked/Weakened/Inspired), veteran-tier progress, and an "acting"/"hit" flash. A single shared effect sprite slides attacker→target during replay. There is a generic title text reading just `"Combat"`. A separate scrolling combat **log** lives elsewhere on screen (out of scope here — do not redesign the log).

**(b) Problem at 20 rounds / multi-act.**
- The title is a static `"Combat"` with **no context**: no act/theme, no round, no "this is the guild fight / the capstone boss." Across 20 fights the player loses track of where they are.
- Act 2 introduces **new demonic enemies and more active statuses**; card density rises. The current chrome/colors are generic and don't reflect act identity or help separate the six status glyphs at a glance.
- Enemy vs. hero sides, and front vs. back rows, rely on small text row labels; under heavier Act 2 boards this hierarchy is weak.

**(c) Must stay the same.** Keep the four-row enemy-back / enemy-front / hero-front / hero-back structure, the card contents (portrait, name, HP bar, attack, status glyphs, veteran progress, acting/hit flash), the single shared traveling effect sprite, and the separate scrolling log. No new mechanics, no more than 5 effect sprites, no per-unit unique art, no added motion.

**(d) Implementation acceptance criteria.**
1. Combat chrome adopts the shared visual system (palette, type scale, panel framing, status/severity colors) and shows compact **fight context** (act/theme + round + fight kind: dungeon / which guild / capstone) where the bare "Combat" title is now.
2. Enemy side vs. hero side, and front vs. back rows, have stronger visual separation than plain row-label text, without enlarging cards beyond the existing card footprint.
3. The six status indicators remain compact and legible against the new chrome, distinguishable from each other and from the acting/hit flash, at the existing card size.
4. The re-skin preserves the existing layout structure and the 5-sprite effect budget — it is presentation polish, not a rebuild.
5. The act-theme treatment is consistent with the other four views and theme-swappable for Acts 3–5.

---

## 5. Summary of the shared-system ask

Across all five: a small consistent type scale and palette; **one severity color language** used for debt tiers everywhere they appear; **one per-act identity treatment** (accent color + short theme word/glyph + run-progress sense) that is data-driven so Acts 3/4/5 are content-only; consistent panel chrome and a single consistent primary-button style; clear information hierarchy that survives a 20-round run and rising Act 2 density — all expressible in flat uGUI with no motion beyond color/state changes. Hand back per-view HTML/JSX mockups + a short rationale, strictly inside Section 2's constraints.
