import { el, clear } from "../dom.js";
import { appendPanelHeader } from "../components.js";
import { DataRepository } from "../../core/DataRepository.js";
import { GameRules } from "../../core/GameRules.js";
import { PayrollActionId } from "../../data/enums.js";

const ACTION_PREVIEWS = {
  [PayrollActionId.TakeLoan]: [
    { label: "Gold",   value: `+${GameRules.LoanGoldGain} now` },
    { label: "Debt",   value: `+${GameRules.LoanDebtCost} now` },
    { label: "Morale", value: "no change" },
    { label: "Combat", value: "no stat change" },
    { label: "Risk",   value: "raises debt before the fight" },
  ],
  [PayrollActionId.CutWages]: [
    { label: "Gold",   value: `saves up to ${GameRules.CutWagesUpkeepReduction} upkeep after combat` },
    { label: "Debt",   value: "may prevent upkeep shortfall" },
    { label: "Morale", value: "no change" },
    { label: "Combat", value: `all heroes -${GameRules.CutWagesAttackPenalty} attack this fight` },
    { label: "Risk",   value: "lower combat power" },
  ],
  [PayrollActionId.PromiseVictoryBonus]: [
    { label: "Gold",   value: `pay ${GameRules.VictoryBonusGoldCost} only if you win` },
    { label: "Debt",   value: `+${GameRules.VictoryBonusDebtOnLoss} if you lose; unpaid win bonus becomes debt` },
    { label: "Morale", value: "no change" },
    { label: "Combat", value: `all heroes +${GameRules.VictoryBonusAttackBuff} attack this fight` },
    { label: "Risk",   value: "debt pressure if you lose or cannot afford the payout" },
  ],
  [PayrollActionId.StandardPay]: [
    { label: "Gold",   value: "no change" },
    { label: "Debt",   value: "no change" },
    { label: "Morale", value: "no change" },
    { label: "Combat", value: "no bonus or penalty" },
    { label: "Risk",   value: "none" },
  ],
};

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
      const preview = ACTION_PREVIEWS[action.id] ?? [];
      grid.appendChild(el("button", {
        class: `btn difficulty-card${isSel ? " primary" : ""}`,
        onClick: () => { this._selected = action.id; this.gm.selectPayrollAction(action.id); this.render(); },
      }, [
        el("div", { class: "d-name", text: action.displayName }),
        el("div", { class: "d-desc", text: action.description }),
        el("div", { class: "payroll-preview" }, preview.map((row) => {
          const isActiveRisk = row.label === "Risk" && row.value !== "none";
          return el("div", { class: "payroll-preview-row" }, [
            el("span", { class: "payroll-preview-label", text: row.label }),
            el("span", { class: `payroll-preview-value${isActiveRisk ? " risk" : ""}`, text: row.value }),
          ]);
        })),
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
