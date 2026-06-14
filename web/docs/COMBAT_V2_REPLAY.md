# Combat V2 Replay Behavior

Parent epic: #311

Combat V2 replay events describe deterministic simulation facts. The combat UI
may animate those facts, but it must not rerun targeting, damage, healing,
movement, cooldown, or death logic.

## Replay Groups

Every replay event includes:

- `tick`: integer simulation tick.
- `phase`: broad replay phase such as setup, movement, attack start, hit
  resolution, death, or combat end.
- `groupId`: deterministic grouping key for events that should present as one
  combat beat.
- `groupSequence`: deterministic ordering inside the group.
- `sequence`: deterministic ordering across the full stream.

The Combat panel advances one `groupId` per visual step. This means same-tick
movement, attack starts, hit/heal feedback, and deaths can appear together
without changing resolver order.

## Presentation Rules

- `AttackStart` / `AbilityStart` events drive windup, actor highlights, lunges,
  casts, and projectile starts.
- `Attack`, `Heal`, `StatusDamage`, and `StatusChange` events drive HP/status
  updates and floating feedback.
- `Death` events drive defeated visuals after same-tick hit resolution.
- Unit action and ability bars update from replay cooldown snapshots, never
  from an independent UI simulation.
- Skip-to-report and reduced-motion paths apply replay facts instantly and then
  render the same final combat summary.

## Known Limitations

- The current visuals are still placeholder-style overlays and simple effects.
- Active ability bars are shown only for units that expose an active cooldown in
  replay metadata.
- Some passive hook events occur at tick-start or combat-end timing points, so
  validation checks event shape and group determinism rather than forcing one
  global phase order for every hook.
