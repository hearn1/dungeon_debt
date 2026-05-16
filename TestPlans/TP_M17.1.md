# TP_M17.1 - Tiered veterancy XP + stat bumps

Manual Unity Editor test plan for M17.1. Leave every `Actual:` line blank until testing.

## Happy path

- [ ] Step 1. Open `DungeonDebt/Assets/Scenes/Main.unity`, enter Play Mode, choose `Standard Contract`, and start a run.
      Expected: The run starts normally at Act 1 Round 1 with no Console errors.
      Actual:

- [ ] Step 2. Hire at least one hero, continue through Formation into Combat, and inspect that hero's player combat card before combat resolves.
      Expected: The player combat card shows a compact XP/Veteran progress bar reading `XP 0/2`; HP, tier border, portrait/fallback name, and role readability remain intact.
      Actual:

- [ ] Step 3. Win the first normal dungeon fight with at least one surviving hero, then read Reward Summary.
      Expected: Reward Summary includes a compact `Veterancy:` line; each surviving hero shows `+1 XP` and progress such as `XP 1/2`.
      Actual:

- [ ] Step 4. Continue to the next Formation view and inspect the same surviving hero card.
      Expected: The instance/formation card shows the XP progress bar; the existing role badge, stats, upkeep, tier slot, and effect text are still readable.
      Actual:

- [ ] Step 5. Win a second fight with the same hero surviving.
      Expected: Reward Summary calls out that hero reaching `Veteran 1`; the formation card shows the Veteran progress label and the hero's displayed ATK and max HP each increase by 1 compared with its pre-Veteran Bronze/Silver baseline.
      Actual:

- [ ] Step 6. Continue through a rival-guild fight with the same hero surviving.
      Expected: The surviving hero gains stacked fight XP for the rival fight: `+2 XP` total from survivor + rival bonus.
      Actual:

- [ ] Step 7. Continue fights until the same hero crosses 5 XP and then 9 XP.
      Expected: Veteran tiers are automatic at 5 XP and 9 XP, and Reward Summary reports the new tier without offering choices, spending, skill trees, class changes, or new abilities.
      Actual:

## Edge cases

### Temporary diagnostic scaffold - dead hero survivor XP exclusion

Add this test-only scaffold in `DungeonDebt/Assets/Scripts/Run/RunManager.cs`, inside `AwardVeterancyXp`, immediately after `int[] awards = new int[runState.Party.Count];`:

```csharp
        if (runState.Party.Count > 0 && !WasHeroDead(combatResult, runState.Party[0]))
        {
            combatResult.DeadHeroes.Add(runState.Party[0]);
            UnityEngine.Debug.Log("[M17.1 TEST] Forced first party hero into DeadHeroes before XP awards.");
        }
```

Also add this test-only log in the same method immediately after `hero.VeteranTier = GameRules.GetVeteranTierForXp(hero.VeteranXp);`:

```csharp
            UnityEngine.Debug.Log("[M17.1 XP] " + hero.Definition.DisplayName + " +" + awards[i] + " XP total=" + hero.VeteranXp + " veteran=" + hero.VeteranTier + " dead=" + WasHeroDead(combatResult, hero));
```

- [ ] Step 8. With the scaffold in place, enter Play Mode, hire at least two heroes, and complete a normal dungeon fight.
      Expected: The Console logs show the first party hero as forced dead and omitted from survivor XP; other surviving heroes still gain XP normally.
      Actual:

- [ ] Step 9. Revert both temporary scaffold snippets before continuing any other scenario.
      Expected: `RunManager.cs` is back to the committed M17.1 implementation with no test-only `Debug.Log` or forced `DeadHeroes` mutation.
      Actual:

- [ ] Step 10. Win the Act 1 end-of-act fight on round 10 with at least one surviving hero.
      Expected: Each surviving hero gains stacked end-of-act fight XP plus act-completion XP: `+3 XP` total from survivor + end-of-act + act complete.
      Actual:

- [ ] Step 11. Continue into Act 2 and win the Act 2 round-13 rival capstone with at least one surviving hero.
      Expected: Each surviving hero gains all applicable stacked XP: survivor + rival + end-of-act + act complete, for `+4 XP` total.
      Actual:

- [ ] Step 12. If a hero is already Silver, inspect its formation card and combat card after gaining a Veteran tier.
      Expected: Silver tier identity remains visible, and Veteran ATK/HP bonuses stack on top of Silver bonuses.
      Actual:

- [ ] Step 13. If a combat relic affecting hero stats is active, inspect relevant combat cards after a Veteran tier is gained.
      Expected: Veteran bonuses and relic bonuses both apply in combat; active relic UI remains unchanged.
      Actual:

- [ ] Step 14. Start a run on `Apprentice Ledger` or `Predatory Interest`, then inspect combat card stats after a Veteran tier is gained.
      Expected: Veteran bonuses stack with the selected run contract's combat multipliers; no preset selection or economy behavior changes.
      Actual:

## Observable invariants

- [ ] Step 15. Inspect Reward Summary after several fights.
      Expected: The `Veterancy:` line is compact and does not hide reward, upkeep, interest, debt status, or final resource text.
      Actual:

- [ ] Step 16. Inspect shop/scout/definition-only hero cards.
      Expected: Definition-only cards do not show run-local XP, because XP belongs to hero instances only.
      Actual:

- [ ] Step 17. Inspect enemy combat cards.
      Expected: Enemy cards do not show XP/Veteran progress bars.
      Actual:

- [ ] Step 18. Continue a run after gaining multiple Veteran tiers.
      Expected: Veteran tiers persist only within the current run; starting a new run resets newly hired heroes to `XP 0/2` and Veteran tier 0.
      Actual:

- [ ] Step 19. Watch the Console while completing the above scenarios.
      Expected: No new errors or warnings appear.
      Actual:

## Regression checks

These checks are included because the slice touches `RunManager.ApplyPostCombatResult`, `HeroEffects` stat seeding, and shared card views.

- [ ] Step 20. Use `Cut Wages` or `Promise Victory Bonus`, complete combat, and continue to the next round.
      Expected: Temporary payroll attack changes still revert after combat; next-round hero cards show baseline tier/Veteran stats, not the temporary payroll value.
      Actual:

- [ ] Step 21. Win a relic-eligible rival fight and choose a relic.
      Expected: Reward Summary can lead into Relic Reward as before; selecting a relic routes to the original next state without losing hero XP/Veteran state.
      Actual:

- [ ] Step 22. Lose a fight or hit a debt/morale defeat after XP has been awarded.
      Expected: Existing defeat routing and end-screen copy still work; XP does not create persistence, unlocks, or a restart advantage.
      Actual:
