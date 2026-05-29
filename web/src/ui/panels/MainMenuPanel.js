import { el, clear } from "../dom.js";
import { appendPanelHeader } from "../components.js";
import { DataRepository } from "../../core/DataRepository.js";
import { GameRules } from "../../core/GameRules.js";

export class MainMenuPanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "overlay" });
    this._selectedLevel = GameRules.DefaultDifficultyLevel;
    this._devEnableAct3 = false;
    this._onKeyDown = (event) => this._handleKeyDown(event);
    if (globalThis.window) window.addEventListener("keydown", this._onKeyDown);
  }

  render() {
    clear(this.root);
    appendPanelHeader(this.root, "MENU", "Dungeon Debt", "An auto-battler economy roguelite");
    this.root.appendChild(el("h1", { class: "title", text: "DUNGEON DEBT" }));
    this.root.appendChild(el("div", { class: "subtitle", text: "An auto-battler economy roguelite" }));

    const choices = el("div", {
      class: "menu-choices",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(190px, 1fr))",
        minWidth: "740px",
        gap: "8px",
      },
    });
    for (const difficulty of DataRepository.allDifficultyLevels) {
      const isSelected = difficulty.level === this._selectedLevel;
      const isImplemented = difficulty.isImplemented;
      choices.appendChild(el("button", {
        class: `btn difficulty-card${isSelected ? " primary" : ""}`,
        disabled: isImplemented ? null : "",
        title: isImplemented ? "" : "Coming soon.",
        onClick: () => this._selectLevel(difficulty.level),
      }, [
        el("div", { class: "d-name", text: difficulty.displayName }),
        el("div", { class: "d-desc", text: this._getDifficultySummary(difficulty) }),
      ]));
    }
    this.root.appendChild(choices);

    const selectedDifficulty = DataRepository.getDifficultyLevel(this._selectedLevel);
    const mutatorText = selectedDifficulty && selectedDifficulty.mutators.length > 0
      ? selectedDifficulty.mutators.map((m) => m.description).join(" ")
      : "No mutators applied.";

    this.root.appendChild(el("div", {
      class: "subtitle",
      style: { maxWidth: "560px", letterSpacing: "1px", textTransform: "none" },
      text: `Cumulative mutators: ${mutatorText}`,
    }));

    this.root.appendChild(el("button", {
      class: "btn primary",
      onClick: () => this._startRun(),
    }, [
      el("div", { class: "d-name", text: `Start ${selectedDifficulty.displayName}` }),
    ]));

    this.root.appendChild(el("a", {
      class: "credits-link",
      href: "ATTRIBUTION.md",
      target: "_blank",
      rel: "noopener",
      text: "Art credits",
    }));
  }

  _selectLevel(level) {
    const difficulty = DataRepository.getDifficultyLevel(level);
    if (!difficulty || !difficulty.isImplemented) return;
    this._selectedLevel = level;
    this.render();
  }

  _getDifficultySummary(difficulty) {
    if (!difficulty.isImplemented) return "Coming soon.";
    if (difficulty.mutators.length <= 0) return "Baseline contract.";
    return "Cumulative: " + difficulty.mutators.map((m) => m.description).join(" ");
  }

  _startRun() {
    if (this.gm.runManager && this.gm.runManager.setDevEnableAct3ForNextRun) {
      this.gm.runManager.setDevEnableAct3ForNextRun(this._devEnableAct3);
    }
    this.gm.startRun(this._selectedLevel);
  }

  _handleKeyDown(event) {
    const isDigit3 = event.key === "3" || event.key === "#" || event.code === "Digit3";
    if (!event.ctrlKey || !event.shiftKey || !isDigit3) return;
    this._devEnableAct3 = !this._devEnableAct3;
    if (this.gm.runManager && this.gm.runManager.setDevEnableAct3ForNextRun) {
      this.gm.runManager.setDevEnableAct3ForNextRun(this._devEnableAct3);
    }
  }
}
