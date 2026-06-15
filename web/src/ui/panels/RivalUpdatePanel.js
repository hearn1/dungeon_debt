import { el, clear } from "../dom.js";
import { appendPanelHeader } from "../components.js";
import { GameRules, GameRulesFns } from "../../core/GameRules.js";

export class RivalUpdatePanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "panel" });
    this.onDirty = null;
  }

  render() {
    clear(this.root);
    const run = this.gm.currentRunState;

    appendPanelHeader(this.root, "RIVAL LEDGER", "Rival Contract Race", "Competing guilds are chasing the same contract bonus.");

    const list = el("div", { class: "rival-list" });
    list.appendChild(playerLane(run));
    for (const rival of run.rivals) {
      list.appendChild(rivalLane(run, rival));
    }
    this.root.appendChild(list);

    if (run.rivalRaceFinishesThisRound.length > 0) {
      const names = run.rivals
        .filter((rival) => run.rivalRaceFinishesThisRound.includes(rival.guild))
        .map((rival) => rival.displayName)
        .join(", ");
      this.root.appendChild(el("div", { class: "rival-race-finished" },
        `The ${names} filed first and claims your contract bonus. -${GameRules.RivalFinishedFirstMorale} morale each.`));
    }

    const raceActions = el("div", { class: "scout-race-actions" });
    const progress = run.playerRaceProgress;
    raceActions.appendChild(el("div", { class: "scout-race-header", text: `CONTRACT RACE — ${progress}/${GameRules.RivalRaceMaxProgress}` }));

    const rushUsed = run.usedRaceActions.has("rushAhead");
    const bribeUsed = run.usedRaceActions.has("bribeGuide");

    if (!rushUsed) {
      raceActions.appendChild(el("button", {
        class: "btn secondary", text: `Rush the Paperwork  (-${GameRules.RushAheadMoraleCost} morale, +1 progress)`,
        onClick: () => { this.gm.applyRaceAction("rushAhead"); this.render(); },
      }));
    } else {
      raceActions.appendChild(el("div", { class: "scout-race-done", text: "✓ Rush order filed" }));
    }

    if (!bribeUsed) {
      raceActions.appendChild(el("button", {
        class: "btn secondary",
        text: `Expedite with Guide  (${GameRules.BribeGuideGoldCost}g or +${GameRules.BribeGuideDebtFallback} debt, +1 progress)`,
        onClick: () => { this.gm.applyRaceAction("bribeGuide"); this.render(); },
      }));
    } else {
      raceActions.appendChild(el("div", { class: "scout-race-done", text: "✓ Guide retainer paid" }));
    }

    this.root.appendChild(raceActions);

    this.root.appendChild(el("div", { class: "panel-actions" }, [
      el("button", { class: "btn primary", text: "Open Next Contract →", onClick: () => this.gm.continueFromRivalUpdate() }),
    ]));
  }
}

function playerLane(run) {
  const progress = Math.min(GameRules.RivalRaceMaxProgress, run.playerRaceProgress || run.round);
  return raceLane({
    name: "Your Guild Office",
    progress,
    color: "var(--dd-rust-accent)",
    meta: progress >= GameRules.RivalRaceMaxProgress ? "FINISHED" : `Projected round ${GameRules.RivalRaceMaxProgress}`,
    finished: progress >= GameRules.RivalRaceMaxProgress,
  });
}

function rivalLane(run, rival) {
  const color = GameRulesFns.getRivalGuildColor(rival.guild);
  const finished = rival.progress >= GameRules.RivalRaceMaxProgress;
  const projected = finished
    ? `FINISHED round ${rival.finishedAtRound || run.round}`
    : `Projected round ${GameRulesFns.getRivalRaceProjectedFinishRound(rival.guild, run.round, rival.progress, rival)}`;

  return raceLane({
    name: rival.displayName,
    progress: rival.progress,
    color,
    meta: projected,
    finished,
  });
}

function raceLane({ name, progress, color, meta, finished }) {
  const clamped = Math.max(0, Math.min(GameRules.RivalRaceMaxProgress, progress));
  const percent = (clamped / GameRules.RivalRaceMaxProgress) * 100;
  const progressText = `${formatProgress(clamped)} / ${GameRules.RivalRaceMaxProgress}`;

  return el("div", { class: `rival-race-lane${finished ? " finished" : ""}` }, [
    el("div", { class: "rival-race-top" }, [
      el("div", { class: "rival-name", text: name }),
      el("div", { class: "rival-race-meta", text: meta }),
    ]),
    el("div", { class: "rival-race-track" }, [
      el("div", { class: "rival-race-bar", style: { width: `${percent}%`, background: color } }),
    ]),
    el("div", { class: "rival-race-progress", text: progressText }),
  ]);
}

function formatProgress(value) {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}
