# TP_M18.1 - Multi-status combat keywords, enemy-side first pass

## Happy path

- [ ] Step 1. Open `DungeonDebt/Assets/Scenes/Main.unity` in Unity and press Play.
      Expected: Main menu appears with no Console errors.
      Actual:

- [ ] Step 2. Start a Standard Contract run and play to Round 2, then enter combat against Goblin Thieves.
      Expected: Goblin Thief cards do not start with gray `W`; when a Goblin attacks, its target gains gray `W`, and that afflicted hero's later attacks log Weakened attack reduction.
      Actual:

- [ ] Step 3. Continue to Round 3 Greedy Guild Ghost.
      Expected: Greedy Carry cards show gold `I` and red `M`; the carry's first attack logs Inspired +1 and removes `I`; `M` remains until that carry is actually hit by an incoming attack, then logs +1 incoming damage and disappears.
      Actual:

- [ ] Step 4. Continue to Round 5 Backline Bat.
      Expected: Backline Bat card shows red `M`; when it attacks, the target gains orange `B`. Burned damage/attack penalty happen later when that afflicted target attacks.
      Actual:

- [ ] Step 5. Continue to Round 6 Carry Guild Ghost.
      Expected: Carry Protector cards show blue `G`; the first incoming attack against each protector logs Guarded damage reduction and removes `G`.
      Actual:

- [ ] Step 6. Continue to Round 7 Debt Wraith.
      Expected: Debt Wraith has no starting `P`; when it attacks, the target gains green `P`. Poison damage and increment happen later when that afflicted target attacks.
      Actual:

- [ ] Step 7. Continue to Round 10 Dungeon Auditor.
      Expected: Dungeon Auditor starts with gold `I`; its first attack is empowered before Inspired disappears and applies Burned to the target.
      Actual:

## Edge cases

### Temporary diagnostic scaffold

Use this only for the edge-case checks, then revert it before marking this test complete.

- [ ] Step 8. In `DungeonDebt/Assets/Scripts/Core/DataRepository.cs`, in `SandboxEncounterDefinition`, temporarily replace the enemy list with `{ CarryProtector, BacklineBat, DebtWraith }`; in `CreateSandboxRun()`, temporarily set the sandbox party to a single `Wizard` in slot `0`.
      Expected: The project recompiles and Restart Sandbox / sandbox combat uses one 3-attack Wizard against Guarded, Marked, Burned-on-hit, and Poisoned-on-hit enemies.
      Actual:

- [ ] Step 9. Run the sandbox combat from the in-game sandbox/restart control.
      Expected: The Wizard's 3-damage attack into Guarded logs `3 -> 2 incoming damage`, proving half damage rounds up.
      Actual:

- [ ] Step 10. In the same sandbox run, observe the Backline Bat interaction.
      Expected: Marked is consumed on first incoming attack; if Backline Bat later attacks, it applies Burned to the Wizard, and Burned does not affect the Wizard until the Wizard's next attack.
      Actual:

- [ ] Step 11. Temporarily set the sandbox party Wizard's health low enough that Poisoned damage can kill it after a later Wizard attack, then run the sandbox again.
      Expected: Debt Wraith applies Poisoned to the Wizard on hit; the Wizard's later attack line appears before Poisoned damage and death lines.
      Actual:

- [ ] Step 12. Revert all temporary `DataRepository.cs` edits from steps 8 and 11, then let Unity recompile.
      Expected: `DataRepository.cs` is back to the committed M18.1 enemy data; no temporary scaffold remains.
      Actual:

## Observable invariants

- [ ] Step 13. During all combat replays, watch status indicators when `Guarded`, `Marked`, or `Inspired` are consumed.
      Expected: Consumed status letters disappear from the card during the replay step that logs consumption.
      Actual:

- [ ] Step 14. Watch cards with active statuses and portraits at 1920x1080.
      Expected: Status indicators sit in the top chrome strip and do not cover portrait art, HP bars, Veteran progress, acting outlines, or hit flashes.
      Actual:

- [ ] Step 15. Watch poisoned units across multiple attacks.
      Expected: Poison damage increases only after poison damage is actually taken by the afflicted unit.
      Actual:

- [ ] Step 16. Watch status-reduced attacks from 1-attack enemies.
      Expected: Damage may reach 0, but no combat log line shows negative attack or negative HP.
      Actual:

- [ ] Step 17. Complete at least one status-heavy combat.
      Expected: Combat still resolves synchronously, turn order remains player left-to-right then enemy left-to-right, and dead units do not act later in the same side pass.
      Actual:

## Regression checks

- [ ] Step 18. Prior combat effect at risk: Knight redirect, because `CombatManager.ApplyAttack` now applies status modifiers before damage. In a run with a Knight and a backline hero, reach Round 5 Backline Bat.
      Expected: Backline Bat's round-2 backline target is still redirected to Knight when available.
      Actual:

- [ ] Step 19. Prior combat effect at risk: Golem armor, because armor reduction now happens after status modifiers. Put Golem in front against any attacking enemy.
      Expected: Golem still reduces incoming attack damage by 1 after status attack modifiers, with no negative damage.
      Actual:

- [ ] Step 20. Prior combat effect at risk: Priest/Frugal Healer replay card refresh, because replay events now carry status snapshots. Observe any Priest or Frugal Healer heal.
      Expected: Heal lines still update HP bars and do not clear unrelated status indicators on other cards.
      Actual:

- [ ] Step 21. Prior combat effect at risk: Debt Wraith debt-scaling, because Debt Wraith now also applies Poisoned on attack. Reach Round 7 with nonzero debt.
      Expected: Debt Wraith still logs debt-scaled attack at combat start, then separately logs Poisoned application to its attack target.
      Actual:
