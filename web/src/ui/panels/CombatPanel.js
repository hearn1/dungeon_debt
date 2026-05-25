import { el, clear } from "../dom.js";
import { GameRules, GameRulesFns } from "../../core/GameRules.js";
import { CombatReplayEventKind } from "../../data/CombatReplayEvent.js";
import { statusPills, hpBar } from "../components.js";

const STEP_MS = 280;

export class CombatPanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "panel" });
    this.onDirty = null;
    this._timer = null;
  }

  render() {
    clear(this.root);
    this._clearTimer();

    const run = this.gm.currentRunState;
    const encounter = run.currentEncounter;

    // Resolve the fight up front; replay its log for presentation only.
    this._result = this.gm.resolveCombat();
    this.onDirty?.(); // gold/debt changed during post-combat

    this.root.appendChild(el("div", { class: "panel-head" }, [
      el("div", { class: "panel-title", text: "Combat" }),
      el("div", { class: "panel-sub", text: encounter ? encounter.displayName : "" }),
    ]));

    // Build the board: trapezoidal vertical stack facing the opposing side.
    //   enemy backline → enemy frontline → divider → player frontline → player backline
    this._units = new Map();
    const enemyBlock = el("div", { class: "combat-side enemy" }, [
      el("div", { class: "combat-side-lbl", text: "ENEMIES" }),
      this._buildRow(this._result.enemyStartUnits, false, false),
      this._buildRow(this._result.enemyStartUnits, false, true),
    ]);
    const playerBlock = el("div", { class: "combat-side player" }, [
      this._buildRow(this._result.playerStartUnits, true, true),
      this._buildRow(this._result.playerStartUnits, true, false),
      el("div", { class: "combat-side-lbl", text: "YOUR GUILD" }),
    ]);
    this.root.appendChild(el("div", { class: "combat-board" }, [
      enemyBlock,
      el("div", { class: "combat-divider" }),
      playerBlock,
    ]));

    this._log = el("div", { class: "combat-log" });
    this.root.appendChild(this._log);

    this._actions = el("div", { class: "panel-actions" }, [
      el("button", { class: "btn", text: "Skip ▶▶", onClick: () => this._finish() }),
    ]);
    this.root.appendChild(this._actions);

    // Begin timed replay.
    this._eventIndex = 0;
    this._timer = setInterval(() => this._tick(), STEP_MS);
  }

  _buildRow(units, isPlayer, isFrontline) {
    const row = el("div", { class: `combat-row ${isFrontline ? "front" : "back"}` });
    const filtered = units.filter(u => isFrontline
      ? u.slot < GameRules.FrontlineSlots
      : u.slot >= GameRules.FrontlineSlots);
    filtered.sort((a, b) => a.slot - b.slot);
    for (const u of filtered) {
      const node = el("div", { class: "combat-unit" });
      this._units.set(this._key(isPlayer, u.slot), { node, max: u.maxHealth });
      this._paintUnit(node, u.displayName, u.currentHealth, u.maxHealth, u.statuses.activeStatuses);
      row.appendChild(node);
    }
    return row;
  }

  _paintUnit(node, name, hp, max, statuses) {
    clear(node);
    node.classList.toggle("dead", hp <= 0);
    node.appendChild(el("div", { class: "cu-head" }, [
      el("span", { text: name }),
      el("span", { class: "cu-hp", text: `${hp}/${max}` }),
    ]));
    node.appendChild(hpBar(hp, max));
    node.appendChild(statusPills(statuses || []));
  }

  _tick() {
    const events = this._result.replayEvents;
    if (this._eventIndex >= events.length) {
      this._finish();
      return;
    }
    const evt = events[this._eventIndex++];
    this._applyEvent(evt);
  }

  _applyEvent(evt) {
    // Highlight the attacker briefly.
    this._clearActing();
    if (evt.kind === CombatReplayEventKind.Attack || evt.kind === CombatReplayEventKind.Heal) {
      const attacker = this._units.get(this._key(evt.attackerIsPlayerSide, evt.attackerSlot));
      if (attacker) attacker.node.classList.add("acting");
    }

    // Update the affected target unit from the event snapshot.
    if (evt.kind !== CombatReplayEventKind.Message) {
      const target = this._units.get(this._key(evt.targetIsPlayerSide, evt.targetSlot));
      if (target) {
        const name = target.node.querySelector(".cu-head span")?.textContent
          || evt.logText;
        this._paintUnit(target.node, name, evt.targetHealthAfter, evt.targetMaxHealth || target.max, evt.targetStatuses);
        // Flash on damage (attack with non-zero amount or status damage tick).
        const isDamage = (evt.kind === CombatReplayEventKind.Attack && evt.amount > 0)
          || evt.kind === CombatReplayEventKind.StatusDamage;
        const isHeal = evt.kind === CombatReplayEventKind.Heal;
        if (isDamage || isHeal) {
          const cls = isHeal ? "flash-heal" : "flash-hit";
          target.node.classList.remove(cls);
          // Force reflow so re-adding the class restarts the animation.
          void target.node.offsetWidth;
          target.node.classList.add(cls);
        }
      }
    }

    this._appendLog(evt.logText);
  }

  _appendLog(text) {
    const cls = text === "Player wins!" ? "line win" : text === "Player loses." || text.startsWith("Combat lost") ? "line loss" : "line";
    this._log.appendChild(el("div", { class: cls, text }));
    this._log.scrollTop = this._log.scrollHeight;
  }

  _finish() {
    this._clearTimer();
    // Flush any remaining events instantly.
    const events = this._result.replayEvents;
    while (this._eventIndex < events.length) {
      this._applyEvent(events[this._eventIndex++]);
    }
    this._clearActing();
    this._renderSummary();
  }

  _renderSummary() {
    const run = this.gm.currentRunState;
    clear(this._actions);

    const summary = el("div", { class: "summary" });
    const won = this._result.playerWon;
    summary.appendChild(el("div", { class: "summary-row" }, [
      el("strong", { text: won ? "Victory" : "Defeat", class: won ? "pos" : "neg" }),
      el("span", { class: "panel-sub", text: `${this._result.combatRoundsElapsed} combat rounds` }),
    ]));
    summary.appendChild(row("Reward gold", `+${run.latestRewardGold}`, "pos"));
    if (run.latestRelicRewardGold > 0) summary.appendChild(row("  (relic bonus)", `+${run.latestRelicRewardGold}`, "pos"));
    if (run.latestMoraleChange !== 0) summary.appendChild(row("Morale", `${run.latestMoraleChange}`, "neg"));
    summary.appendChild(row("Upkeep paid", `−${run.latestUpkeepPaid} / ${run.latestTotalUpkeep}`));
    if (run.latestUpkeepShortfall > 0) summary.appendChild(row("Upkeep shortfall → debt", `+${run.latestUpkeepShortfall}`, "neg"));
    summary.appendChild(row("Interest paid", `−${run.latestInterestPaid} / ${run.latestInterestCharged}`));
    if (run.latestInterestAddedToDebt > 0) summary.appendChild(row("Interest → debt", `+${run.latestInterestAddedToDebt}`, "neg"));
    if (run.latestPayrollSummary) summary.appendChild(row("Payroll", run.latestPayrollSummary));
    if (run.latestVeterancySummary) summary.appendChild(row("Veterancy", run.latestVeterancySummary));
    summary.appendChild(el("hr", { style: { border: "none", borderTop: "1px solid var(--rule)" } }));
    summary.appendChild(row("Gold", String(run.gold)));
    summary.appendChild(row("Debt", `${run.debt} (${GameRulesFns.getDebtStatusLabel(run.debt)})`));
    summary.appendChild(row("Morale", String(run.morale)));

    this.root.insertBefore(summary, this._actions);

    this._actions.appendChild(el("button", {
      class: "btn primary", text: "Continue →",
      onClick: () => { this.onDirty?.(); this.gm.continueAfterReward(); },
    }));
  }

  _clearActing() {
    if (!this._units) return;
    for (const { node } of this._units.values()) node.classList.remove("acting");
  }

  _clearTimer() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }

  _key(isPlayer, slot) { return `${isPlayer ? "p" : "e"}:${slot}`; }
}

function row(label, value, cls) {
  return el("div", { class: "summary-row" }, [
    el("span", { class: "panel-sub", text: label }),
    el("span", { class: cls || "", text: value }),
  ]);
}
