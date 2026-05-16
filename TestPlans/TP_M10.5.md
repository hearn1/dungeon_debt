# TP_M10.5 — Shared effect sprites + category-routed source→target motion

Slice goal: the board-level combat effect uses the shared 5-sprite set from
`SpriteCatalog`, routed by attack category, animated source→target via the
reused M10.2 motion machine. `_swordSprite`/`sword.png` retired.

Preconditions:
- Open `Assets/Scenes/Main.unity` in the Unity 6.4 Editor.
- The `SpriteCatalog` component (wired in M10.4 via `MainMenuPanel._spriteCatalog`)
  has the 5 effect slots assigned: `melee_stab`, `arrow`, `fireball`, `heal`,
  `enchant` (PNGs in `Assets/Art/Effects/`). If any effect slot is empty, that
  category falls back to a hit flash (attacks) or no flourish (enchant) — note
  which slots were assigned when recording results.
- No Console compile errors on entering Play mode.
- Note: `MainMenuPanel` no longer has a `_swordSprite` field; any old scene
  value is silently dropped by Unity. This is expected, not a bug.

---

## Happy path

- [ ] Step 1. Enter Play mode. Start a run; hire a party that includes a
      **Warrior** (or any non-Ranger/Wizard melee hero), a **Ranger**, and a
      **Wizard**. Place them in the formation and proceed to Combat.
      Expected: Combat board shows hero/enemy cards. As the log streams, on a
      melee hero's attack a single shared **melee_stab** sprite travels from
      the attacker card to the target card and retracts; on the **Ranger's**
      attack an **arrow** sprite travels; on the **Wizard's** attack a
      **fireball** sprite travels. Each effect is rotated so it points toward
      the target. HP bars and the combat log update exactly as before.

- [ ] Step 2. Continue runs / rounds until an enemy attacks a hero.
      Expected: enemy attacks show a traveling **melee_stab** sprite from the
      enemy card to the hero card, aimed at the target. No errors.

- [ ] Step 3. Reach an encounter containing a **Frugal Archer** enemy (later
      rounds) and let it attack.
      Expected: the Frugal Archer's attack travels the **arrow** sprite; other
      enemies in the same fight still use **melee_stab**.

- [ ] Step 4. Run a combat where a **Priest** (or enemy **Frugal Healer**)
      heals a damaged ally.
      Expected: the shared upright **heal** sprite pulses once on the healed
      unit's card (no travel, no rotation) and its HP bar rises. The old green
      heal-glow frame no longer appears.

- [ ] Step 5. Run a combat with an **Enchanter** on the player side.
      Expected: at combat start, the upright **enchant** sprite pulses once on
      the Enchanter's own card (appears, brief hold, disappears) with no
      rotation and no travel to other cards. Combat then proceeds normally.

---

## Edge cases

- [ ] Step 6. Enchanter present but in a back-row slot.
      Expected: the combat-start enchant pulse plays on the Enchanter's actual
      card wherever it sits; no error if the slot is back-line.

- [ ] Step 7. Two attacks resolve back-to-back in the log replay.
      Expected: the single shared effect sprite is reused — it finishes one
      source→target motion before the next begins; no duplicate/overlapping
      effect sprites, no leftover sprite stuck on screen between steps.

- [ ] Step 8. A unit dies from an attack (HP reaches 0 on that step).
      Expected: the attack effect still travels and the target shows its dead
      styling; the subsequent death log line produces no effect sprite.

- [ ] Step 9. (Only if an effect slot is intentionally left empty in
      `SpriteCatalog`.) Trigger that category.
      Expected: attacks of a missing category fall back to the target's hit
      flash (no error); a missing enchant slot simply plays no flourish. No
      `NullReferenceException` in the Console.

- [ ] Step 10. Win the combat and continue to the reward screen, then into the
      next round's combat.
      Expected: effects continue to work on the next combat; no sprite
      lingers from the previous combat (board cleared between combats).

---

## Observable invariants

Should always hold during any combat in this slice:

1. At most one effect sprite is visible on the board at any instant (single
   shared sprite; disabled when idle).
2. The effect sprite is only visible during an attack step's
   lunge/hold/retract or the combat-start enchant pulse — never while the
   board is idle or after combat ends.
3. `melee_stab` / `arrow` / `fireball` are rotated toward the target;
   `enchant` and `heal` are upright and pulse in place (no travel).
4. HP bar values and combat-log text are identical to pre-M10.5 behavior for
   the same encounter (effects are presentation-only).
5. No hero/enemy card displays a per-unit-unique attack sprite — every effect
   is one of the 5 shared sprites.
6. No `NullReferenceException` or other Console errors during combat replay.

---

## Regression checks

This slice rewrites the M10.2 traveling-effect path inside
`CombatPanelView` (the seam earlier replay/HP-bar behavior depends on) and
changes `CombatPanelView.Initialize`'s signature + removes
`MainMenuPanel._swordSprite`.

- [ ] R1. Combat-log streaming and per-step HP-bar updates (M10.2 behavior)
      still work end-to-end for a full encounter — the effect rewrite did not
      regress the replay stepping or the final-snapshot HP correction.
      File/seam at risk: `CombatPanelView.ApplyReplayEvent` (attack/heal/death
      branches) and `CombatPanelView.Initialize` call site in
      `MainMenuPanel` (`_combatPanelView.Initialize(GetRuntimeFont(), _spriteCatalog)`).

- [ ] R2. Hero/enemy base portraits (M10.4) and the thin tier frame + no-sprite
      name fallback (M10.6) still render correctly on combat cards — the
      `CombatUnitCardView.CurrentUnit` getter added this slice is read-only and
      must not have altered card rendering.

---

(No temporary diagnostic scaffold needed — every behavior in this slice is
directly observable on the combat board and in the Console.)
