import { el, clear } from "../dom.js";
import { GameRules, GameRulesFns } from "../../core/GameRules.js";
import { heroCard, appendPanelHeader, roundGuidanceCallout } from "../components.js";
import { HeroTier, ShopEventId } from "../../data/enums.js";

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

    appendPanelHeader(this.root, "RECRUITMENT", "Recruitment Office", `${run.gold} gold payroll cash · roster ${run.party.length}/${GameRules.MaxPartySize}`);

    // Shop event area
    const ev = run.currentShopEvent;
    if (ev) {
      if (ev.eventId === ShopEventId.TaxAudit) {
        const eventArea = el("div", { class: "shop-event-area" });
        eventArea.appendChild(el("div", { class: "shop-event-badge", text: "Surprise Tax Audit" }));
        eventArea.appendChild(el("div", { class: "panel-sub", text: "Settle " + GameRules.TaxAuditGoldCost + " gold from petty cash or let morale take the hit." }));
        const btnRow = el("div", { class: "shop-event-actions" });
        btnRow.appendChild(el("button", {
          class: "btn small", text: "Settle Audit (" + GameRules.TaxAuditGoldCost + "g)",
          disabled: run.gold < GameRules.TaxAuditGoldCost ? "" : null,
          onClick: () => { shop.resolveTaxAudit(true); this.refresh(); },
        }));
        btnRow.appendChild(el("button", {
          class: "btn small danger", text: "Contest Audit (-1 morale)",
          onClick: () => { shop.resolveTaxAudit(false); this.refresh(); },
        }));
        eventArea.appendChild(btnRow);
        this.root.appendChild(eventArea);
      } else if (ev.eventId === ShopEventId.TravellingMerchant) {
        const eventArea = el("div", { class: "shop-event-area" });
        eventArea.appendChild(el("div", { class: "shop-event-badge", text: "Travelling Supplier" }));
        for (const good of ev.goods) {
          const purchased = shop.isTravellingGoodPurchased(good.id);
          const row = el("div", { class: "shop-event-good" });
          row.appendChild(el("span", { class: "shop-event-good-label", text: good.label }));
          row.appendChild(el("span", { class: "panel-sub", text: good.description }));
          if (purchased) {
            row.appendChild(el("span", { class: "shop-event-badge", text: "Filed" }));
          } else {
            row.appendChild(el("button", {
              class: "btn small" + (run.gold >= good.cost ? " primary" : ""),
              text: "Purchase (" + good.cost + "g)",
              disabled: run.gold < good.cost ? "" : null,
              onClick: () => { shop.purchaseTravellingGood(good.id); this.refresh(); },
            }));
          }
          eventArea.appendChild(row);
        }
        this.root.appendChild(eventArea);
      }
    }

    // Offers
    const offers = el("div", { class: "card-grid" });
    shop.currentOffers.forEach((offer, i) => {
      if (!offer) {
        offers.appendChild(el("div", { class: "unit-card", text: "Position filled" }));
        return;
      }
      const owned = run.party.find((h) => h.definition.id === offer.hero.id);
      const mergeLabel = getMergeLabel(owned);
      const affordable = run.gold >= offer.hireCost && !offer.purchased;
      const full = run.party.length >= GameRules.MaxPartySize && !owned;
      const disabled = offer.purchased || !affordable || full || (owned && owned.tier === HeroTier.Diamond);
      const cardContainer = el("div", { class: "offer-card-wrap", style: "--idx: " + i });
      cardContainer.appendChild(heroCard(offer.hero, null, {
        tier: offer.tier,
        cost: offer.hireCost,
        actions: [{
          label: offer.purchased ? "On Payroll" : mergeLabel || "Sign Contract",
          primary: true,
          disabled,
          onClick: () => { shop.hire(i); this.refresh(); },
        }],
      }));
      const ev = run.currentShopEvent;
      if (ev && ev.eventId === ShopEventId.BargainStall && ev.slotIndex === i && !offer.purchased) {
        cardContainer.appendChild(el("div", { class: "shop-event-badge", text: "Bargain! 50% off" }));
      }
      offers.appendChild(cardContainer);
    });
    const guidance = roundGuidanceCallout(run.round);
    if (guidance) this.root.appendChild(guidance);
    this.root.appendChild(sectionTitle("Candidate Pool"));
    this.root.appendChild(offers);

    // Party
    this.root.appendChild(sectionTitle("Current Payroll"));
    const party = el("div", { class: "card-grid" });
    if (run.party.length === 0) {
      party.appendChild(el("div", { class: "panel-sub", text: "No adventurers under contract yet." }));
    }
    run.party.forEach((hero, i) => {
      party.appendChild(heroCard(hero.definition, hero, {
        actions: [{
          label: `Release Contract (+${GameRules.FireRefund})`,
          danger: true,
          onClick: () => { shop.fire(i); this.refresh(); },
        }],
      }));
    });
    this.root.appendChild(party);

    // Actions
    const debtPayment = GameRulesFns.calculateDebtPaymentAmount(run.gold, run.debt);
    const debtArea = el("div", { class: "shop-debt-area" });
    debtArea.appendChild(this._buildPayDebtControl(run, shop, debtPayment));
    this.root.appendChild(el("div", { class: "panel-actions" }, [
      el("button", {
        class: "btn", text: `Refresh Candidates (${GameRules.RerollCost})`,
        disabled: run.gold < GameRules.RerollCost ? "" : null,
        onClick: () => { shop.reroll(); this.refresh(); },
      }),
      debtArea,
      el("button", {
        class: "btn primary",
        text: ev && ev.eventId === ShopEventId.TaxAudit ? "Resolve Tax Audit first" : "Set Formation →",
        disabled: ev && ev.eventId === ShopEventId.TaxAudit ? "" : null,
        onClick: () => { if (!ev || ev.eventId !== ShopEventId.TaxAudit) this.gm.continueFromShop(); },
      }),
    ]));
  }

  _buildPayDebtControl(run, shop, debtPayment) {
    const wrap = el("div", { class: "shop-debt-control" });
    let btnText;
    let disabled;
    let helperLines = [];

    if (run.debt <= 0) {
      btnText = "No Debt";
      disabled = true;
      helperLines.push("Your ledger is clear.");
    } else if (run.gold <= 0) {
      btnText = "Need Gold to Pay Debt";
      disabled = true;
      helperLines.push("Debt keeps generating interest after upkeep.");
    } else {
      const debtAfter = run.debt - debtPayment;
      btnText = `Pay Debt: ${debtPayment}g (cap ${GameRules.DebtPaymentCap})`;
      disabled = false;
      helperLines.push(`Debt ${run.debt} → ${debtAfter}. Paying now lowers future interest.`);
      if (GameRulesFns.isHighDebtPressure(run.debt)) {
        helperLines.push("Unpaid debt keeps generating interest and can push the guild toward bankruptcy.");
      }
    }

    wrap.appendChild(el("button", {
      class: "btn",
      text: btnText,
      disabled: disabled ? "" : null,
      onClick: () => { shop.payDebt(); this.refresh(); },
    }));
    for (const line of helperLines) {
      wrap.appendChild(el("div", { class: "shop-debt-helper", text: line }));
    }
    return wrap;
  }
}

function getMergeLabel(owned) {
  if (!owned) return null;
  if (owned.tier === HeroTier.Bronze) return "Promote → Silver";
  if (owned.tier === HeroTier.Silver) return "Promote → Gold";
  if (owned.tier === HeroTier.Gold) return "Promote → Diamond";
  return null;
}

function sectionTitle(text) {
  return el("div", { class: "combat-side-lbl", text: text.toUpperCase() });
}
