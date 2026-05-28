import { el, clear } from "../dom.js";
import { GameRules, GameRulesFns } from "../../core/GameRules.js";
import { CombatReplayEventKind } from "../../data/CombatReplayEvent.js";
import { HeroRole, EnemyEffectId } from "../../data/enums.js";
import { statusPills, hpBar, appendPanelHeader } from "../components.js";
import { unitPortrait, attackEffect, healEffect } from "../SpriteCatalog.js";

const STEP_MS = 280;
const PROJ_DURATION = { arc: 300, snap: 170, jab: 140, generic: 240 };

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

    appendPanelHeader(this.root, "COMBAT", "Combat", encounter ? encounter.displayName : "");

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
    this._projectileLayer = el("div", { class: "projectile-layer" });
    this._board = el("div", { class: "combat-board" }, [
      enemyBlock,
      el("div", { class: "combat-divider" }),
      playerBlock,
      this._projectileLayer,
    ]);
    this.root.appendChild(this._board);

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
      // Remember the unit so projectile lookup can resolve its sprite.
      this._units.set(this._key(isPlayer, u.slot), { node, max: u.maxHealth, unit: u });
      this._paintUnit(node, u.displayName, u.currentHealth, u.maxHealth, u.statuses.activeStatuses, u);
      row.appendChild(node);
    }
    return row;
  }

  _paintUnit(node, name, hp, max, statuses, unit) {
    clear(node);
    node.classList.toggle("dead", hp <= 0);
    if (unit) {
      node.appendChild(el("img", {
        class: "cu-portrait",
        src: unitPortrait(unit),
        alt: name,
      }));
    }
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
    let attacker = null;
    if (evt.kind === CombatReplayEventKind.Attack || evt.kind === CombatReplayEventKind.Heal) {
      attacker = this._units.get(this._key(evt.attackerIsPlayerSide, evt.attackerSlot));
      if (attacker) attacker.node.classList.add("acting");
    }

    // Melee-only attack lunge. Skip on Heal / StatusDamage / Message and on
    // ranged/magic attackers — see _shouldLunge for the classification.
    if (attacker && evt.kind === CombatReplayEventKind.Attack && this._shouldLunge(attacker.unit)) {
      const sideCls = evt.attackerIsPlayerSide ? "player" : "enemy";
      attacker.node.classList.remove("lunging", "player", "enemy");
      void attacker.node.offsetWidth; // reflow → restart for back-to-back attacks
      attacker.node.classList.add("lunging", sideCls);
      const node = attacker.node;
      setTimeout(() => {
        node.classList.remove("lunging", "player", "enemy");
      }, STEP_MS);
    }

    // Update the affected target unit from the event snapshot.
    if (evt.kind !== CombatReplayEventKind.Message) {
      const target = this._units.get(this._key(evt.targetIsPlayerSide, evt.targetSlot));
      if (target) {
        const name = target.node.querySelector(".cu-head span")?.textContent
          || evt.logText;
        this._paintUnit(target.node, name, evt.targetHealthAfter, evt.targetMaxHealth || target.max, evt.targetStatuses, target.unit);
        // One-shot death animation: target crossed to 0 HP → fade out.
        if (evt.targetHealthAfter <= 0 && target.node.dataset.died !== "1") {
          target.node.dataset.died = "1";
          target.node.classList.remove("dead");
          target.node.classList.add("dying");
          const n = target.node;
          setTimeout(() => {
            n.classList.remove("dying");
            n.classList.add("dead");
          }, 440);
        }
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
        // Fire a projectile from attacker → target for Attack / Heal events.
        if (attacker && (evt.kind === CombatReplayEventKind.Attack || isHeal)) {
          this._fireProjectile(attacker, target, isHeal);
        }
      }
    }

    this._appendLog(evt.logText);
  }

  _fireProjectile(attacker, target, isHeal) {
    const layer = this._projectileLayer;
    const board = this._board;
    if (!layer || !board) return;
    const boardRect = board.getBoundingClientRect();
    const a = attacker.node.getBoundingClientRect();
    const t = target.node.getBoundingClientRect();
    const startX = a.left - boardRect.left + a.width / 2;
    const startY = a.top - boardRect.top + a.height / 2;
    const endX = t.left - boardRect.left + t.width / 2;
    const endY = t.top - boardRect.top + t.height / 2;
    const dx = endX - startX;
    const dy = endY - startY;

    const style = isHeal ? "arc" : this._projectileStyle(attacker.unit);
    const duration = PROJ_DURATION[style] || PROJ_DURATION.generic;

    const src = isHeal ? healEffect() : attackEffect(attacker.unit);
    const sprite = el("img", {
      class: `projectile proj-${style}${isHeal ? " heal" : ""}`,
      src,
      alt: "",
      style: { left: `${startX}px`, top: `${startY}px` },
    });
    sprite.style.setProperty("--dx", `${dx}px`);
    sprite.style.setProperty("--dy", `${dy}px`);
    if (style === "arc") sprite.style.setProperty("--arc-h", "40px");
    if (style === "snap") sprite.style.setProperty("--proj-angle", `${Math.atan2(dy, dx)}rad`);
    layer.appendChild(sprite);

    // Cleanup. Use animationend if it fires, else a fallback timer.
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      sprite.removeEventListener("animationend", cleanup);
      if (sprite.parentNode === layer) layer.removeChild(sprite);
    };
    sprite.addEventListener("animationend", cleanup);
    setTimeout(cleanup, duration + 80);
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
    // Drop any in-flight projectiles so they don't outlive the summary screen.
    if (this._projectileLayer) clear(this._projectileLayer);
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

  _shouldLunge(unit) {
    if (!unit) return false;
    const h = unit.sourceHero;
    if (h) {
      if (h.role === HeroRole.Tank) return true;
      if (h.id === "ninja") return true; // only melee Damage hero
      return false;
    }
    const e = unit.sourceEnemy;
    if (e) {
      if (e.effectId === EnemyEffectId.BackBatBackline) return false; // flying ranged backline
      if (e.effectId === EnemyEffectId.FrugalGhostHeal) return false; // support unit, not front-line attacker
      if (e.id === "frugal_archer") return false;
      return true;
    }
    return false;
  }

  _projectileStyle(unit) {
    const h = unit?.sourceHero;
    if (h) {
      if (h.id === "wizard" || h.id === "enchanter") return "arc";
      if (h.id === "ranger") return "snap";
      if (h.role === HeroRole.Tank || h.id === "ninja") return "jab";
      return "arc";
    }
    return "generic";
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
