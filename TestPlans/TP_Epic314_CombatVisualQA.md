# TP_Epic314 — Combat Visual QA Checklist

Repeatable manual QA checklist for real combat visuals and animation readability.
Run this plan after any art or animation pass. Pass = check all items, note any failures.

---

## Setup

- [ ] Start the game (`npm start` or browser via `python serve.py`).
- [ ] Start a new run at Normal difficulty.
- [ ] Recruit at least one of: Warrior, Knight, Priest (first-slice heroes).
- [ ] Proceed through Shop → Formation → Payroll → Combat to reach the combat board.

---

## Section 1 — Unit Readability

Can you tell who is acting?

- [ ] 1.1 The currently-acting unit is visually distinct from idle units (brighter, scaled, or glowing).
- [ ] 1.2 Player-side units and enemy-side units are visually distinguishable at a glance.
- [ ] 1.3 Unit names are visible and readable below each portrait token.
- [ ] 1.4 Unit HP bars update correctly as damage/healing lands.
- [ ] 1.5 Defeated units are clearly greyed out or faded, not overlapping live units.

---

## Section 2 — Damage and Healing Feedback

Can you tell who is taking damage or being healed?

- [ ] 2.1 When a unit takes damage, it flashes or shakes visually.
- [ ] 2.2 When a unit is healed, the feedback is visually different from a damage hit (green vs red tint or number).
- [ ] 2.3 Floating damage numbers appear and disappear cleanly without overlapping permanently.
- [ ] 2.4 Attack projectile travels from attacker to target (or lunge occurs for melee).
- [ ] 2.5 Heal projectile/arc travels from caster to target and is distinguishable from attack.

---

## Section 3 — Death

Can you tell when a unit dies?

- [ ] 3.1 When a unit dies, a visible death animation plays (sink, fade, or drop).
- [ ] 3.2 Dead units remain on the board in a clearly defeated state (no visual confusion with living units).
- [ ] 3.3 Death of a **PortraitToken unit** (Warrior, Knight, Priest, Slime, Goblin Thief, Cave Bat) uses the enhanced medallion death animation, not the placeholder fade.

---

## Section 4 — Role and Team Distinction

Can you distinguish roles and teams?

- [ ] 4.1 Tank-role heroes have a noticeably different border color from Damage or Support heroes.
- [ ] 4.2 Enemy units have a red/rust-tinted border distinct from player hero borders.
- [ ] 4.3 Support-cast abilities (heal, buff) are visually different from basic attack projectiles.
- [ ] 4.4 PortraitToken units are visually richer than PlaceholderPawn units (can you spot the difference?).

---

## Section 5 — Simultaneous Event Groups

Can you follow simultaneous action groups?

- [ ] 5.1 When multiple units act in the same tick, all their animations trigger without one suppressing another.
- [ ] 5.2 Multiple floating numbers from grouped events do not stack exactly on top of each other.
- [ ] 5.3 Round boundary label updates correctly (e.g. "Round 2", "Round 3").

---

## Section 6 — Speed and Accessibility

Board remains readable at normal and fast speed.

- [ ] 6.1 At Normal speed, each event is distinguishable before the next begins.
- [ ] 6.2 Toggle to Fast speed — combat resolves faster but key feedback (hit flash, death) remains visible.
- [ ] 6.3 Toggle Reduced Motion (Settings) — combat resolves instantly with no animation errors.
- [ ] 6.4 No console errors or warnings appear during any of the above steps.
- [ ] 6.5 Skipping directly to the report ("Skip to Report") produces no console errors.

---

## Section 7 — Fallback Safety

Missing assets never break Formation or Combat.

- [ ] 7.1 Start a run with a hero that is NOT in the first visual slice (e.g. Wizard, Ranger). Confirm the board renders without errors and the PlaceholderPawn style is used.
- [ ] 7.2 Reach an encounter with enemies outside the first slice (e.g. Debt Wraith, Dungeon Auditor). Confirm no console errors; placeholder visuals appear.
- [ ] 7.3 Reach combat with a full 5-hero party including both slice and non-slice heroes. Confirm both visual kinds coexist on the board without layout issues.

---

## Known Visual Limitations (follow-up items)

- Only 6 units (Warrior, Knight, Priest, Slime, Goblin Thief, Cave Bat) have the PortraitToken treatment. All others use the PlaceholderPawn colored-pin style.
- No per-character idle sprite sheets or skeletal animations; animations are CSS keyframe only.
- Ability-specific VFX sprites (`assets/effects/ability-<id>.png`) are not yet authored — ability projectiles use the caster's attack effect as fallback.
- Enemy VFX at death use the same CSS death animation as heroes; no enemy-specific death effect.
- No VFX particles for status effects (poison, shield) beyond the existing status glyph icons.

These are deferred to future visual passes once the asset pipeline (CombatAssetManifest) supports per-unit overrides.
