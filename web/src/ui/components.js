// Shared presentational builders used across panels.
import { el } from "./dom.js";
import { GameRulesFns } from "../core/GameRules.js";

export function hpBar(current, max) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const bar = el("div", { class: `hpbar${ratio <= 0.34 ? " low" : ""}` }, [
    el("span", { style: { width: `${ratio * 100}%` } }),
  ]);
  return bar;
}

export function statusPills(statuses) {
  const row = el("div", { class: "status-row" });
  for (const s of statuses) {
    row.appendChild(el("span", {
      class: "status-pill",
      title: GameRulesFns.getCombatStatusLabel(s),
      text: GameRulesFns.getCombatStatusLetter(s),
      style: { background: GameRulesFns.getCombatStatusColor(s) },
    }));
  }
  return row;
}

// A hero card used in shop offers, formation, and party listings.
// opts: { cost, actions: [{label, onClick, primary, danger, disabled}], showHp, run }
export function heroCard(def, instance, opts = {}) {
  const role = def.role;
  const tier = instance ? instance.tier : (opts.tier || "Bronze");
  const attack = instance ? instance.attack : def.baseAttack;
  const card = el("div", { class: `unit-card role-${role}` }, [
    el("div", { class: "uc-head" }, [
      el("div", { class: "uc-name", text: def.displayName }),
      el("div", { class: `uc-tier ${tier}`, text: tier.toUpperCase() }),
    ]),
    el("div", { class: "uc-role", text: role }),
    el("div", { class: "uc-stats" }, [
      stat(attack, "ATK"),
      stat(instance ? instance.currentHealth : def.baseHealth, "HP"),
      stat(instance ? instance.upkeepThisRound : def.baseUpkeep, "UPKEEP"),
    ]),
    el("div", { class: "uc-blurb", text: def.effectDescription }),
  ]);

  if (opts.cost !== undefined && opts.cost !== null) {
    card.appendChild(el("div", { class: "uc-cost", text: `Hire — ${opts.cost} gold` }));
  }

  if (opts.actions && opts.actions.length) {
    const row = el("div", { class: "uc-actions" });
    for (const a of opts.actions) {
      row.appendChild(el("button", {
        class: `btn small${a.primary ? " primary" : ""}${a.danger ? " danger" : ""}`,
        text: a.label,
        disabled: a.disabled ? "" : null,
        onClick: a.onClick,
      }));
    }
    card.appendChild(row);
  }

  return card;
}

function stat(value, label) {
  return el("div", { class: "uc-stat" }, [
    el("div", { class: "uc-stat-val", text: String(value) }),
    el("div", { class: "uc-stat-lbl", text: label }),
  ]);
}
