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
    appendPanelHeader(this.root, "GUILD OFFICE", "Dungeon Debt", "Run a mercenary guild, take dungeon contracts, and keep the ledger out of the red.");
    this.root.appendChild(el("h1", { class: "title", text: "DUNGEON DEBT" }));
    this.root.appendChild(el("div", { class: "subtitle", text: "Own the guild. Pay the party. Survive the audit." }));

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
      const isLocked = this._isLevelLocked(difficulty);
      choices.appendChild(el("button", {
        class: `btn difficulty-card${isSelected ? " primary" : ""}`,
        disabled: isLocked ? "" : null,
        title: isLocked ? this._getLockedLabel(difficulty) : "",
        onClick: () => this._selectLevel(difficulty.level),
      }, [
        el("div", { class: "d-name", text: difficulty.displayName }),
        el("div", { class: "d-desc", text: this._getDifficultySummary(difficulty) }),
      ]));
    }
    this.root.appendChild(choices);

    const selectedDifficulty = DataRepository.getDifficultyLevel(this._selectedLevel);
    const mutatorText = this._formatDifficultyMutators(selectedDifficulty, "No mutators applied.");

    this.root.appendChild(el("div", {
      class: "subtitle",
      style: { maxWidth: "560px", letterSpacing: "1px", textTransform: "none" },
      text: `Contract clauses: ${mutatorText}`,
    }));

    this.root.appendChild(el("button", {
      class: "btn primary",
      onClick: () => this._startRun(),
    }, [
      el("div", { class: "d-name", text: `Sign ${selectedDifficulty.displayName} Contract` }),
    ]));

    const menuFooter = el("div", { class: "menu-footer" });
    menuFooter.appendChild(el("button", {
      class: "btn how-to-play-btn",
      text: "How to Play",
      onClick: () => this._showTutorial(),
    }));
    menuFooter.appendChild(el("a", {
      class: "credits-link",
      href: "ATTRIBUTION.md",
      target: "_blank",
      rel: "noopener",
      text: "Art credits",
    }));
    this.root.appendChild(menuFooter);
  }

  _isLevelLocked(difficulty) {
    if (!difficulty.isImplemented) return true;
    if (difficulty.level === 0) return false;
    return difficulty.level > this.gm.highestBeatenDifficulty + 1;
  }

  _getLockedLabel(difficulty) {
    if (!difficulty.isImplemented) return "Coming soon.";
    return "Clear Level " + (difficulty.level - 1) + " contract to unlock.";
  }

  _selectLevel(level) {
    const difficulty = DataRepository.getDifficultyLevel(level);
    if (!difficulty || this._isLevelLocked(difficulty)) return;
    this._selectedLevel = level;
    this.render();
  }

  _getDifficultySummary(difficulty) {
    if (!difficulty.isImplemented) return this._getLockedLabel(difficulty);
    if (difficulty.mutators.length <= 0) return "Standard guild charter.";
    const mutatorSummary = "Clauses: " + this._formatDifficultyMutators(difficulty);
    if (this._isLevelLocked(difficulty)) return this._getLockedLabel(difficulty) + " " + mutatorSummary;
    return mutatorSummary;
  }

  _formatDifficultyMutators(difficulty, fallback = "") {
    if (!difficulty || difficulty.mutators.length <= 0) return fallback;
    return difficulty.mutators
      .map((mutator) => `${mutator.displayName}: ${mutator.description}`)
      .join(" ");
  }

  _startRun() {
    if (this.gm.runManager && this.gm.runManager.setDevEnableAct3ForNextRun) {
      this.gm.runManager.setDevEnableAct3ForNextRun(this._devEnableAct3);
    }
    this.gm.startRun(this._selectedLevel);
  }

  _showTutorial() {
    if (document.getElementById("how-to-play-modal")) return;

    const steps = [
      { num: "1", head: "Review the Contract", body: "Scout the next fight, enemy roster, and payout before spending." },
      { num: "2", head: "Recruit Adventurers", body: "Use gold to sign new heroes, promote duplicates, reroll candidates, or pay down debt." },
      { num: "3", head: "Set Formation", body: "Frontline slots are targeted first. Put durable heroes up front and fragile damage/support heroes in back." },
      { num: "4", head: "Choose Payroll", body: "Standard pay is safe. Loans give cash but add debt. Cutting wages saves money but weakens the party. Victory bonuses cost cash for temporary power." },
      { num: "5", head: "Watch Combat Resolve", body: "Combat is automatic. Your roster, formation, payroll choice, and matchup decide the result." },
      { num: "6", head: "Read the Ledger", body: "After combat, rewards are paid, wages are charged, debt interest applies, and morale may change." },
    ];

    const backdrop = el("div", { id: "how-to-play-modal", class: "tutorial-backdrop" });
    const modal = el("div", { class: "tutorial-modal" }, [
      el("div", { class: "tutorial-header" }, [
        el("h2", { class: "tutorial-title", text: "How to Manage Your Guild" }),
        el("button", {
          class: "btn tutorial-close",
          text: "✕",
          onClick: () => this._closeTutorial(),
        }),
      ]),
      el("div", { class: "tutorial-body" }, [
        el("p", { class: "tutorial-intro", text: "Dungeon Debt is about managing a guild, not controlling heroes directly." }),
        el("p", { class: "tutorial-lead", text: "Your job each round:" }),
        el("div", { class: "tutorial-steps" },
          steps.map(s => el("div", { class: "tutorial-step" }, [
            el("div", { class: "tutorial-step-head" }, [
              el("span", { class: "tutorial-step-num", text: s.num }),
              el("span", { text: s.head }),
            ]),
            el("div", { class: "tutorial-step-body", text: s.body }),
          ]))
        ),
        el("p", { class: "tutorial-goal", text: "Win contracts, grow the guild, and keep debt under control." }),
        el("div", { class: "tutorial-tip" }, [
          el("span", { class: "tutorial-tip-label", text: "Tip" }),
          el("span", { text: " If unsure: hire one durable frontline hero, one damage hero, use Standard Payroll, and watch the post-combat ledger." }),
        ]),
      ]),
      el("div", { class: "tutorial-footer" }, [
        el("button", {
          class: "btn primary",
          text: "Got it",
          onClick: () => this._closeTutorial(),
        }),
      ]),
    ]);

    backdrop.appendChild(modal);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) this._closeTutorial(); });
    document.getElementById("app").appendChild(backdrop);
  }

  _closeTutorial() {
    document.getElementById("how-to-play-modal")?.remove();
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
