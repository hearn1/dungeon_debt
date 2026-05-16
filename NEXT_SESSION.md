# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M10.7 — Combat-screen layout pass (v2 footer-card, made practical in Unity)

**Milestone:** M10 — Combat view rebuild
**Slice goal:** Make the v2 "Footer" portrait-card design practical in Unity by (a) re-shaping `CombatUnitCardView` into a portrait card with a bottom name+HP footer and (b) a **bounded combat-only screen relayout** in `CombatPanelView` + `MainMenuPanel` that reclaims vertical space for the card grid — *without* moving the non-combat panels, without redesigning the combat log, and without editing the scene. This is a practical adaptation of the mock-up, **not** a 1:1 port.

### Why this slice exists

M10.4/M10.6 made unit art render correctly, but at 150×102 the portrait is a ~70×60 inner slice. A design exploration (see *Design source*) picked the **portrait-card / footer-strip** direction (`combat-card-v2.jsx`, "Footer" variant, 200×208).

Reviewing the mock-up surfaced the hard constraint that re-scoped this slice: the v2 design only fits 1080p because it uses **nearly the full screen height** for the card grid (≈976px: a 56px compact header + the grid + a thin log). In Unity the combat board is hard-capped at **510px** — `MainMenuPanel` sets `CombatUnitPanelHeight = 510` and `CombatLogTopOffset = 380` (the top ~380px holds the tall title, Start Run/Restart buttons, and status text). Four 208px rows need ~958px and cannot fit 510px. So the redesign is **not card-only** — it requires reclaiming the top chrome space for the combat screen specifically. `CombatLogTopOffset` is shared by the shop/formation/payroll/scout panels, so the reclaim must be combat-only.

### Scope (re-scoped and approved by user)

**Approved:**
- Edit `CombatUnitCardView.cs` and `CombatPanelView.cs` for the v2 footer card + grid.
- Edit `MainMenuPanel.cs` to add a **combat-only layout path**: a combat-specific top offset / compact combat presentation that reclaims vertical space for the board **only while in the Combat screen**.
- Keep all non-combat panels (shop, formation, payroll, scout, reward, end, leaderboard) on the existing shared offsets — they must not move.
- Keep `CombatLogView` behaviour and the existing scrolling combat log intact.
- Treat **200×208 as the ideal target**; a smaller final runtime card size is acceptable if needed to preserve the scrolling log and the existing Start Run / Restart / "press Continue" controls.

**Not approved for M10.7:**
- Do not move all panels globally / do not change the shared `CombatLogTopOffset` for non-combat panels.
- Do not edit `Assets/Scenes/Main.unity` unless there is genuinely no runtime-code alternative (MainMenuPanel builds its UI in code, so a runtime path is expected to exist — if not, stop and ask before touching the scene).
- Do not redesign `CombatLogView` or reduce the real combat log to a one-line strip if that risks regressing R001 (long-combat scroll/truncation).
- Do not add web-only visual treatments: CSS gradients/vignettes, box-shadow glows, drop-shadows, rounded-corner chrome, web fonts, shaders, new art, particles, tweens, or any VFX/animation system. Flat-colour approximations only (CLAUDE.md §Scope control still in force).

### Definition of ready

- ID: M10.7. One-sentence goal: above. Files and acceptance criteria below.
- M10.6 complete. M10.5 acceptance (effect motion) is the only pending M10 item and is independent (effects vs. layout) — do not block on it, but **verify M10.5's effect motion still tracks at the new card size/positions** (regression check).
- No open 🔴 Blocker regressions in `REGRESSIONS.md` interact with this; R001 (closed) is the relevant historical risk for the log — protect it.
- **Decide at Plan:**
  1. The runtime mechanism for the combat-only reclaim in `MainMenuPanel`: how the title / Start Run / Restart / status block is compacted or repositioned **only for the Combat state** (e.g. a combat-specific offset + a compact combat header built in code and toggled by state), while leaving the shared layout for other states untouched. Confirm how these controls are currently shown during `GameState.Combat` and where the "press Continue" / Start Run / Restart affordances live in the compact combat layout.
  2. Final `CardWidth`/`CardHeight`/`CardGap`/`RowGap` for `CombatPanelView`. Ideal 200/208/22/14; compute the real vertical budget = (combat screen height) − (compact combat header) − (retained scrolling log at its current behaviour) − (paddings/labels/title), divide across 4 rows + gaps, and pick the largest size ≤ that budget. Record the actual numbers chosen and why if < 200×208.
  3. Footer construction in `CombatUnitCardView`: fixed-height footer band (default, matches `BuildUi` manual-anchoring style) containing the name above the HP track, with a 1px role-accent top edge and a slightly darker footer background. Drop the footer-bg Image if it fights the hit-flash/acting-outline layering — the 1px role edge alone is acceptable.
  4. Whether enemy-sprite horizontal mirror and a flat dead-state marker (mock-up showed `scaleX(-1)` and a big "✕") are in or out. Default: **out** for M10.7 (keep current dead-state red tint); raise if you want them, do not assume.

### Design source

- `Combat Layout v2.html` + `combat-card-v2.jsx` + `tweaks-panel.jsx` — **the final design.** Renders correctly. Chosen state (`V2_DEFAULTS`): style `footer`, card **200×208**, role band **6**, footer **56**. `CardFooter`/`CardShell`/`SpriteArea` show the structure: sprite fills above a bottom footer; footer has name (uppercase, ellipsis) above an HP bar, a 1px role-accent top border, darker bg; shell keeps role band / tier border / acting / dead vocabulary.
- `Combat Layouts.html` — the earlier 3-variant comparison. Note: it references `design-canvas.jsx` but the repo file is `design-canvas (1).jsx`, so it will not render as-is. Not needed; v2 is authoritative.
- The mock-up is HTML/CSS. Treat dimensions and structure as the **target**, port as flat uGUI. The mock-up's gradients, vignettes, glows, "TARGET" tag, damage numbers, and tweak panel are **reference only / out of scope**.

### Background (state after M10.6 + M10.5 polish)

`CombatUnitCardView.BuildUi` builds: background, left role band, 4 tier-border edge strips, portrait (anchored to leave a top name + bottom HP track), name text (top-anchored, hidden when a sprite resolves — M10.6), HP track/fill/centered HP text (bottom-anchored), hit-flash overlay, 4 acting-outline edge strips. `CombatPanelView` lays out 4 rows (enemy back, enemy front, hero front, hero back) by absolute top offsets derived from `CardHeight`, with `CardWidth=150, CardHeight=102, CardGap=18, RowGap=8`, and a center-anchored per-side row width; it also owns the shared effect-sprite motion (M10.5) and `EffectSpriteSize`. `MainMenuPanel` constructs the combat panel + log panel in code via `SetAnchoredRect` with `HorizontalMargin=140, CombatLogTopOffset=380, CombatUnitPanelHeight=510, CombatPanelLogGap=16, RewardSummaryWidth=520`, and the shop/formation/payroll/scout panels reuse `CombatLogTopOffset` as their top offset.

### Acceptance Criteria (finalize at Orient/Plan)

1. `CombatUnitCardView` is a portrait card: the unit name moves from the top into a fixed-height bottom footer band that also holds the HP track; the portrait expands to fill everything above the footer, minus the left role-band gutter and the existing tier-border inset. Footer has a 1px role-accent top edge and a slightly darker background (or just the 1px edge if layering conflicts).
2. A **combat-only** relayout reclaims vertical space so the four-row grid is meaningfully larger than 150×102, sized to the largest that fits the real budget (ideal 200×208; smaller allowed). Nothing clips or overflows at 1920×1080 with the run/combat header, panel title/labels, panel padding, and the **unchanged scrolling combat log** all present.
3. Non-combat screens are visually unchanged: shop, formation, payroll, scout, reward summary, end screen, and rival leaderboard render exactly as before (the shared offsets they use are not modified). Verify by entering each state.
4. All existing card states still render at the new size: role band, tier border (4 strips), acting outline (4 strips), hit-flash overlay, dead-state red tint, M10.6 name-only-when-no-sprite fallback, and HP fill colour switching at the 50% threshold. No new state, no new replay/combat data.
5. `CombatLogView` behaviour is unchanged and the long-combat scroll (R001) still works — run a long support-heavy combat and confirm the log still scrolls and is not truncated. M10.5's category-routed effect motion still flies between the correct two cards and centres on the target at the new size/positions. No combat math, targeting, rewards, upkeep, hero-effect, run-flow, replay, log, sprite-catalog, scene, or art change.

### Files Claude Code May Modify

```
DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs  — portrait card + bottom name/HP footer band; re-anchor for the new size.
DungeonDebt/Assets/Scripts/UI/CombatPanelView.cs     — final card/grid constants; row + label offsets derive from CardHeight, keep them aligned; verify EffectSpriteSize/effect motion at the new size.
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs       — add a combat-only layout path (combat-specific offset / compact combat header built in code, toggled by Combat state) that reclaims board height; non-combat panel offsets untouched; combat log panel kept (may be repositioned but not redesigned or shrunk in a way that regresses R001).
TestPlans/TP_M10.7.md                                — NEW: manual test plan (portrait card + footer, combat-only relayout, every non-combat screen unchanged, all card states, long-combat log scroll = R001 regression check, M10.5 effect motion regression check).
```

### Files Claude Code Does NOT Touch

- Any `Combat/`, `Run/`, `Core/`, or `Data/` script — presentation only.
- `CombatLogView.cs` — no redesign; the scrolling log behaviour is preserved as-is.
- `SpriteCatalog.cs` — no new ids / API change.
- The shared `CombatLogTopOffset` semantics for non-combat panels — they keep the existing offsets and must not move.
- `Assets/Scenes/Main.unity` and prefabs — only if there is no runtime-code alternative; if forced, stop and ask first.
- `Assets/Art/**` — no new/retired art.
- `IMPLEMENTATION_PLAN.md`, `CLAUDE.md`, `GAME_DESIGN.md`.
- `PROGRESS.md` / `REGRESSIONS.md` mid-session (summary step only).

### Deferred (tracked, not this slice)

- M10.5 acceptance run (effect motion) — independent; do not block, but regression-check it here.
- Enemy-sprite mirror / flat dead "✕" marker — only if explicitly opted in at Plan.
- Per-hero / per-enemy unique art — post-M10, out of MVP unless re-ratified.
- "TARGET" tag / floating damage numbers — no replay signal to drive them; out.
- M11 — Economy & balance pass.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
