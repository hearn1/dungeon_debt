# TP_M3.2 — ShopManager and shop UI

**Slice:** M3.2
**Goal:** Verify `Start Run` opens a Shop with 3 distinct random offers from `DataRepository.AllHeroes`, Hire/Fire/Reroll mutate `RunState` correctly with `GameRules` constants, and Continue advances to Combat with the player-built party. M1/M2 flow (combat, reward, end screen) still works.

Every temporary code edit below has an explicit revert step. Do not commit any temporary edits.

---

## Constants used (for reference)

- `GameRules.ShopOfferCount = 3`
- `GameRules.HireCostBonus = 2` → hire cost = `BaseUpkeep + 2`
- `GameRules.FireRefund = 1`
- `GameRules.RerollCost = 2`
- `GameRules.MaxPartySize = 5`
- `GameRules.StartingGold = 10`

---

## Happy path

- [ ] Step 1. Open `DungeonDebt/Assets/Scenes/Main.unity` in Unity and press Play.
      Expected: Title "Dungeon Debt" shows; **Start Run** button is enabled; **Restart Sandbox** is disabled; no shop panel visible.
      Actual: pass

- [ ] Step 2. Click **Start Run**.
      Expected: Shop panel appears in the central area. Header shows `Round 1`, `Gold 10`, `Debt 0`, `Morale 30`. Status text reads "Shop. Hire heroes, then Continue." The shop shows the title "Shop", a gold/party readout `Gold: 10    Party: 0 / 5`, three offer cards on the left, a "Party" column on the right with 5 "(empty)" rows, a **Reroll (2g)** button bottom-left, **Continue to Combat** button bottom-right.
      Actual: pass

- [ ] Step 3. Inspect the 3 offers.
      Expected: Each offer shows hero name + role, "ATK x / HP y / Upkeep z", an effect blurb, and a `Hire (Ng)` button where N = upkeep + 2. The three hero names are **all different**.
      Actual: pass

- [ ] Step 4. Click **Hire** on the cheapest affordable offer (any hero where N ≤ current gold).
      Expected: Gold decreases by exactly N. Party readout updates to `Party: 1 / 5`. Row 1 of the Party column shows that hero's name and stats with a **Fire** button. That offer card's button becomes disabled and its status reads "Hired".
      Actual: pass

- [ ] Step 5. Continue hiring affordable offers (Hire all three if affordable, or Reroll and Hire more) until **Party: 2 / 5** or higher.
      Expected: Gold decreases each time by `upkeep + 2`. Party rows appear in hire order.
      Actual: pass

- [ ] Step 6. Click **Continue to Combat**.
      Expected: Shop panel hides. Combat log streams. The party that fights matches the heroes you hired (names appear in the combat log).
      Actual: pass

- [ ] Step 7. Wait for combat to finish.
      Expected: Reward Summary appears with reward/upkeep/interest math. Continue button is shown. Restart Sandbox is enabled.
      Actual: pass

- [ ] Step 8. Click **Continue** on Reward Summary.
      Expected: If neither victory nor defeat conditions are met, the next round starts and combat re-runs with the same hired party. Header `Round` advances to 2.
      Actual: pass

---

## Affordability and party limits

- [ ] Step 9. Press Play, click **Start Run**. Note the displayed hire costs.
      Expected: Any offer whose cost > 10 has its Hire button disabled and status reads "Need Ng".
      Actual: partial - no cost > 10. did notice when purchasing earlier that hire button does disable when cant afford

- [ ] Step 10. (Temporary setup) Edit `DungeonDebt/Assets/Scripts/Core/GameRules.cs`, change `StartingGold = 10;` to `StartingGold = 100;`. Save. Press Play, click **Start Run**.
      Expected: All 3 offers have Hire enabled (gold = 100 covers any cost).
      Actual: pass

- [ ] Step 11. Hire 5 heroes total. Pattern: Hire any affordable offers → Reroll (deducts 2g, refreshes **all 3** slots with fresh draws, excluding heroes already in your party) → Hire more → Reroll → ... until Party: 5/5.
      Expected: Each Reroll fully replaces the 3 offers (the slots you'd already hired are now replaced by new heroes — your hired heroes remain in the Party column). No offered hero name is already a party member. After Hire #5, party readout reads `Party: 5 / 5` and every offer's Hire button is disabled with status "Party full".
      Actual: Pass
      Regression: Picked a bunch of support characters. Game log gets cut off if there are too many actions in a round.

- [ ] Step 12. (Revert) Restore `GameRules.StartingGold = 10;`. Save.
      Expected: Code reverted.
      Actual: pass

- [ ] Step 13. Press Play, click **Start Run**. Confirm Reroll button state: starting gold is 10, so Reroll (2g) is enabled.
      Expected: Reroll button enabled.
      Actual: pass

- [ ] Step 14. (Temporary setup) Edit `GameRules.cs` and set `StartingGold = 1;`. Save. Press Play, click **Start Run**.
      Expected: Reroll button is disabled (1 < 2). Every offer's Hire button is disabled (every hero costs ≥ 3).
      Actual: pass

- [ ] Step 15. (Revert) Restore `GameRules.StartingGold = 10;`. Save.
      Expected: Code reverted.
      Actual: pass

---

## Hire / Fire math

- [ ] Step 16. Press Play, click **Start Run**. Pick an offer for a hero with `BaseUpkeep = 1` (Squire/Bard/Apprentice if offered) or `BaseUpkeep = 2` (Warrior/Treasurer). If none are offered, Reroll once and try again.
      Expected: Hire cost label = `Hire ((upkeep+2)g)`. Hiring deducts exactly `upkeep + 2` from gold.
      Actual: pass

- [ ] Step 17. With at least one hero in the party, click that hero's **Fire** button.
      Expected: That row clears to "(empty)". Gold increases by exactly 1 (`FireRefund`). Party readout drops by 1. Any previously-disabled Hire buttons may now re-enable if Party was full.
      Actual: Partial pass - wasnt able to test the previously disabled hires

---

## Reroll behavior

- [ ] Step 18. Press Play, click **Start Run**. Note the three offered hero names (call them A, B, C).
      Expected: Three distinct names shown.
      Actual: pass

- [ ] Step 19. Hire one offer (say A). Click **Reroll**.
      Expected: Gold decreases by 2. Offer A's slot still shows hero A with status "Hired" and disabled Hire (purchased offers are locked). The other two slots show different heroes (not necessarily new — could include B or C since they were not purchased — but the three visible heroes must all be distinct from each other).
      Actual: pass

- [ ] Step 20. Reroll repeatedly until gold < 2.
      Expected: Each reroll deducts 2 gold and refreshes only the unpurchased slots. Once gold < 2, Reroll button disables.
      Actual: pass

---

## Rule checks

- [ ] Step 21. Open `DungeonDebt/Assets/Scripts/Run/ShopManager.cs`.
      Expected: No reference to `UnityEngine.Random`. Random draws use `_runManager.Random` (a `System.Random`).
      Actual: pass

- [ ] Step 22. Search the whole repo under `DungeonDebt/Assets/Scripts/` for `UnityEngine.Random` and for `Random.Range`.
      Expected: Zero matches in any new or modified file from this slice.
      Actual: pass

- [ ] Step 23. Open `DungeonDebt/Assets/Scripts/UI/ShopPanelView.cs` and `ShopOfferView.cs`.
      Expected: Neither file calls `gameObject.SetActive` on a *different* panel. `ShopPanelView.Show()/Hide()` operate only on its own GameObject, called from `MainMenuPanel` in response to state changes. The shop does not show or hide itself.
      Actual: pass

- [ ] Step 24. Open `DungeonDebt/Assets/Scripts/Core/GameManager.cs`.
      Expected: `StartRun()` chains `ChangeState(GameState.StartRun)` then `ChangeState(GameState.Shop)`. Entering `Shop` calls `_shopManager.GenerateOffers()`. `ContinueFromShop()` transitions to `Combat`. All state changes go through `ChangeState`.
      Actual: pass

- [ ] Step 25. Open `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs`.
      Expected: No call to `_runManager.PrepareSandboxRun()` anywhere. `RunSandboxCombat` reads the party from `_gameManager.CurrentRunState` (the player-built party).
      Actual: pass

- [ ] Step 26. Confirm no out-of-scope additions: no payroll-choice UI, no formation-edit UI, no scout panel, no rival panel, no new encounter content, no save/load, no animations/tweens/audio, no new hero/enemy effects.
      Expected: All true.
      Actual: pass

---

## Regression checks (from prior slices)

- [ ] Step 27. From the Shop, hire at least one hero, Continue to Combat.
      Expected (M1.3): Combat log streams readable lines, ends with a Win/Loss result line. Synchronous resolution; only the log replay is delayed.
      Actual: pass

- [ ] Step 28. After combat finishes, inspect the Run header values.
      Expected (M2.1/M2.2): Header reflects post-combat values: gold = starting_after_shop + reward - upkeep paid - interest paid; debt and morale updated per M2 math. Values match Reward Summary's "Final: Gold / Debt / Morale" line.
      Actual: pass

- [ ] Step 29. Click **Continue** on Reward Summary repeatedly through several rounds, or force loss conditions (e.g., low Morale by temporarily editing `GameRules.StartingMorale = 6;` then revert).
      Expected (M2.3): A morale or debt loss reaches the **Defeat** end screen; finishing round 10 with a win reaches **Victory**. New Run button restarts the run from the Shop.
      Actual: pass

- [ ] Step 30. (Revert any temporary `GameRules` edits.)
      Expected: All constants back to original values (`StartingGold = 10`, `StartingMorale = 30`, etc.).
      Actual: pass

---

## Observable invariants

- [ ] Step 31. Throughout any run, the shop shows exactly 3 offer slots (no more, no fewer) on entry.
      Expected: True at every shop visit.
      Actual: pass

- [ ] Step 32. `RunState.Party.Count` never exceeds 5. Hire buttons disable at 5/5.
      Expected: True.
      Actual: pass

- [ ] Step 33. The 3 hero names visible in the shop at any given moment are all distinct (no duplicate hero ids in a single roll).
      Expected: True at initial roll and after every reroll.
      Actual: pass

- [ ] Step 34. Gold never goes negative. Every Hire/Fire/Reroll only fires when its affordability/limits gate is satisfied.
      Expected: True.
      Actual: pass

- [ ] Step 35. With zero heroes hired, clicking **Continue to Combat** is allowed and combat runs (and per design, the player loses by turn limit). This is intentional per slice scope.
      Expected: Combat begins with empty party and reaches a Loss result without crashing.
      Actual: pass
