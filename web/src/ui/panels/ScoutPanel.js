import { el, clear } from "../dom.js";
import { appendPanelHeader } from "../components.js";
import { GameRules, GameRulesFns } from "../../core/GameRules.js";
import { EncounterType } from "../../data/enums.js";

export class ScoutPanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "panel" });
  }

  render() {
    clear(this.root);
    const run = this.gm.currentRunState;
    const enc = run ? run.currentEncounter : null;

    appendPanelHeader(this.root, "SCOUT", "Scout", enc ? GameRulesFns.getEncounterKindLabel(enc) : "");

    if (!enc) {
      this.root.appendChild(el("div", { class: "panel-sub", text: "No encounter." }));
      return;
    }

    const capstone = GameRulesFns.isCapstoneEncounter(enc);
    const isRival = enc.type === EncounterType.RivalGhost && !capstone;
    const isBoss = enc.type === EncounterType.FinalBoss;

    // Top cue strip — capstone signals a relic reward; rival fights show the guild.
    if (capstone) {
      this.root.appendChild(el("div", { class: "scout-cue capstone",
        text: `★ CAPSTONE — choose 1 of ${GameRules.RelicChoiceCount} relics on victory` }));
    } else if (isRival) {
      const color = GameRulesFns.getRivalGuildColor(enc.rivalGuild);
      this.root.appendChild(el("div", { class: "scout-cue rival", style: { borderColor: color, color } },
        [`vs ${enc.rivalGuild.toUpperCase()} GUILD`]));
    } else if (isBoss) {
      this.root.appendChild(el("div", { class: "scout-cue capstone", text: "★ FINAL BOSS" }));
    }

    const card = el("div", { class: `scout-card${capstone ? " capstone-card" : ""}` }, [
      el("div", { class: "scout-kind", text: enc.dangerCategory }),
      el("div", { class: "panel-title", text: enc.displayName }),
      el("div", { class: "scout-text", text: enc.scoutText }),
    ]);

    // Reward preview.
    card.appendChild(el("div", { class: "scout-reward-row" }, [
      el("span", { class: "panel-sub", text: "REWARD" }),
      el("span", { class: "uc-cost", text: `+${enc.baseGoldReward}g${isRival ? ` (+${GameRules.RivalWinBonus} rival bonus)` : ""}` }),
    ]));

    const enemies = el("div", {});
    enemies.appendChild(el("div", { class: "combat-side-lbl", text: `ENEMY LINEUP · ${enc.enemies.length}` }));
    for (const e of enc.enemies) {
      enemies.appendChild(el("div", { class: "enemy-line" }, [
        el("span", { text: e.displayName }),
        el("span", { class: "panel-sub", text: `${e.attack} ATK · ${e.health} HP` }),
      ]));
    }
    card.appendChild(enemies);
    this.root.appendChild(card);

    this.root.appendChild(el("div", { class: "panel-actions" }, [
      el("button", { class: "btn primary", text: "To the Shop →", onClick: () => this.gm.continueFromScout() }),
    ]));
  }
}
