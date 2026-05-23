// Persistent top chrome shown during a run. Mirrors RunHeaderView content:
// act seal, round progress, contract, gold/morale, prominent debt chip, relics.
import { el, clear, two } from "./dom.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { DataRepository } from "../core/DataRepository.js";

export class RunHeader {
  constructor() {
    this.root = el("header", { class: "run-header" });
    this.hide();
  }

  hide() { this.root.style.display = "none"; }
  show() { this.root.style.display = "flex"; }

  refresh(run) {
    clear(this.root);
    if (!run) { this.hide(); return; }
    this.show();

    const act = run.act <= 0 ? 1 : run.act;
    const roundWithinAct = GameRulesFns.getRoundWithinAct(act, run.round);
    const roundsInAct = GameRulesFns.getRoundsInAct(act);
    const totalRounds = GameRulesFns.getActFinalRound(GameRulesFns.totalActs);
    const accent = GameRulesFns.getActAccentColor(act);

    const primary = el("div", { class: "rh-primary" }, [
      el("div", { class: "rh-seal" }, [
        el("div", { class: "rh-seal-num", text: GameRulesFns.getActRomanNumeral(act), style: { background: accent } }),
        el("div", { class: "rh-seal-meta" }, [
          el("div", { class: "rh-seal-act", text: `ACT ${act} / ${GameRulesFns.totalActs}` }),
          el("div", { class: "rh-seal-theme", text: GameRulesFns.getActThemeWord(act).toUpperCase() }),
        ]),
      ]),
      el("div", { class: "rh-round" }, [
        el("div", { class: "rh-round-big", text: `${two(roundWithinAct)} / ${two(roundsInAct)}` }),
        el("div", { class: "rh-round-total", text: `ROUND ${two(run.round)} / ${two(totalRounds)}` }),
        el("div", { class: "rh-contract", text: `CONTRACT ${(run.difficultyDisplayName || "-").toUpperCase()}` }),
      ]),
      el("div", { class: "rh-spacer" }),
      el("div", { class: "rh-resources" }, [
        resource(run.gold, "GOLD", true),
        resource(run.morale, "MORALE", false),
      ]),
      this.debtChip(run.debt),
    ]);

    this.root.appendChild(primary);
    this.root.appendChild(this.relicStrip(run));
  }

  debtChip(debt) {
    const color = GameRulesFns.getDebtStatusColor(debt);
    const bg = GameRulesFns.getDebtStatusBackgroundColor(debt);
    return el("div", { class: "rh-debt", style: { background: bg, borderColor: color } }, [
      el("div", { class: "rh-debt-row" }, [
        el("div", { class: "rh-debt-val", text: String(debt), style: { color } }),
        el("div", { class: "rh-debt-lbl", text: "DEBT" }),
      ]),
      el("div", { class: "rh-debt-tier", text: GameRulesFns.getDebtStatusLabel(debt).toUpperCase(), style: { color } }),
    ]);
  }

  relicStrip(run) {
    const strip = el("div", { class: "rh-relics" });
    if (!run.activeRelics || run.activeRelics.length === 0) {
      strip.appendChild(el("div", { class: "rh-relics-empty", text: "NO RELICS" }));
      return strip;
    }
    for (const id of run.activeRelics) {
      const relic = DataRepository.getRelic(id);
      strip.appendChild(el("div", { class: "rh-relic-chip", text: relic.displayName, title: relic.effectDescription }));
    }
    return strip;
  }
}

function resource(value, label, isGold) {
  return el("div", { class: "rh-res" }, [
    el("div", { class: `rh-res-val${isGold ? " gold" : ""}`, text: String(value) }),
    el("div", { class: "rh-res-lbl", text: label }),
  ]);
}
