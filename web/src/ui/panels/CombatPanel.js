import { el, clear } from "../dom.js";
import { GameRules, GameRulesFns } from "../../core/GameRules.js";
import { CombatReplayEventKind } from "../../data/CombatReplayEvent.js";
import { HeroRole, EnemyEffectId, EncounterType } from "../../data/enums.js";
import { statusGlyphs, appendPanelHeader } from "../components.js";
import { unitPortrait, attackEffect, healEffect, abilityEffect } from "../SpriteCatalog.js";
import { Settings } from "../../core/Settings.js";
import { ThreeCombatBoardScene } from "../board/ThreeCombatBoardScene.js";

const TOKEN = 70;         // combat token width/height (fits inside TILE)
const TOKEN_HALF = TOKEN / 2;

const PROJ_DURATION = { arc: 300, snap: 170, jab: 140, generic: 240 };

export class CombatPanel {
  constructor(gm) {
    this.gm = gm;
    this.root = el("div", { class: "panel" });
    this.onDirty = null;
    this._timer = null;
    this._result = null;
    this._eventIndex = 0;
    this._stepMs = 280;
    // unitId → { node (the .combat-token), coord {q,r}, unit (CombatUnit snapshot) }
    this._unitMap = new Map();
    this._log = null;
    this._board = null;
    this._boardRenderer = null;
    this._threeScene = null;
    this._projectileLayer = null;
    this._roundLabel = null;
  }

  render() {
    clear(this.root);
    this._clearTimer();
    this._boardRenderer?.destroy();
    this._boardRenderer = null;
    this._threeScene?.destroy();
    this._threeScene = null;
    this._unitMap = new Map();

    const run = this.gm.currentRunState;
    const encounter = run.currentEncounter;

    this._result = this.gm.resolveCombat();
    this.onDirty?.();

    appendPanelHeader(
      this.root,
      "JOB SITE",
      "Contract Execution",
      encounter ? `${encounter.displayName} · employees executing the plan` : "Employees executing the plan",
    );

    this._buildBattlefield(run, encounter);
    this._buildControls();

    this._log = el("div", {
      class: Settings.combatLogVisible ? "combat-log" : "combat-log hidden",
    });
    this.root.appendChild(this._log);

    this._actions = el("div", { class: "panel-actions" });
    this.root.appendChild(this._actions);

    this._initUnitsFromSpawnEvents();

    if (Settings.reducedMotion) {
      this._skipToEnd();
    } else {
      this._eventIndex = 0;
      this._stepMs = Settings.stepMs;
      this._timer = setInterval(() => this._tick(), this._stepMs);
    }
  }

  // ---- Battlefield construction ----

  _buildBattlefield(run, encounter) {
    const scene = new ThreeCombatBoardScene({ run, encounter });
    const wrap = scene.root;

    this._projectileLayer = scene.effectLayer;

    // Encounter-type visual accent.
    const encClass = encounter?.type === EncounterType.RivalGhost ? "encounter-rival"
      : encounter?.type === EncounterType.FinalBoss ? "encounter-boss"
      : "encounter-dungeon";
    wrap.classList.add(encClass);
    wrap.style.setProperty("--act-accent", GameRulesFns.getActAccentColor(run.act));

    this._threeScene = scene;
    this._board = wrap;
    this.root.appendChild(wrap);
  }

  _buildControls() {
    const row = el("div", { class: "combat-controls" });

    const roundLbl = el("span", { class: "combat-round-lbl", text: "Round 1" });
    this._roundLabel = roundLbl;
    row.appendChild(roundLbl);

    row.appendChild(el("button", {
      class: "btn",
      text: "Skip to Report →",
      onClick: () => this._finish(),
    }));

    const speedBtn = el("button", {
      class: "btn",
      text: Settings.animationSpeed === "fast" ? "Speed: Fast ▶▶" : "Speed: Normal ▶",
    });
    speedBtn.addEventListener("click", () => {
      Settings.setAnimationSpeed(Settings.animationSpeed === "fast" ? "normal" : "fast");
      speedBtn.textContent = Settings.animationSpeed === "fast" ? "Speed: Fast ▶▶" : "Speed: Normal ▶";
      this._stepMs = Settings.stepMs;
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = setInterval(() => this._tick(), this._stepMs);
      }
    });
    row.appendChild(speedBtn);

    const logBtn = el("button", {
      class: "btn",
      text: Settings.combatLogVisible ? "Hide Log ▴" : "Show Log ▾",
    });
    logBtn.addEventListener("click", () => {
      Settings.setCombatLogVisible(!Settings.combatLogVisible);
      this._log.classList.toggle("hidden", !Settings.combatLogVisible);
      logBtn.textContent = Settings.combatLogVisible ? "Hide Log ▴" : "Show Log ▾";
    });
    row.appendChild(logBtn);

    this.root.appendChild(row);
  }

  // ---- Unit initialisation from UnitSpawn replay events ----

  _initUnitsFromSpawnEvents() {
    const events = this._result.replayEvents;
    for (const evt of events) {
      if (evt.kind !== CombatReplayEventKind.UnitSpawn) continue;
      if (!evt.sourceCoord) continue;

      // Find the matching snapshot in result.playerStartUnits / enemyStartUnits.
      const pool = evt.attackerIsPlayerSide
        ? this._result.playerStartUnits
        : this._result.enemyStartUnits;
      const unit = pool.find(u => u.slot === evt.attackerSlot && u.isPlayerSide === evt.attackerIsPlayerSide);
      if (!unit) continue;

      const sceneEntry = this._threeScene?.addUnit(evt.actorUnitId, unit, evt.sourceCoord, evt.attackerIsPlayerSide);
      if (!sceneEntry) continue;
      this._unitMap.set(evt.actorUnitId, {
        node: sceneEntry.overlay,
        coord: { q: evt.sourceCoord.q, r: evt.sourceCoord.r },
        unit,
        maxHp: evt.amount || unit.maxHealth,
        sceneEntry,
      });
    }
  }

  _buildToken(unit, isPlayer) {
    const token = el("div", {
      class: `combat-token ${isPlayer ? "player" : "enemy"}`,
      title: unit.displayName,
    });

    const face = el("div", { class: "ct-face" });
    face.appendChild(el("img", {
      class: "ct-portrait",
      src: unitPortrait(unit),
      alt: unit.displayName,
    }));
    token.appendChild(face);

    // HP bar (positioned below the hex face via CSS).
    const hpBar = el("div", { class: "ct-hpbar" });
    hpBar.appendChild(el("div", { class: "ct-hpfill" }));
    token.appendChild(hpBar);

    // Initial status glyphs overlay.
    this._updateTokenGlyphs(token, unit.statuses.activeStatuses, unit.statuses.poisonDamage);

    return token;
  }

  _placeToken(token, coord) {
    const pos = this._threeScene?.screenPositionFromCoord(coord) || { x: 50, y: 50 };
    token.style.left = `${pos.x}%`;
    token.style.top  = `${pos.y}%`;
  }

  _moveToken(entry, newCoord) {
    entry.coord = { q: newCoord.q, r: newCoord.r };
    const unitId = this._unitIdForEntry(entry);
    if (unitId) this._threeScene?.moveUnit(unitId, newCoord);
    else this._placeToken(entry.node, newCoord);
  }

  _updateTokenHp(entry, hp, maxHp) {
    const fill = entry.node.querySelector(".ct-hpfill");
    if (!fill) return;
    const ratio = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
    fill.style.width = `${ratio * 100}%`;
    fill.classList.toggle("low", ratio <= 0.34);
  }

  _updateTokenGlyphs(tokenNode, statuses, poisonDamage) {
    const existing = tokenNode.querySelector(".ct-glyphs");
    if (existing) existing.remove();
    if (!statuses || statuses.length === 0) return;
    const g = statusGlyphs(statuses, poisonDamage);
    if (!g) return;
    g.className = "ct-glyphs"; // override the generic status-glyph-container class
    tokenNode.appendChild(g);
  }

  // ---- Event-driven pixel centre of a unit (for projectiles) ----

  _tokenCenter(coord) {
    const pos = this._threeScene?.screenPositionFromCoord(coord) || { x: 50, y: 50 };
    const x = (pos.x / 100) * 760;
    const y = (pos.y / 100) * 430;
    return { x, y };
  }

  // ---- Timed replay ----

  _tick() {
    const events = this._result.replayEvents;
    if (this._eventIndex >= events.length) {
      this._finish();
      return;
    }
    this._applyEvent(events[this._eventIndex++]);
  }

  _applyEvent(evt) {
    const K = CombatReplayEventKind;

    if (evt.kind === K.RoundBoundary && this._roundLabel) {
      this._roundLabel.textContent = `Round ${evt.amount}`;
      if (evt.logText) this._appendLog(evt.logText);
      return;
    }

    if (evt.kind === K.CombatStart || evt.kind === K.UnitSpawn || evt.kind === K.CombatEnd) {
      return; // structural events handled during init / end
    }

    if (evt.kind === K.Movement) {
      this._handleMovement(evt);
      if (evt.logText) this._appendLog(evt.logText);
      return;
    }

    if (evt.kind === K.AbilityCast) {
      this._handleAbilityCast(evt);
      return;
    }

    if (evt.kind === K.PassiveTrigger) {
      this._handlePassiveTrigger(evt);
      return;
    }

    if (evt.kind === K.Message) {
      this._appendLog(evt.logText);
      return;
    }

    // Attack / Heal / StatusChange / StatusDamage / Death.
    this._handleCombatAction(evt);
  }

  _handleMovement(evt) {
    const entry = this._unitMap.get(evt.actorUnitId);
    if (!entry || !evt.targetCoord) return;
    this._moveToken(entry, evt.targetCoord);
  }

  _handleAbilityCast(evt) {
    const caster = this._unitMap.get(evt.actorUnitId);
    if (caster) {
      this._threeScene?.pulseUnit(evt.actorUnitId, "casting");
      caster.node.classList.remove("casting");
      void caster.node.offsetWidth;
      caster.node.classList.add("casting");
      const n = caster.node;
      setTimeout(() => n.classList.remove("casting"), this._stepMs);

      // Fire an ability projectile if there is a target.
      if (evt.targetUnitId) {
        const target = this._unitMap.get(evt.targetUnitId);
        if (target) this._fireProjectile(caster, target, false, "ability", evt.abilityId);
      }
    }
  }

  _handlePassiveTrigger(evt) {
    const entry = this._unitMap.get(evt.actorUnitId);
    if (entry) {
      this._threeScene?.pulseUnit(evt.actorUnitId, "passive-glow");
      entry.node.classList.remove("passive-glow");
      void entry.node.offsetWidth;
      entry.node.classList.add("passive-glow");
      const n = entry.node;
      setTimeout(() => n.classList.remove("passive-glow"), this._stepMs);
    }
  }

  _handleCombatAction(evt) {
    const K = CombatReplayEventKind;

    // Clear the "acting" glow from the previous event.
    this._clearActing();

    // Resolve actor and target by unitId (set by CombatLogger on all action events).
    const actorEntry  = this._unitMap.get(evt.actorUnitId);
    const targetEntry = this._unitMap.get(evt.targetUnitId);

    // Highlight the acting unit.
    if (actorEntry && (evt.kind === K.Attack || evt.kind === K.Heal)) {
      this._threeScene?.setActiveUnit(evt.actorUnitId);
      actorEntry.node.classList.add("acting");

      // Lunge for melee attackers.
      if (evt.kind === K.Attack && this._shouldLunge(actorEntry.unit)) {
        const sideCls = actorEntry.unit.isPlayerSide ? "player" : "enemy";
        actorEntry.node.classList.remove("lunging");
        void actorEntry.node.offsetWidth;
        actorEntry.node.classList.add("lunging", sideCls);
        const n = actorEntry.node;
        setTimeout(() => n.classList.remove("lunging"), this._stepMs);
      }
    }

    if (targetEntry) {
      const isHeal   = evt.kind === K.Heal;
      const isDamage = (evt.kind === K.Attack && evt.amount > 0) || evt.kind === K.StatusDamage;

      // Update HP bar.
      const maxHp = evt.targetMaxHealth || targetEntry.maxHp || 1;
      this._updateTokenHp(targetEntry, evt.targetHealthAfter, maxHp);

      // Update status glyphs.
      const pd = evt.targetPoisonDamage ?? targetEntry.unit?.statuses?.poisonDamage ?? 0;
      this._updateTokenGlyphs(targetEntry.node, evt.targetStatuses, pd);

      // Death.
      if (evt.targetHealthAfter <= 0 && targetEntry.node.dataset.died !== "1") {
        targetEntry.node.dataset.died = "1";
        this._threeScene?.markUnitDefeated(evt.targetUnitId);
        targetEntry.node.classList.remove("dead");
        targetEntry.node.classList.add("dying");
        const n = targetEntry.node;
        setTimeout(() => {
          n.classList.remove("dying");
          n.classList.add("dead");
        }, 440);
      }

      // Flash.
      if (isDamage || isHeal) {
        const cls = isHeal ? "flash-heal" : "flash-hit";
        targetEntry.node.classList.remove(cls);
        void targetEntry.node.offsetWidth;
        targetEntry.node.classList.add(cls);
      }

      // Floating number.
      this._spawnFloatingNumber(targetEntry.node, evt);

      // Projectile.
      if (actorEntry && (evt.kind === K.Attack || isHeal)) {
        this._fireProjectile(actorEntry, targetEntry, isHeal, "attack");
      }
    }

    if (evt.logText) this._appendLog(evt.logText);
  }

  // ---- Visual helpers ----

  _spawnFloatingNumber(tokenNode, evt) {
    if (evt.amount <= 0) return;
    const isHeal = evt.kind === CombatReplayEventKind.Heal;
    const isDamage = evt.kind === CombatReplayEventKind.Attack || evt.kind === CombatReplayEventKind.StatusDamage;
    if (!isHeal && !isDamage) return;

    const num = el("div", {
      class: `combat-float ${isHeal ? "heal" : "hit"}`,
      text: `${isHeal ? "+" : "-"}${evt.amount}`,
    });
    tokenNode.appendChild(num);
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      num.removeEventListener("animationend", cleanup);
      num.remove();
    };
    num.addEventListener("animationend", cleanup);
    setTimeout(cleanup, 760);
  }

  _fireProjectile(actorEntry, targetEntry, isHeal, kind, abilityId) {
    const layer = this._projectileLayer;
    if (!layer) return;
    const start = this._tokenCenter(actorEntry.coord);
    const end   = this._tokenCenter(targetEntry.coord);
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    const style = isHeal ? "arc"
      : kind === "ability" ? "arc"
      : this._projectileStyle(actorEntry.unit);
    const duration = PROJ_DURATION[style] || PROJ_DURATION.generic;

    const src = isHeal ? healEffect()
      : kind === "ability" && abilityId ? abilityEffect(abilityId, actorEntry.unit)
      : attackEffect(actorEntry.unit);

    const sprite = el("img", {
      class: `projectile proj-${style}${isHeal ? " heal" : ""}`,
      src,
      alt: "",
      style: { left: `${start.x}px`, top: `${start.y}px` },
    });
    sprite.style.setProperty("--dx", `${dx}px`);
    sprite.style.setProperty("--dy", `${dy}px`);
    if (style === "arc") sprite.style.setProperty("--arc-h", "40px");
    if (style === "snap") sprite.style.setProperty("--proj-angle", `${Math.atan2(dy, dx)}rad`);
    layer.appendChild(sprite);

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
    if (!text) return;
    const cls = text === "Player wins!" ? "line win"
      : text === "Player loses." || text.startsWith("Combat lost") ? "line loss"
      : "line";
    this._log.appendChild(el("div", { class: cls, text }));
    this._log.scrollTop = this._log.scrollHeight;
  }

  // ---- Finish / skip ----

  _skipToEnd() {
    const events = this._result.replayEvents;
    while (this._eventIndex < events.length) {
      this._applyEventInstant(events[this._eventIndex++]);
    }
    this._clearActing();
    if (this._projectileLayer) clear(this._projectileLayer);
    this._renderSummary();
  }

  _applyEventInstant(evt) {
    const K = CombatReplayEventKind;
    if (evt.kind === K.CombatStart || evt.kind === K.UnitSpawn) return;
    if (evt.kind === K.CombatEnd) return;

    if (evt.kind === K.RoundBoundary && this._roundLabel) {
      this._roundLabel.textContent = `Round ${evt.amount}`;
      return;
    }

    if (evt.kind === K.Movement) {
      const entry = this._unitMap.get(evt.actorUnitId);
      if (entry && evt.targetCoord) {
        // Instant move: suppress CSS transition temporarily.
        entry.node.style.transition = "none";
        this._moveToken(entry, evt.targetCoord);
        void entry.node.offsetWidth;
        entry.node.style.transition = "";
      }
      return;
    }

    // For combat actions, just update the HP and dead state.
    const targetEntry = this._unitMap.get(evt.targetUnitId);
    if (targetEntry) {
      const maxHp = evt.targetMaxHealth || targetEntry.maxHp || 1;
      this._updateTokenHp(targetEntry, evt.targetHealthAfter, maxHp);
      if (evt.targetHealthAfter <= 0) {
        this._threeScene?.markUnitDefeated(evt.targetUnitId);
        targetEntry.node.classList.add("dead");
      }
      this._updateTokenGlyphs(targetEntry.node, evt.targetStatuses || [], evt.targetPoisonDamage || 0);
    }
    if (evt.logText) this._appendLog(evt.logText);
  }

  _finish() {
    this._clearTimer();
    while (this._eventIndex < this._result.replayEvents.length) {
      this._applyEvent(this._result.replayEvents[this._eventIndex++]);
    }
    this._clearActing();
    if (this._projectileLayer) clear(this._projectileLayer);
    this._renderSummary();
  }

  // ---- Summary ----

  _renderSummary() {
    const run = this.gm.currentRunState;
    clear(this._actions);

    const summary = el("div", { class: "summary" });
    const won = this._result.playerWon;
    summary.appendChild(el("div", { class: "summary-row" }, [
      el("strong", { text: won ? "Contract Fulfilled" : "Contract Failed", class: won ? "pos" : "neg" }),
      el("span", { class: "panel-sub", text: `${this._result.combatRoundsElapsed} combat rounds logged` }),
    ]));

    if (run.latestManagerReportLines && run.latestManagerReportLines.length > 0) {
      const reportBlock = el("div", { class: "manager-report" });
      reportBlock.appendChild(el("div", { class: "manager-report-header", text: "Manager Report" }));
      for (const line of run.latestManagerReportLines) {
        reportBlock.appendChild(el("div", { class: "manager-report-line", text: line }));
      }
      summary.appendChild(reportBlock);
    }

    summary.appendChild(summaryRow("Contract payout", `+${run.latestRewardGold}`, "pos"));
    if (run.latestRelicRewardGold > 0) summary.appendChild(summaryRow("  (relic bonus)", `+${run.latestRelicRewardGold}`, "pos"));
    if (run.latestMoraleChange !== 0) summary.appendChild(summaryRow("Morale adjustment", `${run.latestMoraleChange}`, "neg"));
    summary.appendChild(summaryRow("Wages paid", `−${run.latestUpkeepPaid} / ${run.latestTotalUpkeep}`));
    if (run.latestUpkeepShortfall > 0) summary.appendChild(summaryRow("Wage shortfall → debt", `+${run.latestUpkeepShortfall}`, "neg"));
    summary.appendChild(summaryRow("Debt interest paid", `−${run.latestInterestPaid} / ${run.latestInterestCharged}`));
    if (run.latestInterestAddedToDebt > 0) summary.appendChild(summaryRow("Unpaid interest → debt", `+${run.latestInterestAddedToDebt}`, "neg"));
    if (run.latestPayrollSummary) summary.appendChild(summaryRow("Payroll policy", run.latestPayrollSummary));
    if (run.latestVeterancySummary) summary.appendChild(summaryRow("Staff development", run.latestVeterancySummary));
    summary.appendChild(el("hr", { style: { border: "none", borderTop: "1px solid var(--rule)" } }));
    summary.appendChild(summaryRow("Gold", String(run.gold)));

    const debtStatusBefore = run.latestDebtStatusBefore;
    const debtStatusAfter  = GameRulesFns.getDebtStatusLabel(run.debt);
    const debtStatusText   = (debtStatusBefore && debtStatusBefore !== debtStatusAfter)
      ? `${debtStatusBefore} → ${debtStatusAfter}`
      : debtStatusAfter;
    summary.appendChild(summaryRow("Debt", String(run.debt)));
    summary.appendChild(summaryRow("Debt status", debtStatusText, GameRulesFns.isHighDebtPressure(run.debt) ? "neg" : ""));
    if (GameRulesFns.isHighDebtPressure(run.debt)) {
      summary.appendChild(el("div", { class: "summary-debt-hint", text: "Interest pressure is high. Use Pay Debt in Shop to reduce principal." }));
    }
    summary.appendChild(summaryRow("Crew morale", String(run.morale)));

    this.root.insertBefore(summary, this._actions);
    this._actions.appendChild(el("button", {
      class: "btn primary", text: "File Report →",
      onClick: () => { this.onDirty?.(); this.gm.continueAfterReward(); },
    }));
  }

  // ---- Unit classification helpers ----

  _shouldLunge(unit) {
    if (!unit) return false;
    const h = unit.sourceHero;
    if (h) {
      if (h.role === HeroRole.Tank) return true;
      if (h.id === "ninja") return true;
      return false;
    }
    const e = unit.sourceEnemy;
    if (e) {
      if (e.effectId === EnemyEffectId.BackBatBackline)  return false;
      if (e.effectId === EnemyEffectId.FrugalGhostHeal)  return false;
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

  // ---- Utility ----

  _clearActing() {
    this._threeScene?.clearActiveUnits();
    for (const { node } of this._unitMap.values()) node.classList.remove("acting");
  }

  _unitIdForEntry(targetEntry) {
    for (const [unitId, entry] of this._unitMap.entries()) {
      if (entry === targetEntry) return unitId;
    }
    return "";
  }

  _clearTimer() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }
}

function summaryRow(label, value, cls) {
  return el("div", { class: "summary-row" }, [
    el("span", { class: "panel-sub", text: label }),
    el("span", { class: cls || "", text: value }),
  ]);
}
