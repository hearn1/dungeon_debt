// Listens to GameManager state changes and swaps the visible panel. Mirrors the
// Unity UIManager's job: panels never show/hide themselves.
import { el, clear } from "./dom.js";
import { GameState } from "../core/GameState.js";
import { RunHeader } from "./RunHeader.js";
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
    this.stage = el("div", { class: "stage" });

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
}
