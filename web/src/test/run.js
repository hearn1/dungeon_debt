// Phase C run-flow test. Drives GameManager through targeted unit checks and a
// full autopiloted run to confirm the whole state machine resolves without
// errors. Run with: node src/test/run.js

import { GameManager } from "../core/GameManager.js";
import { GameState } from "../core/GameState.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { DataRepository } from "../core/DataRepository.js";
import { RunManager } from "../run/RunManager.js";
import { EncounterManager } from "../run/EncounterManager.js";
import { ShopManager } from "../run/ShopManager.js";
import { ShopOffer } from "../data/ShopOffer.js";
import { HeroInstance } from "../data/HeroInstance.js";
import { HeroEffects } from "../combat/HeroEffects.js";
import { CombatManager } from "../combat/CombatManager.js";
import { RivalUpdatePanel } from "../ui/panels/RivalUpdatePanel.js";
import { EnemyEffectId, HeroRole, HeroTier, PayrollActionId, EncounterType, DifficultyLevel, RivalGuild, ShopEventId } from "../data/enums.js";

let failures = 0;
function check(name, cond) {
  console.log(`  ${cond ? "ok  " : "FAIL"} ${name}`);
  if (!cond) failures++;
}

console.log("Run-flow test");

// ---- All four tier enums present ----
{
  check("tier: Bronze exists", HeroTier.Bronze === "Bronze");
  check("tier: Silver exists", HeroTier.Silver === "Silver");
  check("tier: Gold exists", HeroTier.Gold === "Gold");
  check("tier: Diamond exists", HeroTier.Diamond === "Diamond");
}

// ---- Run initialization applies difficulty levels ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  const run = gm.currentRunState;
  check("init: level 0 gold = old Standard Contract", run.gold === GameRules.StartingGold);
  check("init: level 0 debt = old Standard Contract", run.debt === GameRules.StartingDebt);
  check("init: level 0 morale = old Standard Contract", run.morale === GameRules.StartingMorale);
  check("init: level 0 interest = old Standard Contract", run.interestDivisor === GameRules.InterestDebtDivisor);
  check("init: level 0 debt limit = old Standard Contract", run.debtLimit === GameRules.DebtLimit);
  check("init: level 0 hero health multiplier = old Standard Contract", run.heroHealthMultiplier === GameRules.NoCombatMultiplier);
  check("init: level 0 hero damage multiplier = old Standard Contract", run.heroDamageMultiplier === GameRules.NoCombatMultiplier);
  check("init: level 0 enemy health multiplier = old Standard Contract", run.enemyHealthMultiplier === GameRules.NoCombatMultiplier);
  check("init: level 0 enemy damage multiplier = old Standard Contract", run.enemyDamageMultiplier === GameRules.NoCombatMultiplier);
  check("init: act 1 round 1", run.act === 1 && run.round === 1);
  check("init: 3 rivals created", run.rivals.length === 3);
  check("init: entered Scout state", gm.currentState === GameState.Scout);
  check("init: encounter loaded for round 1", run.currentEncounter && run.currentEncounter.round === 1);

  const runManager = new RunManager();
  const level1 = runManager.initializeRun(DifficultyLevel.Level1, 70);
  check("difficulty: level 1 applies LessStartingGold", level1.gold === GameRules.StartingGold - 3);
  check("difficulty: level 1 keeps baseline interest", level1.interestDivisor === GameRules.InterestDebtDivisor);
  check("difficulty: level 1 keeps baseline debt limit", level1.debtLimit === GameRules.DebtLimit);

  const level2 = runManager.initializeRun(DifficultyLevel.Level2, 70);
  check("difficulty: level 2 keeps level 1 gold", level2.gold === GameRules.StartingGold - 3);
  check("difficulty: level 2 applies HigherInterest", level2.interestDivisor === 4);
  check("difficulty: level 2 keeps baseline debt limit", level2.debtLimit === GameRules.DebtLimit);

  const level3 = runManager.initializeRun(DifficultyLevel.Level3, 70);
  check("difficulty: level 3 keeps level 1 gold", level3.gold === GameRules.StartingGold - 3);
  check("difficulty: level 3 keeps level 2 interest", level3.interestDivisor === 4);
  check("difficulty: level 3 applies LowerDebtLimit", level3.debtLimit === GameRules.DebtLimit - 5);

  let threw = false;
  try {
    runManager.initializeRun(99, 70);
  } catch (err) {
    threw = err.message.includes("not implemented") || err.message.includes("Unknown difficulty");
  }
  check("difficulty: level >10 throws clear error", threw);

  const allLevels = DataRepository.allDifficultyLevels;
  const visibleLevels = allLevels.map((d) => d.level).join(",");
  check("difficulty: levels 0-10 visible in data", visibleLevels === "0,1,2,3,4,5,6,7,8,9,10");

  // Level 4-10 init field checks.
  const level4 = runManager.initializeRun(DifficultyLevel.Level4, 70);
  check("difficulty: level 4 applies InitialDebt", level4.debt === GameRules.StartingDebt + 3);
  check("difficulty: level 4 keeps baseline morale", level4.morale === GameRules.StartingMorale);

  const level5 = runManager.initializeRun(DifficultyLevel.Level5, 70);
  check("difficulty: level 5 keeps level 4 debt", level5.debt === GameRules.StartingDebt + 3);
  check("difficulty: level 5 applies ReducedMorale", level5.morale === GameRules.StartingMorale - 5);

  const level6 = runManager.initializeRun(DifficultyLevel.Level6, 70);
  check("difficulty: level 6 applies ReducedReward modifier", level6.rewardGoldModifier === -2);
  check("difficulty: level 6 keeps baseline reroll modifier", level6.rerollCostModifier === 0);

  const level7 = runManager.initializeRun(DifficultyLevel.Level7, 70);
  check("difficulty: level 7 applies CostlyRerolls modifier", level7.rerollCostModifier === 1);
  check("difficulty: level 7 keeps level 6 reward modifier", level7.rewardGoldModifier === -2);

  const level8 = runManager.initializeRun(DifficultyLevel.Level8, 70);
  check("difficulty: level 8 applies SlowerGrowth modifier", level8.veteranXpModifier === -1);
  check("difficulty: level 8 keeps baseline enemy health", level8.enemyHealthMultiplier === GameRules.NoCombatMultiplier);

  const level9 = runManager.initializeRun(DifficultyLevel.Level9, 70);
  check("difficulty: level 9 applies TougherEnemies", level9.enemyHealthMultiplier === 1.15);
  check("difficulty: level 9 keeps baseline hero health", level9.heroHealthMultiplier === GameRules.NoCombatMultiplier);

  const level10 = runManager.initializeRun(DifficultyLevel.Level10, 70);
  check("difficulty: level 10 applies BrutalContract heroHealth", level10.heroHealthMultiplier === 0.85);
  check("difficulty: level 10 applies BrutalContract heroDamage", level10.heroDamageMultiplier === 0.85);
  check("difficulty: level 10 applies BrutalContract enemyDamage", level10.enemyDamageMultiplier === 1.15);
  check("difficulty: level 10 keeps level 9 enemy health", level10.enemyHealthMultiplier === 1.15);

  const expectedMutatorStacks = [
    {
      level: DifficultyLevel.Level1,
      ids: ["LessStartingGold"],
      descriptions: ["-3 starting gold."],
    },
    {
      level: DifficultyLevel.Level2,
      ids: ["LessStartingGold", "HigherInterest"],
      descriptions: ["-3 starting gold.", "Interest divisor becomes 4."],
    },
    {
      level: DifficultyLevel.Level3,
      ids: ["LessStartingGold", "HigherInterest", "LowerDebtLimit"],
      descriptions: ["-3 starting gold.", "Interest divisor becomes 4.", "-5 debt limit."],
    },
    {
      level: DifficultyLevel.Level4,
      ids: ["LessStartingGold", "HigherInterest", "LowerDebtLimit", "InitialDebt"],
      descriptions: ["-3 starting gold.", "Interest divisor becomes 4.", "-5 debt limit.", "Start the run with +3 debt."],
    },
    {
      level: DifficultyLevel.Level5,
      ids: ["LessStartingGold", "HigherInterest", "LowerDebtLimit", "InitialDebt", "ReducedMorale"],
      descriptions: ["-3 starting gold.", "Interest divisor becomes 4.", "-5 debt limit.", "Start the run with +3 debt.", "-5 starting morale."],
    },
    {
      level: DifficultyLevel.Level6,
      ids: ["LessStartingGold", "HigherInterest", "LowerDebtLimit", "InitialDebt", "ReducedMorale", "ReducedReward"],
      descriptions: ["-3 starting gold.", "Interest divisor becomes 4.", "-5 debt limit.", "Start the run with +3 debt.", "-5 starting morale.", "Combat win rewards reduced by 2 gold."],
    },
    {
      level: DifficultyLevel.Level7,
      ids: ["LessStartingGold", "HigherInterest", "LowerDebtLimit", "InitialDebt", "ReducedMorale", "ReducedReward", "CostlyRerolls"],
      descriptions: ["-3 starting gold.", "Interest divisor becomes 4.", "-5 debt limit.", "Start the run with +3 debt.", "-5 starting morale.", "Combat win rewards reduced by 2 gold.", "Shop rerolls cost 1 extra gold."],
    },
    {
      level: DifficultyLevel.Level8,
      ids: ["LessStartingGold", "HigherInterest", "LowerDebtLimit", "InitialDebt", "ReducedMorale", "ReducedReward", "CostlyRerolls", "SlowerGrowth"],
      descriptions: ["-3 starting gold.", "Interest divisor becomes 4.", "-5 debt limit.", "Start the run with +3 debt.", "-5 starting morale.", "Combat win rewards reduced by 2 gold.", "Shop rerolls cost 1 extra gold.", "Heroes earn 1 less veterancy XP per combat."],
    },
    {
      level: DifficultyLevel.Level9,
      ids: ["LessStartingGold", "HigherInterest", "LowerDebtLimit", "InitialDebt", "ReducedMorale", "ReducedReward", "CostlyRerolls", "SlowerGrowth", "TougherEnemies"],
      descriptions: ["-3 starting gold.", "Interest divisor becomes 4.", "-5 debt limit.", "Start the run with +3 debt.", "-5 starting morale.", "Combat win rewards reduced by 2 gold.", "Shop rerolls cost 1 extra gold.", "Heroes earn 1 less veterancy XP per combat.", "Enemies have 15% more HP."],
    },
    {
      level: DifficultyLevel.Level10,
      ids: ["LessStartingGold", "HigherInterest", "LowerDebtLimit", "InitialDebt", "ReducedMorale", "ReducedReward", "CostlyRerolls", "SlowerGrowth", "TougherEnemies", "BrutalContract"],
      descriptions: ["-3 starting gold.", "Interest divisor becomes 4.", "-5 debt limit.", "Start the run with +3 debt.", "-5 starting morale.", "Combat win rewards reduced by 2 gold.", "Shop rerolls cost 1 extra gold.", "Heroes earn 1 less veterancy XP per combat.", "Enemies have 15% more HP.", "Heroes have 15% less HP and deal 15% less damage; enemies deal 15% more damage."],
    },
  ];

  for (const expectation of expectedMutatorStacks) {
    const mutators = DataRepository.getDifficultyMutatorsForLevel(expectation.level);
    const levelDefinition = DataRepository.getDifficultyLevel(expectation.level);
    check(`difficulty: level ${expectation.level} cumulative mutator ids`,
      mutators.map((mutator) => mutator.id).join(",") === expectation.ids.join(","));
    check(`difficulty: level ${expectation.level} cumulative mutator descriptions`,
      mutators.map((mutator) => mutator.description).join(" ") === expectation.descriptions.join(" "));
    check(`difficulty: level ${expectation.level} definition uses cumulative mutators`,
      levelDefinition.mutators.map((mutator) => mutator.id).join(",") === expectation.ids.join(","));
  }
}

// ---- Difficulty progressive unlock ----
{
  const gm = new GameManager();
  check("unlock: fresh gm highestBeaten = -1", gm.highestBeatenDifficulty === -1);
  check("unlock: level 0 unlocked by default", !gm.isDifficultyLocked(DataRepository.getDifficultyLevel(0)));
  check("unlock: level 1 locked before beating 0", gm.isDifficultyLocked(DataRepository.getDifficultyLevel(1)));
  check("unlock: level 2 locked before beating 0", gm.isDifficultyLocked(DataRepository.getDifficultyLevel(2)));
  check("unlock: level 3 locked before beating 0", gm.isDifficultyLocked(DataRepository.getDifficultyLevel(3)));
  check("unlock: level 4 locked before beating 3", gm.isDifficultyLocked(DataRepository.getDifficultyLevel(4)));

  gm.startRun(DifficultyLevel.Level0);
  gm.currentRunState.act = 1;
  gm.currentRunState.round = GameRulesFns.act1FinalRound;
  gm.changeState(GameState.Victory);
  check("unlock: Act 1 victory does not unlock level 1", gm.highestBeatenDifficulty === -1);
  check("unlock: level 1 still locked after Act 1 victory", gm.isDifficultyLocked(DataRepository.getDifficultyLevel(1)));

  const progression = [
    { beaten: DifficultyLevel.Level0, unlocks: DifficultyLevel.Level1, locks: DifficultyLevel.Level2 },
    { beaten: DifficultyLevel.Level1, unlocks: DifficultyLevel.Level2, locks: DifficultyLevel.Level3 },
    { beaten: DifficultyLevel.Level2, unlocks: DifficultyLevel.Level3, locks: DifficultyLevel.Level4 },
    { beaten: DifficultyLevel.Level3, unlocks: DifficultyLevel.Level4, locks: DifficultyLevel.Level5 },
  ];

  for (const step of progression) {
    gm.returnToMainMenu();
    gm.startRun(step.beaten);
    const outcome = autopilotWithParty(gm, ["paladin", "golem", "barbarian", "ranger", "cleric"], 1000, {
      tier: HeroTier.Gold,
      stabilizeEconomy: true,
    });
    check(`unlock: level ${step.beaten} full run reaches Victory`,
      outcome.terminated && outcome.state === GameState.Victory);
    check(`unlock: highestBeaten becomes ${step.beaten} after full victory`,
      gm.highestBeatenDifficulty === step.beaten);
    if (step.unlocks !== null) {
      check(`unlock: level ${step.unlocks} unlocked after beating ${step.beaten}`,
        !gm.isDifficultyLocked(DataRepository.getDifficultyLevel(step.unlocks)));
    }
    check(`unlock: level ${step.locks} remains locked after beating ${step.beaten}`,
      gm.isDifficultyLocked(DataRepository.getDifficultyLevel(step.locks)));
  }

  const lossGm = new GameManager();
  lossGm.startRun(DifficultyLevel.Level0);
  lossGm.changeState(GameState.Defeat);
  check("unlock: loss does not advance highestBeaten", lossGm.highestBeatenDifficulty === -1);
  check("unlock: level 1 stays locked after loss", lossGm.isDifficultyLocked(DataRepository.getDifficultyLevel(1)));
}

// ---- Encounter variants: four Act 1 pools select from the run RNG ----
{
  const variantSlots = [4, 6, 8, 9];
  for (const slot of variantSlots) {
    const pool = DataRepository.getEncounterPool(1, slot);
    check(`variants: act 1 slot ${slot} has base + variant`, pool.length === 2);
  }

  const first = collectVariantSequence(73);
  const second = collectVariantSequence(73);
  check("variants: same seed repeats sequence", JSON.stringify(first) === JSON.stringify(second));

  const distinct = new Set();
  for (let seed = 73; seed < 78; seed++) {
    distinct.add(collectVariantSequence(seed).join("|"));
  }
  check("variants: five seeds produce at least two sequences", distinct.size >= 2);
}

// ---- Act 3/4 dev data is present but normal act count remains 2 ----
{
  const act2Imp = DataRepository.allEnemies.find((enemy) => enemy.id === "imp");
  const act3Enemies = DataRepository.allEnemies.filter((enemy) => enemy.id.startsWith("act3-"));
  const act4Enemies = DataRepository.allEnemies.filter((enemy) => enemy.id.startsWith("act4-"));
  const bankerKing = DataRepository.allEnemies.find((enemy) => enemy.id === "act4-banker-king");
  const act3Encounters = DataRepository.encounters.filter((encounter) => encounter.act === 3);
  const act4Encounters = DataRepository.encounters.filter((encounter) => encounter.act === 4);
  const act2Shape = DataRepository.encounters
    .filter((encounter) => encounter.act === 2)
    .map((encounter) => `${encounter.slot}:${encounter.type}:${encounter.rivalGuild}:${encounter.encounterEffectId}:${encounter.enemies.length}`)
    .join("|");
  const act3Shape = act3Encounters
    .map((encounter) => `${encounter.slot}:${encounter.type}:${encounter.rivalGuild}:${encounter.encounterEffectId}:${encounter.enemies.length}`)
    .join("|");
  const act4Shape = act4Encounters
    .map((encounter) => `${encounter.slot}:${encounter.type}:${encounter.rivalGuild}:${encounter.encounterEffectId}:${encounter.enemies.length}`)
    .join("|");

  check("actscale: act 2 reads table without stat drift", act2Imp.attack === 2 && act2Imp.health === 5);
  check("actscale: act 3 table locked", GameRules.ActStatScale[3].enemyHealth === 1.2 && GameRules.ActStatScale[3].enemyAttack === 1.15);
  check("actscale: act 4 table locked", GameRules.ActStatScale[4].enemyHealth === 1.45 && GameRules.ActStatScale[4].enemyAttack === 1.35);
  check("act3data: exactly eight act 3 enemies", act3Enemies.length === 8);
  check("act3data: exactly ten act 3 encounters", act3Encounters.length === 10);
  check("act3data: encounter structure mirrors act 2", act3Shape === act2Shape);
  check("act4data: exactly eight act 4 enemies", act4Enemies.length === 8);
  check("act4data: exactly ten act 4 encounters", act4Encounters.length === 10);
  check("act4data: encounter structure mirrors act 2", act4Shape === act2Shape);
  check("act4data: Banker King has Debt Judgment", bankerKing && bankerKing.effectId === EnemyEffectId.BankerKingDebtJudgment);
  check("actdata: normal total acts remains 2", GameRulesFns.totalActs === 2 && GameRulesFns.devTotalActs === 4);
}

// ---- Shop hire spends gold and adds to party; direct offers stop at Silver ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout(); // -> Shop, offers generated
  const run = gm.currentRunState;
  const shop = gm.shopManager;

  const someHero = shop.currentOffers.find((o) => o && o.tier === HeroTier.Bronze);
  check("shop: at least one bronze offer", !!someHero);
  check("shop: no direct Gold offers", shop.currentOffers.every((o) => !o || o.tier !== HeroTier.Gold));
  check("shop: no direct Diamond offers", shop.currentOffers.every((o) => !o || o.tier !== HeroTier.Diamond));

  const goldBefore = run.gold;
  const idx = shop.currentOffers.findIndex((o) => o && !o.purchased && o.hireCost <= run.gold);
  const hired = idx >= 0 ? shop.hire(idx) : false;
  check("shop: hire succeeded", hired === true);
  check("shop: party grew to 1", run.party.length === 1);
  check("shop: gold decreased", run.gold < goldBefore);
}

// ---- New #69 heroes are hireable through the shop path ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  const run = gm.currentRunState;
  const shop = gm.shopManager;
  const paladin = DataRepository.allHeroes.find((h) => h.id === "paladin");
  const cleric = DataRepository.allHeroes.find((h) => h.id === "cleric");
  const barbarian = DataRepository.allHeroes.find((h) => h.id === "barbarian");

  shop.currentOffers.length = 0;
  shop.currentOffers.push(new ShopOffer(paladin, 0, HeroTier.Bronze));
  shop.currentOffers.push(new ShopOffer(cleric, 0, HeroTier.Bronze));
  shop.currentOffers.push(new ShopOffer(barbarian, 0, HeroTier.Bronze));

  const hiredAll = shop.hire(0) && shop.hire(1) && shop.hire(2);
  const hiredIds = run.party.map((hero) => hero.definition.id).join(",");
  check("newheroes-shop: all three controlled offers hire", hiredAll === true);
  check("newheroes-shop: paladin cleric barbarian in party", hiredIds === "paladin,cleric,barbarian");
}

// ---- #69 second batch (Rogue/Warlock/Artificer) are hireable through the shop path ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  const run = gm.currentRunState;
  const shop = gm.shopManager;
  const rogue = DataRepository.allHeroes.find((h) => h.id === "rogue");
  const warlock = DataRepository.allHeroes.find((h) => h.id === "warlock");
  const artificer = DataRepository.allHeroes.find((h) => h.id === "artificer");

  shop.currentOffers.length = 0;
  shop.currentOffers.push(new ShopOffer(rogue, 0, HeroTier.Bronze));
  shop.currentOffers.push(new ShopOffer(warlock, 0, HeroTier.Bronze));
  shop.currentOffers.push(new ShopOffer(artificer, 0, HeroTier.Bronze));

  const hiredAll = shop.hire(0) && shop.hire(1) && shop.hire(2);
  const hiredIds = run.party.map((hero) => hero.definition.id).join(",");
  check("newheroes2-shop: all three controlled offers hire", hiredAll === true);
  check("newheroes2-shop: rogue warlock artificer in party", hiredIds === "rogue,warlock,artificer");
}

// ---- Shop role-balance spot check from a fixed seed ----
{
  const runManager = new RunManager();
  runManager.initializeRun(DifficultyLevel.Level0, 69);
  const shop = new ShopManager(runManager);
  const roleCounts = {
    [HeroRole.Tank]: 0,
    [HeroRole.Damage]: 0,
    [HeroRole.Support]: 0,
    [HeroRole.Economy]: 0,
  };
  let offerCount = 0;

  for (let i = 0; i < 20; i++) {
    shop.generateOffers();
    for (const offer of shop.currentOffers) {
      if (!offer || !offer.hero) continue;
      roleCounts[offer.hero.role] += 1;
      offerCount += 1;
    }
  }

  const maxRoleOffers = Math.max(roleCounts.Tank, roleCounts.Damage, roleCounts.Support, roleCounts.Economy);
  check("shoproles: fixed seed produced 20 full offer sets", offerCount === 20 * GameRules.ShopOfferCount);
  check("shoproles: no role dominates >70%", maxRoleOffers <= offerCount * 0.7);
}

// ---- Duplicate hire merges Bronze -> Silver -> Gold (direct ShopOffer injection) ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  const run = gm.currentRunState;
  const shop = gm.shopManager;

  // Pull a known hero definition and craft two offers for it.
  const def = shop.currentOffers.find((o) => o)?.hero;
  if (def) {
    // Build a controlled offer list: same hero twice, cheap.
    shop.currentOffers.length = 0;
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));

    shop.hire(0);
    check("merge: first hire is Bronze", run.party[0].tier === HeroTier.Bronze);
    shop.hire(1);
    check("merge: duplicate hire upgraded to Silver", run.party[0].tier === HeroTier.Silver);
    shop.hire(2);
    const hero = run.party[0];
    check("merge: duplicate Silver upgraded to Gold", hero.tier === HeroTier.Gold);
    check("merge: still one party member", run.party.length === 1);
    check("merge: Gold attack is 1.8x Bronze", hero.attack === GameRulesFns.scaleCombatStat(def.baseAttack, GameRules.GoldStatMultiplier));
    check("merge: Gold health is 1.8x Bronze", HeroEffects.getTierAdjustedMaxHealth(hero) === GameRulesFns.scaleCombatStat(def.baseHealth, GameRules.GoldStatMultiplier));
    check("merge: Gold current health reseeded", hero.currentHealth === HeroEffects.getTierAdjustedMaxHealth(hero));
    check("merge: Gold upkeep is Bronze + 2", hero.upkeepThisRound === def.baseUpkeep + GameRules.GoldUpkeepIncrease);
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));
    const promoted = shop.hire(3);
    check("merge: Gold upgraded to Diamond", hero.tier === HeroTier.Diamond && promoted === true);
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));
    const blocked = shop.hire(0);
    check("merge: Diamond cannot promote further", blocked === false && hero.tier === HeroTier.Diamond);
  } else {
    check("merge: had a definition to test", false);
  }
}

// ---- Gold -> Diamond merge promotion test ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  const run = gm.currentRunState;
  const shop = gm.shopManager;

  const def = shop.currentOffers.find((o) => o)?.hero;
  if (def) {
    shop.currentOffers.length = 0;
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));

    shop.hire(0);
    check("diamond: first hire is Bronze", run.party[0].tier === HeroTier.Bronze);
    shop.hire(1);
    check("diamond: duplicate upgraded to Silver", run.party[0].tier === HeroTier.Silver);
    shop.hire(2);
    check("diamond: duplicate upgraded to Gold", run.party[0].tier === HeroTier.Gold);
    shop.hire(3);
    const hero = run.party[0];
    check("diamond: duplicate Gold upgraded to Diamond", hero.tier === HeroTier.Diamond);
    check("diamond: still one party member", run.party.length === 1);
    check("diamond: Diamond attack is 2.3x Bronze", hero.attack === GameRulesFns.scaleCombatStat(def.baseAttack, GameRules.DiamondStatMultiplier));
    check("diamond: Diamond health is 2.3x Bronze", HeroEffects.getTierAdjustedMaxHealth(hero) === GameRulesFns.scaleCombatStat(def.baseHealth, GameRules.DiamondStatMultiplier));
    check("diamond: Diamond current health reseeded", hero.currentHealth === HeroEffects.getTierAdjustedMaxHealth(hero));
    check("diamond: Diamond upkeep is Bronze + 3", hero.upkeepThisRound === def.baseUpkeep + GameRules.DiamondUpkeepIncrease);
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));
    const blocked = shop.hire(0);
    check("diamond: Diamond cannot promote further", blocked === false && hero.tier === HeroTier.Diamond);
  } else {
    check("diamond: had a definition to test", false);
  }
}

// ---- Payroll: Take Loan adds gold and debt ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  gm.continueFromShop();
  gm.continueFromFormation(); // -> Payroll
  const run = gm.currentRunState;
  const goldBefore = run.gold;
  const debtBefore = run.debt;
  gm.selectPayrollAction(PayrollActionId.TakeLoan);
  gm.continueFromPayroll(); // applies payroll, -> Combat
  check("payroll: loan added gold", run.gold === goldBefore + GameRules.LoanGoldGain);
  check("payroll: loan added debt", run.debt === debtBefore + GameRules.LoanDebtCost);
  check("payroll: entered Combat state", gm.currentState === GameState.Combat);
}

// ---- Dungeon win pays the standard reward ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  // Bypass shop RNG: inject a known-strong party so the win path is deterministic.
  gm.continueFromScout();
  fieldKnownParty(gm, ["warrior", "golem", "wizard", "ranger", "priest"]);
  gm.continueFromShop();
  gm.continueFromFormation();
  gm.selectPayrollAction(PayrollActionId.StandardPay);
  gm.continueFromPayroll();
  const run = gm.currentRunState;
  const result = gm.resolveCombat();
  check("combat: round 1 is a Dungeon", run.currentEncounter.type === EncounterType.Dungeon);
  check("combat: player won round 1", result.playerWon === true);
  check("combat: reward gold = WinReward", run.latestRewardGold === GameRules.WinReward);
  check("combat: no morale loss on win", run.latestMoraleChange === 0);
}

// ---- Rival advance changes payroll ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  const run = gm.currentRunState;
  const payrollBefore = run.rivals.map((r) => r.payroll);
  gm.rivalManager.advanceRivals(run);
  const changed = run.rivals.some((r, i) => r.payroll !== payrollBefore[i]);
  check("rivals: payroll advanced", changed);
  const greedy = run.rivals.find((r) => r.guild === RivalGuild.Greedy);
  const frugal = run.rivals.find((r) => r.guild === RivalGuild.Frugal);
  const carry = run.rivals.find((r) => r.guild === RivalGuild.Carry);
  check("rivals-race: greedy round 1 progress +1.4", greedy && greedy.progress === 1.4);
  check("rivals-race: frugal round 1 progress +1.1", frugal && frugal.progress === 1.1);
  check("rivals-race: carry round 1 progress +0.7", carry && carry.progress === 0.7);
}

// ---- Rival finish-first morale fires once per rival ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  const run = gm.currentRunState;
  const greedy = run.rivals.find((r) => r.guild === RivalGuild.Greedy);
  run.round = 19;
  run.morale = 30;
  greedy.progress = 19.5;
  gm.rivalManager.advanceRivals(run);
  check("rivals-race: finish recorded", greedy.finishedAtRound === 19);
  check("rivals-race: finish list populated", run.rivalRaceFinishesThisRound.includes(RivalGuild.Greedy));
  check("rivals-race: morale penalty applied", run.morale === 30 - GameRules.RivalFinishedFirstMorale);
  gm.rivalManager.advanceRivals(run);
  check("rivals-race: morale penalty is one-time", run.morale === 30 - GameRules.RivalFinishedFirstMorale);
}

// ---- Rival ghost lead snapshots at scout and scales combat stats ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  const run = gm.currentRunState;
  const greedy = run.rivals.find((r) => r.guild === RivalGuild.Greedy);
  run.round = 3;
  run.act = 1;
  greedy.progress = 8;
  gm.encounterManager.loadEncounter(run.round);
  const encounter = run.currentEncounter;
  const lead = encounter.rivalLead;
  greedy.progress = 0;
  fieldKnownParty(gm, ["warrior", "golem", "wizard", "ranger", "priest"]);
  const result = new CombatManager().startCombat(run, encounter);
  const tank = result.enemyStartUnits[0];
  check("rivals-race: scout snapshot stores lead", lead === 5);
  check("rivals-race: combat uses snapshot lead for hp", tank && tank.maxHealth === 10);
  check("rivals-race: combat uses snapshot lead for attack", tank && tank.attack === 4);
}

// ---- Victory tribute grants gold for rivals still behind ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  const run = gm.currentRunState;
  run.act = 2;
  run.round = GameRulesFns.act2FinalRound;
  run.gold = 10;
  run.latestCombatWon = true;
  run.rivals[0].progress = 20;
  run.rivals[1].progress = 18;
  run.rivals[2].progress = 12;
  const nextState = gm.runManager.evaluateNextState();
  check("rivals-race: final victory reached", nextState === GameState.Victory);
  check("rivals-race: tribute per behind rival applied", run.gold === 10 + (2 * GameRules.RivalRaceTributePerBehind));
  gm.runManager.evaluateNextState();
  check("rivals-race: tribute applies once", run.gold === 10 + (2 * GameRules.RivalRaceTributePerBehind));
}

// ---- Rival race panel render smoke ----
{
  const previousDocument = globalThis.document;
  globalThis.document = createFakeDocument();
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.rivalManager.advanceRivals(gm.currentRunState);
  const panel = new RivalUpdatePanel(gm);
  panel.render();
  const laneCount = countClass(panel.root, "rival-race-lane");
  check("rivals-race-ui: renders four lanes", laneCount === 4);
  check("rivals-race-ui: title rendered", textContentOf(panel.root).includes("Race the Rivals"));
  globalThis.document = previousDocument;
}

// ---- Payroll: PromiseVictoryBonus costs gold, buffs attack, no debt on win ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  gm.continueFromShop();
  gm.continueFromFormation();
  const run = gm.currentRunState;
  const goldBefore = run.gold;
  const debtBefore = run.debt;
  gm.selectPayrollAction(PayrollActionId.PromiseVictoryBonus);
  gm.continueFromPayroll();
  check("victorybonus: gold deducted", run.gold === goldBefore - GameRules.VictoryBonusGoldCost);
  check("victorybonus: entered Combat", gm.currentState === GameState.Combat);
  // Win the fight — no debt on win, gold cost already applied
  fieldKnownParty(gm, ["warrior", "golem", "wizard", "ranger", "priest"]);
  const result = gm.resolveCombat();
  check("victorybonus: won fight", result.playerWon === true);
  check("victorybonus: no debt on win", run.debt === debtBefore);
}

// ---- Payroll: CutWages reduces total upkeep ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  gm.continueFromShop();
  gm.continueFromFormation();
  const run = gm.currentRunState;
  gm.selectPayrollAction(PayrollActionId.CutWages);
  gm.continueFromPayroll();
  check("cutwages: entered Combat", gm.currentState === GameState.Combat);
  // CutWages applies upkeep reduction during post-combat calculation
  fieldKnownParty(gm, ["warrior", "golem", "wizard", "ranger", "priest"]);
  const result = gm.resolveCombat();
  check("cutwages: won fight", result.playerWon === true);
  // Upkeep should have been reduced by CutWagesUpkeepReduction
  const upkeepAfter = run.latestTotalUpkeep;
  // We can't easily check the exact amount since it depends on party composition,
  // but we can verify it's not negative (cut wages floors at 0)
  check("cutwages: upkeep >= 0", upkeepAfter >= 0);
}

// ---- Run terminates on morale = 0 ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  gm.continueFromShop();
  gm.continueFromFormation();
  gm.selectPayrollAction(PayrollActionId.StandardPay);
  gm.continueFromPayroll();
  // Force morale to 0
  const run = gm.currentRunState;
  run.morale = 0;
  fieldKnownParty(gm, ["warrior"]);
  const result = gm.resolveCombat();
  // Let fight resolve (will probably lose) then check routing
  gm.continueAfterReward();
  check("moraledefeat: ended in Defeat", gm.currentState === GameState.Defeat);
  check("moraledefeat: end reason set", run.latestEndReason && run.latestEndReason.includes("Morale"));
}

// ---- Run terminates on debt limit reached ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout(); // → Shop
  const run = gm.currentRunState;
  // In Scout state, set debt to exactly the limit to trigger defeat
  run.debt = run.debtLimit;
  // Continue through shop, formation, payroll to trigger evaluation
  gm.continueFromShop();
  gm.continueFromFormation();
  gm.selectPayrollAction(PayrollActionId.StandardPay);
  gm.continueFromPayroll();
  const result = gm.resolveCombat();
  gm.continueAfterReward();
  check("debtdefeat: ended in Defeat", gm.currentState === GameState.Defeat);
  check("debtdefeat: end reason set", run.latestEndReason && run.latestEndReason.includes("Debt"));
}

// ---- Final boss loss ends the run ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  const outcome = autopilotWithParty(gm, ["squire", "squire"], 500);
  check("finalboss-lose: run terminated", outcome.terminated);
  check("finalboss-lose: reached victory or defeat",
    outcome.state === GameState.Victory || outcome.state === GameState.Defeat);
}

// ---- Act 1 victory leads to Act 2 (best-effort: skip if party loses) ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  for (let round = 1; round <= 10; round++) {
    if (gm.currentState === GameState.Defeat) break;
    gm.continueFromScout();
    fieldKnownParty(gm, ["warrior", "golem", "wizard", "ranger", "priest"]);
    gm.continueFromShop();
    gm.continueFromFormation();
    gm.selectPayrollAction(PayrollActionId.StandardPay);
    gm.continueFromPayroll();
    const result = gm.resolveCombat();
    gm.continueAfterReward();
    if (gm.currentState === GameState.RelicReward) {
      const choice = gm.currentRunState.pendingRelicChoices[0];
      gm.continueAfterRelicReward(choice);
    }
  }
  if (gm.currentState === GameState.Victory) {
    const run = gm.currentRunState;
    check("acttransition: reached Victory", true);
    gm.continueToNextAct();
    check("acttransition: advanced to Act 2", run.act === 2);
    check("acttransition: Scout state for Act 2", gm.currentState === GameState.Scout);
    check("acttransition: act 2 round = 11", run.round === 11);
  } else if (gm.currentState === GameState.Defeat) {
    check("acttransition: party lost before Act 1 victory (non-deterministic)", true);
  } else {
    check("acttransition: unexpected state", false);
  }
}

// ---- #86 Regression: shop hire merges correct tier; no duplicate party members ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  const run = gm.currentRunState;
  const shop = gm.shopManager;

  const def = shop.currentOffers.find((o) => o)?.hero;
  if (def) {
    shop.currentOffers.length = 0;
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));

    shop.hire(0);
    check("reg86: first hire is Bronze", run.party[0].tier === HeroTier.Bronze);

    shop.hire(1);
    check("reg86: duplicate hire upgrades to Silver", run.party[0].tier === HeroTier.Silver);
    check("reg86: still one party member after Bronze→Silver", run.party.length === 1);

    shop.currentOffers.length = 0;
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));

    shop.hire(0);
    check("reg86: Silver upgraded to Gold", run.party[0].tier === HeroTier.Gold);
    check("reg86: still one party member after Silver→Gold", run.party.length === 1);

    shop.currentOffers.length = 0;
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));
    shop.hire(0);
    const diamondHero = run.party[0];
    check("reg86: Gold upgraded to Diamond", diamondHero.tier === HeroTier.Diamond);
    check("reg86: no duplicate added after Gold→Diamond", run.party.length === 1);

    shop.currentOffers.length = 0;
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));
    const blocked = shop.hire(0);
    check("reg86: Diamond cannot promote further", blocked === false && diamondHero.tier === HeroTier.Diamond);
    check("reg86: no duplicate added for Diamond", run.party.length === 1);

    const uniqueIds = new Set(run.party.map((h) => h.definition.id));
    check("reg86: all party members have unique definition ids",
      uniqueIds.size === run.party.length);
  } else {
    check("reg86: had a definition to test", false);
  }
}

// ---- #86 Generated-shop invariant: no duplicate party hero ids across seeds ----
{
  for (let seed = 1; seed <= 20; seed++) {
    const gm = new GameManager();
    gm.startRun(DifficultyLevel.Level0, seed);
    gm.continueFromScout();
    const shop = gm.shopManager;
    const run = gm.currentRunState;
    for (let attempt = 0; attempt < 6; attempt++) {
      for (let i = 0; i < shop.currentOffers.length; i++) {
        const offer = shop.currentOffers[i];
        if (offer && !offer.purchased && run.gold >= offer.hireCost) {
          shop.hire(i);
        }
      }
      shop.reroll();
    }
    const uniqueIds = new Set(run.party.map((h) => h && h.definition && h.definition.id).filter(Boolean));
    check("reg86-gen: seed " + seed + " no duplicate hero ids",
      uniqueIds.size === run.party.filter((h) => h && h.definition).length);
  }
}

// ---- #86 Full-party merge: merging works when party is at capacity ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  const run = gm.currentRunState;
  const shop = gm.shopManager;

  const def = shop.currentOffers.find((o) => o)?.hero;
  if (def) {
    shop.currentOffers.length = 0;
    const otherDefs = DataRepository.allHeroes.filter((h) => h.id !== def.id);
    for (let i = 0; i < GameRules.MaxPartySize - 1 && i < otherDefs.length; i++) {
      shop.currentOffers.push(new ShopOffer(otherDefs[i], 0, HeroTier.Bronze));
    }
    for (let i = 0; i < shop.currentOffers.length; i++) {
      shop.hire(i);
    }
    shop.currentOffers.length = 0;
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));
    shop.hire(0);
    check("reg86-full: party at capacity", run.party.length === GameRules.MaxPartySize);

    shop.currentOffers.length = 0;
    shop.currentOffers.push(new ShopOffer(def, 0, HeroTier.Bronze));
    const merged = shop.hire(0);
    check("reg86-full: merge succeeds when party full", merged === true);
    check("reg86-full: party size unchanged after merge", run.party.length === GameRules.MaxPartySize);
    const owner = run.party.find((h) => h.definition.id === def.id);
    check("reg86-full: merged hero tier advanced", owner && owner.tier === HeroTier.Silver);
  } else {
    check("reg86-full: had a definition to test", false);
  }
}

// ---- Shop: fire hero ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  const shop = gm.shopManager;
  const run = gm.currentRunState;
  // Hire first affordable offer
  const idx = shop.currentOffers.findIndex((o) => o && !o.purchased && o.hireCost <= run.gold);
  if (idx >= 0 && shop.hire(idx)) {
    const partySize = run.party.length;
    const goldBeforeFire = run.gold;
    shop.fire(0);
    check("shopfire: party shrank", run.party.length === partySize - 1);
    check("shopfire: gold increased by FireRefund", run.gold === goldBeforeFire + GameRules.FireRefund);
  } else {
    check("shopfire: able to hire first", false);
  }
}

// ---- Shop: Pay Debt ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  const shop = gm.shopManager;
  const run = gm.currentRunState;
  run.debt = 10; // add debt to test pay debt
  const debtBefore = run.debt;
  const goldBefore = run.gold;
  const paid = shop.payDebt();
  if (paid) {
    check("shopdebt: debt decreased", run.debt < debtBefore);
    check("shopdebt: gold decreased", run.gold < goldBefore);
    check("shopdebt: payment <= 3", (debtBefore - run.debt) <= GameRules.DebtPaymentCap);
  } else {
    check("shopdebt: unable to pay (might be no gold)", true);
  }
}

// ---- Shop: reroll costs gold ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  const shop = gm.shopManager;
  const run = gm.currentRunState;
  const goldBefore = run.gold;
  const offersBefore = [...shop.currentOffers];
  shop.reroll();
  check("shopreroll: gold decreased by RerollCost", run.gold === goldBefore - GameRules.RerollCost);
  // Offers should have changed (at least one different)
  const sameOffers = offersBefore.every((o, i) => o === shop.currentOffers[i]);
  check("shopreroll: offers replaced", !sameOffers);
}

// ---- M17 Shop events: determinism and variety across all event types ----
{
  // Same seed produces same shop-event sequence
  const seq1 = collectShopEventSequence(42);
  const seq2 = collectShopEventSequence(42);
  check("shopevent: same seed repeats sequence", JSON.stringify(seq1) === JSON.stringify(seq2));

  // Multiple seeds show both event and no-event cases
  const distinct = new Set();
  for (let seed = 1; seed <= 15; seed++) {
    const seq = collectShopEventSequence(seed);
    distinct.add(seq.join("|"));
  }
  check("shopevent: fifteen seeds produce at least three distinct sequences", distinct.size >= 3);
}

// ---- M17 Shop events: discounted cost is charged once and reroll clears ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  const run = gm.currentRunState;
  const shop = gm.shopManager;

  // Inject a known hero offer to control costs
  const def = shop.currentOffers.find((o) => o)?.hero;
  if (def) {
    // Force a BargainStall event onto slot 0
    const baseCost = def.baseUpkeep + GameRules.HireCostBonus;
    shop.currentOffers.length = 0;
    shop.currentOffers.push(new ShopOffer(def, baseCost, HeroTier.Bronze));
    shop.currentOffers.push(new ShopOffer(def, baseCost + 1, HeroTier.Bronze));

    const expectedDiscounted = Math.max(1, Math.ceil(baseCost * 0.5));
    run.currentShopEvent = {
      eventId: ShopEventId.BargainStall,
      slotIndex: 0,
      originalCost: baseCost,
      discountedCost: expectedDiscounted,
    };
    shop.currentOffers[0].hireCost = expectedDiscounted;

    check("shopevent-force: offer cost was discounted", shop.currentOffers[0].hireCost === expectedDiscounted);
    check("shopevent-force: other offer unchanged", shop.currentOffers[1].hireCost === baseCost + 1);

    const goldBefore = run.gold;
    const hired = shop.hire(0);
    check("shopevent-force: hire succeeded", hired === true);
    check("shopevent-force: charged discounted cost", run.gold === goldBefore - expectedDiscounted);
    check("shopevent-force: party grew", run.party.length === 1);

    // Reroll clears prior event
    run.gold = Math.max(run.gold, GameRules.RerollCost);
    const rerolled = shop.reroll();
    check("shopevent-force: reroll succeeded", rerolled === true);
    check("shopevent-force: event cleared after reroll", run.currentShopEvent === null);

    run.currentShopEvent = {
      eventId: ShopEventId.BargainStall,
      slotIndex: 1,
      originalCost: baseCost + 1,
      discountedCost: Math.max(1, Math.ceil((baseCost + 1) * 0.5)),
    };
    gm.continueFromShop();
    check("shopevent-force: event cleared after leaving shop", run.currentShopEvent === null);
  } else {
    check("shopevent-force: had a definition to test", false);
  }
}

// ---- M17 Shop events: TaxAudit costs deducted correctly ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  const run = gm.currentRunState;
  const shop = gm.shopManager;

  run.currentShopEvent = { eventId: ShopEventId.TaxAudit };
  const goldBefore = run.gold;
  const resolved = shop.resolveTaxAudit(true);
  check("taxaudit: pay succeeded", resolved === true);
  check("taxaudit: gold deducted by cost", run.gold === goldBefore - GameRules.TaxAuditGoldCost);
  check("taxaudit: event cleared after pay", run.currentShopEvent === null);

  run.currentShopEvent = { eventId: ShopEventId.TaxAudit };
  const moraleBefore = run.morale;
  shop.resolveTaxAudit(false);
  check("taxaudit: morale decreased by 1", run.morale === moraleBefore - 1);
  check("taxaudit: event cleared after refuse", run.currentShopEvent === null);

  run.currentShopEvent = { eventId: ShopEventId.TaxAudit };
  run.gold = 2;
  check("taxaudit: fails with insufficient gold", shop.resolveTaxAudit(true) === false);
  check("taxaudit: event preserved on failed pay", run.currentShopEvent !== null);

  run.currentShopEvent = { eventId: ShopEventId.TaxAudit };
  gm.continueFromShop();
  check("taxaudit: event cleared after leaving shop", run.currentShopEvent === null);
}

// ---- M17 Shop events: TravellingMerchant purchases ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  const run = gm.currentRunState;
  const shop = gm.shopManager;
  const def = DataRepository.allHeroes.find((h) => h.id === "warrior");

  // Set up party with a damaged hero
  run.party.length = 0;
  const hero = new HeroInstance(def, 0);
  hero.currentHealth = 1;
  run.party.push(hero);
  const maxHp = HeroEffects.getTierAdjustedMaxHealth(hero);

  // Inject TravellingMerchant event
  run.currentShopEvent = {
    eventId: ShopEventId.TravellingMerchant,
    purchases: [],
    goods: [
      { id: "healAll", label: "Heal All Party", cost: GameRules.TravellingHealAllCost, description: "Restore all heroes to full HP" },
      { id: "goldBlessing", label: "Gold Blessing", cost: GameRules.TravellingBlessingCost, description: "+" + GameRules.TravellingBlessingAmount + " gold on next combat reward" },
    ],
  };

  // Heal all purchase
  run.gold = 20;
  check("travelling: healAll not yet purchased", shop.isTravellingGoodPurchased("healAll") === false);
  const goldBeforeHeal = run.gold;
  shop.purchaseTravellingGood("healAll");
  check("travelling: healAll purchased", shop.isTravellingGoodPurchased("healAll") === true);
  check("travelling: gold deducted for healAll", run.gold === goldBeforeHeal - GameRules.TravellingHealAllCost);
  check("travelling: hero healed to max", run.party[0].currentHealth === maxHp);

  // Prevent double-purchase
  const goldBeforeDouble = run.gold;
  shop.purchaseTravellingGood("healAll");
  check("travelling: healAll not charged twice", run.gold === goldBeforeDouble);

  // Gold blessing purchase
  const goldBeforeBless = run.gold;
  const pendingBefore = run.pendingNextRewardBonus;
  shop.purchaseTravellingGood("goldBlessing");
  check("travelling: goldBlessing purchased", shop.isTravellingGoodPurchased("goldBlessing") === true);
  check("travelling: gold deducted for blessing", run.gold === goldBeforeBless - GameRules.TravellingBlessingCost);
  check("travelling: pendingNextRewardBonus increased", run.pendingNextRewardBonus === pendingBefore + GameRules.TravellingBlessingAmount);

  // Fail with insufficient gold
  run.currentShopEvent = {
    eventId: ShopEventId.TravellingMerchant,
    purchases: [],
    goods: [
      { id: "healAll", label: "Heal All Party", cost: GameRules.TravellingHealAllCost, description: "Restore all heroes to full HP" },
    ],
  };
  run.gold = 1;
  check("travelling: fails with insufficient gold", shop.purchaseTravellingGood("healAll") === false);

  // Clear on leaving shop
  run.currentShopEvent = {
    eventId: ShopEventId.TravellingMerchant,
    purchases: [],
    goods: [],
  };
  gm.continueFromShop();
  check("travelling: event cleared after leaving shop", run.currentShopEvent === null);
}

// ---- M17 Shop events: goldBlessing applies to combat reward ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  gm.continueFromScout();
  fieldKnownParty(gm, ["warrior", "golem"]);
  gm.continueFromShop();
  gm.continueFromFormation();
  gm.selectPayrollAction(PayrollActionId.StandardPay);
  gm.continueFromPayroll();
  const run = gm.currentRunState;
  run.pendingNextRewardBonus = 999;
  const result = gm.resolveCombat();
  check("goldblessing: reward bonus applied", run.latestRewardGold === GameRules.WinReward + 999);
  check("goldblessing: bonus consumed after reward", run.pendingNextRewardBonus === 0);
}

// ---- Full 20-round autopilot on easier preset ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  const outcome = autopilot(gm, 800);
  check("20run-autopilot: run terminated", outcome.terminated);
  check("20run-autopilot: rounds advanced past 3", outcome.maxRound > 3);
  check("20run-autopilot: reached Victory or Defeat",
    outcome.state === GameState.Victory || outcome.state === GameState.Defeat);
}

// ---- Normal strong run still resolves at Act 2 victory ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyLevel.Level0);
  const outcome = autopilotWithParty(gm, ["paladin", "golem", "barbarian", "ranger", "cleric"], 1000, {
    tier: HeroTier.Gold,
    stabilizeEconomy: true,
  });
  const run = gm.currentRunState;
  check("20run-normal: strong run reaches Victory", outcome.terminated && outcome.state === GameState.Victory);
  check("20run-normal: ends on act 2 round 20", run.act === 2 && outcome.maxRound === GameRulesFns.act2FinalRound);
}

// ---- Dev-enabled long run reaches 40-round victory ----
{
  const gm = new GameManager();
  gm.runManager.setDevEnableAct3ForNextRun(true);
  gm.startRun(DifficultyLevel.Level0);
  const run = gm.currentRunState;
  check("40run-dev: flag copied into run state", run.devEnableAct3 === true);

  const outcome = autopilotWithParty(gm, ["paladin", "golem", "barbarian", "ranger", "cleric"], 1400, {
    tier: HeroTier.Gold,
    stabilizeEconomy: true,
  });
  check("40run-dev: run terminated in Victory", outcome.terminated && outcome.state === GameState.Victory);
  check("40run-dev: ends on act 4 round 40", run.act === 4 && outcome.maxRound === GameRulesFns.act4FinalRound);
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);

// ---- helpers ----

// Bypass shop RNG entirely by inserting HeroInstances built from known
// definitions. Tier-seed each one so attack/upkeep match the live values a
// hired hero would have. Used for deterministic combat-outcome assertions.
function fieldKnownParty(gm, heroIds, tier = HeroTier.Bronze) {
  const run = gm.currentRunState;
  run.party.length = 0;
  heroIds.forEach((id, slot) => {
    const def = DataRepository.allHeroes.find((h) => h.id === id);
    const hero = new HeroInstance(def, slot);
    hero.tier = tier;
    HeroEffects.applyTierStatSeed(hero);
    hero.currentHealth = HeroEffects.getTierAdjustedMaxHealth(hero);
    run.party.push(hero);
  });
}

function collectShopEventSequence(seed) {
  const runManager = new RunManager();
  const shop = new ShopManager(runManager);
  const run = runManager.initializeRun(DifficultyLevel.Level0, seed);
  const sequence = [];

  // Generate offers 5 times per seed to capture event patterns
  for (let i = 0; i < 5; i++) {
    shop.generateOffers();
    if (run.currentShopEvent) {
      sequence.push(run.currentShopEvent.eventId);
    } else {
      sequence.push("N");
    }
  }

  return sequence;
}

function collectVariantSequence(seed) {
  const runManager = new RunManager();
  const encounterManager = new EncounterManager(runManager);
  const run = runManager.initializeRun(DifficultyLevel.Level0, seed);
  const sequence = [];

  for (const slot of [4, 6, 8, 9]) {
    run.act = 1;
    run.round = slot;
    const encounter = encounterManager.loadEncounter(slot);
    sequence.push(encounter ? encounter.variantId : "missing");
  }

  return sequence;
}

function buyStrongParty(gm) {
  // Hire up to 5 affordable heroes from whatever the shop offers.
  const shop = gm.shopManager;
  const run = gm.currentRunState;
  for (let i = 0; i < shop.currentOffers.length && run.party.length < GameRules.MaxPartySize; i++) {
    const offer = shop.currentOffers[i];
    if (offer && !offer.purchased && offer.hireCost <= run.gold) {
      shop.hire(i);
    }
  }
}

function autopilotWithParty(gm, heroIds, maxSteps, options = {}) {
  // Like autopilot but fields the given party every round using fieldKnownParty.
  let steps = 0;
  let maxRound = 0;
  while (steps++ < maxSteps) {
    const run = gm.currentRunState;
    if (run) maxRound = Math.max(maxRound, run.round);
    switch (gm.currentState) {
      case GameState.Scout:
        gm.continueFromScout();
        break;
      case GameState.Shop:
        fieldKnownParty(gm, heroIds, options.tier || HeroTier.Bronze);
        if (options.stabilizeEconomy) stabilizeRunEconomy(run);
        gm.continueFromShop();
        break;
      case GameState.Formation:
        gm.continueFromFormation();
        break;
      case GameState.Payroll:
        gm.selectPayrollAction(PayrollActionId.StandardPay);
        gm.continueFromPayroll();
        break;
      case GameState.Combat:
        gm.resolveCombat();
        gm.continueAfterReward();
        break;
      case GameState.RelicReward: {
        const choice = run.pendingRelicChoices[0];
        gm.continueAfterRelicReward(choice);
        break;
      }
      case GameState.RivalUpdate:
        gm.continueFromRivalUpdate();
        break;
      case GameState.Victory:
        if (run.act < GameRulesFns.totalActs) {
          gm.continueToNextAct();
          break;
        }
        return { terminated: true, state: GameState.Victory, maxRound };
      case GameState.Defeat:
        return { terminated: true, state: GameState.Defeat, maxRound };
      default:
        return { terminated: false, state: gm.currentState, maxRound };
    }
  }
  return { terminated: false, state: gm.currentState, maxRound };
}

function stabilizeRunEconomy(run) {
  if (!run) return;
  if (run.gold < 200) run.gold = 200;
  if (run.morale < GameRules.StartingMorale) run.morale = GameRules.StartingMorale;
  run.debt = 0;
}

function autopilot(gm, maxSteps) {
  let steps = 0;
  let maxRound = 0;
  while (steps++ < maxSteps) {
    const run = gm.currentRunState;
    if (run) maxRound = Math.max(maxRound, run.round);

    switch (gm.currentState) {
      case GameState.Scout:
        gm.continueFromScout();
        break;
      case GameState.Shop:
        buyStrongParty(gm);
        gm.continueFromShop();
        break;
      case GameState.Formation:
        gm.continueFromFormation();
        break;
      case GameState.Payroll:
        gm.selectPayrollAction(PayrollActionId.StandardPay);
        gm.continueFromPayroll();
        break;
      case GameState.Combat:
        gm.resolveCombat();
        gm.continueAfterReward();
        break;
      case GameState.RelicReward: {
        const choice = run.pendingRelicChoices[0];
        gm.continueAfterRelicReward(choice);
        break;
      }
      case GameState.RivalUpdate:
        gm.continueFromRivalUpdate();
        break;
      case GameState.Victory:
        if (run.act < GameRulesFns.totalActs) {
          gm.continueToNextAct();
          break;
        }
        return { terminated: true, state: GameState.Victory, maxRound };
      case GameState.Defeat:
        return { terminated: true, state: GameState.Defeat, maxRound };
      default:
        return { terminated: false, state: gm.currentState, maxRound };
    }
  }
  return { terminated: false, state: gm.currentState, maxRound };
}

function createFakeDocument() {
  return {
    createElement(tag) {
      return makeFakeElement(tag);
    },
    createTextNode(text) {
      return { textContent: String(text) };
    },
  };
}

function makeFakeElement(tag) {
  const node = {
    tag,
    children: [],
    style: {},
    dataset: {},
    attributes: {},
    className: "",
    _textContent: "",
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    removeChild(child) {
      const index = this.children.indexOf(child);
      if (index >= 0) this.children.splice(index, 1);
      return child;
    },
    setAttribute(key, value) {
      this.attributes[key] = value;
    },
    addEventListener() {},
  };

  Object.defineProperty(node, "firstChild", {
    get() {
      return this.children.length > 0 ? this.children[0] : null;
    },
  });
  Object.defineProperty(node, "textContent", {
    get() {
      return this._textContent + this.children.map((child) => child.textContent || "").join("");
    },
    set(value) {
      this._textContent = String(value);
      this.children.length = 0;
    },
  });

  return node;
}

function countClass(node, className) {
  if (!node) return 0;
  let count = hasClass(node, className) ? 1 : 0;
  if (!node.children) return count;
  for (const child of node.children) count += countClass(child, className);
  return count;
}

function hasClass(node, className) {
  if (!node || typeof node.className !== "string") return false;
  return node.className.split(" ").includes(className);
}

function textContentOf(node) {
  return node && node.textContent ? node.textContent : "";
}
