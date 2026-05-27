# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: #69 - Paladin, Cleric, Barbarian

**Slice ID:** GitHub issue `#69` first slice  
**Type:** GitHub expansion issue wave  
**Severity:** Feature foundation  

### One-sentence goal

Add exactly three new Bronze shop heroes - Paladin, Cleric, and Barbarian - with their locked combat effects and deterministic tests.

### Why this session exists

`#72`, `#73`, and `#66` are complete. The next conflict-aware slice is `#69`, which grows the hero roster by exactly three locked archetypes before difficulty, Act 3, Rival Race, and Visual V1 work.

### Scope

**In scope:**

- Add exactly three `HeroEffectId` values:
  - `PaladinAuraHeal`
  - `ClericGroupHeal`
  - `BarbarianRage`
- Add exactly three `HeroDefinition` entries to the Bronze hero/shop pool:
  - Paladin: Tank, upkeep 4, HP 14, attack 2, `PaladinAuraHeal`; end of each combat round, heal 1 to all living allies including self.
  - Cleric: Support, upkeep 3, HP 8, attack 1, `ClericGroupHeal`; end of each combat round, heal 1 to all living allies including self. Stacks with Paladin.
  - Barbarian: Damage, upkeep 3, HP 10, attack 2, `BarbarianRage`; while at <=50% HP, +2 attack. Recompute on damage/heal or at attack time if simpler.
- Add deterministic combat tests for all three effects.
- Spot-check shop role balance with fixed seed: across 20 offer sets, no single role dominates >70%.

**Not in scope:**

- Rogue, Druid, Warlock, Sorcerer, Monk, Fighter, Artificer, or any other hero.
- Custom sprites or asset work.
- Tier-scaled effect potency.
- Out-of-combat hero abilities.
- New roles beyond Tank/Damage/Support/Economy.
- New dependencies, framework/bundler/TypeScript, canvas, or WebGL.

### Files to read

```
AGENTS.md
CLAUDE.md
SESSION_PROTOCOL.md
PROGRESS.md (latest #66, #73, #72 entries)
REGRESSIONS.md (Open section)
IMPLEMENTATION_PLAN.md §6
web/src/data/enums.js
web/src/core/DataRepository.js
web/src/combat/HeroEffects.js
web/src/test/combat.js
web/src/test/run.js only if needed for shop-balance helper context
```

### Files to modify

- `web/src/data/enums.js` - add the three new `HeroEffectId` values only.
- `web/src/combat/HeroEffects.js` - implement Paladin/Cleric group heals and Barbarian rage deterministically.
- `web/src/core/DataRepository.js` - add exactly Paladin, Cleric, Barbarian to the hero definitions/Bronze shop pool.
- `web/src/test/combat.js` - add one deterministic effect test per hero plus stacking/role-balance coverage as appropriate.

### Files not to touch

- UI/CSS files.
- Sprite/assets files.
- `web/package.json` and dependencies.
- Any files for other heroes.
- `PROGRESS.md`, `REGRESSIONS.md`, `NEXT_SESSION.md`, `IMPLEMENTATION_PLAN.md` until wrap.

### Acceptance criteria

1. All three heroes are hireable from the shop and can complete a full combat without errors.
2. Each effect fires at the specified hook and is verifiable in deterministic tests.
3. Paladin and Cleric group heals stack.
4. Barbarian gains +2 attack while at <=50% HP without introducing combat RNG.
5. Shop offers remain role-balanced in the fixed-seed 20-offer-set spot check.
6. `npm.cmd run test:headless` passes.

### Verification

```powershell
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
cd web
npm.cmd run test:headless
```

### Start prompt for the next session

> Read `AGENTS.md`, `CLAUDE.md`, and `SESSION_PROTOCOL.md`, then follow `NEXT_SESSION.md`. The current slice is GitHub issue `#69` first slice: add exactly Paladin, Cleric, and Barbarian. Produce the Orient summary, stop for confirmation, then produce the Plan checkpoint before editing.