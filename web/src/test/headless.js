// Headless smoke test for the ported foundation layer. Run with:
//   node src/test/headless.js
// Phases B/C will extend this to run full combats and runs for parity checks.

import { GameRules, GameRulesFns } from "../core/GameRules.js";
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
check("debt label Critical @20", GameRulesFns.getDebtStatusLabel(20) === "Critical");
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

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
