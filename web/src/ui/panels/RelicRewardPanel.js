import { el, clear } from "../dom.js";
import { appendPanelHeader } from "../components.js";
import { DataRepository } from "../../core/DataRepository.js";
import { GameRules } from "../../core/GameRules.js";

export class RelicRewardPanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "panel" });
    this.onDirty = null;
  }

  render() {
    clear(this.root);
    const run = this.gm.currentRunState;

    const choiceSub = run.pendingRelicChoiceBonus > 0
      ? `Benchmark cleared. Reward quality added ${run.pendingRelicChoiceBonus} extra option.`
      : "Benchmark cleared. Add one permanent relic to the guild.";
    appendPanelHeader(this.root, "CONTRACT BONUS", "Choose a Relic", choiceSub);

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

    grid.appendChild(el("button", {
      class: "btn difficulty-card relic-skip",
      onClick: () => { this.gm.skipRelicReward(); this.onDirty?.(); },
    }, [
      el("div", { class: "d-name", text: `Skip — Take ${GameRules.RelicSkipGold} Gold` }),
      el("div", { class: "d-desc", text: "Decline the relic. Receive gold instead." }),
    ]));

    this.root.appendChild(grid);
  }
}
