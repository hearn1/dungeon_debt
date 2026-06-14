# Combat V2 Runtime Contract

Parent epic: #310

This document defines the simulation contract for Combat V2. It is intentionally
runtime-focused: presentation, animation polish, and tuning changes belong to
later issues unless a replay event is required to describe the simulation.

## Goals

- Resolve combat on one shared deterministic timeline.
- Use integer ticks, never wall-clock time.
- Keep combat math independent from visual animation speed.
- Collect movement and attack/cast intent before resolving effects.
- Allow same-tick actions, including lethal trades.
- Preserve deterministic logs, replay events, and result snapshots.

## Clock

- The simulation advances in integer ticks.
- `GameRules.CombatTicksPerRound` maps legacy round hooks onto the timeline.
- `GameRules.CombatTurnLimit * GameRules.CombatTicksPerRound` remains the
  maximum combat duration.
- A tick is a simulation unit only. UI animation duration must not change combat
  results.

Recommended default:

```text
CombatTicksPerRound = 4
```

This keeps current end-of-round effects readable while allowing actions inside a
round to share or separate ticks.

## Unit Cadence

Each `CombatUnitState` owns fight-scoped timing fields:

- `attackCooldownTicks`: base ticks between basic attacks.
- `attackSpeedMultiplier`: multiplier applied to the base cooldown.
- `attackWindupTicks`: ticks between intent start and hit resolution.
- `attackRecoveryTicks`: ticks after attack start before the unit may start
  another attack.
- `nextAttackReadyTick`: next tick when the unit can create a basic attack
  intent.
- `movementCooldownTicks`: base ticks between movement steps.
- `nextMovementReadyTick`: next tick when the unit can create a movement intent.

`attackCooldownTicks` and `attackSpeedMultiplier` are simulation values, not
animation values. The effective cooldown is clamped to at least
`GameRules.MinimumAttackCooldownTicks`.

## Tick Phase Order

Each tick follows this order:

1. Tick start.
2. Update status/timer surfaces that mature at tick start.
3. Select or refresh targets for living units.
4. Create movement intents for units that are out of range and movement-ready.
5. Create attack or cast intents for units that are in range and cooldown-ready.
6. Resolve movement conflicts deterministically.
7. Start attack/cast windups and enqueue pending hit/cast events.
8. Resolve all pending hit/cast events maturing on this tick.
9. Apply damage, healing, statuses, and passive triggers created by those hits.
10. Apply death cleanup after all same-tick hit/cast events resolve.
11. Emit grouped replay/log events.
12. Check victory, defeat, and turn limit.

The important rule is that intent collection happens before resolution. A unit
that is alive during intent collection can contribute an intent for that tick,
even if another same-tick hit will kill it. Dead units cannot create new intents
on later ticks.

## Targeting

- A unit keeps its current target while that target is alive, valid, and usable.
- A unit retargets after target death.
- A unit may retarget when blocked and unable to move toward or attack its
  current target.
- First-pass default targeting is nearest valid enemy, with deterministic
  tie-breaks.
- Existing role and ability targeting modes remain available as overrides.

Target selection must not flicker every tick merely because another target is
equally valid.

## Movement

- Movement is a timeline behavior, not a turn action.
- A unit creates a movement intent when its target is out of range and movement
  cadence is ready.
- Movement intents move up to the configured movement range toward a reachable
  tile.
- Conflicts are resolved in deterministic unit order.
- No two living units may occupy the same tile after movement resolution.
- Dead units are removed from the board during death cleanup and stop blocking
  later movement.

## Attack Windup And Hit Resolution

- Basic attacks start when cooldown-ready and target-in-range.
- Starting an attack enqueues a pending hit for
  `currentTick + attackWindupTicks`.
- All pending hits that mature on the same tick resolve as one hit group before
  death cleanup.
- Same-tick lethal trades are valid.
- Deterministic ordering inside the group is allowed for logs, passive triggers,
  and status ordering, but ordering must not remove later same-tick hits that
  were already queued.

## Recovery

After an attack or cast intent starts, the next ready tick is based on the
effective cooldown and any recovery surface. The first-pass default uses the
effective cooldown as the dominant cadence and keeps recovery at zero unless a
unit or ability needs an explicit lockout.

## Active And Passive Abilities

- Active abilities use cooldown-based casts in the same timeline as attacks.
- A ready active creates a cast intent, then a pending cast hit/effect event.
- Casts can share a tick with other attacks or casts.
- Replay/log output must distinguish basic attacks from active casts.
- Passive abilities stay tied to explicit timing points:
  - Combat start
  - Attack start
  - Hit resolution
  - Surviving attack
  - Kill
  - Damage taken
  - End of round
  - Combat end
  - Pre-upkeep outside combat

If a legacy passive cannot safely move into the grouped timing model in the
first pass, document the deferral in the implementing commit and keep its current
deterministic behavior.

## Death Cleanup

- During a hit group, a unit reduced to zero health remains eligible to resolve
  any pending same-tick hit or cast it already started.
- After the hit group resolves, dead units are logged, kill/passive hooks fire,
  and board occupancy is cleaned.
- Dead units cannot create movement, attack, or cast intents on later ticks.

## Replay Expectations

Replay events describe simulation facts, not animation duration:

- Combat start and unit placement.
- Round/tick boundaries needed by the UI.
- Movement source and target coordinates.
- Attack or ability start when distinct from hit resolution.
- Hit, heal, status, and death results.
- Final combat result.

The UI may animate those events however it wants, but replay timing must not feed
back into simulation.

## Recommended Defaults

- Keep `CombatTicksPerRound = 4`.
- Keep baseline attack cooldown at one round: 4 ticks.
- Use attack windup of 1 tick so same-tick attacks can visibly start before
  landing.
- Use movement cooldown of 1 tick for first-pass continuous movement.
- Use deterministic tie-breaks: player side first only as a tie-break, then slot,
  then `unitId`; board conflicts use coordinate tie-breaks already defined in
  `CombatBoard`.

## Open Questions And Defaults

1. Should attack speed be authored per definition or role first?
   - Default: keep all authored defaults baseline, expose per-unit surfaces, and
     use tests to prove faster cadence without broad tuning.
2. Should active abilities share basic attack cooldown?
   - Default: keep existing active cooldowns separate, but cast them through the
     same pending event model.
3. Should movement and attack be allowed on the same tick?
   - Default: no. A unit that moves this tick waits for a later tick to attack.
4. Should Combat V1 remain selectable?
   - Default: make runtime version explicit in results/reports. Keep V1 only if
     comparison remains cheap and does not duplicate active combat logic.
