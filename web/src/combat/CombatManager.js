import { CombatResult } from "../data/CombatResult.js";
import { CombatUnit } from "../data/CombatUnit.js";
import { CombatUnitState } from "../data/CombatUnitState.js";
import { CombatMatch } from "./CombatMatch.js";
import { CombatTeam } from "./CombatTeam.js";
import { CombatBoard } from "./CombatBoard.js";
import { CombatLogger } from "./CombatLogger.js";
import { HeroEffects } from "./HeroEffects.js";
import { AbilityRunner } from "./AbilityRunner.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { HeroRole, RelicId, CombatStatusId, EncounterType, HeroEffectId, AbilityTrigger } from "../data/enums.js";
import { getScaledHeroMaxHealth, getRelicAttackBonus, hasRelic } from "../run/heroStats.js";
import { getEncounterScaling } from "../run/EncounterScaling.js";
import { resolvePlayerBoardPosition, resolveEnemyBoardPosition } from "./BoardPlacement.js";
import { selectTarget } from "./TargetingRules.js";
import { getBasicAttackMode } from "./RoleBehavior.js";
import { DefaultCombatRuntimeId, resolveCombatRuntimeId } from "./CombatRuntime.js";
import { CombatReplayPhase } from "../data/CombatReplayEvent.js";

export class CombatManager {
  constructor(options = null) {
    this.runtimeId = resolveCombatRuntimeId(options && options.runtimeId ? options.runtimeId : DefaultCombatRuntimeId);
    this._run = null;
    this._match = null;
    this._knightRedirectsRemaining = 0;
    this._redInkBrandApplied = false;
  }

  startCombat(run, encounter) {
    const result = new CombatResult();
    result.combatRuntimeId = this.runtimeId;
    const logger = new CombatLogger();

    this._run = run;
    this._match = null;
    this._knightRedirectsRemaining = 0;
    this._redInkBrandApplied = false;

    const playerUnits = buildPlayerUnits(run);
    const enemyUnits = buildEnemyUnits(run, encounter);

    this._knightRedirectsRemaining = HeroEffects.onCombatStart(run, encounter, playerUnits, enemyUnits, logger);
    applyCombatStartRelicStatuses(run, playerUnits, logger);
    copyUnitSnapshots(playerUnits, result.playerStartUnits);
    copyUnitSnapshots(enemyUnits, result.enemyStartUnits);

    if (!hasLivingUnits(playerUnits)) {
      result.playerWon = false;
      result.combatRoundsElapsed = 0;
      logger.logMessage("Player has no living heroes.");
      logger.logFinalResult(false);
      this._finishResult(result, playerUnits, enemyUnits, logger);
      return result;
    }

    if (!hasLivingUnits(enemyUnits)) {
      result.playerWon = true;
      result.combatRoundsElapsed = 0;
      logger.logMessage("Enemy side has no living units.");
      logger.logFinalResult(true);
      this._finishResult(result, playerUnits, enemyUnits, logger);
      return result;
    }

    // Build the match container used by the tick loop.
    const playerTeam = new CombatTeam(true, playerUnits);
    const enemyTeam = new CombatTeam(false, enemyUnits);
    const board = new CombatBoard();
    initBoardPositions(board, playerUnits, enemyUnits, encounter);
    const match = new CombatMatch(playerTeam, enemyTeam, board);
    const pendingHitEvents = [];
    const pendingAbilityEvents = [];

    this._match = match;

    // Emit structured replay events for match start and initial unit positions.
    logger.logCombatStart(playerUnits, enemyUnits, board);
    logger.logRoundBoundary(1);

    // Fire CombatStart passives now that board positions are set (e.g. Empower, Growth).
    AbilityRunner.triggerPassives(AbilityTrigger.CombatStart, playerUnits, { match, run, logger });

    // Initialise active ability cooldowns so first cast happens after one full cooldown.
    AbilityRunner.initActiveCooldowns(playerUnits);

    // Timing is seeded by the build functions; ensure all units start ready at tick 0.
    for (const u of match.allUnits) {
      u.nextAttackAt = 0;
      u.nextAttackReadyTick = 0;
      u.nextMovementReadyTick = 0;
    }

    const maxTicks = GameRules.CombatTurnLimit * GameRules.CombatTicksPerRound;

    for (let tick = 0; tick < maxTicks; tick++) {
      match.currentTick = tick;
      logger.setTick(tick);
      const currentRound = Math.floor(tick / GameRules.CombatTicksPerRound) + 1;

      // Fire end-of-round effects when crossing a round boundary.
      if (tick > 0 && tick % GameRules.CombatTicksPerRound === 0) {
        const roundJustEnded = currentRound - 1;
        logger.setPhase(CombatReplayPhase.RoundBoundary);
        logger.logRoundBoundary(currentRound);
        logger.setPhase(CombatReplayPhase.HitResolution, `${tick}:RoundEffects`);
        HeroEffects.onEndOfCombatRound(roundJustEnded, run, encounter, playerUnits, enemyUnits, result, logger);
        AbilityRunner.triggerPassives(AbilityTrigger.EndOfRound, playerUnits, { match, run, logger });
        result.combatRoundsElapsed = roundJustEnded;

        if (!playerTeam.hasLiving) {
          result.playerWon = false;
          result.combatRoundsElapsed = roundJustEnded;
          logger.logFinalResult(false);
          this._finishResult(result, playerUnits, enemyUnits, logger);
          return result;
        }
      }

      // Remove dead units from board before pathfinding so they don't block movement.
      for (const unit of match.allUnits) {
        if (!unit.isAlive) match.board.removeUnit(unit);
      }

      const intents = this._collectTimelineIntents(match, currentRound, playerUnits, tick, logger);
      intents.activeCasts.push(...AbilityRunner.collectActiveIntents(tick, playerUnits, match));
      logger.setPhase(CombatReplayPhase.Movement);
      resolveMovementIntents(intents.movements, match, logger);
      logger.setPhase(CombatReplayPhase.AttackStart);
      startAttackWindups(intents.attacks, pendingHitEvents, tick, logger, match.board);
      startAbilityWindups(intents.activeCasts, pendingAbilityEvents, tick, logger, match.board);
      logger.setPhase(CombatReplayPhase.HitResolution);
      const defeatedThisTick = this._resolveMaturingHitEvents(pendingHitEvents, tick, logger);
      this._resolveMaturingAbilityEvents(pendingAbilityEvents, tick, logger);
      logger.setPhase(CombatReplayPhase.Death);
      this._applyDeferredDeaths(defeatedThisTick, logger);

      for (const unit of match.allUnits) {
        if (unit.deathResolved) match.board.removeUnit(unit);
      }

      if (!enemyTeam.hasLiving) {
        result.playerWon = true;
        result.combatRoundsElapsed = currentRound;
        logger.logFinalResult(true);
        this._finishResult(result, playerUnits, enemyUnits, logger);
        return result;
      }

      if (!playerTeam.hasLiving) {
        result.playerWon = false;
        result.combatRoundsElapsed = currentRound;
        logger.logFinalResult(false);
        this._finishResult(result, playerUnits, enemyUnits, logger);
        return result;
      }

    }

    result.playerWon = false;
    logger.logTurnLimit();
    logger.logFinalResult(false);
    this._finishResult(result, playerUnits, enemyUnits, logger);
    return result;
  }

  _collectTimelineIntents(match, currentRound, playerUnits, tick, logger) {
    const readyUnits = match.allUnits.filter(u => u.isAlive);
    readyUnits.sort(stableUnitOrder);

    const intents = { movements: [], attacks: [], activeCasts: [] };

    for (const unit of readyUnits) {
      let target = findTarget(unit, match, currentRound);
      if (!target) continue;

      if (!unit.isPlayerSide) {
        const redirect = HeroEffects.tryRedirectToKnight(target, playerUnits, this._knightRedirectsRemaining, logger);
        target = redirect.target;
        this._knightRedirectsRemaining = redirect.remaining;
        if (!target) continue;
      }

      if (match.board.canAttack(unit, target)) {
        if (unit.nextAttackReadyTick > tick) continue;
        intents.attacks.push({ actor: unit, target });
        markUnitAttacked(unit, tick);
      } else {
        if (unit.nextMovementReadyTick > tick) continue;
        const targetPos = match.board.getUnitPosition(target);
        if (targetPos) {
          intents.movements.push({ actor: unit, target, targetPos });
          markUnitMoved(unit, tick);
        }
      }
    }

    return intents;
  }

  _resolveMaturingHitEvents(pendingHitEvents, tick, logger) {
    const maturing = [];
    for (let i = pendingHitEvents.length - 1; i >= 0; i--) {
      if (pendingHitEvents[i].hitTick !== tick) continue;
      maturing.push(pendingHitEvents[i]);
      pendingHitEvents.splice(i, 1);
    }
    maturing.sort((a, b) => a.order - b.order);

    const defeatedByUnitId = new Map();
    for (const event of maturing) {
      const { actor, target } = event;
      if (actor.deathResolved || target.deathResolved) continue;
      HeroEffects.onAttack(actor, target, logger);
      const defeated = this._applyAttack(actor, target, logger, { deferDeath: true });
      for (const entry of defeated) {
        if (!defeatedByUnitId.has(entry.defeated.unitId)) {
          defeatedByUnitId.set(entry.defeated.unitId, entry);
        }
      }
    }

    return [...defeatedByUnitId.values()];
  }

  _applyDeferredDeaths(defeatedEntries, logger) {
    defeatedEntries.sort((a, b) => combatActionOrder(a.defeated, b.defeated));

    for (const entry of defeatedEntries) {
      const defeated = entry.defeated;
      if (defeated.deathResolved || defeated.isAlive) continue;
      defeated.pendingDeath = false;
      defeated.deathResolved = true;
      logger.logDeath(defeated);
      HeroEffects.onKill(entry.attacker, defeated, this._run, logger);
      AbilityRunner.triggerPassiveOn(AbilityTrigger.OnKill, entry.attacker, defeated, { match: this._match, run: this._run, logger });
    }
  }

  _resolveMaturingAbilityEvents(pendingAbilityEvents, tick, logger) {
    const maturing = [];
    for (let i = pendingAbilityEvents.length - 1; i >= 0; i--) {
      if (pendingAbilityEvents[i].castTick !== tick) continue;
      maturing.push(pendingAbilityEvents[i]);
      pendingAbilityEvents.splice(i, 1);
    }
    maturing.sort((a, b) => a.order - b.order);

    for (const event of maturing) {
      AbilityRunner.resolveActiveCast(event, this._match, this._run, logger);
    }
  }

  _applyAttack(attacker, defender, logger, options = null) {
    const deferDeath = options && options.deferDeath === true;
    const defeated = [];
    let damage = attacker.attack;
    const defenderWasAlive = defender.isAlive;

    if (attacker.statuses.has(CombatStatusId.CritCharged)) {
      damage *= GameRules.CritDamageMultiplier;
      attacker.statuses.remove(CombatStatusId.CritCharged);
      if (logger) logger.logStatusChange(attacker, `${attacker.displayName} scores a Critical Hit! (base ${attacker.attack} → ${damage} damage)`);
    }

    damage = applyOutgoingStatusModifiers(attacker, damage, logger);
    damage = applyIncomingStatusModifiers(defender, damage, logger);

    const reduction = HeroEffects.getDamageReduction(defender);
    damage -= reduction;
    if (damage < 0) damage = 0;

    defender.currentHealth -= damage;
    if (defender.currentHealth < 0) defender.currentHealth = 0;

    logger.logAttack(attacker, defender, damage);

    if (defenderWasAlive && !defender.isAlive) {
      if (deferDeath) {
        defender.pendingDeath = true;
        defeated.push({ attacker, defeated: defender });
      } else {
        logger.logDeath(defender);
        defender.deathResolved = true;
        HeroEffects.onKill(attacker, defender, this._run, logger);
        AbilityRunner.triggerPassiveOn(AbilityTrigger.OnKill, attacker, defender, { match: this._match, run: this._run, logger });
      }
    } else if (defender.isAlive) {
      applyAttackStatuses(attacker, defender, logger);
      HeroEffects.onSurvivingAttack(attacker, defender, logger);
      this._applyRelicAttackStatuses(attacker, defender, logger);
    }

    // AfterAttack passives fire for the attacker after any attack resolves.
    AbilityRunner.triggerPassiveOn(AbilityTrigger.AfterAttack, attacker, defender, { match: this._match, run: this._run, logger });

    // OnDamageTaken passive fires for the defender when they took damage and survived.
    if (damage > 0 && defender.isAlive) {
      AbilityRunner.triggerPassiveOn(AbilityTrigger.OnDamageTaken, defender, attacker, { match: this._match, run: this._run, logger });
    }

    applyPostAttackStatusDamage(attacker, logger);
    return defeated;
  }

  _applyRelicAttackStatuses(attacker, defender, logger) {
    if (!this._run || !attacker || !defender) return;
    if (!attacker.isPlayerSide || !attacker.sourceHero || !attacker.sourceHero.definition) return;

    if (!this._redInkBrandApplied && hasRelic(this._run, RelicId.RedInkBrand)) {
      this._redInkBrandApplied = true;
      applyRelicStatus(defender, CombatStatusId.Marked, GameRules.RedInkBrandRelicName, logger);
    }

    if (attacker.sourceHero.definition.role !== HeroRole.Damage) return;

    if (hasRelic(this._run, RelicId.CausticWrit)) {
      applyRelicStatus(defender, CombatStatusId.Burned, GameRules.CausticWritRelicName, logger);
    }
    if (hasRelic(this._run, RelicId.ToxicCollateral)) {
      applyRelicStatus(defender, CombatStatusId.Poisoned, GameRules.ToxicCollateralRelicName, logger);
    }
  }

  _finishResult(result, playerUnits, enemyUnits, logger) {
    for (const unit of playerUnits) {
      if (!unit.isAlive && unit.sourceHero) {
        result.deadHeroes.push(unit.sourceHero);
      }
      // MVP rule: dead-in-combat heroes are restored for the next round.
      if (unit.sourceHero && unit.sourceHero.definition) {
        unit.sourceHero.currentHealth = getScaledHeroMaxHealth(unit.sourceHero, this._run);
      }
    }

    for (const unit of enemyUnits) {
      if (unit.sourceEnemy) {
        result.survivorFlags[unit.sourceEnemy.id + "Survived"] = unit.isAlive;
      }
    }

    HeroEffects.onCombatEnd(result, this._run, playerUnits, enemyUnits, logger);
    if (this._run) {
      AbilityRunner.triggerCombatEndPassives(this._run.party, this._run, result, logger);
    }
    copyUnitSnapshots(playerUnits, result.playerFinalUnits);
    copyUnitSnapshots(enemyUnits, result.enemyFinalUnits);
    logger.logCombatEnd(result.playerWon);
    logger.copyTo(result.logLines);
    logger.copyReplayTo(result.replayEvents);
  }
}

// --- Board initialisation ------------------------------------------------------

function initBoardPositions(board, playerUnits, enemyUnits, encounter) {
  for (const unit of playerUnits) {
    const pos = resolvePlayerBoardPosition(unit.sourceHero || { boardPosition: null, formationSlot: unit.slot });
    board.placeUnit(unit, pos);
  }
  for (let i = 0; i < enemyUnits.length; i++) {
    const pos = resolveEnemyBoardPosition(encounter, i);
    board.placeUnit(enemyUnits[i], pos);
  }
}

// --- Unit construction ---------------------------------------------------------

export function buildPlayerUnits(run) {
  const playerUnits = [];
  if (!run) return playerUnits;

  const critSlots = run.critChargedSlots || [];

  for (const hero of run.party) {
    const maxHealth = getScaledHeroMaxHealth(hero, run);
    const attack = GameRulesFns.scaleCombatStat(hero.attack, run.heroDamageMultiplier)
      + getRelicAttackBonus(run, hero);
    const unitId = `p${hero.formationSlot}`;
    const unit = new CombatUnitState(unitId, hero.definition.displayName, attack, maxHealth, maxHealth, true, hero.formationSlot, hero, null);
    applyAttackCadence(unit);
    applyRangeProfile(unit);
    applyMovementCadence(unit);
    if (critSlots.includes(hero.formationSlot)) {
      unit.statuses.add(CombatStatusId.CritCharged);
    }
    playerUnits.push(unit);
  }

  sortUnitsBySlot(playerUnits);
  return playerUnits;
}

export function buildEnemyUnits(run, encounter) {
  const enemyUnits = [];
  if (!encounter) return enemyUnits;

  const encounterScale = getEncounterScaling(encounter.act, encounter.slot, encounter.type);

  for (let i = 0; i < encounter.enemies.length; i++) {
    const enemy = encounter.enemies[i];
    const raceScale = getRivalRaceScale(encounter);
    const attack = GameRulesFns.scaleCombatStat(
      GameRulesFns.scaleCombatStat(
        GameRulesFns.scaleCombatStat(enemy.attack, run ? run.enemyDamageMultiplier : GameRules.NoCombatMultiplier),
        encounterScale.enemyAttack,
      ),
      raceScale.attack,
    );
    const health = GameRulesFns.scaleCombatStat(
      GameRulesFns.scaleCombatStat(
        GameRulesFns.scaleCombatStat(enemy.health, run ? run.enemyHealthMultiplier : GameRules.NoCombatMultiplier),
        encounterScale.enemyHealth,
      ),
      raceScale.health,
    );
    const unitId = `e${i}`;
    const unit = new CombatUnitState(unitId, enemy.displayName, attack, health, health, false, i, null, enemy);
    applyAttackCadence(unit);
    applyRangeProfile(unit);
    applyMovementCadence(unit);
    for (const status of enemy.startingStatuses) {
      unit.statuses.add(status);
    }
    enemyUnits.push(unit);
  }

  sortUnitsBySlot(enemyUnits);
  return enemyUnits;
}

// --- Timing helpers -----------------------------------------------------------

function applyAttackCadence(unit) {
  unit.attackCooldownTicks = resolveAttackCooldownTicks(unit);
  unit.attackSpeedMultiplier = resolveAttackSpeedMultiplier(unit);
  unit.attackWindupTicks = resolveAttackWindupTicks(unit);
  unit.attackRecoveryTicks = resolveAttackRecoveryTicks(unit);
  unit.attackIntervalTicks = resolveEffectiveAttackCooldownTicks(unit);
  unit.nextAttackReadyTick = 0;
  unit.nextAttackAt = unit.nextAttackReadyTick;
}

function applyMovementCadence(unit) {
  unit.movementRange = resolveMovementRange(unit);
  unit.movementCooldownTicks = resolveMovementCooldownTicks(unit);
  unit.nextMovementReadyTick = 0;
}

function markUnitAttacked(unit, tick) {
  const nextReadyTick = tick + unit.attackIntervalTicks;
  unit.nextAttackReadyTick = nextReadyTick;
  unit.nextAttackAt = nextReadyTick;
}

function markUnitMoved(unit, tick) {
  unit.nextMovementReadyTick = tick + unit.movementCooldownTicks;
}

function startAttackWindups(attackIntents, pendingHitEvents, tick, logger = null, board = null) {
  for (const intent of attackIntents) {
    const { actor, target } = intent;
    if (!actor.isAlive || target.deathResolved) continue;
    logger?.logAttackStart(actor, target, board);
    pendingHitEvents.push({
      actor,
      target,
      hitTick: tick + actor.attackWindupTicks,
      order: pendingHitEvents.length,
    });
  }
}

function startAbilityWindups(activeCastIntents, pendingAbilityEvents, tick, logger = null, board = null) {
  for (const intent of activeCastIntents) {
    const { caster, target } = intent;
    if (!caster.isAlive || (target && target.deathResolved)) continue;
    logger?.logAbilityStart(caster, intent.targets || [], intent.ability.id, board);
    pendingAbilityEvents.push({
      ...intent,
      castTick: tick + GameRules.DefaultAbilityWindupTicks,
      order: pendingAbilityEvents.length,
    });
  }
}

function resolveMovementIntents(movementIntents, match, logger) {
  movementIntents.sort((a, b) => stableUnitOrder(a.actor, b.actor));

  for (const intent of movementIntents) {
    const { actor, targetPos } = intent;
    if (!actor.isAlive) continue;

    const fromPos = logger ? match.board.getUnitPosition(actor) : null;
    const moved = match.board.moveUnitToward(actor, targetPos, actor.movementRange);
    if (moved && logger) {
      const toPos = match.board.getUnitPosition(actor);
      logger.logMovement(actor, fromPos, toPos);
    }
  }
}

function resolveAttackCooldownTicks(unit) {
  // All units share the default cooldown in the first Combat V2 pass. Later tuning can
  // specialise this per definition without changing the runtime contract.
  return GameRules.DefaultAttackCooldownTicks;
}

function resolveAttackSpeedMultiplier(unit) {
  return GameRules.DefaultAttackSpeedMultiplier;
}

function resolveAttackWindupTicks(unit) {
  return GameRules.DefaultAttackWindupTicks;
}

function resolveAttackRecoveryTicks(unit) {
  return GameRules.DefaultAttackRecoveryTicks;
}

function resolveMovementRange(unit) {
  return GameRules.DefaultMovementRange;
}

function resolveMovementCooldownTicks(unit) {
  return GameRules.DefaultMovementCooldownTicks;
}

export function resolveEffectiveAttackCooldownTicks(unit) {
  const baseCooldown = unit && unit.attackCooldownTicks > 0
    ? unit.attackCooldownTicks
    : GameRules.DefaultAttackCooldownTicks;
  const speedMultiplier = unit && unit.attackSpeedMultiplier > 0
    ? unit.attackSpeedMultiplier
    : GameRules.DefaultAttackSpeedMultiplier;
  const effectiveCooldown = Math.ceil(baseCooldown / speedMultiplier);
  return Math.max(GameRules.MinimumAttackCooldownTicks, effectiveCooldown);
}

function applyRangeProfile(unit) {
  unit.attackRange = resolveAttackRange(unit);
  unit.preferredMinRange = resolvePreferredMinRange(unit);
}

function resolveAttackRange(unit) {
  if (!unit.sourceHero || !unit.sourceHero.definition) return GameRules.DefaultMeleeRange;
  // Ranger and Ninja are designated ranged units in the MVP slot model.
  const effectId = unit.sourceHero.definition.effectId;
  if (effectId === HeroEffectId.RangerBackline) return GameRules.DefaultLongRangedRange;
  if (effectId === HeroEffectId.NinjaLowestTarget) return GameRules.DefaultShortRangedRange;
  return GameRules.DefaultMeleeRange;
}

function resolvePreferredMinRange(unit) {
  if (unit.attackRange <= GameRules.DefaultMeleeRange) return 0;
  return Math.min(GameRules.DefaultRangedPreferredMinRange, unit.attackRange);
}

// Sort comparator: lower nextAttackAt first, then player-side first (tie-break only),
// then lower slot, then unitId lexicographic order for full stability.
function combatActionOrder(a, b) {
  const aTick = a.nextAttackReadyTick ?? a.nextAttackAt;
  const bTick = b.nextAttackReadyTick ?? b.nextAttackAt;
  if (aTick !== bTick) return aTick - bTick;
  return stableUnitOrder(a, b);
}

function stableUnitOrder(a, b) {
  if (a.isPlayerSide !== b.isPlayerSide) return a.isPlayerSide ? -1 : 1;
  if (a.slot !== b.slot) return a.slot - b.slot;
  if (a.unitId < b.unitId) return -1;
  if (a.unitId > b.unitId) return 1;
  return 0;
}

// --- Target selection ---------------------------------------------------------

function findTarget(unit, match, combatRound) {
  // Round-conditioned overrides (BackBat, etc.) stay in HeroEffects for now.
  const overridden = HeroEffects.overrideTarget(unit, match.oppositeTeam(unit).units, combatRound);
  if (overridden) return overridden;

  const mode = getBasicAttackMode(unit);
  const target = selectTarget({ actor: unit, match, mode, currentTargetUnitId: unit.currentTargetUnitId });
  if (target) unit.currentTargetUnitId = target.unitId;
  return target;
}

// Slot-range helper kept for relic/status helpers that still use formation ordering.
function findLeftmostLivingUnit(units, minSlot, maxSlot) {
  let bestTarget = null;
  for (const unit of units) {
    if (!unit.isAlive || unit.slot < minSlot || unit.slot > maxSlot) continue;
    if (bestTarget === null || unit.slot < bestTarget.slot) bestTarget = unit;
  }
  return bestTarget;
}

// --- Relic / status helpers ---------------------------------------------------

function applyCombatStartRelicStatuses(run, playerUnits, logger) {
  if (!hasRelic(run, RelicId.ShieldClause)) return;
  const target = findLeftmostLivingUnit(playerUnits, 0, GameRules.FrontlineSlots - 1);
  if (!target) return;
  const added = target.statuses.add(CombatStatusId.Guarded);
  if (added && logger) {
    logger.logStatusChange(target, `${GameRules.ShieldClauseRelicName} grants Guarded to ${target.displayName}.`);
  }
}

function applyAttackStatuses(attacker, defender, logger) {
  if (!attacker || !defender || !attacker.sourceEnemy) return;
  for (const statusId of attacker.sourceEnemy.attackStatuses) {
    const added = defender.statuses.add(statusId);
    if (added && logger) {
      logger.logStatusChange(defender,
        `${attacker.displayName} applies ${GameRulesFns.getCombatStatusLabel(statusId)} to ${defender.displayName}.`);
    }
  }
}

function applyRelicStatus(target, statusId, relicName, logger) {
  if (!target || !target.statuses) return;
  const added = target.statuses.add(statusId);
  if (added && logger) {
    logger.logStatusChange(target,
      `${relicName} applies ${GameRulesFns.getCombatStatusLabel(statusId)} to ${target.displayName}.`);
  }
}

function applyOutgoingStatusModifiers(attacker, damage, logger) {
  if (!attacker || !attacker.statuses) return damage;

  if (attacker.statuses.has(CombatStatusId.Weakened)) {
    const before = damage;
    damage -= GameRules.WeakenedAttackPenalty;
    if (damage < 0) damage = 0;
    if (logger) logger.logStatusChange(attacker, `${attacker.displayName} is Weakened (${before} -> ${damage} attack).`);
  }

  if (attacker.statuses.has(CombatStatusId.Burned)) {
    const before = damage;
    damage -= GameRules.BurnedAttackPenalty;
    if (damage < 0) damage = 0;
    if (logger) logger.logStatusChange(attacker, `${attacker.displayName} is Burned (${before} -> ${damage} attack).`);
  }

  if (attacker.statuses.has(CombatStatusId.Inspired)) {
    const before = damage;
    damage += GameRules.InspiredAttackBonus;
    attacker.statuses.remove(CombatStatusId.Inspired);
    if (logger) logger.logStatusChange(attacker, `${attacker.displayName} spends Inspired (${before} -> ${damage} attack).`);
  }

  return damage;
}

function applyIncomingStatusModifiers(defender, damage, logger) {
  if (!defender || !defender.statuses) return damage;

  if (defender.statuses.has(CombatStatusId.Marked)) {
    const before = damage;
    damage += GameRules.MarkedIncomingDamageBonus;
    defender.statuses.remove(CombatStatusId.Marked);
    if (logger) logger.logStatusChange(defender, `${defender.displayName} is Marked (${before} -> ${damage} incoming damage).`);
  }

  if (defender.statuses.has(CombatStatusId.Guarded)) {
    const before = damage;
    damage = Math.floor((damage + GameRules.GuardedDamageDivisor - 1) / GameRules.GuardedDamageDivisor);
    defender.statuses.remove(CombatStatusId.Guarded);
    if (logger) logger.logStatusChange(defender, `${defender.displayName} spends Guarded (${before} -> ${damage} incoming damage).`);
  }

  return damage;
}

function applyPostAttackStatusDamage(attacker, logger) {
  if (!attacker || !attacker.isAlive || !attacker.statuses) return;

  if (attacker.statuses.has(CombatStatusId.Burned)) {
    applyStatusDamage(attacker, CombatStatusId.Burned, GameRules.BurnedSelfDamage, logger);
    if (!attacker.isAlive) return;
  }

  if (attacker.statuses.has(CombatStatusId.Poisoned)) {
    const poisonDamage = attacker.statuses.poisonDamage;
    applyStatusDamage(attacker, CombatStatusId.Poisoned, poisonDamage, logger);
    if (attacker.isAlive) {
      attacker.statuses.increasePoisonDamage();
      if (logger) logger.logStatusChange(attacker, `${attacker.displayName}'s poison rises to ${attacker.statuses.poisonDamage}.`);
    }
  }
}

function applyStatusDamage(unit, statusId, damage, logger) {
  if (damage <= 0) return;
  unit.currentHealth -= damage;
  if (unit.currentHealth < 0) unit.currentHealth = 0;
  if (logger) {
    logger.logStatusDamage(unit, statusId, damage);
    if (!unit.isAlive) {
      unit.deathResolved = true;
      logger.logDeath(unit);
    }
  }
}

// --- Shared unit utilities ---------------------------------------------------

function hasLivingUnits(units) {
  for (const unit of units) {
    if (unit.isAlive) return true;
  }
  return false;
}

function copyUnitSnapshots(source, destination) {
  destination.length = 0;
  for (const unit of source) {
    const snapshot = new CombatUnit(unit.displayName, unit.attack, unit.currentHealth, unit.maxHealth, unit.isPlayerSide, unit.slot, unit.sourceHero, unit.sourceEnemy);
    snapshot.copyStatusesFrom(unit);
    destination.push(snapshot);
  }
}

function sortUnitsBySlot(units) {
  units.sort((a, b) => {
    if (a.slot < b.slot) return -1;
    if (a.slot > b.slot) return 1;
    return 0;
  });
}

function getRivalRaceScale(encounter) {
  if (!encounter || encounter.type !== EncounterType.RivalGhost) {
    return { attack: GameRules.NoCombatMultiplier, health: GameRules.NoCombatMultiplier };
  }

  const lead = Math.max(0, encounter.rivalLead || 0);
  return {
    attack: 1 + Math.min(GameRules.RivalRaceAttackLeadCap, GameRules.RivalRaceAttackLeadFactor * lead),
    health: 1 + Math.min(GameRules.RivalRaceHpLeadCap, GameRules.RivalRaceHpLeadFactor * lead),
  };
}
