import { el, clear } from "../dom.js";

export class BoardRenderer {
  constructor({
    rootClass = "hex-board-wrap",
    boardClass = "hex-board",
    labelText = "",
  } = {}) {
    this.root = el("div", { class: rootClass });
    this.board = el("div", { class: boardClass });
    this._boardClass = boardClass;
    this.layers = new Map();

    if (labelText) {
      this.root.appendChild(el("div", { class: "hex-board-label", text: labelText }));
    }
    this.root.appendChild(this.board);
  }

  renderColumnGrid({ qStart = 0, qEnd, rStart = 0, rEnd, buildTile }) {
    clear(this.board);
    for (let q = qStart; q <= qEnd; q++) {
      const col = el("div", { class: "hex-col" });
      for (let r = rStart; r < rEnd; r++) {
        col.appendChild(buildTile({ q, r }));
      }
      this.board.appendChild(col);
    }
    return this.board;
  }

  renderProjectedGrid({ coords, getBoardSize, projectTile, buildTile }) {
    clear(this.board);
    this.board.className = `${this._boardClass} projected`;

    const size = getBoardSize();
    this.board.style.width = `${size.width}px`;
    this.board.style.height = `${size.height}px`;

    for (const coord of coords) {
      const tile = buildTile(coord);
      const position = projectTile(coord);
      tile.style.left = `${position.x}px`;
      tile.style.top = `${position.y}px`;
      this.board.appendChild(tile);
    }
    return this.board;
  }

  addLayer(name, className) {
    const layer = el("div", { class: className });
    this.layers.set(name, layer);
    this.root.appendChild(layer);
    return layer;
  }

  getLayer(name) {
    return this.layers.get(name) || null;
  }

  destroy() {
    this.layers.clear();
    if (this.root.parentNode) this.root.parentNode.removeChild(this.root);
    clear(this.root);
  }
}
