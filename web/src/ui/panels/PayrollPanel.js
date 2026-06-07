import { el, clear } from "../dom.js";
import { appendPanelHeader } from "../components.js";
import { DataRepository } from "../../core/DataRepository.js";
import { GameRules } from "../../core/GameRules.js";
import { PayrollActionId } from "../../data/enums.js";

export class PayrollPanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "panel" });
    this.onDirty = null;
    this._selected = null;
  }

  render() {
    clear(this.root);
    const run = this.gm.currentRunState;
    this._selected = run.selectedPayrollAction ?? null;

    appendPanelHeader(this.root, "PAYROLL", "Payroll Desk", "Choose this round's wage policy before the party enters danger.");

    const grid = el("div", { class: "card-grid" });
    for (const action of DataRepository.allPayrollActions) {
      const isSel = this._selected === action.id;
      const affordable = isAffordable(action.id, run.gold);
      grid.appendChild(el("button", {
        class: `btn difficulty-card${isSel ? " primary" : ""}`,
        disabled: affordable ? null : "",
        title: affordable ? "" : `Requires ${GameRules.VictoryBonusGoldCost} gold in payroll cash.`,
        onClick: () => { this._selected = action.id; this.gm.selectPayrollAction(action.id); this.render(); },
      }, [
        el("div", { class: "d-name", text: action.displayName }),
        el("div", { class: "d-desc", text: action.description }),
        !affordable ? el("div", { class: "d-desc", style: { color: "var(--debt-critical)" }, text: `Need ${GameRules.VictoryBonusGoldCost} payroll cash.` }) : null,
      ]));
    }
    this.root.appendChild(grid);

    this.root.appendChild(el("div", { class: "panel-actions" }, [
      el("button", {
        class: "btn primary", text: "Authorize Contract Run →",
        disabled: this._selected === null ? "" : null,
        onClick: () => { this.onDirty?.(); this.gm.continueFromPayroll(); },
      }),
    ]));
  }
}

function isAffordable(actionId, gold) {
  if (actionId === PayrollActionId.PromiseVictoryBonus) {
    return gold >= GameRules.VictoryBonusGoldCost;
  }
  return true;
}
