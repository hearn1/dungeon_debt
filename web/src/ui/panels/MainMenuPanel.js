import { el, clear } from "../dom.js";
import { appendPanelHeader } from "../components.js";
import { DataRepository } from "../../core/DataRepository.js";
import { GameRules } from "../../core/GameRules.js";
import { Settings } from "../../core/Settings.js";

const APP_VERSION = "0.1.0";

export class MainMenuPanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "overlay" });
    this._selectedLevel = this._resolveInitialLevel();
    this._devEnableAct3 = false;
    this._resetConfirming = false;
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

    this.root.appendChild(this._renderResetProgress());

    const menuFooter = el("div", { class: "menu-footer" });
    menuFooter.appendChild(el("button", {
      class: "btn how-to-play-btn",
      text: "How to Play",
      onClick: () => this._showTutorial(),
    }));
    menuFooter.appendChild(el("button", {
      class: "btn how-to-play-btn",
      text: "Report Feedback",
      onClick: () => this._showFeedback(),
    }));
    menuFooter.appendChild(el("button", {
      class: "btn how-to-play-btn",
      text: "Settings",
      onClick: () => this._showSettings(),
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

  _resolveInitialLevel() {
    const saved = this.gm.getLastSelectedDifficulty();
    const difficulty = DataRepository.getDifficultyLevel(saved);
    if (!difficulty || this._isLevelLockedForDifficulty(difficulty)) {
      return GameRules.DefaultDifficultyLevel;
    }
    return saved;
  }

  _isLevelLockedForDifficulty(difficulty) {
    if (!difficulty.isImplemented) return true;
    if (difficulty.level === 0) return false;
    return difficulty.level > this.gm.highestBeatenDifficulty + 1;
  }

  _isLevelLocked(difficulty) {
    return this._isLevelLockedForDifficulty(difficulty);
  }

  _getLockedLabel(difficulty) {
    if (!difficulty.isImplemented) return "Coming soon.";
    return "Clear Level " + (difficulty.level - 1) + " contract to unlock.";
  }

  _selectLevel(level) {
    const difficulty = DataRepository.getDifficultyLevel(level);
    if (!difficulty || this._isLevelLocked(difficulty)) return;
    this._selectedLevel = level;
    this.gm.recordSelectedDifficulty(level);
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

  _renderResetProgress() {
    const wrapper = el("div", { class: "reset-progress-area" });
    if (!this._resetConfirming) {
      wrapper.appendChild(el("button", {
        class: "btn reset-progress-btn",
        text: "Reset Progress",
        onClick: () => {
          this._resetConfirming = true;
          this.render();
        },
      }));
    } else {
      wrapper.appendChild(el("div", { class: "subtitle", text: "Reset difficulty unlocks and saved menu settings?" }));
      const btnRow = el("div", { class: "reset-confirm-row" });
      btnRow.appendChild(el("button", {
        class: "btn danger",
        text: "Confirm Reset",
        onClick: () => {
          this.gm.resetProgress();
          this._selectedLevel = GameRules.DefaultDifficultyLevel;
          this._resetConfirming = false;
          this.render();
        },
      }));
      btnRow.appendChild(el("button", {
        class: "btn",
        text: "Cancel",
        onClick: () => {
          this._resetConfirming = false;
          this.render();
        },
      }));
      wrapper.appendChild(btnRow);
    }
    return wrapper;
  }

  _showTutorial() {
    if (document.getElementById("how-to-play-modal")) return;

    const steps = [
      { num: "1", head: "Review the Contract", body: "Scout the next fight, enemy roster, and payout before spending." },
      { num: "2", head: "Recruit Adventurers", body: "Use gold to sign new heroes, promote duplicates, reroll candidates, or pay down debt." },
      { num: "3", head: "Set Formation", body: "Frontline slots are targeted first. Put durable heroes up front and fragile damage/support heroes in back." },
      { num: "4", head: "Choose Payroll", body: "Standard pay is safe. Loans give gold but add debt. Cutting wages saves money but weakens the party. Victory bonuses cost gold for temporary power." },
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

  _showFeedback() {
    if (document.getElementById("feedback-modal")) return;

    const items = [
      "What you expected",
      "What happened instead",
      "The act and round you were on",
      "Your roster, gold, debt, and morale if relevant",
      "Screenshot if possible",
      `Build version: Dungeon Debt v${APP_VERSION}`,
    ];

    const backdrop = el("div", { id: "feedback-modal", class: "tutorial-backdrop" });
    const modal = el("div", { class: "tutorial-modal" }, [
      el("div", { class: "tutorial-header" }, [
        el("h2", { class: "tutorial-title", text: "Report Feedback or Bugs" }),
        el("button", {
          class: "btn tutorial-close",
          text: "✕",
          onClick: () => this._closeFeedback(),
        }),
      ]),
      el("div", { class: "tutorial-body" }, [
        el("p", { class: "tutorial-intro", text: "Please include:" }),
        el("ul", { class: "tutorial-steps" },
          items.map(item => el("li", { class: "tutorial-step-body", text: item }))
        ),
        el("p", { class: "tutorial-goal", text: "Send this information to the developer with the build version above." }),
      ]),
      el("div", { class: "tutorial-footer" }, [
        el("button", {
          class: "btn primary",
          text: "Got it",
          onClick: () => this._closeFeedback(),
        }),
      ]),
    ]);

    backdrop.appendChild(modal);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) this._closeFeedback(); });
    document.getElementById("app").appendChild(backdrop);
  }

  _closeFeedback() {
    document.getElementById("feedback-modal")?.remove();
  }

  _showSettings() {
    if (document.getElementById("settings-modal")) return;

    const backdrop = el("div", { id: "settings-modal", class: "tutorial-backdrop" });
    const modal = el("div", { class: "tutorial-modal" }, [
      el("div", { class: "tutorial-header" }, [
        el("h2", { class: "tutorial-title", text: "Settings" }),
        el("button", {
          class: "btn tutorial-close",
          text: "✕",
          onClick: () => this._closeSettings(),
        }),
      ]),
      el("div", { class: "tutorial-body" }, [
        this._buildSettingRow(
          "Animation Speed",
          "Controls how fast combat animations play.",
          ["normal", "fast"],
          ["Normal", "Fast"],
          Settings.animationSpeed,
          (v) => Settings.setAnimationSpeed(v),
        ),
        this._buildSettingRow(
          "Reduced Motion",
          "Disables all UI animations for motion sensitivity.",
          ["false", "true"],
          ["Off", "On"],
          String(Settings.reducedMotion),
          (v) => Settings.setReducedMotion(v === "true"),
        ),
      ]),
      el("div", { class: "tutorial-footer" }, [
        el("button", {
          class: "btn primary",
          text: "Done",
          onClick: () => this._closeSettings(),
        }),
      ]),
    ]);

    backdrop.appendChild(modal);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) this._closeSettings(); });
    document.getElementById("app").appendChild(backdrop);
  }

  _buildSettingRow(label, description, values, labels, currentValue, onChange) {
    const row = el("div", { class: "setting-row" }, [
      el("div", { class: "setting-row-label" }, [
        el("div", { class: "setting-row-name", text: label }),
        el("div", { class: "setting-row-desc", text: description }),
      ]),
      el("div", { class: "setting-row-options" },
        values.map((v, i) => {
          const btn = el("button", {
            class: `btn setting-option${v === currentValue ? " primary" : ""}`,
            text: labels[i],
            onClick: () => {
              onChange(v);
              const modal = document.getElementById("settings-modal");
              if (modal) modal.remove();
              this._showSettings();
            },
          });
          return btn;
        })
      ),
    ]);
    return row;
  }

  _closeSettings() {
    document.getElementById("settings-modal")?.remove();
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
