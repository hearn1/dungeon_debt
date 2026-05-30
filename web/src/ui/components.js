// Shared presentational builders used across panels.
import { el } from "./dom.js";
import { GameRulesFns } from "../core/GameRules.js";
import { heroPortrait } from "./SpriteCatalog.js";
import { CombatStatusId } from "../data/enums.js";

export function hpBar(current, max, opts = {}) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const previousRatio = Number.isFinite(opts.previousRatio)
    ? Math.max(0, Math.min(1, opts.previousRatio))
    : ratio;
  const fill = el("span", { style: { width: `${previousRatio * 100}%` } });
  const bar = el("div", { class: `hpbar${ratio <= 0.34 ? " low" : ""}` }, [
    fill,
  ]);
  if (previousRatio !== ratio) {
    const applyWidth = () => { fill.style.width = `${ratio * 100}%`; };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(applyWidth);
    else setTimeout(applyWidth, 0);
  }
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

export function statusGlyphs(statuses, poisonDamage) {
  if (!statuses || statuses.length === 0) return null;
  const container = el("div", {
    class: `status-glyph-container${statuses.length >= 3 ? " many" : ""}`,
  });
  for (const s of statuses) {
    const color = GameRulesFns.getCombatStatusColor(s);
    const d = GameRulesFns.getCombatStatusGlyphPath(s);
    if (!d) continue;
    const isFill = s === CombatStatusId.Burned || s === CombatStatusId.Poisoned || s === CombatStatusId.Inspired;
    const glyph = el("div", { class: "status-glyph-wrap" });
    glyph.innerHTML = `<svg class="status-glyph" width="16" height="16" viewBox="0 0 16 16"><path d="${d}" fill="${isFill ? color : "none"}" stroke="${isFill ? "none" : color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    if (s === CombatStatusId.Poisoned && poisonDamage > 0) {
      glyph.appendChild(el("span", { class: "poison-dmg", text: String(poisonDamage) }));
    }
    container.appendChild(glyph);
  }
  return container;
}

export function panelHeader(kicker, title, sub = "") {
  return [
    el("div", { class: "panel-head" }, [
      el("div", { class: "panel-kicker", text: kicker }),
      el("h2", { class: "panel-title", text: title }),
      sub ? el("div", { class: "panel-sub", text: sub }) : null,
    ]),
    el("hr", { class: "panel-rule" }),
  ];
}

export function appendPanelHeader(root, kicker, title, sub = "") {
  for (const node of panelHeader(kicker, title, sub)) root.appendChild(node);
}

// A hero card used in shop offers, formation, and party listings.
// opts: { cost, actions: [{label, onClick, primary, danger, disabled}], showHp, run }
export function heroCard(def, instance, opts = {}) {
  const role = def.role;
  const tier = instance ? instance.tier : (opts.tier || "Bronze");
  const attack = instance ? instance.attack : def.baseAttack;
  const card = el("div", { class: `unit-card role-${role}` }, [
    el("div", { class: "uc-head" }, [
      el("div", { class: "uc-name-wrap" }, [
        el("img", { class: "uc-portrait", src: heroPortrait(def), alt: def.displayName }),
        el("div", { class: "uc-name", text: def.displayName }),
      ]),
      el("div", { class: `uc-tier ${tier}`, text: tierLetter(tier) }),
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

function tierLetter(tier) {
  if (tier === "Silver") return "S";
  if (tier === "Gold") return "G";
  return "B";
}

function stat(value, label) {
  return el("div", { class: "uc-stat" }, [
    el("div", { class: "uc-stat-val", text: String(value) }),
    el("div", { class: "uc-stat-lbl", text: label }),
  ]);
}
