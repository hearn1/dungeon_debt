# TP_M20.1 — Act 2 full 10-round demonic skeleton

Manual Unity Editor test plan for slice **M20.1**. Run in Play mode in `Assets/Scenes/Main.unity`.

Slice goal: Act 2 is now a full 10-round act (absolute rounds 11–20) with a demonic
encounter skeleton — Frugal/Greedy/Carry guild fights at slots 3/6/9 and a new
`Infernal Auditor` `FinalBoss` at round 20 — using deterministic single-candidate
encounter pools.

Reference: `IMPLEMENTATION_PLAN.md` §16 "M20.0 act-format design outcome" / M20.1.

Act 2 slot map under test (absolute round = act start 11 + slot − 1):

| Slot | Round | Encounter | Type | Demonic enemy |
|---:|---:|---|---|---|
| 1 | 11 | Imp Swarm | Dungeon | Imp ×3 |
| 2 | 12 | Soul Broker | Dungeon | Soul Broker + Imp |
| 3 | 13 | Frugal Guild Rematch | RivalGhost | Act 2 Frugal roster |
| 4 | 14 | Gloom Bat | Dungeon | Gloom Bat + Imp |
| 5 | 15 | Debt Wraith | Dungeon | Act 2 Debt Wraith |
| 6 | 16 | Greedy Guild Rematch | RivalGhost | Act 2 Greedy roster |
| 7 | 17 | Hoard Fiend | Dungeon | Hoard Fiend + Imp |
| 8 | 18 | Brimstone Brute | Dungeon | Brimstone Brute + Imp ×2 |
| 9 | 19 | Carry Guild Rematch | RivalGhost | Act 2 Carry roster |
| 10 | 20 | Infernal Auditor | FinalBoss | Infernal Auditor (awards relic) |

---

## Happy path

- [ ] Step 1. Launch Play mode, start a new run, and clear Act 1 (rounds 1–10) as usual. On the Act 1 end screen, observe the title and continue button.
      Expected: Title reads "Act 1 Clear" (generalized copy, not a hardcoded literal). Continue button reads "Continue to Act 2". Reason text reads "Act 1 cleared. The rival guilds regroup for Act 2."
      Actual:

- [ ] Step 2. Click "Continue to Act 2". Proceed to Scout for the first Act 2 round (absolute round 11).
      Expected: The run continues into Act 2. The Run Header / Scout shows Act 2, round 1 of 10 (absolute round 11). The encounter is "Imp Swarm" with 3 Imp enemies.
      Actual:

- [ ] Step 3. Play through Act 2 rounds 11–20 in order, completing the full Scout → Shop → Payroll → Formation → Combat → Reward → Upkeep loop each round. At each round confirm the encounter matches the slot-map table above.
      Expected: Each absolute round 11–20 presents exactly the encounter named in the table; rounds 13/16/19 are the Frugal/Greedy/Carry guild rematches (RivalGhost) in that order; round 20 is the Infernal Auditor final boss.
      Actual:

- [ ] Step 4. Win the round-20 Infernal Auditor fight.
      Expected: A relic reward choice appears (final boss is relic-eligible via the existing RivalGhost-or-FinalBoss rule), then the end screen shows the final-victory copy: title "Victory", reason "All rival guilds defeated. Act 2 complete - the run is won.", button "Main Menu".
      Actual:

- [ ] Step 5. From the round-20 victory end screen, click "Main Menu".
      Expected: Returns to main menu; a fresh run can be started.
      Actual:

## Edge cases

- [ ] Step 6. Reach the round-15 "Debt Wraith" fight while carrying a high debt (take a Loan payroll a couple of times in Act 2 first). Observe the Debt Wraith's combat attack.
      Expected: The Act 2 Debt Wraith's attack scales with current debt at combat start (same DebtWraithScales behavior as Act 1, retuned base stats: higher HP). It applies Poisoned on attack.
      Actual:

- [ ] Step 7. At the round-12 "Soul Broker" fight, deliberately let a Soul Broker survive past combat round 3.
      Expected: 3 gold is lost (existing GoblinStealGold effect, reused), reflected in the Reward Summary / Run Header.
      Actual:

- [ ] Step 8. At the round-17 "Hoard Fiend" fight, deliberately let the Hoard Fiend survive to combat end.
      Expected: Reward is reduced by 4 gold (existing TreasureLeechRewardDrain effect, reused).
      Actual:

- [ ] Step 9. Lose a guild fight on purpose at round 13 (Frugal rematch) — let the party die.
      Expected: Rival-loss morale penalty applies (RivalLossMorale, larger than dungeon loss). Run continues or ends per existing loss-condition rules; the act/round counter stays correct (still Act 2).
      Actual:

- [ ] Step 10. Lose the round-20 Infernal Auditor fight on purpose.
      Expected: End screen shows "Defeat" with the run's end reason; button reads "Main Menu" (no act handoff because Act 2 is the final act).
      Actual:

## Observable invariants

- [ ] Step 11. Throughout the full 20-round run, watch the Run Header / Scout act + round indicator.
      Expected: Rounds 1–10 show Act 1 (1/10 … 10/10); rounds 11–20 show Act 2 (1/10 … 10/10). The indicator never shows Act 2 round counts of /3 or an out-of-range round.
      Actual:

- [ ] Step 12. At every Act 2 Scout, note the encounter name and enemies.
      Expected: Each Act 2 slot always resolves to the same single encounter on repeated runs (single-candidate deterministic pools — no variation between runs). Combat outcomes for identical party/formation/payroll are identical run to run.
      Actual:

- [ ] Step 13. Inspect every Act 2 enemy card in combat (rounds 11–20).
      Expected: No enemy card shows negative HP or negative attack. Demonic dungeon enemies (Imp, Soul Broker, Gloom Bat, Debt Wraith, Hoard Fiend, Brimstone Brute, Infernal Auditor) render with either their placeholder sprite slot or the fallback card box — never a missing/broken graphic that crashes the view.
      Actual:

- [ ] Step 14. Confirm exactly three RivalGhost fights occur in Act 2 (rounds 13, 16, 19) and exactly one FinalBoss (round 20).
      Expected: One fight against each of Frugal, Greedy, Carry (in that order), and one capstone — matching the per-act "one fight vs each guild + capstone" invariant.
      Actual:

## Regression checks

This slice changes shared data flow (`DataRepository` encounter table, `GameRules.ActRoundCounts`)
and the end-screen act copy, so the prior Act 1 run and the Act 1→Act 2 handoff are at risk.

- [ ] Step 15. Play Act 1 rounds 1–10 and confirm every Act 1 encounter is unchanged.
      Expected: Slots 1–10 of Act 1 are exactly as before this slice: Slimes, Goblin Thieves, Greedy Guild Ghost, Tax Collector, Backline Bat, Carry Guild Ghost, Debt Wraith (Act 1 stats: 1 atk / 10 hp), Treasure Leech, Frugal Guild Ghost, Dungeon Auditor final-style fight. No demonic enemy appears in Act 1. (Risk: `DataRepository` encounter list edit / shared `DebtWraith` def.)
      Actual:

- [ ] Step 16. Confirm the Act 1 → Act 2 transition still hands off at round 10 (not earlier, not skipped).
      Expected: The Act 1 clear handoff fires only after round 10 is won; clicking continue starts Act 2 at absolute round 11. (Risk: `GameRules.FinalAct`/`ActRoundCounts` change, `EndScreenView` handoff condition.)
      Actual:

- [ ] Step 17. Confirm the previously-shippable short run is now a full 20-round run end-to-end with no dead/empty round.
      Expected: There is a real, playable encounter for every absolute round 1–20; the run never reaches a round with no encounter or an immediate auto-resolve. (Risk: `ActRoundCounts {10,3}→{10,10}` with the M19.3 act/encounter seam.)
      Actual:

---

No temporary diagnostic scaffold is required: all observations in this plan are
visible in the in-game Scout, Combat, Reward Summary, Run Header, and End Screen
UI. No `Debug.Log` or probe component should be added or committed for this slice.
