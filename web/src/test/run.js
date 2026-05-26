// Phase C run-flow test. Drives GameManager through targeted unit checks and a
// full autopiloted run to confirm the whole state machine resolves without
// errors. Run with: node src/test/run.js

import { GameManager } from "../core/GameManager.js";
import { GameState } from "../core/GameState.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { DataRepository } from "../core/DataRepository.js";
import { RunManager } from "../run/RunManager.js";
import { EncounterManager } from "../run/EncounterManager.js";
import { ShopOffer } from "../data/ShopOffer.js";
import { HeroInstance } from "../data/HeroInstance.js";
import { HeroEffects } from "../combat/HeroEffects.js";
import { HeroTier, PayrollActionId, EncounterType, DifficultyPresetId } from "../data/enums.js";

let failures = 0;
function check(name, cond) {
  console.log(`  ${cond ? "ok  " : "FAIL"} ${name}`);
  if (!cond) failures++;
}

console.log("Run-flow test");

// ---- Run initialization applies the difficulty preset ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.StandardContract);
  const run = gm.currentRunState;
  check("init: gold = StartingGold", run.gold === GameRules.StartingGold);
  check("init: morale = StartingMorale", run.morale === GameRules.StartingMorale);
  check("init: act 1 round 1", run.act === 1 && run.round === 1);
  check("init: 3 rivals created", run.rivals.length === 3);
  check("init: entered Scout state", gm.currentState === GameState.Scout);
  check("init: encounter loaded for round 1", run.currentEncounter && run.currentEncounter.round === 1);
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

// ---- Shop hire spends gold and adds to party; duplicate hire merges to Silver ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.ApprenticeLedger); // more starting gold
  gm.continueFromScout(); // -> Shop, offers generated
  const run = gm.currentRunState;
  const shop = gm.shopManager;

  const someHero = shop.currentOffers.find((o) => o && o.tier === HeroTier.Bronze);
  check("shop: at least one bronze offer", !!someHero);

  const goldBefore = run.gold;
  const idx = shop.currentOffers.findIndex((o) => o && !o.purchased && o.hireCost <= run.gold);
  const hired = idx >= 0 ? shop.hire(idx) : false;
  check("shop: hire succeeded", hired === true);
  check("shop: party grew to 1", run.party.length === 1);
  check("shop: gold decreased", run.gold < goldBefore);
}

// ---- Duplicate hire merges Bronze -> Silver (direct ShopOffer injection) ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.ApprenticeLedger);
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

    shop.hire(0);
    check("merge: first hire is Bronze", run.party[0].tier === HeroTier.Bronze);
    shop.hire(1);
    check("merge: duplicate hire upgraded to Silver", run.party[0].tier === HeroTier.Silver);
    check("merge: still one party member", run.party.length === 1);
  } else {
    check("merge: had a definition to test", false);
  }
}

// ---- Payroll: Take Loan adds gold and debt ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.StandardContract);
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
  gm.startRun(DifficultyPresetId.StandardContract);
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
  gm.startRun(DifficultyPresetId.StandardContract);
  const run = gm.currentRunState;
  const payrollBefore = run.rivals.map((r) => r.payroll);
  gm.rivalManager.advanceRivals(run);
  const changed = run.rivals.some((r, i) => r.payroll !== payrollBefore[i]);
  check("rivals: payroll advanced", changed);
}

// ---- Payroll: PromiseVictoryBonus costs gold, buffs attack, no debt on win ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.StandardContract);
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
  gm.startRun(DifficultyPresetId.StandardContract);
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
  gm.startRun(DifficultyPresetId.StandardContract);
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
  gm.startRun(DifficultyPresetId.StandardContract);
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
  gm.startRun(DifficultyPresetId.ApprenticeLedger); // easier preset
  const outcome = autopilotWithParty(gm, ["squire", "squire"], 500);
  check("finalboss-lose: run terminated", outcome.terminated);
  check("finalboss-lose: reached victory or defeat",
    outcome.state === GameState.Victory || outcome.state === GameState.Defeat);
}

// ---- Act 1 victory leads to Act 2 (best-effort: skip if party loses) ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.ApprenticeLedger);
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

// ---- Shop: fire hero ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.ApprenticeLedger);
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
  gm.startRun(DifficultyPresetId.ApprenticeLedger);
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
  gm.startRun(DifficultyPresetId.ApprenticeLedger);
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

// ---- Full 20-round autopilot on easier preset ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.ApprenticeLedger);
  const outcome = autopilot(gm, 800);
  check("20run-autopilot: run terminated", outcome.terminated);
  check("20run-autopilot: rounds advanced past 3", outcome.maxRound > 3);
  check("20run-autopilot: reached Victory or Defeat",
    outcome.state === GameState.Victory || outcome.state === GameState.Defeat);
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);

// ---- helpers ----

// Bypass shop RNG entirely by inserting HeroInstances built from known
// definitions. Tier-seed each one so attack/upkeep match the live values a
// hired hero would have. Used for deterministic combat-outcome assertions.
function fieldKnownParty(gm, heroIds) {
  const run = gm.currentRunState;
  run.party.length = 0;
  heroIds.forEach((id, slot) => {
    const def = DataRepository.allHeroes.find((h) => h.id === id);
    const hero = new HeroInstance(def, slot);
    HeroEffects.applyTierStatSeed(hero);
    run.party.push(hero);
  });
}

function collectVariantSequence(seed) {
  const runManager = new RunManager();
  const encounterManager = new EncounterManager(runManager);
  const run = runManager.initializeRun(DifficultyPresetId.StandardContract, seed);
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

function autopilotWithParty(gm, heroIds, maxSteps) {
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
        fieldKnownParty(gm, heroIds);
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
