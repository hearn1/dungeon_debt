# TP_M13.1 - Act 1 framing and transition shell

Manual Unity Editor test plan for slice **M13.1**. Run at 1920x1080 / 16:9 in Play mode.

This plan verifies that the existing 10-round dungeon is framed as Act 1, that victory stops at an Act 1 clear handoff, and that no Act 2 gameplay content starts.

---

## Happy path

- [ ] Step 1. Open `DungeonDebt/Assets/Scenes/Main.unity`, set Game view to 1920x1080 / 16:9, and press Play.
      Expected: Main menu appears cleanly; Console has no new errors before starting.
      Actual:

- [ ] Step 2. Click Start Run and inspect the first Scout screen plus the run header.
      Expected: The header reads `Act 1 - Round 1/10`; the Scout title or type line also includes `Act 1`.
      Actual:

- [ ] Step 3. Continue through the normal visible flow for one round.
      Expected: Scout, Shop, Formation, Payroll, Combat, Reward, and Rival Update still appear in the same order as the current build; no extra act/campaign/map screen appears.
      Actual:

- [ ] Step 4. Continue the run until the final Round 10 fight is won.
      Expected: The end screen title reads `Act 1 Clear`, the reason says the Dungeon Auditor was defeated, and the copy clearly states that Act 2 is not implemented yet.
      Actual:

- [ ] Step 5. Inspect the victory end screen stats and button.
      Expected: Final round, gold, debt, and morale are still shown; a future-facing handoff note mentions party/gold/debt/morale review before Act 2; the only action is starting a new run.
      Actual:

- [ ] Step 6. Click New Run from the Act 1 clear screen.
      Expected: A fresh run starts at `Act 1 - Round 1/10`; no Act 2 state, carry-forward state, save/load prompt, or new content appears.
      Actual:

## Edge cases

### Temporary setup: defeat copy

For steps 7-10, temporarily edit `DungeonDebt/Assets/Scripts/Core/GameRules.cs` before entering Play mode:

```csharp
public const int StartingDebt = 20;
```

This is test-only setup to trigger the existing debt defeat check quickly. Revert the constant before moving to the next scenario.

- [ ] Step 7. With `StartingDebt = 20`, start a fresh run and complete one combat/reward sequence.
      Expected: When the run evaluates after reward/upkeep, the end screen is a defeat screen, not an Act 1 clear screen.
      Actual:

- [ ] Step 8. Inspect the defeat end screen text.
      Expected: The title reads `Defeat`; the reason remains debt-related; no text implies Act 2 was reached or unlocked.
      Actual:

- [ ] Step 9. Click New Run from the defeat screen.
      Expected: A fresh Act 1 run starts normally; no carry-forward state or Act 2 shell appears after defeat.
      Actual:

- [ ] Step 10. Revert `StartingDebt` in `GameRules.cs` to its pre-test value.
      Expected: The constant is back to normal before continuing.
      Actual:

- [ ] Step 11. Start a run, stop before winning, and inspect Scout/Shop/Reward copy across early rounds.
      Expected: UI copy may frame the dungeon as Act 1, but no copy promises playable Act 2 encounters, a map, save/load, campaign selection, or carry-forward state.
      Actual:

## Observable invariants

- [ ] Step 12. Header text remains visible and non-overlapping in Scout, Shop, Formation, Payroll, Combat, Reward, and Rival Update.
      Actual:

- [ ] Step 13. Scout title/type text remains visible and does not overlap the scout text, reward, danger, enemy cards, or Continue button.
      Actual:

- [ ] Step 14. The run still has exactly 10 rounds; the final fight is still Round 10.
      Actual:

- [ ] Step 15. Victory never auto-starts a new state after Act 1 clear; it waits on the New Run button.
      Actual:

- [ ] Step 16. Defeat screens never show the Act 2 handoff copy.
      Actual:

## Regression checks

These are included because M13.1 changes `RunHeaderView`, `ScoutPanelView`, `EndScreenView`, and a small state-status string in `MainMenuPanel`. The affected seams are display refresh and end-screen variant selection; gameplay managers and data are intentionally untouched.

- [ ] Step 17. Complete a normal early round after the copy changes.
      Expected: Hiring, formation movement, payroll selection, combat replay, reward summary, and Rival Update continue normally; the Act 1 labels do not block any button.
      Actual:

- [ ] Step 18. Reach a victory end screen and then start a new run.
      Expected: `GameManager.StartRun()` still creates a fresh run; previous final gold/debt/morale/party do not carry forward.
      Actual:

- [ ] Step 19. Reach any defeat end screen.
      Expected: `EndScreenView.Show(..., false)` still uses the defeat title/color/reason path and does not show victory-only Act 2 handoff text.
      Actual:
