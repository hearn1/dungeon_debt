# TP_M14.1 - Act 2 state shell + 3-encounter mini vertical

Manual Unity Editor test plan for slice **M14.1**. Run at 1920x1080 / 16:9 in Play mode.

This plan verifies that an Act 1 round-10 win hands off into a 3-encounter Act 2
(upgraded rival-guild rematches) using existing systems, that live run state
carries forward, that Act 2 ends on a temporary "Act 2 Complete" screen, and
that defeat behavior is unchanged and never implies Act 2.

All Act/round/gold/debt/morale values under test are visible in the run header,
scout panel, end screen, and rival leaderboard, so no Debug.Log scaffold is
required. The temporary setups below are `GameRules.cs` constant edits used only
to reach late rounds quickly; **each has an explicit revert step that must be
completed before the next scenario.** These edits are test-only and must not be
committed.

---

## Happy path (full, no temporary setup)

- [ ] Step 1. Open `DungeonDebt/Assets/Scenes/Main.unity`, set Game view to 1920x1080 / 16:9, press Play, click Start Run.
      Expected: Run header reads `Act 1 - Round 1/10`; Scout title/type include `Act 1`. No Console errors.
      Actual:

- [ ] Step 2. Play through all 10 Act 1 rounds and win the Round 10 Dungeon Auditor fight.
      Expected: End screen title reads `Act 1 Clear`; reason says Act 1 is cleared and the rival guilds regroup for Act 2; stats show `Act 1 - Round 10/10`, gold, debt, morale. The single action button reads `Continue to Act 2` (not `New Run`).
      Actual:

- [ ] Step 3. Note current gold, debt, morale, and the exact party (heroes, tiers, formation slots) from the end screen / prior screens, then click `Continue to Act 2`.
      Expected: No new run is created. The header now reads `Act 2 - Round 1/3`. Scout title/type read `Act 2`, encounter is `Greedy Guild Rematch` (RivalGhost). Gold/debt/morale match the values from before clicking. The party, hero tiers, and rival leaderboard are the same live state carried forward (HP refreshed for the new round as normal).
      Actual:

- [ ] Step 4. Play Act 2 Round 1 (Greedy Guild Rematch) through Scout -> Shop -> Formation -> Payroll -> Combat -> Reward.
      Expected: The full existing loop works unchanged. Enemy team is an upgraded Greedy team (2 tougher Greedy Tanks + a stronger Greedy Carry). Win/loss reward uses the existing values; RivalGhost win bonus still applies on a win.
      Actual:

- [ ] Step 5. Continue. Confirm Rival Update still runs after Act 2 Round 1.
      Expected: The Rival Leaderboard / Rival Update screen appears after Act 2 Round 1 (rivals keep updating in Act 2). Continue advances to `Act 2 - Round 2/3` Scout, encounter `Carry Guild Rematch`.
      Actual:

- [ ] Step 6. Inspect the Carry Guild Rematch scout/enemy cards.
      Expected: Header reads `Act 2 - Round 2/3`. Enemy team is an upgraded Carry team with one extra unit (2 Carry Protectors + Carry Champion + Carry Vanguard = 4 enemies). EncounterEffectId is none.
      Actual:

- [ ] Step 7. Win Act 2 Round 2, Continue through Rival Update, and reach `Act 2 - Round 3/3`.
      Expected: Header reads `Act 2 - Round 3/3`. Scout encounter is `Frugal Guild Rematch`. Enemy team is 2 Frugal Guards + Frugal Archer + Frugal Healer.
      Actual:

- [ ] Step 8. Observe the Frugal Healer behavior during Act 2 Round 3 combat.
      Expected: The Act 2 Frugal Healer reuses the existing Frugal heal effect - it heals the leftmost living ally each combat round (same wording/behavior as the Act 1 Frugal Ghost healer). No new combat keyword or status appears.
      Actual:

- [ ] Step 9. Win Act 2 Round 3 (the capstone).
      Expected: End screen title reads `Act 2 Complete`; reason says rival guilds defeated and that this is a temporary Act 2 finale with no further content yet; stats show `Act 2 - Round 3/3`, gold, debt, morale. The single button reads `New Run`.
      Actual:

- [ ] Step 10. Click `New Run`.
      Expected: A fresh run starts at `Act 1 - Round 1/10` with starting gold/debt/morale and an empty party. No Act 2 state, carry-forward state, save/load prompt, map, or campaign screen appears.
      Actual:

## Edge cases

> Note: Act 2 is only reachable by clearing Act 1, and `AdvanceToAct2` derives
> the Act 2 start round from `Act1FinalRound` while the Act 2 encounters are
> keyed to absolute rounds 11-13. Lowering `Act1FinalRound` as a "fast path"
> would desync encounter lookup, so it is intentionally **not** used. The full
> happy path above is the canonical Act 1 -> Act 2 -> Act 2 Complete pass. The
> only sanctioned temporary setup is the defeat check below, which is
> independent of the act-round coupling.

### Temporary setup A - defeat never implies Act 2

For steps 11-14, before entering Play mode edit `DungeonDebt/Assets/Scripts/Core/GameRules.cs`:

```csharp
public const int StartingDebt = 20;
```

This trips the existing debt-limit defeat check on the first evaluation.

- [ ] Step 11. With `StartingDebt = 20`, Start Run and complete one combat/reward/upkeep sequence.
      Expected: The run evaluates to a Defeat end screen, not an Act 1 Clear or Act 2 Complete screen.
      Actual:

- [ ] Step 12. Inspect the defeat end screen.
      Expected: Title reads `Defeat`; reason is debt-related; no text mentions Act 2, "Continue to Act 2", or that Act 2 was reached/unlocked. The button reads `New Run`.
      Actual:

- [ ] Step 13. Click `New Run`.
      Expected: Fresh `Act 1 - Round 1/10` run; no carry-forward, no Act 2 shell after defeat.
      Actual:

- [ ] Step 14. Revert `StartingDebt` in `GameRules.cs` to its committed value (`0`).
      Expected: `StartingDebt = 0` again before continuing.
      Actual:

## Observable invariants

- [ ] Step 15. The run is exactly 10 Act 1 rounds + 3 Act 2 rounds (13 absolute). There is no Act 2 round 4+ and no Act 3.
      Actual:

- [ ] Step 16. The header round display never exceeds the rounds-in-act denominator: Act 1 shows `x/10`, Act 2 shows `x/3`; within-act round is never 0 or negative once a run is active.
      Actual:

- [ ] Step 17. Header, scout title/type, and end-screen copy always agree on the current Act (no screen says Act 1 while another says Act 2 for the same state).
      Actual:

- [ ] Step 18. The Act 1 clear screen always waits on the `Continue to Act 2` button and never auto-starts Act 2 or a new run; the Act 2 complete and defeat screens always wait on `New Run`.
      Actual:

- [ ] Step 19. Continuing to Act 2 never resets gold, debt, morale, party membership, hero tiers, or rival leaderboard standings.
      Actual:

- [ ] Step 20. Act 2 enemy cards never show a new combat keyword/status; only higher stats, the one extra Carry unit, and the reused Frugal heal appear.
      Actual:

## Regression checks

Included because M14.1 changes `RunManager.EvaluateNextState` (the shared
post-reward run-flow seam) and adds `RunState.Act`, which every round-display
consumer now reads. Risk: Act 1 rounds 1-9 routing and the round-10 evaluation
must behave exactly as before for Act 1.

- [ ] Step 21. Without any temporary setup, play Act 1 rounds 1 through 9 normally.
      Expected: Each round still routes Scout -> Shop -> Formation -> Payroll -> Combat -> Reward -> Rival Update -> next Scout, with the header counting `Act 1 - Round 1/10` ... `9/10`. No premature Act 1 clear or Act 2 handoff before round 10.
      Actual:

- [ ] Step 22. Lose an Act 1 fight badly enough to drop morale to 0 (or use a temporary morale/debt setup, then revert it with an explicit check) before round 10.
      Expected: Defeat screen as before; no Act 1 Clear / Act 2 copy; `New Run` only.
      Actual:

- [ ] Step 23. From an Act 1 Clear screen, instead of continuing, observe nothing auto-progresses; then click `Continue to Act 2` and immediately check the rival leaderboard in Act 2 Round 1 Scout.
      Expected: Rival standings are continuous with Act 1 (carried, not re-initialized); Rival Update continues to advance them after Act 2 rounds 1 and 2.
      Actual:
