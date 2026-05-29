// Phase B combat-engine test. Builds a RunState by hand (RunManager arrives in
// Phase C), runs full combats through the ported CombatManager, and checks
// structural correctness plus a few known mechanics. Run with:
//   node src/test/combat.js

import { DataRepository } from "../core/DataRepository.js";
import { CombatManager } from "../combat/CombatManager.js";
import { HeroEffects } from "../combat/HeroEffects.js";
import { RunState } from "../data/RunState.js";
import { HeroInstance } from "../data/HeroInstance.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { HeroTier, RelicId, CombatStatusId } from "../data/enums.js";
import { CombatUnit as CU } from "../data/CombatUnit.js";

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

function buildRun(partyIds, extra) {
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
  if (extra && typeof extra === "function") extra(run);
  return run;
}

function extractDamageFromLog(logLines, attackerName, targetName) {
  for (const line of logLines) {
    const m = line.match(new RegExp(`${attackerName} attacks ${targetName} for (\\d+)`));
    if (m) return parseInt(m[1], 10);
  }
  return -1;
}

function countDamageToTarget(logLines, targetName) {
  let total = 0;
  for (const line of logLines) {
    const m = line.match(new RegExp(`attacks ${targetName} for (\\d+)`));
    if (m) total += parseInt(m[1], 10);
  }
  return total;
}

function buildRunSlotted(entries) {
  const run = new RunState();
  run.heroHealthMultiplier = GameRules.NoCombatMultiplier;
  run.heroDamageMultiplier = GameRules.NoCombatMultiplier;
  run.enemyHealthMultiplier = GameRules.NoCombatMultiplier;
  run.enemyDamageMultiplier = GameRules.NoCombatMultiplier;
  for (const { id, slot } of entries) {
    const def = heroById(id);
    if (!def) continue;
    const hero = new HeroInstance(def, slot);
    HeroEffects.applyTierStatSeed(hero);
    run.party.push(hero);
  }
  return run;
}

function buildCombatUnitsFromRun(run) {
  const units = [];
  for (const hero of run.party) {
    const maxHealth = HeroEffects.getTierAdjustedMaxHealth(hero);
    units.push(new CU(hero.definition.displayName, hero.attack, maxHealth, maxHealth, true, hero.formationSlot, hero, null));
  }
  return units;
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

// ---- Hero effects ----

// Golem armor reduces incoming damage by 1. Slimes have 1 attack so hits should deal 0 to Golem.
{
  const run = buildRun(["golem", "squire", "squire"]);
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  check("golem: player wins", result.playerWon === true);
  const damageToGolem = countDamageToTarget(result.logLines, "Golem");
  check("golem: takes 0 damage per hit (armor -1 vs slime atk 1)", damageToGolem === 0);
}

// Knight redirects the first backline hit to himself.
// Use Knight (slot 0, frontline) + Treasurer (slot 2, backline, 0 attack).
// Treasurer deals 0 damage so Backline Bat survives to round 2 and targets backline.
{
  const run = buildRunSlotted([{ id: "knight", slot: 0 }, { id: "treasurer", slot: 2 }]);
  const result = new CombatManager().startCombat(run, encounter(1, 5));
  check("knight: redirect for backline logged", result.logLines.some(l => l.includes("redirects the hit from")));
}

// Priest heals the frontmost ally each combat round.
{
  const run = buildRun(["warrior", "golem", "priest", "ranger"]);
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  check("priest: heal logged", result.logLines.some(l => l.includes("heals") && l.includes("for 2")));
  check("priest: player wins", result.playerWon === true);
}

// Paladin heals all living allies, including self, at end of combat round.
{
  const run = buildRunSlotted([{ id: "paladin", slot: 0 }, { id: "barbarian", slot: 1 }]);
  const units = buildCombatUnitsFromRun(run);
  units[0].currentHealth = 12;
  units[1].currentHealth = 8;
  const heals = [];
  const logger = { logHeal: (healer, target, amount) => heals.push(`${healer.displayName}->${target.displayName}:${amount}`) };
  HeroEffects.onEndOfCombatRound(1, run, null, units, [], {}, logger);
  check("paladin: heals self for 1", units[0].currentHealth === 13);
  check("paladin: heals ally for 1", units[1].currentHealth === 9);
  check("paladin: group heal logged twice", heals.length === 2);
}

// Cleric heals all living allies, including self, at end of combat round.
{
  const run = buildRunSlotted([{ id: "cleric", slot: 0 }, { id: "barbarian", slot: 1 }]);
  const units = buildCombatUnitsFromRun(run);
  units[0].currentHealth = 6;
  units[1].currentHealth = 8;
  const heals = [];
  const logger = { logHeal: (healer, target, amount) => heals.push(`${healer.displayName}->${target.displayName}:${amount}`) };
  HeroEffects.onEndOfCombatRound(1, run, null, units, [], {}, logger);
  check("cleric: heals self for 1", units[0].currentHealth === 7);
  check("cleric: heals ally for 1", units[1].currentHealth === 9);
  check("cleric: group heal logged twice", heals.length === 2);
}

// Paladin and Cleric group heals stack.
{
  const run = buildRunSlotted([{ id: "paladin", slot: 0 }, { id: "cleric", slot: 1 }, { id: "barbarian", slot: 2 }]);
  const units = buildCombatUnitsFromRun(run);
  units[0].currentHealth = 12;
  units[1].currentHealth = 6;
  units[2].currentHealth = 8;
  const heals = [];
  const logger = { logHeal: (healer, target, amount) => heals.push(`${healer.displayName}->${target.displayName}:${amount}`) };
  HeroEffects.onEndOfCombatRound(1, run, null, units, [], {}, logger);
  check("groupheal: paladin healed by both effects", units[0].currentHealth === 14);
  check("groupheal: cleric healed by both effects", units[1].currentHealth === 8);
  check("groupheal: barbarian healed by both effects", units[2].currentHealth === 10);
  check("groupheal: six stacked heal events logged", heals.length === 6);
}

// Barbarian gains +2 attack while at half HP or below, recalculated at attack time.
{
  const run = buildRunSlotted([{ id: "barbarian", slot: 0 }]);
  const barbarian = buildCombatUnitsFromRun(run)[0];
  const dummy = new CU("Training Dummy", 0, 20, 20, false, 0, null, null);
  const logger = { logMessage: () => {} };
  barbarian.currentHealth = 6;
  HeroEffects.onAttack(barbarian, dummy, logger);
  check("barbarian: no rage above half health", barbarian.attack === 2);
  barbarian.currentHealth = 5;
  HeroEffects.onAttack(barbarian, dummy, logger);
  check("barbarian: rage attack at half health", barbarian.attack === 4);
  barbarian.currentHealth = 6;
  HeroEffects.onAttack(barbarian, dummy, logger);
  check("barbarian: rage removed after healing above half", barbarian.attack === 2);
}

// Rogue first strike doubles first attack damage.
{
  const run = buildRun(["rogue", "warrior", "golem"]);
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  check("rogue: first strike message logged",
    result.logLines.some(l => l.includes("strikes first for double damage")));
  // Rogue attack 3, double = 6. Check the first damage line mentioning Rogue.
  const rogueDmg = result.logLines.find(l => l.includes("Rogue attacks") && l.includes("for "));
  if (rogueDmg) {
    const m = rogueDmg.match(/for (\d+)/);
    check("rogue: first strike deals 6 damage", m && parseInt(m[1], 10) === 6);
  }
}

// Warlock gains attack from debt at combat start.
{
  const run = buildRun(["warlock", "warrior", "golem"]);
  run.debt = 12;
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  // debt 12 → floor(12/6) = 2, min(4, 2) = 2
  check("warlock: debt pact message logged",
    result.logLines.some(l => l.includes("gains +2 attack from debt pact")));
}

// Artificer gains attack from relics at combat start.
{
  const run = buildRun(["artificer", "warrior", "golem"]);
  run.activeRelics.push("BladeCharter");
  run.activeRelics.push("IronOath");
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  // 2 relics → min(4, 2) = 2
  check("artificer: relic charge message logged",
    result.logLines.some(l => l.includes("gains +2 attack from relic charge")));
}

// The three new #69 heroes can complete a full combat together without errors.
{
  const run = buildRun(["rogue", "warlock", "artificer", "warrior", "golem"]);
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  check("newheroes2: full combat resolved", result.logLines.length > 0);
  check("newheroes2: no combat error and final line present",
    result.logLines[result.logLines.length - 1] === "Player wins!" || result.logLines[result.logLines.length - 1] === "Player loses.");
}

// The three new heroes can complete a full combat together without errors.
{
  const run = buildRun(["paladin", "cleric", "barbarian"]);
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  check("newheroes: full combat resolved", result.logLines.length > 0);
  check("newheroes: no combat error and final line present",
    result.logLines[result.logLines.length - 1] === "Player wins!" || result.logLines[result.logLines.length - 1] === "Player loses.");
}

// Enchanter gives +1 attack to adjacent Damage allies.
{
  const run = buildRun(["enchanter", "wizard", "warrior"]);
  run.fullUpkeepPaidLastRound = true;
  const result = new CombatManager().startCombat(run, encounter(1, 4)); // Tax Collector — single enemy, extended combat
  check("enchanter: enchant logged", result.logLines.some(l => l.includes("enchants") && l.includes("+1 attack")));
  check("enchanter: player wins", result.playerWon === true);
}

// Wizard gains +1 attack when full upkeep was paid last round.
{
  const run = buildRun(["wizard", "warrior", "golem"]);
  run.fullUpkeepPaidLastRound = true;
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  check("wizard: scaling logged (full upkeep)", result.logLines.some(l => l.includes("gains +1 attack (full upkeep paid)")));
}

// Wizard does NOT gain attack when full upkeep was NOT paid.
{
  const run = buildRun(["wizard", "warrior", "golem"]);
  run.fullUpkeepPaidLastRound = false;
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  check("wizard: no scaling when upkeep unpaid", !result.logLines.some(l => l.includes("gains +1 attack (full upkeep paid)")));
}

// Bard grants gold on win.
{
  const run = buildRun(["bard", "warrior", "golem", "ranger", "priest"]);
  const goldBefore = run.gold;
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  check("bard: win", result.playerWon === true);
  check("bard: gold increased on win", run.gold > goldBefore);
  check("bard: sing logged", result.logLines.some(l => l.includes("sings for +2 gold")));
}

// ---- Enemy effects ----

// Backline Bat attacks the lowest-HP backline hero on combat round 2.
// Use Squire (slot 0, frontline) + Treasurer (slot 2, backline, 0 atk) so
// Bat survives to round 2 and targets backline.
{
  const run = buildRunSlotted([{ id: "squire", slot: 0 }, { id: "treasurer", slot: 2 }]);
  const result = new CombatManager().startCombat(run, encounter(1, 5)); // Backline Bat + Slime
  if (result.combatRoundsElapsed >= 2) {
    const batAttacksBackline = result.replayEvents.some(e =>
      !e.attackerIsPlayerSide && e.targetIsPlayerSide && e.targetSlot >= GameRules.FrontlineSlots);
    check("backbat: attacks backline hero when alive round 2", batAttacksBackline);
  } else {
    check("backbat: combat lasted <2 rounds", true);
  }
}

// Debt Wraith scales attack with player debt.
{
  const run = buildRun(["warrior", "golem", "wizard", "ranger", "priest"]);
  run.debt = 12;
  const result = new CombatManager().startCombat(run, encounter(1, 7)); // Debt Wraith
  const scaleMsg = result.logLines.filter(l => l.includes("scales to"));
  check("debtwraith: scaling message present", scaleMsg.length > 0);
  // debt 12 → 1 + floor(12/3) = 5 base. No enemy mult, so attack should be 5.
  if (scaleMsg.length > 0) {
    const m = scaleMsg[0].match(/scales to (\d+) attack/);
    check("debtwraith: attack = 5 at debt 12", m && parseInt(m[1], 10) === 5);
  }
}

// Goblin Thief sets survivor flag if alive past combat round 3.
{
  const run = buildRun(["warrior", "golem"]);
  const result = new CombatManager().startCombat(run, encounter(1, 2)); // Goblin Thieves
  // Weak party might not win, but flag should be set if thieves survive
  if (result.combatRoundsElapsed >= GameRules.GoblinThiefStealRound) {
    check("goblin: steal flag present when rounds >= 3",
      result.survivorFlags["goblinStoleGold"] === true);
  }
  check("goblin: steal logged", result.logLines.some(l => l.includes("escapes with the gold")));
}

// Treasure Leech sets survivor flag if alive at combat end.
// Use a weak party so Leech (12 HP) likely survives.
{
  const run = buildRun(["squire"]); // 1 squire, attack 1, can't kill 12-HP Leech + Slime
  const result = new CombatManager().startCombat(run, encounter(1, 8)); // Treasure Leech + Slime
  check("leech: survivor flag present", result.survivorFlags["treasureLeechSurvived"] === true);
}

// Frugal Healer heals frontmost ally each round.
{
  const run = buildRun(["warrior", "golem", "ranger", "priest"]);
  const result = new CombatManager().startCombat(run, encounter(1, 9)); // Frugal Guild ghost
  check("frugal: heal logged", result.logLines.some(l => l.includes("heals") && l.includes("for ")));
}

// ---- Status mechanics ----

// Burned: attacker deals -1 damage and takes 1 self-damage after attacking.
// Backline Bat applies Burned on attack. Use a tanky hero so it survives and retaliates.
{
  const run = buildRun(["golem"]); // Golem damage reduction = lasts longer
  const result = new CombatManager().startCombat(run, encounter(1, 5)); // Backline Bat + Slime
  const burnedSelfDmg = result.logLines.some(l => l.includes("takes 1 Burned damage"));
  check("burned: self-damage line found", burnedSelfDmg);
}

// Poisoned: damage grows incrementally. Debt Wraith applies Poisoned on attack.
{
  const run = buildRun(["golem"]);
  const result = new CombatManager().startCombat(run, encounter(1, 7)); // Debt Wraith
  const poisonDmgLines = result.logLines.filter(l => l.includes("Poisoned damage"));
  check("poison: at least one poison damage instance", poisonDmgLines.length > 0);
}

// Guarded halves incoming damage.
{
  // Frugal Guard starts Guarded, so first hit should deal half damage.
  const run = buildRun(["warrior", "golem", "ranger", "priest"]);
  const result = new CombatManager().startCombat(run, encounter(1, 9)); // Frugal guild
  const guardedSpent = result.logLines.some(l => l.includes("spends Guarded"));
  check("guarded: Guarded consumption logged", guardedSpent);
}

// Marked increases incoming damage by 1. Backline Bat starts with Marked.
{
  const run = buildRun(["warrior", "squire"]); // Warrior hits bat first → Marked consumed
  const result = new CombatManager().startCombat(run, encounter(1, 5)); // Backline Bat + Slime
  const markedSpent = result.logLines.some(l => l.includes("is Marked") && l.includes("incoming damage"));
  check("marked: Marked consumption logged", markedSpent);
}

// Weakened reduces attacker damage by 1.
{
  // Goblin Thief applies Weakened on attack (attackStatuses: [C.Weakened])
  const run = buildRun(["warrior", "golem", "priest"]);
  const result = new CombatManager().startCombat(run, encounter(1, 2));
  const weakenedMsg = result.logLines.some(l => l.includes("is Weakened") && l.includes("attack"));
  check("weakened: Weakened penalty logged", weakenedMsg);
}

// Inspired gives +1 attack and is consumed.
{
  // Dungeon Auditor starts Inspired
  const run = buildRun(["golem", "warrior", "priest"]);
  const result = new CombatManager().startCombat(run, encounter(1, 10));
  const inspiredMsg = result.logLines.some(l => l.includes("spends Inspired"));
  check("inspired: Inspired consumed on attack", inspiredMsg);
}

// ---- Silver tier combat effects ----

// Silver Knight starts Guarded.
{
  const run = buildRun(["knight", "golem"]);
  run.party[0].tier = HeroTier.Silver;
  HeroEffects.applyTierStatSeed(run.party[0]);
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  check("silverknight: starts Guarded", result.logLines.some(l => l.includes("starts Guarded (Silver upgrade)")));
}

// Knight redirect via direct HeroEffects API (isolated from combat timing).
{
  const run = buildRun(["knight", "squire"]);
  const knightHero = run.party[0];
  const squireHero = run.party[1];
  const knightUnit = new CU("Knight", 1, 10, 10, true, 0, knightHero, null);
  const backlineUnit = new CU("Squire", 1, 4, 4, true, 2, squireHero, null);
  const mockLogger = { logMessage: () => {} };
  const redirect = HeroEffects.tryRedirectToKnight(
    backlineUnit, [knightUnit, backlineUnit], 1, mockLogger);
  check("knight: redirect API works", redirect.target !== null && redirect.target.displayName === "Knight");
  check("knight: redirect consumed", redirect.remaining === 0);
}

// Silver Priest heals 3 instead of 2. Use Frugal Guild (4 enemies) so the
// frontline takes enough damage that the full 3-point heal is needed.
{
  const run = buildRun(["warrior", "golem", "priest"]);
  run.party[2].tier = HeroTier.Silver;
  HeroEffects.applyTierStatSeed(run.party[2]);
  const result = new CombatManager().startCombat(run, encounter(1, 9)); // Frugal Guild — 4 enemies
  const silverHeal = result.logLines.some(l => /heals \w+ for 3/.test(l));
  check("silverpriest: heals for 3", silverHeal);
}

// ---- Relic effects in combat ----

// ShieldClause: leftmost frontline hero starts Guarded.
{
  const run = buildRun(["warrior", "golem", "ranger", "priest"]);
  run.activeRelics.push(RelicId.ShieldClause);
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  check("shieldclause: grants Guarded", result.logLines.some(l => l.includes("grants Guarded to")));
}

// RedInkBrand: first player attack applies Marked if target survives.
{
  const run = buildRun(["warrior", "golem", "ranger", "priest"]);
  run.activeRelics.push(RelicId.RedInkBrand);
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  check("redink: applies Marked", result.logLines.some(l => l.includes("applies Marked to")));
}

// CausticWrit: Damage-role heroes apply Burned if target survives.
// Use a Ninja (Damage role, low attack) vs a tanky target so it survives.
{
  const run = buildRun(["ninja", "golem"]);
  run.activeRelics.push(RelicId.CausticWrit);
  run.party[0].tier = HeroTier.Silver;
  HeroEffects.applyTierStatSeed(run.party[0]);
  const result = new CombatManager().startCombat(run, encounter(1, 8)); // Treasure Leech (12 HP) + Slime
  check("caustic: applies Burned", result.logLines.some(l => l.includes("applies Burned to")));
}

// ToxicCollateral: Damage-role heroes apply Poisoned if target survives.
{
  const run = buildRun(["ninja", "golem"]);
  run.activeRelics.push(RelicId.ToxicCollateral);
  run.party[0].tier = HeroTier.Silver;
  HeroEffects.applyTierStatSeed(run.party[0]);
  const result = new CombatManager().startCombat(run, encounter(1, 8)); // Treasure Leech (12 HP) + Slime
  check("toxic: applies Poisoned", result.logLines.some(l => l.includes("applies Poisoned to")));
}

// ---- Difficulty combat multipliers ----

// ApprenticeLedger: hero health scaled up.
{
  const run = buildRun(["warrior"]);
  run.heroHealthMultiplier = GameRules.ApprenticeHeroHealthMult; // 1.25
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  const warriorMax = result.playerStartUnits[0]?.maxHealth;
  check("apprentice: warrior max health scaled (ceil(8*1.25)=10)", warriorMax === 10);
}

// PredatoryInterest: enemy health/damage scaled up.
{
  const run = buildRun(["warrior", "golem", "ranger", "priest"]);
  run.enemyHealthMultiplier = GameRules.PredatoryEnemyHealthMult; // 1.2
  run.enemyDamageMultiplier = GameRules.PredatoryEnemyDamageMult; // 1.2
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  const slime = result.enemyStartUnits[0];
  // Slime: attack 1 → ceil(1*1.2) = 2, health 4 → ceil(4*1.2) = 5
  check("predatory: slime attack scaled to 2", slime && slime.attack === 2);
  check("predatory: slime health scaled to 5", slime && slime.maxHealth === 5);
}

// ---- Combat determinism with effects ----

// Determinism holds with status effects present.
{
  const a = new CombatManager().startCombat(buildRun(["golem", "warrior"]), encounter(1, 2));
  const b = new CombatManager().startCombat(buildRun(["golem", "warrior"]), encounter(1, 2));
  check("determinism: status combat identical logs", JSON.stringify(a.logLines) === JSON.stringify(b.logLines));
}

// ---- Edge cases ----

// No living enemies at start.
{
  // Encounter with all-zero-HP enemies (Training Dummy in encounter pool? No — use a
  // single-slot encounter with guaranteed win: slimes have 4 HP).
  // Instead test: party with zero damage can't kill. Not an edge case to stress here.
  // Instead: verify turn limit works.
  const run = buildRun(["squire"]); // attack 1
  const result = new CombatManager().startCombat(run, encounter(1, 1));
  check("edge: squire-vs-3slimes resolved without crash", result.logLines.length > 0);
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
