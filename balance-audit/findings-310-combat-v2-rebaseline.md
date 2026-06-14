# Findings 310: Combat V2 Runtime Rebaseline

Date: 2026-06-14

Scope: Epic #310, before any late-game balance tuning.

## Runtime

- Combat runtime: `CombatV2`.
- Runtime seam: `CombatManager` now requires a supported runtime id and stamps `CombatResult.combatRuntimeId`.
- Balance combat/economy rows include `combatRuntimeId`, and generated balance Markdown reports list the combat runtime in the configuration section.

## Representative V2 Coverage

The automated combat suite now pins representative Combat V2 scenarios for:

- Melee: Warrior/Golem vs Act 1 Slimes.
- Ranged: Ranger/Wizard/Golem vs Act 1 Tax Collector.
- Sustain: Warrior/Golem/Priest/Cleric/Paladin vs Act 1 boss.
- Carry: reference party vs Carry Guild Ghost.
- Boss: reference party vs Act 1 boss.
- Rival: reference party vs Act 2 Frugal Guild Rematch.

## Rebaseline Notes

These outcomes are accepted as Combat V2 foundation behavior, not tuning targets:

- Continuous movement and attack windups make multi-unit melee contact less bursty than the earlier sequential loop.
- Stable targeting keeps units on valid current targets, which can concentrate pressure differently than nearest-target retargeting every action.
- Active abilities resolve through timeline intents with ability windup; first casts now resolve after cooldown plus windup instead of as an immediate post-attack pass.
- The reference party still clears the Act 1 snapshot set, while several Act 2 representative snapshots are expected losses under current foundation semantics.

No numeric enemy, hero, reward, or economy tuning is included in this rebaseline.
