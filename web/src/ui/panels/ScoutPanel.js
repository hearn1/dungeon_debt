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

    const raceActions = el("div", { class: "scout-race-actions" });
    const progress = run.playerRaceProgress;
    raceActions.appendChild(el("div", { class: "scout-race-header", text: `RACE — ${progress}/${GameRules.RivalRaceMaxProgress}` }));

    const rushUsed = run.usedRaceActions.has("rushAhead");
    const bribeUsed = run.usedRaceActions.has("bribeGuide");

    if (!rushUsed) {
      raceActions.appendChild(el("button", {
        class: "btn secondary", text: `Rush Ahead  (-${GameRules.RushAheadMoraleCost} morale, +1 progress)`,
        onClick: () => { this.gm.applyRaceAction("rushAhead"); this.render(); },
      }));
    } else {
      raceActions.appendChild(el("div", { class: "scout-race-done", text: "✓ Rush Ahead used" }));
    }

    if (!bribeUsed) {
      raceActions.appendChild(el("button", {
        class: "btn secondary",
        text: `Bribe Guide  (${GameRules.BribeGuideGoldCost}g or +${GameRules.BribeGuideDebtFallback} debt, +1 progress)`,
        onClick: () => { this.gm.applyRaceAction("bribeGuide"); this.render(); },
      }));
    } else {
      raceActions.appendChild(el("div", { class: "scout-race-done", text: "✓ Bribe Guide used" }));
    }

    this.root.appendChild(raceActions);
    this.root.appendChild(el("div", { class: "panel-actions" }, [
      el("button", { class: "btn primary", text: "To the Shop →", onClick: () => this.gm.continueFromScout() }),
    ]));
  }
}
