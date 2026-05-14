# TP_M3.1 — DataRepository expansion to the full 12 heroes

**Slice:** M3.1 (data-only)
**Goal:** Verify `DataRepository.AllHeroes` exposes all 12 heroes from `IMPLEMENTATION_PLAN.md` §7 in plan order with exact stats, and that the M1/M2 sandbox flow still works.

This slice has no new UI. Verification is by source inspection plus a temporary one-line probe added to an existing script. Every temporary edit below has an explicit revert step.

---

## Reference: §7 hero table (the source of truth)

| Index | Id          | DisplayName | Role    | Atk | HP | Upkeep | EffectId                  |
|------:|-------------|-------------|---------|----:|---:|-------:|---------------------------|
| 0     | warrior     | Warrior     | Tank    | 2   | 8  | 2      | None                      |
| 1     | knight      | Knight      | Tank    | 1   | 10 | 4      | KnightRedirect            |
| 2     | golem       | Golem       | Tank    | 1   | 14 | 6      | GolemArmor                |
| 3     | wizard      | Wizard      | Damage  | 3   | 4  | 5      | WizardScaling             |
| 4     | ninja       | Ninja       | Damage  | 4   | 3  | 4      | NinjaLowestTarget         |
| 5     | ranger      | Ranger      | Damage  | 3   | 5  | 3      | RangerBackline            |
| 6     | priest      | Priest      | Support | 1   | 5  | 4      | PriestHeal                |
| 7     | bard        | Bard        | Support | 1   | 4  | 3      | BardGoldOnWin             |
| 8     | enchanter   | Enchanter   | Support | 1   | 4  | 3      | EnchanterAdjacent         |
| 9     | squire      | Squire      | Tank    | 1   | 4  | 1      | None                      |
| 10    | treasurer   | Treasurer   | Economy | 0   | 4  | 2      | TreasurerUpkeepReduce     |
| 11    | apprentice  | Apprentice  | Economy | 1   | 3  | 1      | ApprenticeWizardSupport   |

---

## Happy path

- [ ] Step 1. Open `DungeonDebt/Assets/Scripts/Core/DataRepository.cs` in any editor.
      Expected: Twelve `HeroDefinition` static readonly fields appear in this order: Warrior, Knight, Golem, Wizard, Ninja, Ranger, Priest, Bard, Enchanter, Squire, Treasurer, Apprentice.
      Actual: pass

- [ ] Step 2. In the same file, inspect the `HeroDefinitions` list literal.
      Expected: The list contains exactly the 12 entries above in the same order, with no duplicates and no extra entries.
      Actual: pass

- [ ] Step 3. Open `DungeonDebt/Assets/Scripts/Data/GameEnums.cs`.
      Expected: `HeroEffectId` contains `None`, `KnightRedirect`, `GolemArmor`, `WizardScaling`, `NinjaLowestTarget`, `RangerBackline`, `PriestHeal`, `BardGoldOnWin`, `EnchanterAdjacent`, `TreasurerUpkeepReduce`, `ApprenticeWizardSupport`. No new IDs were added in this slice.
      Actual: pass

- [ ] Step 4. Open `DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs`.
      Expected: File is unchanged from M1.2 — six static no-op hook methods, no per-effect logic.
      Actual: pass

- [ ] Step 5. Open Unity Editor. Wait for compilation.
      Expected: Console shows no compile errors and no new warnings.
      Actual: pass

- [ ] Step 6. **Temporary probe.** Open `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs`. Find `Awake()` (or `Start()` — whichever method runs once on scene load). At the very top of the method body, insert exactly this block:

      ```
      for (int i = 0; i < DataRepository.AllHeroes.Count; i++)
      {
          var h = DataRepository.AllHeroes[i];
          UnityEngine.Debug.Log($"[M3.1] {i} {h.Id} {h.DisplayName} {h.Role} Atk={h.BaseAttack} HP={h.BaseHealth} Up={h.BaseUpkeep} Eff={h.EffectId} :: {h.EffectDescription}");
      }
      ```

      Save. Wait for Unity to recompile.
      Expected: No compile errors.
      Actual: pass

- [ ] Step 7. Press Play.
      Expected: Console prints exactly 12 `[M3.1]` lines, indices 0..11, matching the §7 reference table above field-for-field.
      Actual: pass

- [ ] Step 8. **Revert the probe.** Open `MainMenuPanel.cs`, delete the inserted `for` block from Step 6, save. Wait for recompile.
      Expected: File matches its pre-Step-6 contents. Unity compiles cleanly.
      Actual: pass

---

## Field-by-field checks (use the Step 7 console output)

- [ ] Step 9. Verify Warrior row matches `warrior / Warrior / Tank / 2 / 8 / 2 / None`.
      Expected: All fields match.
      Actual: pass

- [ ] Step 10. Verify Knight row matches `knight / Knight / Tank / 1 / 10 / 4 / KnightRedirect`.
      Expected: All fields match.
      Actual: pass

- [ ] Step 11. Verify Golem row matches `golem / Golem / Tank / 1 / 14 / 6 / GolemArmor`.
      Expected: All fields match.
      Actual: pass

- [ ] Step 12. Verify Wizard row matches `wizard / Wizard / Damage / 3 / 4 / 5 / WizardScaling`.
      Expected: All fields match.
      Actual: pass

- [ ] Step 13. Verify Ninja row matches `ninja / Ninja / Damage / 4 / 3 / 4 / NinjaLowestTarget`.
      Expected: All fields match.
      Actual: pass

- [ ] Step 14. Verify Ranger row matches `ranger / Ranger / Damage / 3 / 5 / 3 / RangerBackline`.
      Expected: All fields match.
      Actual: pass

- [ ] Step 15. Verify Priest row matches `priest / Priest / Support / 1 / 5 / 4 / PriestHeal`.
      Expected: All fields match.
      Actual: pass

- [ ] Step 16. Verify Bard row matches `bard / Bard / Support / 1 / 4 / 3 / BardGoldOnWin`.
      Expected: All fields match.
      Actual: pass

- [ ] Step 17. Verify Enchanter row matches `enchanter / Enchanter / Support / 1 / 4 / 3 / EnchanterAdjacent`.
      Expected: All fields match.
      Actual: pass

- [ ] Step 18. Verify Squire row matches `squire / Squire / Tank / 1 / 4 / 1 / None`.
      Expected: All fields match.
      Actual: pass

- [ ] Step 19. Verify Treasurer row matches `treasurer / Treasurer / Economy / 0 / 4 / 2 / TreasurerUpkeepReduce`.
      Expected: All fields match.
      Actual: pass

- [ ] Step 20. Verify Apprentice row matches `apprentice / Apprentice / Economy / 1 / 3 / 1 / ApprenticeWizardSupport`.
      Expected: All fields match.
      Actual: pass

---

## Edge cases

- [ ] Step 21. Scan the Step 7 console output for duplicate `Id` values.
      Expected: All 12 `Id` strings are unique.
      Actual: pass

- [ ] Step 22. Confirm count.
      Expected: Exactly 12 `[M3.1]` log lines printed, no more, no less.
      Actual: pass

---

## Rule checks

- [ ] Step 23. Inspect `HeroDefinition.cs` (unchanged).
      Expected: All public members are `get`-only properties initialized via the constructor. Definitions are immutable.
      Actual: pass

- [ ] Step 24. In `DataRepository.cs`, confirm `AllHeroes` is `IReadOnlyList<HeroDefinition>` wrapped in `ReadOnlyCollection`.
      Expected: Field is read-only; external callers cannot mutate the list.
      Actual: pass

- [ ] Step 25. Search the slice's modified files for `UnityEngine.Random`.
      Expected: Zero matches.
      Actual: pass

- [ ] Step 26. Search the slice's modified files for any magic numeric literal that should live in `GameRules`.
      Expected: Hero stats are data values per §7 and belong in `DataRepository`, not `GameRules`. No tuning constants leaked into other logic files.
      Actual: pass

- [ ] Step 27. Confirm no new files were created under `Assets/Resources/`, `Assets/StreamingAssets/`, `Assets/Tests/`, or `Assets/Editor/`.
      Expected: None of those folders exist or were created.
      Actual: pass

- [ ] Step 28. Confirm no new Input System `.inputactions` assets were created.
      Expected: None.
      Actual: pass

- [ ] Step 29. Confirm `HeroEffects.cs` has no new switch/dispatch on the seven new effect IDs.
      Expected: Hook methods remain no-ops; non-MVP effect logic was not added.
      Actual: pass

---

## Regression checks

- [ ] Step 30. Press Play, click Start Run (M2.1).
      Expected: Header shows Round 1/10, Gold 10, Debt 0, Morale 30. Matches TP_M2.1.
      Actual: pass

- [ ] Step 31. Click Start Combat (M1.3 sandbox flow).
      Expected: Sandbox combat resolves with the same 4-hero party (Warrior, Squire, Wizard, Ranger) versus 2 Slimes + 1 Cave Bat. Log lines stream as before.
      Actual: pass

- [ ] Step 32. Read the combat log.
      Expected: Final line is `Player wins!` (or whatever the deterministic M1.3 result was — must match prior TP_M1.3 outcome).
      Actual: pass

- [ ] Step 33. Click Continue from the Reward Summary (M2.2).
      Expected: Reward summary shows the same reward/upkeep/shortfall/interest/morale numbers as TP_M2.2.
      Actual: pass

- [ ] Step 34. Continue advancing rounds. Force or play to a Defeat (M2.3) or Victory (round 10).
      Expected: End-screen flow reaches Victory or Defeat exactly as in TP_M2.3, including reason text.
      Actual: pass

---

## Observable invariants

- [ ] Step 35. `DataRepository.AllHeroes.Count == 12` at all times.
      Expected: Always 12.
      Actual: pass

- [ ] Step 36. No two heroes share an `Id`.
      Expected: 12 distinct ids.
      Actual: pass

- [ ] Step 37. Every hero's `EffectId` is a defined member of `HeroEffectId`.
      Expected: No `(HeroEffectId)999` or similar — every value matches an enum entry.
      Actual: pass

- [ ] Step 38. `CreateSandboxRun()` still returns a `RunState` with `Party.Count == 4` and party members Warrior, Squire, Wizard, Ranger (in that order, slots 0..3).
      Expected: Sandbox party identity preserved.
      Actual: pass

- [ ] Step 39. Stats in `AllHeroes` exactly match §7 (no value is "close" or "approximate").
      Expected: Byte-for-byte agreement with the reference table above.
      Actual: pass
