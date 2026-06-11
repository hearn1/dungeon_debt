import { el, clear } from "../dom.js";
import { GameRules } from "../../core/GameRules.js";
import { heroCard, appendPanelHeader } from "../components.js";
import { isInPlayerZone, getDefaultPlayerBoardPosition } from "../../combat/BoardPlacement.js";

export class FormationPanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "panel" });
    this.onDirty = null;
    this._dragHero = null; // HeroInstance currently being dragged
  }

  render() {
    clear(this.root);
    const run = this.gm.currentRunState;

    appendPanelHeader(this.root, "DEPLOYMENT", "Formation Orders", "Drag heroes onto hex tiles before combat begins.");

    // Ensure every hero has an explicit board position (fall back to slot default).
    for (const hero of run.party) {
      if (!hero.boardPosition) {
        hero.boardPosition = getDefaultPlayerBoardPosition(hero.formationSlot);
      }
    }

    this.root.appendChild(this._buildHexBoard(run));

    this.root.appendChild(el("div", { class: "panel-actions" }, [
      el("button", { class: "btn primary", text: "Approve Deployment →", onClick: () => this.gm.continueFromFormation() }),
    ]));
  }

  _buildHexBoard(run) {
    const wrap = el("div", { class: "hex-board-wrap" });
    const board = el("div", { class: "hex-board" });

    // Build a position→hero lookup for the current deployment.
    const heroAtKey = new Map();
    for (const hero of run.party) {
      if (hero.boardPosition) {
        heroAtKey.set(`${hero.boardPosition.q},${hero.boardPosition.r}`, hero);
      }
    }

    // Render the player deployment zone: q = 0..PlayerDeploymentMaxQ, r = 0..HexBoardHeight-1.
    for (let q = 0; q <= GameRules.PlayerDeploymentMaxQ; q++) {
      const col = el("div", { class: "hex-col" });
      for (let r = 0; r < GameRules.HexBoardHeight; r++) {
        const coord = { q, r };
        const key = `${q},${r}`;
        const hero = heroAtKey.get(key);
        const tile = this._buildTile(coord, hero, run);
        col.appendChild(tile);
      }
      board.appendChild(col);
    }

    wrap.appendChild(el("div", { class: "hex-board-label", text: "DEPLOYMENT ZONE  (drag to rearrange)" }));
    wrap.appendChild(board);
    return wrap;
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
      const card = el("div", { class: "hex-hero-token", draggable: true });
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
