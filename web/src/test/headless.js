// Headless smoke test for the ported foundation layer. Run with:
//   node src/test/headless.js
// Phases B/C will extend this to run full combats and runs for parity checks.

import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { SaveManager, MemoryStorage } from "../core/SaveManager.js";
import { Rng } from "../core/Rng.js";
import { HeroRole, HeroTier, CombatStatusId } from "../data/enums.js";
import { HeroDefinition } from "../data/HeroDefinition.js";
import { HeroInstance } from "../data/HeroInstance.js";
import { CombatStatusState } from "../data/CombatStatusState.js";
import { CombatUnit } from "../data/CombatUnit.js";

let failures = 0;
function check(name, cond) {
  if (cond) {
    console.log(`  ok   ${name}`);
  } else {
    console.log(`  FAIL ${name}`);
    failures++;
  }
}

console.log("Foundation smoke test");

// GameRules constants + helpers
check("StartingGold = 15", GameRules.StartingGold === 15);
check("debt label Stable @0", GameRulesFns.getDebtStatusLabel(0) === "Stable");
check("debt label Stable @5", GameRulesFns.getDebtStatusLabel(5) === "Stable");
check("debt label Strained @6", GameRulesFns.getDebtStatusLabel(6) === "Strained");
check("debt label Strained @11", GameRulesFns.getDebtStatusLabel(11) === "Strained");
check("debt label Dangerous @12", GameRulesFns.getDebtStatusLabel(12) === "Dangerous");
check("debt label Dangerous @13", GameRulesFns.getDebtStatusLabel(13) === "Dangerous");
check("debt label Critical @14", GameRulesFns.getDebtStatusLabel(14) === "Critical");
check("debt label Critical @19", GameRulesFns.getDebtStatusLabel(19) === "Critical");
check("debt label Critical @20", GameRulesFns.getDebtStatusLabel(20) === "Critical");
check("high debt pressure false @11", GameRulesFns.isHighDebtPressure(11) === false);
check("high debt pressure true @12", GameRulesFns.isHighDebtPressure(12) === true);
check("debt payment caps at 3", GameRulesFns.calculateDebtPaymentAmount(10, 10) === 3);
check("debt payment limited by available gold", GameRulesFns.calculateDebtPaymentAmount(2, 10) === 2);
check("debt payment limited by remaining debt", GameRulesFns.calculateDebtPaymentAmount(10, 2) === 2);
check("scaleCombatStat ceil", GameRulesFns.scaleCombatStat(4, 1.25) === 5);
check("act final round act1 = 10", GameRulesFns.getActFinalRound(1) === 10);
check("act final round act2 = 20", GameRulesFns.getActFinalRound(2) === 20);
check("absolute round act2 slot1 = 11", GameRulesFns.getAbsoluteRound(2, 1) === 11);
check("veteran tier @5 = 2", GameRulesFns.getVeteranTierForXp(5) === 2);
check("role color is css rgba", GameRulesFns.getRoleColor(HeroRole.Tank).startsWith("rgba("));

// Rng determinism
const a = new Rng(12345);
const b = new Rng(12345);
const seqA = [a.next(100), a.next(100), a.nextDouble()];
const seqB = [b.next(100), b.next(100), b.nextDouble()];
check("rng deterministic for same seed", JSON.stringify(seqA) === JSON.stringify(seqB));
check("rng next in range", seqA[0] >= 0 && seqA[0] < 100);

// Data classes
const def = new HeroDefinition("knight", "Knight", HeroRole.Tank, 2, 8, 3, "desc", "KnightRedirect");
const hero = new HeroInstance(def, 0);
check("hero starts at base health", hero.currentHealth === 8);
check("hero starts Bronze", hero.tier === HeroTier.Bronze);
check("hero has unique id", typeof hero.instanceId === "string" && hero.instanceId.length > 0);

const unit = new CombatUnit("Knight", 2, 8, 8, true, 0, hero, null);
check("unit alive at full hp", unit.isAlive === true);
unit.currentHealth = 0;
check("unit dead at 0 hp", unit.isAlive === false);

const status = new CombatStatusState();
status.add(CombatStatusId.Poisoned);
check("poison sets initial damage", status.poisonDamage === GameRules.PoisonInitialDamage);
status.increasePoisonDamage();
check("poison grows", status.poisonDamage === GameRules.PoisonInitialDamage + GameRules.PoisonDamageGrowth);
check("add None rejected", status.add(CombatStatusId.None) === false);
const copy = new CombatStatusState();
copy.copyFrom(status);
check("copyFrom carries poison damage", copy.poisonDamage === status.poisonDamage);

// ---- SaveManager ----
console.log("\nSaveManager tests");
{
  // Missing save returns default v1 and writes it
  const mem = new MemoryStorage();
  const sm = new SaveManager(mem);
  const data = sm.load();
  check("save: missing save returns schemaVersion 1", data.schemaVersion === 1);
  check("save: missing save returns highestBeatenDifficulty -1", data.progression.highestBeatenDifficulty === -1);
  check("save: missing save returns lastSelectedDifficulty default", data.settings.lastSelectedDifficulty === GameRules.DefaultDifficultyLevel);
  check("save: missing save writes to storage", mem.getItem("dungeonDebt.save.v1") !== null);

  // Valid save loads fields correctly
  const mem2 = new MemoryStorage();
  mem2.setItem("dungeonDebt.save.v1", JSON.stringify({
    schemaVersion: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    progression: { highestBeatenDifficulty: 2 },
    settings: { lastSelectedDifficulty: 1 },
  }));
  const sm2 = new SaveManager(mem2);
  sm2.load();
  check("save: valid save loads highestBeatenDifficulty", sm2.getHighestBeatenDifficulty() === 2);
  check("save: valid save loads lastSelectedDifficulty", sm2.getLastSelectedDifficulty() === 1);

  // Corrupt JSON resets to default
  const mem3 = new MemoryStorage();
  mem3.setItem("dungeonDebt.save.v1", "not valid json{{");
  const sm3 = new SaveManager(mem3);
  sm3.load();
  check("save: corrupt JSON resets highestBeaten to -1", sm3.getHighestBeatenDifficulty() === -1);

  // Unsupported schemaVersion resets to default
  const mem4 = new MemoryStorage();
  mem4.setItem("dungeonDebt.save.v1", JSON.stringify({ schemaVersion: 99, progression: { highestBeatenDifficulty: 5 }, settings: {} }));
  const sm4 = new SaveManager(mem4);
  sm4.load();
  check("save: unsupported schemaVersion resets to default", sm4.getHighestBeatenDifficulty() === -1);

  // Partial v1 save normalizes missing fields
  const mem5 = new MemoryStorage();
  mem5.setItem("dungeonDebt.save.v1", JSON.stringify({ schemaVersion: 1, progression: { highestBeatenDifficulty: 3 } }));
  const sm5 = new SaveManager(mem5);
  sm5.load();
  check("save: partial v1 preserves valid highestBeaten", sm5.getHighestBeatenDifficulty() === 3);
  check("save: partial v1 fills missing lastSelectedDifficulty", sm5.getLastSelectedDifficulty() === GameRules.DefaultDifficultyLevel);

  // Invalid numeric fields clamp to valid range
  const mem6 = new MemoryStorage();
  mem6.setItem("dungeonDebt.save.v1", JSON.stringify({
    schemaVersion: 1,
    progression: { highestBeatenDifficulty: 999 },
    settings: { lastSelectedDifficulty: -99 },
  }));
  const sm6 = new SaveManager(mem6);
  sm6.load();
  check("save: out-of-range highestBeaten clamped to MAX", sm6.getHighestBeatenDifficulty() === 10);
  check("save: out-of-range lastSelectedDifficulty clamped to MIN", sm6.getLastSelectedDifficulty() === -1);

  // reset() clears to default v1
  const mem7 = new MemoryStorage();
  const sm7 = new SaveManager(mem7);
  sm7.load();
  sm7.setHighestBeatenDifficulty(3);
  sm7.setLastSelectedDifficulty(2);
  const resetData = sm7.reset();
  check("save: reset highestBeaten to -1", sm7.getHighestBeatenDifficulty() === -1);
  check("save: reset lastSelectedDifficulty to default", sm7.getLastSelectedDifficulty() === GameRules.DefaultDifficultyLevel);
  check("save: reset returns default data", resetData.progression.highestBeatenDifficulty === -1);

  // setHighestBeatenDifficulty never decreases progression
  const mem8 = new MemoryStorage();
  const sm8 = new SaveManager(mem8);
  sm8.load();
  sm8.setHighestBeatenDifficulty(3);
  sm8.setHighestBeatenDifficulty(1);
  check("save: setHighestBeaten never decreases", sm8.getHighestBeatenDifficulty() === 3);

  // animationSpeed and reducedMotion persist across load
  const mem9 = new MemoryStorage();
  const sm9 = new SaveManager(mem9);
  sm9.load();
  check("save: default animationSpeed is normal", sm9.getAnimationSpeed() === "normal");
  check("save: default reducedMotion is false", sm9.getReducedMotion() === false);
  sm9.setAnimationSpeed("fast");
  sm9.setReducedMotion(true);
  const sm9b = new SaveManager(mem9);
  sm9b.load();
  check("save: animationSpeed persists across load", sm9b.getAnimationSpeed() === "fast");
  check("save: reducedMotion persists across load", sm9b.getReducedMotion() === true);

  // invalid animationSpeed is ignored
  const mem10 = new MemoryStorage();
  const sm10 = new SaveManager(mem10);
  sm10.load();
  sm10.setAnimationSpeed("fast");
  sm10.setAnimationSpeed("turbo"); // invalid — should be ignored
  check("save: invalid animationSpeed rejected", sm10.getAnimationSpeed() === "fast");

  // corrupt animationSpeed in stored JSON falls back to default
  const mem11 = new MemoryStorage();
  mem11.setItem("dungeonDebt.save.v1", JSON.stringify({
    schemaVersion: 1,
    progression: { highestBeatenDifficulty: 0 },
    settings: { lastSelectedDifficulty: 0, animationSpeed: "turbo", reducedMotion: "yes" },
  }));
  const sm11 = new SaveManager(mem11);
  sm11.load();
  check("save: corrupt animationSpeed falls back to normal", sm11.getAnimationSpeed() === "normal");
  check("save: corrupt reducedMotion falls back to false", sm11.getReducedMotion() === false);

  // reset() resets animationSpeed and reducedMotion to defaults
  const mem12 = new MemoryStorage();
  const sm12 = new SaveManager(mem12);
  sm12.load();
  sm12.setAnimationSpeed("fast");
  sm12.setReducedMotion(true);
  sm12.reset();
  check("save: reset clears animationSpeed to normal", sm12.getAnimationSpeed() === "normal");
  check("save: reset clears reducedMotion to false", sm12.getReducedMotion() === false);
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
