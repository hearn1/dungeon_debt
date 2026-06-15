import { el, clear } from "../dom.js";
import { GameRules } from "../../core/GameRules.js";
import { appendPanelHeader } from "../components.js";
import { isInPlayerZone, getDefaultPlayerBoardPosition } from "../../combat/BoardPlacement.js";
import { BoardRenderer } from "../board/BoardRenderer.js";
import { BoardProjectionMode, getProjectedBoardSize, projectBoardTile } from "../board/BoardProjection.js";
import { resolveUnitVisual } from "../UnitVisualCatalog.js";
import { DataRepository } from "../../core/DataRepository.js";
import { PayrollActionId } from "../../data/enums.js";

const ACTION_PREVIEWS = {
  [PayrollActionId.TakeLoan]: [
    { label: "Gold",   value: `+${GameRules.LoanGoldGain} now` },
    { label: "Debt",   value: `+${GameRules.LoanDebtCost} now` },
    { label: "Morale", value: "no change" },
    { label: "Combat", value: "no stat change" },
    { label: "Risk",   value: "raises debt before the fight" },
  ],
  [PayrollActionId.CutWages]: [
    { label: "Gold",   value: `saves up to ${GameRules.CutWagesUpkeepReduction} wages after combat` },
    { label: "Debt",   value: "may prevent wage shortfall" },
    { label: "Morale", value: "no change" },
    { label: "Combat", value: `all heroes -${GameRules.CutWagesAttackPenalty} attack this fight` },
    { label: "Risk",   value: "lower combat power" },
  ],
  [PayrollActionId.PromiseVictoryBonus]: [
    { label: "Gold",   value: `pay ${GameRules.VictoryBonusGoldCost} only if you win` },
    { label: "Debt",   value: `+${GameRules.VictoryBonusDebtOnLoss} if you lose; unpaid win bonus becomes debt` },
    { label: "Morale", value: "no change" },
    { label: "Combat", value: `all heroes +${GameRules.VictoryBonusAttackBuff} attack this fight` },
    { label: "Risk",   value: "debt pressure if you lose or cannot afford the payout" },
  ],
  [PayrollActionId.StandardPay]: [
    { label: "Gold",   value: "no change" },
    { label: "Debt",   value: "no change" },
    { label: "Morale", value: "no change" },
    { label: "Combat", value: "no bonus or penalty" },
    { label: "Risk",   value: "none" },
  ],
};

export class FormationPanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "panel" });
    this.onDirty = null;
    this._dragHero = null;
    this._boardRenderer = null;
    this._step = 'deployment'; // 'deployment' | 'payroll'
    this._payrollSelected = null;
  }

  render(state) {
    clear(this.root);
    this._boardRenderer?.destroy();
    this._boardRenderer = null;
    const run = this.gm.currentRunState;

    // Reset to deployment step when UIManager transitions to this panel (called with state arg).
    // Internal re-renders from drops or step buttons call render() with no arg and keep _step.
    if (state !== undefined) {
      this._step = 'deployment';
      this._payrollSelected = run.selectedPayrollAction ?? null;
    }

    // Ensure every hero has an explicit board position (fall back to slot default).
    for (const hero of run.party) {
      if (!hero.boardPosition) {
        hero.boardPosition = getDefaultPlayerBoardPosition(hero.formationSlot);
      }
    }

    if (this._step === 'payroll') {
      this._renderPayrollStep(run);
    } else {
      this._renderDeploymentStep(run);
    }
  }

  _renderDeploymentStep(run) {
    appendPanelHeader(this.root, "DEPLOYMENT", "Formation Orders", "Step 1 of 2 — Drag heroes onto hex tiles. Payroll follows.");
    this.root.appendChild(this._buildHexBoard(run));
    this.root.appendChild(el("div", { class: "panel-actions" }, [
      el("button", {
        class: "btn primary",
        text: "Next: Payroll →",
        onClick: () => {
          this._step = 'payroll';
          this.render();
        },
      }),
    ]));
  }

  _renderPayrollStep(run) {
    this._payrollSelected = run.selectedPayrollAction ?? null;
    appendPanelHeader(this.root, "PAYROLL", "Payroll Desk", "Step 2 of 2 — Choose this round's payroll policy before the party enters danger.");

    const grid = el("div", { class: "card-grid" });
    for (const action of DataRepository.allPayrollActions) {
      const isSel = this._payrollSelected === action.id;
      const preview = ACTION_PREVIEWS[action.id] ?? [];
      grid.appendChild(el("button", {
        class: `btn difficulty-card${isSel ? " primary" : ""}`,
        onClick: () => {
          this._payrollSelected = action.id;
          this.gm.selectPayrollAction(action.id);
          this.render();
        },
      }, [
        el("div", { class: "d-name", text: action.displayName }),
        el("div", { class: "d-desc", text: action.description }),
        el("div", { class: "payroll-preview" }, preview.map((row) => {
          const isActiveRisk = row.label === "Risk" && row.value !== "none";
          return el("div", { class: "payroll-preview-row" }, [
            el("span", { class: "payroll-preview-label", text: row.label }),
            el("span", { class: `payroll-preview-value${isActiveRisk ? " risk" : ""}`, text: row.value }),
          ]);
        })),
      ]));
    }
    this.root.appendChild(grid);

    this.root.appendChild(el("div", { class: "panel-actions" }, [
      el("button", {
        class: "btn",
        text: "← Deployment",
        onClick: () => {
          this._step = 'deployment';
          this.render();
        },
      }),
      el("button", {
        class: "btn primary",
        text: "Authorize Contract Run →",
        disabled: this._payrollSelected === null ? "" : null,
        onClick: () => { this.onDirty?.(); this.gm.continueFromPayroll(); },
      }),
    ]));
  }

  _buildHexBoard(run) {
    const renderer = new BoardRenderer({
      labelText: "DEPLOYMENT ZONE  (drag to rearrange)",
    });
    this._boardRenderer = renderer;

    // Build a position→hero lookup for the current deployment.
    const heroAtKey = new Map();
    for (const hero of run.party) {
      if (hero.boardPosition) {
        heroAtKey.set(`${hero.boardPosition.q},${hero.boardPosition.r}`, hero);
      }
    }

    const coords = [];
    for (let q = 0; q <= GameRules.PlayerDeploymentMaxQ; q++) {
      for (let r = 0; r < GameRules.HexBoardHeight; r++) coords.push({ q, r });
    }
    const projectionOptions = { mode: BoardProjectionMode.BottomTop };
    renderer.renderProjectedGrid({
      coords,
      getBoardSize: () => getProjectedBoardSize(projectionOptions),
      projectTile: (coord) => projectBoardTile(coord, projectionOptions),
      buildTile: (coord) => {
        const key = `${coord.q},${coord.r}`;
        const hero = heroAtKey.get(key);
        return this._buildTile(coord, hero, run);
      },
    });

    return renderer.root;
  }

  _buildTile(coord, hero, run) {
    const tile = el("div", {
      class: `hex-tile${hero ? " occupied" : " empty"}`,
      title: `(${coord.q},${coord.r})`,
    });

    tile.dataset.q = coord.q;
    tile.dataset.r = coord.r;

    // Drop target — accept drags from other tiles.
    tile.addEventListener("dragover", (e) => {
      e.preventDefault();
      tile.classList.add("drag-over");
    });
    tile.addEventListener("dragleave", () => tile.classList.remove("drag-over"));
    tile.addEventListener("drop", (e) => {
      e.preventDefault();
      tile.classList.remove("drag-over");
      this._onDrop(coord, run);
    });

    if (hero) {
      const visual = resolveUnitVisual(hero);
      const card = el("div", {
        class: `hex-hero-token ${visual.cssClass}`,
        draggable: true,
        dataset: {
          visualGroup: visual.group,
          visualKind: visual.kind,
        },
      });
      card.style.setProperty("--unit-visual-color", `#${visual.color.toString(16).padStart(6, "0")}`);
      card.appendChild(el("div", { class: "hex-hero-visual" }, [
        el("img", { class: "hex-hero-portrait", src: visual.portraitUrl, alt: "" }),
      ]));
      card.appendChild(el("div", { class: "hex-hero-name", text: hero.definition.displayName }));

      card.addEventListener("dragstart", (e) => {
        e.dataTransfer.effectAllowed = "move";
        this._dragHero = hero;
      });
      card.addEventListener("dragend", () => { this._dragHero = null; });
      tile.appendChild(card);
    }

    return tile;
  }

  _onDrop(destCoord, run) {
    const dragged = this._dragHero;
    if (!dragged) return;

    // Reject drops outside player deployment zone.
    if (!isInPlayerZone(destCoord)) return;

    // Swap if another hero already occupies the destination.
    const occupant = run.party.find(h =>
      h !== dragged &&
      h.boardPosition &&
      h.boardPosition.q === destCoord.q &&
      h.boardPosition.r === destCoord.r
    );

    if (occupant) {
      const origCoord = dragged.boardPosition;
      occupant.boardPosition = { ...origCoord };
    }

    dragged.boardPosition = { ...destCoord };
    this._dragHero = null;
    this.render();
    this.onDirty?.();
  }
}
