import { el, clear } from "../dom.js";
import { GameRulesFns } from "../../core/GameRules.js";

export class RivalUpdatePanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "panel" });
    this.onDirty = null;
  }

  render() {
    clear(this.root);
    const run = this.gm.currentRunState;

    this.root.appendChild(el("div", { class: "panel-head" }, [
      el("div", { class: "panel-title", text: "Rival Guilds" }),
      el("div", { class: "panel-sub", text: "Where the competition stands this round." }),
    ]));

    const list = el("div", { class: "rival-list" });
    for (const rival of run.rivals) {
      const color = GameRulesFns.getRivalGuildColor(rival.guild);
      list.appendChild(el("div", { class: "rival-row" }, [
        el("div", { class: "rival-swatch", style: { background: color } }),
        el("div", { class: "rival-name", text: rival.displayName }),
        stat(rival.morale, "MORALE"),
        stat(rival.debt, "DEBT"),
        stat(rival.payroll, "PAYROLL"),
        el("div", { class: "rival-stat" }, [
          el("span", { class: "v", text: rival.statusLabel }),
          el("span", { class: "l", text: "STATUS" }),
        ]),
      ]));
    }
    this.root.appendChild(list);

    this.root.appendChild(el("div", { class: "panel-actions" }, [
      el("button", { class: "btn primary", text: "Next Round →", onClick: () => this.gm.continueFromRivalUpdate() }),
    ]));
  }
}

function stat(value, label) {
  return el("div", { class: "rival-stat" }, [
    el("span", { class: "v", text: String(value) }),
    el("span", { class: "l", text: label }),
  ]);
}
