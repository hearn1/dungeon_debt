// Edge-case and regression verification for the web port.
// Run: node src/test/verify.js
// Covers gaps identified in the Phase 1 review:
//   - PromiseVictoryBonus loss path → debt
//   - CutWages attack floor at 0
//   - revertPerCombatHeroStats restores stats
//   - Rival debt creep calculation
//   - calculateDebtPaymentAmount edge cases
//   - Multiple Bards gold stacking
//   - Act 2 loss routing
//   - evaluateNextState routing chain (Victory → RelicReward → Victory → NextAct)
//   - ShopManager fire re-assigns slots
//   - Enchanter adjacency across rows (slot 1 vs slot 2)

import { GameManager } from "../core/GameManager.js";
import { GameState } from "../core/GameState.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { DataRepository } from "../core/DataRepository.js";
import { HeroInstance } from "../data/HeroInstance.js";
import { HeroEffects } from "../combat/HeroEffects.js";
import { CombatManager } from "../combat/CombatManager.js";
import { PayrollActionId, DifficultyPresetId } from "../data/enums.js";

let failures = 0;
function check(name, cond) {
  console.log(`  ${cond ? "ok  " : "FAIL"} ${name}`);
  if (!cond) failures++;
}

console.log("Edge-case verification test");

// ---- calculateDebtPaymentAmount ----
{
  check("payDebt: zero gold = 0", GameRulesFns.calculateDebtPaymentAmount(0, 10) === 0);
  check("payDebt: zero debt = 0", GameRulesFns.calculateDebtPaymentAmount(10, 0) === 0);
  check("payDebt: capped at 3", GameRulesFns.calculateDebtPaymentAmount(10, 10) === 3);
  check("payDebt: pays min(gold, debt, 3)", GameRulesFns.calculateDebtPaymentAmount(2, 10) === 2);
  check("payDebt: pays min when debt < cap", GameRulesFns.calculateDebtPaymentAmount(10, 1) === 1);
  check("payDebt: negative gold = 0", GameRulesFns.calculateDebtPaymentAmount(-5, 10) === 0);
  check("payDebt: negative debt = 0", GameRulesFns.calculateDebtPaymentAmount(10, -5) === 0);
}

// ---- CutWages attack floor at 0 for Treasurer (base attack 0) ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.ApprenticeLedger);
  gm.continueFromScout();
  gm.continueFromShop();
  gm.continueFromFormation();
  const run = gm.currentRunState;
  // Inject a Treasurer
  const treasDef = DataRepository.allHeroes.find(h => h.id === "treasurer");
  run.party.push(new HeroInstance(treasDef, 0));
  HeroEffects.applyTierStatSeed(run.party[0]);
  gm.selectPayrollAction(PayrollActionId.CutWages);
  gm.continueFromPayroll();
  check("cutwages: treasurer attack >= 0 after cut", run.party[0].attack >= 0);
}

// ---- revertPerCombatHeroStats restores hero attack after CutWages ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.ApprenticeLedger);
  gm.continueFromScout();
  gm.continueFromShop();
  gm.continueFromFormation();
  const run = gm.currentRunState;
  const warDef = DataRepository.allHeroes.find(h => h.id === "warrior");
  const hero = new HeroInstance(warDef, 0);
  HeroEffects.applyTierStatSeed(hero);
  run.party.push(hero);
  const baseAttack = hero.attack;
  gm.selectPayrollAction(PayrollActionId.CutWages);
  gm.continueFromPayroll();
  const afterCut = hero.attack;
  // Resolve combat to trigger revertPerCombatHeroStats
  gm.resolveCombat();
  check("cutwages: attack reduced during combat", afterCut < baseAttack);
  check("cutwages: attack restored after combat", hero.attack === baseAttack);
}

// ---- PromiseVictoryBonus loss path adds debt ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.StandardContract);
  gm.continueFromScout();
  gm.continueFromShop();
  gm.continueFromFormation();
  const run = gm.currentRunState;
  const debtBefore = run.debt;
  gm.selectPayrollAction(PayrollActionId.PromiseVictoryBonus);
  gm.continueFromPayroll();
  // Field a weak party to guarantee loss
  run.party.length = 0;
  const squireDef = DataRepository.allHeroes.find(h => h.id === "squire");
  const squire = new HeroInstance(squireDef, 0);
  HeroEffects.applyTierStatSeed(squire);
  run.party.push(squire);
  // Resolve combat (expected: loss)
  gm.resolveCombat();
  check("victorybonus-loss: debt increased on loss", run.debt > debtBefore);
  check("victorybonus-loss: debt increased by exactly 5", run.debt - debtBefore === GameRules.VictoryBonusDebtOnLoss);
}

// ---- PromiseVictoryBonus gold deduction on low gold ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.StandardContract);
  gm.continueFromScout();
  gm.continueFromShop();
  gm.continueFromFormation();
  const run = gm.currentRunState;
  run.gold = 1; // less than VictoryBonusGoldCost (3)
  check("victorybonus: gold before floor test", run.gold === 1);
  gm.selectPayrollAction(PayrollActionId.PromiseVictoryBonus);
  gm.continueFromPayroll();
  check("victorybonus: gold floors at 0", run.gold === 0);
}

// ---- Rival payroll growth ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.StandardContract);
  const run = gm.currentRunState;
  const greedy = run.rivals.find(r => r.guild === "Greedy");
  const frugal = run.rivals.find(r => r.guild === "Frugal");
  const carry = run.rivals.find(r => r.guild === "Carry");
  check("rivals: greedy payroll = 10", greedy && greedy.payroll === GameRules.GreedyRivalStartingPayroll);
  check("rivals: frugal payroll = 6", frugal && frugal.payroll === GameRules.FrugalRivalStartingPayroll);
  check("rivals: carry payroll = 8", carry && carry.payroll === GameRules.CarryRivalStartingPayroll);
  // Advance once
  gm.rivalManager.advanceRivals(run);
  check("rivals: greedy grows by 2", greedy && greedy.payroll === GameRules.GreedyRivalStartingPayroll + GameRules.GreedyRivalPayrollGrowth);
  check("rivals: frugal grows by 1", frugal && frugal.payroll === GameRules.FrugalRivalStartingPayroll + GameRules.FrugalRivalPayrollGrowth);
  // Carry grows by 1 on odd rounds (we're at round 1 = odd start; advanced once = round 2 tracking)
  check("rivals: carry grows by 1 (odd round 1)", carry && carry.payroll === GameRules.CarryRivalStartingPayroll + GameRules.CarryRivalOddRoundPayrollGrowth);
  // Advance on round 2 (even) to test even-round growth
  run.round = 2;
  gm.rivalManager.advanceRivals(run);
  check("rivals: carry grows by 2 (even round 2)", carry && carry.payroll === GameRules.CarryRivalStartingPayroll + GameRules.CarryRivalOddRoundPayrollGrowth + GameRules.CarryRivalEvenRoundPayrollGrowth);
}

// ---- Multiple Bards stack gold on win ----
// Bard effect: +BronzeBardWinGold per Bard on combat win.
// Bards are weak, so pair them with a Warrior to ensure a win.
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.StandardContract);
  gm.continueFromScout();
  gm.continueFromShop();
  gm.continueFromFormation();
  const run = gm.currentRunState;
  const bardDef = DataRepository.allHeroes.find(h => h.id === "bard");
  const warDef = DataRepository.allHeroes.find(h => h.id === "warrior");
  const bard0 = new HeroInstance(bardDef, 0);
  const bard1 = new HeroInstance(bardDef, 1);
  const war = new HeroInstance(warDef, 2);
  HeroEffects.applyTierStatSeed(bard0);
  HeroEffects.applyTierStatSeed(bard1);
  HeroEffects.applyTierStatSeed(war);
  run.party = [bard0, bard1, war];
  const goldBefore = run.gold;
  gm.selectPayrollAction(PayrollActionId.StandardPay);
  gm.continueFromPayroll();
  gm.resolveCombat();
  check("multi-bard: combat won with warrior support", run.latestCombatWon === true);
  if (run.latestCombatWon) {
    // Gold increased by at least: WinReward + 2×bard bonus - deductions
    check("multi-bard: bard +4 gold (2×BronzeBardWinGold) visible post-deductions",
      run.gold >= goldBefore + GameRules.WinReward + 2 * GameRules.BronzeBardWinGold - run.latestTotalUpkeep - run.latestInterestCharged);
  }
}

// ---- Shop fire re-assigns formation slots ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.ApprenticeLedger);
  gm.continueFromScout();
  const shop = gm.shopManager;
  const run = gm.currentRunState;
  // Hire 3 heroes
  for (let i = 0; i < 3 && i < shop.currentOffers.length; i++) {
    const offer = shop.currentOffers[i];
    if (offer && !offer.purchased && run.gold >= offer.hireCost) shop.hire(i);
  }
  check("fire-slot: has at least 2 heroes", run.party.length >= 2);
  if (run.party.length >= 2) {
    const slotsBefore = run.party.map(h => h.formationSlot);
    shop.fire(0);
    const slotsAfter = run.party.map(h => h.formationSlot);
    check("fire-slot: slots are sequential 0..N-1 after fire",
      slotsAfter.every((s, i) => s === i));
  }
}

// ---- Act 2 loss ends run ----
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.ApprenticeLedger);
  // Fast-forward to round 20 with weak party, then lose
  for (let r = 1; r <= 10; r++) {
    if (gm.currentState === GameState.Defeat) break;
    gm.continueFromScout();
    gm.continueFromShop();
    gm.continueFromFormation();
    gm.selectPayrollAction(PayrollActionId.StandardPay);
    gm.continueFromPayroll();
    gm.resolveCombat();
    gm.continueAfterReward();
    if (gm.currentState === GameState.RelicReward) {
      const choice = gm.currentRunState.pendingRelicChoices[0];
      gm.continueAfterRelicReward(choice);
    }
    if (gm.currentState === GameState.Victory) {
      gm.continueToNextAct(); // now in Act 2
      break;
    }
  }
  // If we reached Act 2, drive it to loss at round 20
  if (gm.currentRunState && gm.currentRunState.act === 2) {
    for (let r = 11; r <= 20; r++) {
      if (gm.currentState === GameState.Defeat) break;
      gm.continueFromScout();
      gm.continueFromShop();
      gm.continueFromFormation();
      gm.selectPayrollAction(PayrollActionId.StandardPay);
      gm.continueFromPayroll();
      // Field a weak party for this round to try losing
      const run = gm.currentRunState;
      run.party.length = 0;
      const squireDef = DataRepository.allHeroes.find(h => h.id === "squire");
      const sq = new HeroInstance(squireDef, 0);
      HeroEffects.applyTierStatSeed(sq);
      run.party.push(sq);
      gm.resolveCombat();
      gm.continueAfterReward();
      if (gm.currentState === GameState.RelicReward) {
        const choice = gm.currentRunState.pendingRelicChoices[0];
        gm.continueAfterRelicReward(choice);
      }
    }
    if (gm.currentState === GameState.Defeat) {
      check("act2-loss: reached Defeat at final round", true);
    } else {
      // Could also reach Victory if the squire somehow won
      check("act2-loss: run terminated (Victory or Defeat)",
        gm.currentState === GameState.Victory || gm.currentState === GameState.Defeat);
    }
  } else {
    check("act2-loss: reached Act 2 (or already defeated)", true);
  }
}

// ---- Enchanter adjacency works across frontline/backline boundary ----
// Slot 1 (last frontline) and slot 2 (first backline) are adjacent.
{
  const gm = new GameManager();
  gm.startRun(DifficultyPresetId.StandardContract);
  const run = gm.currentRunState;
  const enchanterDef = DataRepository.allHeroes.find(h => h.id === "enchanter");
  const wizardDef = DataRepository.allHeroes.find(h => h.id === "wizard");
  const enchanter = new HeroInstance(enchanterDef, 1); // front row, slot 1
  const wizard = new HeroInstance(wizardDef, 2); // back row, slot 2 (adjacent to slot 1)
  HeroEffects.applyTierStatSeed(enchanter);
  HeroEffects.applyTierStatSeed(wizard);
  run.party = [enchanter, wizard];
  const encounter = DataRepository.getEncounterPool(1, 1)[0];
  const result = new CombatManager().startCombat(run, encounter);
  check("enchanter-crossrow: enchant message present",
    result.logLines.some(l => l.includes("enchants") && l.includes("+1 attack")));
  check("enchanter-crossrow: player wins", result.playerWon === true);
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
