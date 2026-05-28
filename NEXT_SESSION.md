# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: #71 - Visual identity V1

**Slice ID:** GitHub issue `#71` first slice
**Type:** GitHub expansion issue wave
**Severity:** Visual polish foundation

### One-sentence goal

Ship the V1 visual identity pass only: locked Faded Ledger palette tokens, framed hero cards, corner tier ribbons, consistent panel headers, and sharp candle buttons without adding assets, dependencies, fonts, or animation work.

### Why this session exists

`#72`, `#73`, `#66`, `#69`, `#70`, `#67`, and `#68` are complete. The final conflict-aware issue slice is `#71`, intentionally last because it is a broad UI/CSS sweep.

### Scope

**In scope:**

- V1 Visual identity pass only.
- Add the locked Faded Ledger palette in `GameRules.js` and `main.css`:
  - `--dd-parchment: #e3dcc6`
  - `--dd-candle: #b8924a`
  - `--dd-ink: #1a1612`
  - `--dd-rust-accent: #a64a40`
- Keep existing background, card, rule, role, debt, and status token families as-is; aliases may point at new tokens to minimize churn.
- Keep typography family exactly `--font: 'Segoe UI', system-ui, sans-serif;`.
- Replace flat hero cards with sharp-corner double-hairline framed cards.
- Move hero role accent to a 4px left-edge swatch strip via `::before`.
- Replace full tier pill text with a top-right clipped triangle ribbon showing the tier letter.
- Refactor every panel under `web/src/ui/panels/` to emit the same D6 header structure:
  - `.panel-head`
  - `.panel-kicker`
  - `.panel-title`
  - optional `.panel-sub`
  - followed by `<hr class="panel-rule" />`
- Update button styling:
  - `.btn.primary` solid candle fill, ink text, sharp corners.
  - all `.btn` variants use `border-radius: 0`.
  - `.btn.danger` uses rust accent color.
- Capture before/after screenshots for the PR.

**Locked design decisions:**

- D1: Use the exact Faded Ledger token values above. They are foreground/accent only.
- D2: System fonts only. Do not change `font-family`, add fonts, Google Fonts, or `@font-face`.
- D3: Hero-card frame uses sharp corners and double-hairline frame. Status pills stay round.
- D4: Role accent is a left-edge 4px swatch strip. Do not synthesize role colors for enemies.
- D5: Tier badge is a top-right 22px triangle ribbon with the tier letter.
- D6: Every panel uses identical header markup and a full-width `.panel-rule`.
- D7: Primary button is solid candle fill with ink text and sharp corners.

**Not in scope:**

- V2 combat scene.
- V3 attack and impact feedback.
- V4 status effect visuals.
- V5 economy panel juice.
- V6 panel/act/victory transitions.
- New PNG/SVG assets or sprite work.
- New animations beyond what already exists.
- HP bar styling changes.
- Status-pill shape changes.
- Projectile overlay or combat-unit lunge keyframe changes.
- Typography family changes.
- New dependencies, framework/bundler/TypeScript, canvas, or WebGL.

### Files to read

```
AGENTS.md
CLAUDE.md
SESSION_PROTOCOL.md
PROGRESS.md (latest #68, #67, #70 entries)
REGRESSIONS.md (Open section)
IMPLEMENTATION_PLAN.md section 6
web/styles/main.css
web/src/core/GameRules.js
web/src/ui/components.js
web/src/ui/panels/MainMenuPanel.js
web/src/ui/panels/ScoutPanel.js
web/src/ui/panels/ShopPanel.js
web/src/ui/panels/FormationPanel.js
web/src/ui/panels/PayrollPanel.js
web/src/ui/panels/CombatPanel.js
web/src/ui/panels/RelicRewardPanel.js
web/src/ui/panels/RivalUpdatePanel.js
web/src/ui/panels/EndScreenPanel.js
```

### Files to modify

- `web/styles/main.css` - palette tokens, card frame/ribbon/swatch styling, unified panel header/rule styles, sharp button styles.
- `web/src/core/GameRules.js` - expose the four Faded Ledger tokens alongside existing UI tokens.
- `web/src/ui/components.js` - update `heroCard()` tier rendering to use a tier letter ribbon.
- `web/src/ui/panels/MainMenuPanel.js` - D6 header markup.
- `web/src/ui/panels/ScoutPanel.js` - D6 header markup.
- `web/src/ui/panels/ShopPanel.js` - D6 header markup.
- `web/src/ui/panels/FormationPanel.js` - D6 header markup.
- `web/src/ui/panels/PayrollPanel.js` - D6 header markup.
- `web/src/ui/panels/CombatPanel.js` - D6 header markup.
- `web/src/ui/panels/RelicRewardPanel.js` - D6 header markup.
- `web/src/ui/panels/RivalUpdatePanel.js` - D6 header markup.
- `web/src/ui/panels/EndScreenPanel.js` - D6 header markup.

### Files not to touch

- `web/src/data/enums.js`
- `web/src/core/Rng.js`
- `web/src/combat/CombatManager.js`
- `web/src/combat/HeroEffects.js`
- `web/assets/**`
- `package.json`
- `PROGRESS.md`, `REGRESSIONS.md`, `NEXT_SESSION.md`, `IMPLEMENTATION_PLAN.md` until wrap.

### Acceptance criteria

1. The four `--dd-*` CSS custom properties exist on `:root` and are exposed from `GameRules.js`.
2. Hero cards render with sharp double-hairline frame, left-edge role swatch for heroes, and top-right tier ribbon.
3. Every panel uses identical D6 `.panel-head` markup and a following `.panel-rule`.
4. `.btn.primary` is solid candle fill with ink text and sharp corners; all `.btn` variants have `border-radius: 0`.
5. `npm.cmd run test:headless` passes.
6. Browser preview verifies affected screens with zero console warnings/errors.
7. Before/after screenshots are attached to the PR.
8. No new runtime dependencies, font files, image assets, canvas, or WebGL.

### Verification

```powershell
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
cd web
npm.cmd run test:headless
```

Because this is broad UI/CSS work, also run browser preview and capture before/after screenshots for the PR.

### Start prompt for the next session

> Read `AGENTS.md`, `CLAUDE.md`, and `SESSION_PROTOCOL.md`, then follow `NEXT_SESSION.md`. The current slice is GitHub issue `#71` first slice: Visual identity V1 only with locked decisions D1-D7. Produce the Orient summary, stop for confirmation, then produce the Plan checkpoint before editing.
