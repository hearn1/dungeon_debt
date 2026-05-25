import { el, clear } from "../dom.js";
import { DataRepository } from "../../core/DataRepository.js";

const DESCRIPTIONS = {
  ApprenticeLedger: "Forgiving. More starting gold and morale, gentler interest, tougher heroes.",
  StandardContract: "The baseline guild contract. The intended challenge.",
  PredatoryInterest: "Brutal. Less gold, harsher interest, a lower debt limit, deadlier enemies.",
};

export class MainMenuPanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "overlay" });
  }

  render() {
    clear(this.root);
    this.root.appendChild(el("h1", { class: "title", text: "DUNGEON DEBT" }));
    this.root.appendChild(el("div", { class: "subtitle", text: "An auto-battler economy roguelite" }));

    const choices = el("div", { class: "menu-choices" });
    for (const preset of DataRepository.allDifficultyPresets) {
      choices.appendChild(el("button", {
        class: "btn difficulty-card",
        onClick: () => this.gm.startRun(preset.id),
      }, [
        el("div", { class: "d-name", text: preset.displayName }),
        el("div", { class: "d-desc", text: DESCRIPTIONS[preset.id] || "" }),
      ]));
    }
    this.root.appendChild(choices);

    this.root.appendChild(el("a", {
      class: "credits-link",
      href: "ATTRIBUTION.md",
      target: "_blank",
      rel: "noopener",
      text: "Art credits",
    }));
  }
}
