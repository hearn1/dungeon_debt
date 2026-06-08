// Listens to GameManager state changes and swaps the visible panel. Mirrors the
// Unity UIManager's job: panels never show/hide themselves.
import { el, clear } from "./dom.js";
import { GameState } from "../core/GameState.js";
import { RunHeader } from "./RunHeader.js";
import { HelpContent } from "./HelpContent.js";
import { MainMenuPanel } from "./panels/MainMenuPanel.js";
import { ScoutPanel } from "./panels/ScoutPanel.js";
import { ShopPanel } from "./panels/ShopPanel.js";
import { FormationPanel } from "./panels/FormationPanel.js";
import { PayrollPanel } from "./panels/PayrollPanel.js";
import { CombatPanel } from "./panels/CombatPanel.js";
import { RelicRewardPanel } from "./panels/RelicRewardPanel.js";
import { RivalUpdatePanel } from "./panels/RivalUpdatePanel.js";
import { EndScreenPanel } from "./panels/EndScreenPanel.js";

const HEADER_STATES = new Set([
  GameState.Scout, GameState.Shop, GameState.Formation,
  GameState.Payroll, GameState.Combat, GameState.RelicReward, GameState.RivalUpdate,
]);

export class UIManager {
  constructor(gm, rootEl) {
    this.gm = gm;
    this.header = new RunHeader();
    this.header.onHelpClick = () => this._showHelp();
    this.stage = el("div", { class: "stage" });
    this._currentState = null;

    clear(rootEl);
    rootEl.appendChild(this.header.root);
    rootEl.appendChild(this.stage);

    const refresh = () => this.header.refresh(this.gm.currentRunState);
    this.panels = {
      [GameState.MainMenu]: new MainMenuPanel(gm),
      [GameState.Scout]: new ScoutPanel(gm),
      [GameState.Shop]: new ShopPanel(gm),
      [GameState.Formation]: new FormationPanel(gm),
      [GameState.Payroll]: new PayrollPanel(gm),
      [GameState.Combat]: new CombatPanel(gm),
      [GameState.RelicReward]: new RelicRewardPanel(gm),
      [GameState.RivalUpdate]: new RivalUpdatePanel(gm),
    };
    this.endScreen = new EndScreenPanel(gm);
    for (const panel of Object.values(this.panels)) {
      if ("onDirty" in panel) panel.onDirty = refresh;
    }

    gm.onStateChanged((state) => this.handleState(state));
  }

  start() {
    this.handleState(this.gm.currentState);
  }

  handleState(state) {
    // StartRun is a transient bootstrap state; Scout follows immediately.
    if (state === GameState.StartRun) return;
    this._currentState = state;
    this._closeHelp();

    if (HEADER_STATES.has(state)) this.header.refresh(this.gm.currentRunState);
    else this.header.hide();

    clear(this.stage);

    if (state === GameState.Victory || state === GameState.Defeat) {
      this.endScreen.render(state);
      this.stage.appendChild(this.endScreen.root);
      return;
    }

    const panel = this.panels[state];
    if (!panel) return;
    panel.render(state);
    this.stage.appendChild(panel.root);
  }

  _showHelp() {
    if (document.getElementById("run-help-modal")) return;
    const content = HelpContent.get(this._currentState);
    if (!content) return;

    const backdrop = el("div", { id: "run-help-modal", class: "tutorial-backdrop" });
    const modal = el("div", { class: "tutorial-modal" }, [
      el("div", { class: "tutorial-header" }, [
        el("h2", { class: "tutorial-title", text: content.title }),
        el("button", { class: "btn tutorial-close", text: "✕", onClick: () => this._closeHelp() }),
      ]),
      el("div", { class: "tutorial-body" }, [
        el("p", { class: "tutorial-intro", text: content.body }),
      ]),
      el("div", { class: "tutorial-footer" }, [
        el("button", { class: "btn primary", text: "Got it", onClick: () => this._closeHelp() }),
      ]),
    ]);

    backdrop.appendChild(modal);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) this._closeHelp(); });
    document.getElementById("app").appendChild(backdrop);
  }

  _closeHelp() {
    document.getElementById("run-help-modal")?.remove();
  }
}
