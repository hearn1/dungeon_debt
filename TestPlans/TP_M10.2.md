# TP_M10.2 - Combat replay and visual feasibility prototype

Slice goal: Prototype live combat replay visuals on top of the M10.1 combat board (per-step HP bar updates, acting outline, hit flash, heal-frame pulse, Warrior board-level traveling sword stab) so we can decide whether uGUI is sufficient for further M10 work or whether to pivot to GameObject/sprite rendering.

Visual model after iteration:
- **Acting** = thin yellow 4-edge outline on the acting unit's card (not a full-card fill).
- **Hit flash** = brief full-card red flash on a non-Warrior / enemy attack target.
- **Heal** = pulsing green 4-edge frame on the healed card (not a full-card fill) + HP bar rise.
- **Warrior attack** = a single shared sword sprite that travels from the Warrior's card to the target card and retracts (board-level overlay, no rotation swing, no trail). Non-Warrior attackers use the hit flash.

## Pre-test setup

- [ ] Step 0a. Open `Main.unity` in the Unity Editor.
      Expected: scene loads with no console errors at edit time.
      Actual:

- [ ] Step 0b. Select the `MainMenuPanel` GameObject in the Hierarchy. In the Inspector, locate the `Sword Sprite` field on `MainMenuPanel` and assign `Assets/Art/Combat/sword.png`.
      Expected: the field shows the sword sprite thumbnail.
      Actual:

- [ ] Step 0c. With `Assets/Art/Combat/sword.png` selected in the Project window, set Inspector → `Texture Type` to **Sprite (2D and UI)**. Click Apply.
      Expected: import settings update without error.
      Actual:

- [ ] Step 0d. Save the scene.
      Expected: scene saves cleanly.
      Actual:

## Happy path

- [ ] Step 1. Press Play. Click `Start Run`.
      Expected: shop opens. No errors in Console.
      Actual:

- [ ] Step 2. Hire a party that includes at least one **Warrior** and one **Priest** (re-roll if needed). Place the Warrior in `F0` (front-left) and the Priest in `B2` (any backline slot).
      Expected: party hires succeed; formation shows Warrior in front and Priest in back.
      Actual:

- [ ] Step 3. Continue through Formation → Payroll (pick any) → Combat.
      Expected: combat board appears with all four lanes populated. The retained combat log appears below it.
      Actual:

- [ ] Step 4. Watch the first attack from the Warrior.
      Expected: (a) the Warrior's card shows a thin yellow 4-edge acting outline (not a full-card yellow fill), (b) the sword sprite appears at the Warrior's card, aimed tip-first toward the target, (c) it lunges quickly to the target card, holds briefly, and retracts, then disappears, (d) the target's HP bar drops in lockstep with the matching log line, (e) the acting outline clears before the next event.
      Actual:

- [ ] Step 5. Watch a non-Warrior hero attack (e.g. a Knight, Wizard, or any other hero) and any enemy attack.
      Expected: target card shows a brief red hit flash (no sword) and HP drops in lockstep with the log line. Thin yellow acting outline appears on the attacker, not a full-card fill.
      Actual:

- [ ] Step 6. Wait for an end-of-round Priest heal to fire (it triggers at the end of every combat round).
      Expected: Priest card shows the thin yellow acting outline; the frontmost ally card shows a pulsing green 4-edge frame (not a full-card green fill); that ally's HP bar visibly increases in lockstep with the heal log line.
      Actual:

- [ ] Step 7. Let combat finish.
      Expected: at the end of the replay, no card has a lingering acting outline; no card has a stuck flash/heal-frame; the sword sprite is hidden (not frozen mid-board); HP bars match the final result exactly; combat log is fully visible and ends with `Player wins!` or `Player loses.`
      Actual:

- [ ] Step 8. Continue to Reward → Upkeep → Shop. Run another combat (different round, different encounter).
      Expected: replay still works on the second combat; nothing leaks between combats; previously-killed heroes show full HP again on the new combat board (per the existing `FinishResult` reset rule).
      Actual:

## Edge cases

- [ ] Step 9. Run a combat where the Warrior dies during replay.
      Expected: at the moment the Warrior's HP reaches 0, the card switches to the dead red-tint background (`SetCurrentHealth` with 0 triggers it). The Warrior produces no further stab visuals because dead units don't act.
      Actual:

- [ ] Step 9b. During a Warrior stab, confirm the sword renders *above* all cards (not clipped behind a card row) and does not push card layout around as it travels across lanes.
      Expected: sword overlays cleanly on top; no card reflows; sword returns to hidden after retract.
      Actual:

- [ ] Step 10. Run a combat where the Priest dies before end-of-round.
      Expected: heal events for that round are skipped (already true in resolver) and no green glow appears on the would-have-been heal target. Replay continues without errors.
      Actual:

- [ ] Step 11. Run a combat that ends on the very first attack (e.g. one-enemy encounter killed in one hit).
      Expected: a single Attack event plays (sword stab if Warrior, flash otherwise), final result line follows, no leftover visual state.
      Actual:

- [ ] Step 12. Run a combat that hits the turn limit.
      Expected: `Combat lost (turn limit).` log line appears as a Message event; no card visual side effect for that line; final HP snapshot matches the resolved result.
      Actual:

- [ ] Step 13. Knight redirect: include a Knight in `F0` plus a Ranger in `B2`. When an enemy targets the Ranger, the Knight should redirect.
      Expected: the redirect message appears in the log as a Message event with no card visual, then the *next* Attack event lands on the Knight (red flash on Knight, HP drop on Knight). The Ranger card is not visually affected.
      Actual:

- [ ] Step 14. Silver Warrior. Get a Warrior to Silver tier (hire two Warriors). Run a combat where the Silver Warrior attacks.
      Expected: silver tier border on the Warrior card persists through replay; sword stab still plays normally from the Silver Warrior to its targets; HP setter doesn't strip the silver border.
      Actual:

## Sword-sprite-missing failsafe

Temporary diagnostic scaffold: this case verifies the `PlayStab` null-sprite fallback (it returns `false`, so the caller falls back to `FlashHit`). If you don't want to test it, skip Steps 15a–15c — they are only exercised when the sprite isn't assigned.

- [ ] Step 15a. Stop Play. On `MainMenuPanel`, clear the `Sword Sprite` field (drag None into it).
      Expected: field shows `None (Sprite)`.
      Actual:

- [ ] Step 15b. Press Play, run a combat with a Warrior.
      Expected: Warrior attacks render as a plain red hit flash (the `FlashHit` fallback when `CombatPanelView.PlayStab` returns false), not as missing visuals or errors.
      Actual:

- [ ] Step 15c. **Revert:** stop Play. Re-assign `Assets/Art/Combat/sword.png` to the `Sword Sprite` field on `MainMenuPanel`.
      Expected: field shows the sword sprite thumbnail again.
      Actual:

## Observable invariants

- [ ] I1. At the end of replay, every card's HP bar matches `result.PlayerFinalUnits` / `result.EnemyFinalUnits` (the existing final-snapshot refresh runs as a safety net).
      Actual:

- [ ] I2. No card displays negative HP at any point during replay (`SetHpDisplay` clamps to 0).
      Actual:

- [ ] I3. At any single moment during replay, **at most one** card on each side has the yellow acting outline visible (acting is cleared before each new event).
      Actual:

- [ ] I4. Acting outline and heal frame stay within card bounds (thin edge strips, not full-card fills). The traveling sword is the only visual that intentionally crosses card bounds; it never reparents or resizes a card.
      Actual:

- [ ] I5. The combat log still reaches the same final `Player wins!` / `Player loses.` line as in M10.1; no log lines are dropped or reordered.
      Actual:

- [ ] I6. Combat math, targeting, rewards, upkeep, hero effects, and run flow all behave identically to M10.1 (no gameplay regression from replay rendering).
      Actual:

## Regression checks

These focus on M10.2's data-shape change to `CombatResult` (`ReplayEvents` list) and `MainMenuPanel`'s switch from `StreamLines` to `StreamReplay`. The resolver itself is unchanged, so encounter outcomes, rewards, upkeep, and rival flow shouldn't move.

- [ ] R1. Rival ghost combat (rounds 3, 6, 9) plays through replay correctly with no special-case errors (rival heroes have valid `HeroId` strings).
      Actual:

- [ ] R2. Frugal Healer enemy heal triggers a green glow on the frugal team's frontmost ally (heal events also fire for enemy-side heals via the same `LogHeal` path).
      Actual:

- [ ] R3. End-of-combat events (`Bard sings...`, `Treasure Leech...`, `Goblin escapes...`) appear in the log as Message events without card visuals and don't block replay completion.
      Actual:

- [ ] R4. Auditor encounter (final boss): periodic auditor damage appears in the log as Message events. **Known limitation:** HP bars do *not* visibly drop on the audited heroes during replay (auditor damage is a Message-kind event in this prototype, not an Attack/Heal event with HP data). Final-snapshot refresh corrects HP after replay completes. Document the visual delay; do not file as a regression.
      Actual:

## Feasibility note (fills AC4)

After running the steps above, write a short feasibility judgment here. Three candidate verdicts; pick one and explain.

- [ ] F1. **uGUI is sufficient for M10.3+** — the traveling sword stab + flash + heal frame read clearly enough to keep building combat presentation in uGUI. Continue with the current architecture for things like attack windups, projectile lines, and per-hero attack signatures (e.g. Wizard bolt, Ranger arrow).
      Verdict + reasoning:

- [ ] F2. **uGUI is borderline; mixed approach.** Keep the static board in uGUI but add a single overlay Canvas + GameObjects for combat VFX going forward, so we can use sprites with proper ordering, masking, and rotation pivots without fighting `RectTransform`.
      Verdict + reasoning:

- [ ] F3. **Pivot to GameObjects.** uGUI cannot carry the visuals we want; before further M10 slices, plan a GameObject/sprite combat representation (units as world-space sprites, attacks as tweened transforms or Animator clips, HP bars as world-space UI).
      Verdict + reasoning:

Notes / friction observed during testing (sprite pivot quirks, layering issues, anything that pushed toward a particular verdict):
