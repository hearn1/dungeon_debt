import { el, clear } from "../dom.js";
import { DataRepository } from "../../core/DataRepository.js";

export class RelicRewardPanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "panel" });
    this.onDirty = null;
  }

  render() {
    clear(this.root);
    const run = this.gm.currentRunState;

    this.root.appendChild(el("div", { class: "panel-head" }, [
      el("div", { class: "panel-title", text: "Choose a Relic" }),
      el("div", { class: "panel-sub", text: "A reward for clearing a benchmark fight." }),
    ]));

    const grid = el("div", { class: "card-grid" });
    for (const id of run.pendingRelicChoices) {
      const relic = DataRepository.getRelic(id);
      grid.appendChild(el("button", {
        class: "btn difficulty-card",
        onClick: () => { this.gm.continueAfterRelicReward(id); this.onDirty?.(); },
      }, [
        el("div", { class: "d-name", text: relic.displayName }),
        el("div", { class: "d-desc", text: relic.effectDescription }),
      ]));
    }
    this.root.appendChild(grid);
  }
}
