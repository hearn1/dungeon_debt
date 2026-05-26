# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: #66 - Gold hero tier

**Slice ID:** GitHub issue `#66` first slice  
**Type:** GitHub expansion issue wave  
**Severity:** Feature foundation  

### One-sentence goal

Add the Gold hero tier as an earned merge tier above Silver, with 1.8x HP/attack scaling, +2 upkeep over Bronze, no direct Gold shop offers, and no Diamond tier.

### Why this session exists

`#72` balance harness and `#73` encounter variants are complete. The next conflict-aware slice is `#66`, which expands the existing Bronze -> Silver merge progression to Bronze -> Silver -> Gold before adding new heroes or difficulty scaffolding.

### Confirmed choices from orchestration

Matt confirmed the recommended answers for the open planning questions:

1. `web/src/combat/HeroEffects.js` may be added to the file list if needed, because current tier stat seeding lives there.
2. Preserve Silver behavior as "unchanged" and add Gold in the same local style unless tests prove the issue's 1.4x wording requires centralization.

### Scope

**In scope:**

- Add `HeroTier.Gold = "Gold"` only.
- Add Gold HP/attack scaling target: 1.8x vs Bronze.
- Add Gold upkeep target: Bronze upkeep + 2.
- Extend duplicate-hire merge from Bronze -> Silver to Silver -> Gold.
- Gold heroes cannot promote further in this slice.
- Gold heroes never appear directly in shop offers.
- Add Gold tier color/style.
- Add targeted run-flow tests for Bronze -> Silver -> Gold.

**Not in scope:**

- Diamond tier.
- Tier-2 or Gold effect potency changes.
- Rare late-act Gold shop offers.
- Multi-tier jump promotions.
- New heroes.
- Combat RNG, new dependencies, framework/bundler/TypeScript, canvas, or WebGL.

### Files to read

```
AGENTS.md
CLAUDE.md
SESSION_PROTOCOL.md
PROGRESS.md (latest #73 and #72 entries)
REGRESSIONS.md (Open section)
IMPLEMENTATION_PLAN.md §6
web/src/data/enums.js
web/src/core/GameRules.js
web/src/run/heroStats.js
web/src/run/ShopManager.js
web/src/combat/HeroEffects.js
web/styles/main.css
web/src/test/run.js
```

### Files to modify

- `web/src/data/enums.js` - add `Gold` to `HeroTier`; do not add Diamond.
- `web/src/core/GameRules.js` - add Gold tier multiplier/color constants or table entries.
- `web/src/run/heroStats.js` - audit hardcoded Silver-only branches; modify only if needed.
- `web/src/run/ShopManager.js` - extend duplicate-hire promotion to Silver -> Gold and block further Gold promotion.
- `web/src/combat/HeroEffects.js` - allowed if required for current tier stat seed path.
- `web/styles/main.css` - add Gold tier badge/card style matching existing markup.
- `web/src/test/run.js` - add Bronze -> Silver -> Gold promotion checks for stats/upkeep and no direct Gold offers.

### Files not to touch

- `web/src/core/DataRepository.js` unless a plan checkpoint proves it is required and Matt confirms.
- `web/src/test/combat.js` unless a plan checkpoint proves it is required and Matt confirms.
- UI panels.
- `PROGRESS.md`, `REGRESSIONS.md`, `NEXT_SESSION.md`, `IMPLEMENTATION_PLAN.md` until wrap.

### Acceptance criteria

1. `HeroTier` has Bronze, Silver, Gold and no Diamond.
2. Hiring a duplicate Silver in the active party promotes that hero to Gold.
3. Gold HP, attack, and upkeep update according to the locked rules.
4. Gold heroes never appear as direct shop offers.
5. `npm.cmd run test:headless` includes and passes a Bronze -> Silver -> Gold promotion test.
6. Combat remains deterministic; no `Math.random()` added.

### Verification

```powershell
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
cd web
npm.cmd run test:headless
```

### Start prompt for the next session

> Read `AGENTS.md`, `CLAUDE.md`, and `SESSION_PROTOCOL.md`, then follow `NEXT_SESSION.md`. The current slice is GitHub issue `#66` first slice: Gold hero tier only. Use the confirmed orchestration choices in `NEXT_SESSION.md`, produce the Orient summary, stop for confirmation, then produce the Plan checkpoint before editing.