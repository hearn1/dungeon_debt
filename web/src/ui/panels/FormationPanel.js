import { el, clear } from "../dom.js";
import { GameRules } from "../../core/GameRules.js";
import { heroCard, appendPanelHeader } from "../components.js";

export class FormationPanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "panel" });
    this.onDirty = null;
    this._selected = null;
  }

  render() {
    clear(this.root);
    const run = this.gm.currentRunState;

    appendPanelHeader(this.root, "FORMATION", "Formation", "Click two slots to swap. Frontline is targeted first.");

    const bySlot = new Map();
    for (const h of run.party) bySlot.set(h.formationSlot, h);

    const frontline = el("div", { class: "slot-row" });
    for (let s = 0; s < GameRules.FrontlineSlots; s++) frontline.appendChild(this.slot(s, bySlot.get(s)));

    const backline = el("div", { class: "slot-row" });
    for (let s = GameRules.FrontlineSlots; s < GameRules.MaxPartySize; s++) backline.appendChild(this.slot(s, bySlot.get(s)));

    this.root.appendChild(el("div", { class: "formation" }, [
      el("div", { class: "formation-zone" }, [
        el("div", { class: "formation-zone-lbl", text: "FRONTLINE" }),
        frontline,
      ]),
      el("div", { class: "formation-zone" }, [
        el("div", { class: "formation-zone-lbl", text: "BACKLINE" }),
        backline,
      ]),
    ]));

    this.root.appendChild(el("div", { class: "panel-actions" }, [
      el("button", { class: "btn primary", text: "To Payroll →", onClick: () => this.gm.continueFromFormation() }),
    ]));
  }

  slot(slotIndex, hero) {
    const selected = this._selected === slotIndex;
    const node = el("div", {
      class: `slot${hero ? " filled" : ""}${selected ? " selected" : ""}`,
      onClick: () => this.onSlotClick(slotIndex),
    });
    if (hero) node.appendChild(heroCard(hero.definition, hero, {}));
    else node.textContent = "Empty";
    return node;
  }

  onSlotClick(slotIndex) {
    if (this._selected === null) {
      this._selected = slotIndex;
    } else if (this._selected === slotIndex) {
      this._selected = null;
    } else {
      this.gm.runManager.swapPartySlots(this._selected, slotIndex);
      this._selected = null;
    }
    this.render();
    this.onDirty?.();
  }
}
