import { el, clear } from "../dom.js";
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

    this.root.appendChild(el("div", { class: "panel-head" }, [
      el("div", { class: "panel-title", text: "Race the Rivals" }),
      el("div", { class: "panel-sub", text: "Four guilds race for the same contract bonus." }),
    ]));

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
        `The ${names} claims your contract bonus. -${GameRules.RivalFinishedFirstMorale} morale each.`));
    }

    this.root.appendChild(el("div", { class: "panel-actions" }, [
      el("button", { class: "btn primary", text: "Next Round ->", onClick: () => this.gm.continueFromRivalUpdate() }),
    ]));
  }
}

function playerLane(run) {
  const progress = Math.min(GameRules.RivalRaceMaxProgress, run.round);
  return raceLane({
    name: "Your Guild",
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
