// Phase B combat-engine test. Builds a RunState by hand (RunManager arrives in
// Phase C), runs full combats through the ported CombatManager, and checks
// structural correctness plus a few known mechanics. Run with:
//   node src/test/combat.js

import { DataRepository } from "../core/DataRepository.js";
import { CombatManager } from "../combat/CombatManager.js";
import { HeroEffects } from "../combat/HeroEffects.js";
import { RunState } from "../data/RunState.js";
import { HeroInstance } from "../data/HeroInstance.js";
import { GameRules } from "../core/GameRules.js";

let failures = 0;
function check(name, cond) {
  console.log(`  ${cond ? "ok  " : "FAIL"} ${name}`);
  if (!cond) failures++;
}

function heroById(id) {
  return DataRepository.allHeroes.find((h) => h.id === id);
}

function encounter(act, slot) {
  return DataRepository.getEncounterPool(act, slot)[0];
}

function buildRun(partyIds) {
  const run = new RunState();
  run.heroHealthMultiplier = GameRules.NoCombatMultiplier;
  run.heroDamageMultiplier = GameRules.NoCombatMultiplier;
  run.enemyHealthMultiplier = GameRules.NoCombatMultiplier;
  run.enemyDamageMultiplier = GameRules.NoCombatMultiplier;
  partyIds.forEach((id, slot) => {
    const hero = new HeroInstance(heroById(id), slot);
    HeroEffects.applyTierStatSeed(hero);
    run.party.push(hero);
  });
  return run;
}

console.log("Combat engine test");

// A strong, well-rounded party should clear the opening Slimes fight.
{
  const run = buildRun(["warrior", "golem", "wizard", "ranger", "priest"]);
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  check("slimes: player wins", result.playerWon === true);
  check("slimes: log produced", result.logLines.length > 0);
  check("slimes: replay events produced", result.replayEvents.length > 0);
  check("slimes: final result line is win", result.logLines[result.logLines.length - 1] === "Player wins!");
  check("slimes: start snapshots captured", result.playerStartUnits.length === 5 && result.enemyStartUnits.length === 3);
}

// Empty party loses immediately with no living heroes.
{
  const run = buildRun([]);
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  check("empty party: player loses", result.playerWon === false);
  check("empty party: rounds elapsed 0", result.combatRoundsElapsed === 0);
  check("empty party: 'no living heroes' logged", result.logLines.includes("Player has no living heroes."));
}

// Ninja loots gold on kill (OnKill side effect on RunState).
{
  const run = buildRun(["ninja", "warrior", "golem", "priest", "ranger"]);
  const goldBefore = run.gold;
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  check("ninja: wins vs slimes", result.playerWon === true);
  check("ninja: looted gold on kills", run.gold > goldBefore);
}

// Final boss applies periodic Auditor damage. Use a tanky, low-damage party so
// combat survives to round 3+ and the periodic audit (rounds 3/6/9) fires.
{
  const run = buildRun(["golem", "warrior", "squire", "priest"]);
  const result = new CombatManager().startCombat(run, encounter(1, 10));
  const auditorLine = result.logLines.some((l) => l.startsWith("Dungeon Auditor audits"));
  check("auditor: combat lasted past round 3", result.combatRoundsElapsed >= 3);
  check("auditor: periodic audit damage logged", auditorLine);
}

// Determinism: same setup yields identical logs (combat has no RNG).
{
  const a = new CombatManager().startCombat(buildRun(["warrior", "golem", "wizard", "ranger", "priest"]), encounter(1, 6));
  const b = new CombatManager().startCombat(buildRun(["warrior", "golem", "wizard", "ranger", "priest"]), encounter(1, 6));
  check("determinism: identical logs across runs", JSON.stringify(a.logLines) === JSON.stringify(b.logLines));
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
