// Phase C run-flow test. Drives GameManager through targeted unit checks and a
// full autopiloted run to confirm the whole state machine resolves without
// errors. Run with: node src/test/run.js

import { GameManager } from "../core/GameManager.js";
import { GameState } from "../core/GameState.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { DataRepository } from "../core/DataRepository.js";
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

// ---- Full autopiloted run terminates in Victory or Defeat ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.StandardContract);
  const outcome = autopilot(gm, 500);
  check("autopilot: run terminated", outcome.terminated);
  check("autopilot: ended Victory or Defeat", outcome.state === GameState.Victory || outcome.state === GameState.Defeat);
  check("autopilot: rounds advanced past 1", outcome.maxRound > 1);
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
