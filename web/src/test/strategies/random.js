import { Rng } from "../../core/Rng.js";
import { GameRules, GameRulesFns } from "../../core/GameRules.js";
import { PayrollActionId } from "../../data/enums.js";

const StrategySeedSalt = 0x72f2;
const MaxShopActions = 20;

export const RandomStrategy = Object.freeze({
  id: "random",

  createContext(seed) {
    return { rng: new Rng((seed + StrategySeedSalt) >>> 0) };
  },

  visitShop(shopManager, run, context) {
    if (!shopManager || !run || !context || !context.rng) return;

    for (let i = 0; i < MaxShopActions; i++) {
      const actions = getLegalShopActions(shopManager, run);
      actions.push({ type: "stop" });

      const action = actions[context.rng.next(actions.length)];
      if (!action || action.type === "stop") return;
      if (action.type === "hire") shopManager.hire(action.index);
      else if (action.type === "reroll") shopManager.reroll();
      else if (action.type === "payDebt") shopManager.payDebt();
    }
  },

  choosePayrollAction(run, context) {
    if (!run || !context || !context.rng) return PayrollActionId.StandardPay;

    const actions = [PayrollActionId.StandardPay, PayrollActionId.CutWages];
    if (run.debt + GameRules.LoanDebtCost < run.debtLimit) actions.push(PayrollActionId.TakeLoan);
    if (run.gold >= GameRules.VictoryBonusGoldCost) actions.push(PayrollActionId.PromiseVictoryBonus);

    return actions[context.rng.next(actions.length)];
  },

  chooseRelic(run, context) {
    if (!run || !context || !context.rng) return null;
    if (!run.pendingRelicChoices || run.pendingRelicChoices.length <= 0) return null;
    return run.pendingRelicChoices[context.rng.next(run.pendingRelicChoices.length)];
  },
});

function getLegalShopActions(shopManager, run) {
  const actions = [];
  for (let i = 0; i < shopManager.currentOffers.length; i++) {
    const offer = shopManager.currentOffers[i];
    if (!offer || offer.purchased || offer.hireCost > run.gold) continue;
    if (run.party.length >= GameRules.MaxPartySize && !ownsHero(run, offer.hero.id)) continue;
    actions.push({ type: "hire", index: i });
  }

  if (run.gold >= GameRules.RerollCost) actions.push({ type: "reroll" });
  if (GameRulesFns.calculateDebtPaymentAmount(run.gold, run.debt) > 0) {
    actions.push({ type: "payDebt" });
  }

  return actions;
}

function ownsHero(run, heroId) {
  for (const hero of run.party) {
    if (hero && hero.definition && hero.definition.id === heroId) return true;
  }
  return false;
}
