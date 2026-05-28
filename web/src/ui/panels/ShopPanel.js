import { el, clear } from "../dom.js";
import { GameRules, GameRulesFns } from "../../core/GameRules.js";
import { heroCard, appendPanelHeader } from "../components.js";

export class ShopPanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "panel" });
    this.onDirty = null;
  }

  // Re-render this panel and refresh shared chrome (header) after a mutation.
  refresh() {
    this.render();
    this.onDirty?.();
  }

  render() {
    clear(this.root);
    const run = this.gm.currentRunState;
    const shop = this.gm.shopManager;

    appendPanelHeader(this.root, "SHOP", "Recruit Heroes", `${run.gold} gold · party ${run.party.length}/${GameRules.MaxPartySize}`);

    // Offers
    const offers = el("div", { class: "card-grid" });
    shop.currentOffers.forEach((offer, i) => {
      if (!offer) {
        offers.appendChild(el("div", { class: "unit-card", text: "Sold out" }));
        return;
      }
      const owned = run.party.find((h) => h.definition.id === offer.hero.id);
      const merge = owned && owned.tier !== "Silver";
      const affordable = run.gold >= offer.hireCost && !offer.purchased;
      const full = run.party.length >= GameRules.MaxPartySize && !owned;
      offers.appendChild(heroCard(offer.hero, null, {
        tier: offer.tier,
        cost: offer.hireCost,
        actions: [{
          label: offer.purchased ? "Hired" : merge ? "Merge → Silver" : "Hire",
          primary: true,
          disabled: offer.purchased || !affordable || full,
          onClick: () => { shop.hire(i); this.refresh(); },
        }],
      }));
    });
    this.root.appendChild(sectionTitle("Recruits"));
    this.root.appendChild(offers);

    // Party
    this.root.appendChild(sectionTitle("Your Guild"));
    const party = el("div", { class: "card-grid" });
    if (run.party.length === 0) {
      party.appendChild(el("div", { class: "panel-sub", text: "No heroes hired yet." }));
    }
    run.party.forEach((hero, i) => {
      party.appendChild(heroCard(hero.definition, hero, {
        actions: [{
          label: `Fire (+${GameRules.FireRefund})`,
          danger: true,
          onClick: () => { shop.fire(i); this.refresh(); },
        }],
      }));
    });
    this.root.appendChild(party);

    // Actions
    const debtPayment = GameRulesFns.calculateDebtPaymentAmount(run.gold, run.debt);
    this.root.appendChild(el("div", { class: "panel-actions" }, [
      el("button", {
        class: "btn", text: `Reroll (${GameRules.RerollCost})`,
        disabled: run.gold < GameRules.RerollCost ? "" : null,
        onClick: () => { shop.reroll(); this.refresh(); },
      }),
      el("button", {
        class: "btn", text: debtPayment > 0 ? `Pay Debt (−${debtPayment})` : "Pay Debt",
        disabled: debtPayment <= 0 ? "" : null,
        onClick: () => { shop.payDebt(); this.refresh(); },
      }),
      el("button", { class: "btn primary", text: "To Formation →", onClick: () => this.gm.continueFromShop() }),
    ]));
  }
}

function sectionTitle(text) {
  return el("div", { class: "combat-side-lbl", text: text.toUpperCase() });
}
