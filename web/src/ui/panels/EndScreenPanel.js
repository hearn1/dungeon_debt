import { el, clear } from "../dom.js";
import { GameRulesFns } from "../../core/GameRules.js";
import { GameState } from "../../core/GameState.js";

export class EndScreenPanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "overlay" });
  }

  render(state) {
    clear(this.root);
    const run = this.gm.currentRunState;
    const victory = state === GameState.Victory;
    this.root.className = `overlay ${victory ? "victory" : "defeat"}`;

    const moreActs = run && victory && run.act < GameRulesFns.totalActs;

    this.root.appendChild(el("h1", {
      class: "title",
      text: victory ? (moreActs ? "ACT CLEARED" : "GUILD TRIUMPHANT") : "BANKRUPT",
    }));
    if (run && run.latestEndReason) {
      this.root.appendChild(el("div", { class: "end-reason", text: run.latestEndReason }));
    }
    if (run) {
      this.root.appendChild(el("div", { class: "subtitle", text: `Gold ${run.gold} · Debt ${run.debt} · Morale ${run.morale}` }));
    }

    const actions = el("div", { class: "menu-choices" });
    if (moreActs) {
      actions.appendChild(el("button", {
        class: "btn primary", text: `Descend to Act ${run.act + 1} →`,
        onClick: () => this.gm.continueToNextAct(),
      }));
    }
    actions.appendChild(el("button", {
      class: "btn", text: "Return to Main Menu",
      onClick: () => this.gm.returnToMainMenu(),
    }));
    this.root.appendChild(actions);
  }
}
