import { CombatResult } from "../data/CombatResult.js";
import { CombatUnit } from "../data/CombatUnit.js";
import { CombatUnitState } from "../data/CombatUnitState.js";
import { CombatMatch } from "./CombatMatch.js";
import { CombatTeam } from "./CombatTeam.js";
import { CombatBoard } from "./CombatBoard.js";
import { CombatLogger } from "./CombatLogger.js";
import { HeroEffects } from "./HeroEffects.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { HeroRole, RelicId, CombatStatusId, EncounterType, HeroEffectId } from "../data/enums.js";
import { getScaledHeroMaxHealth, getRelicAttackBonus, hasRelic } from "../run/heroStats.js";
import { resolvePlayerBoardPosition, resolveEnemyBoardPosition } from "./BoardPlacement.js";

export class CombatManager {
  constructor() {
    this._run = null;
    this._knightRedirectsRemaining = 0;
    this._redInkBrandApplied = false;
  }

  startCombat(run, encounter) {
    const result = new CombatResult();
    const logger = new CombatLogger();

    this._run = run;
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

    // Timing is seeded by the build functions; ensure all units start ready at tick 0.
    for (const u of match.allUnits) {
      u.nextAttackAt = 0;
    }

    const maxTicks = GameRules.CombatTurnLimit * GameRules.CombatTicksPerRound;

    for (let tick = 0; tick < maxTicks; tick++) {
      match.currentTick = tick;
      const currentRound = Math.floor(tick / GameRules.CombatTicksPerRound) + 1;

      // Fire end-of-round effects when crossing a round boundary.
      if (tick > 0 && tick % GameRules.CombatTicksPerRound === 0) {
        const roundJustEnded = currentRound - 1;
        HeroEffects.onEndOfCombatRound(roundJustEnded, run, encounter, playerUnits, enemyUnits, result, logger);
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

      // Collect units ready to act this tick and execute in deterministic order.
      const readyUnits = match.allUnits.filter(u => u.isAlive && u.nextAttackAt <= tick);
      readyUnits.sort(combatActionOrder);

      for (const unit of readyUnits) {
        if (!unit.isAlive) continue; // may have died earlier this tick

        let target = findTarget(unit, match.oppositeTeam(unit).units, currentRound);
        if (!target) continue;

        // Knight redirect only applies when an enemy hits a player backline hero.
        if (!unit.isPlayerSide) {
          const redirect = HeroEffects.tryRedirectToKnight(target, playerUnits, this._knightRedirectsRemaining, logger);
          target = redirect.target;
          this._knightRedirectsRemaining = redirect.remaining;
          if (!target) continue;
        }

        if (match.board.canAttack(unit, target)) {
          // Target is in range: attack.
          HeroEffects.onAttack(unit, target, logger);
          this._applyAttack(unit, target, logger);
          // Remove killed units from board immediately so same-tick pathfinding is unblocked.
          if (!target.isAlive) match.board.removeUnit(target);
          if (!unit.isAlive) match.board.removeUnit(unit);
        } else {
          // Target is out of range: move one step toward it.
          const targetPos = match.board.getUnitPosition(target);
          if (targetPos) {
            const moved = match.board.moveUnitToward(unit, targetPos, GameRules.DefaultMovementRange);
            if (moved && logger) {
              const newPos = match.board.getUnitPosition(unit);
              logger.logMessage(`${unit.displayName} moves to (${newPos.q},${newPos.r}).`);
            }
          }
        }

        unit.nextAttackAt = tick + unit.attackIntervalTicks;

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
    }

    result.playerWon = false;
    logger.logTurnLimit();
    logger.logFinalResult(false);
    this._finishResult(result, playerUnits, enemyUnits, logger);
    return result;
  }

  _applyAttack(attacker, defender, logger) {
    let damage = attacker.attack;

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

    if (!defender.isAlive) {
      logger.logDeath(defender);
      HeroEffects.onKill(attacker, defender, this._run, logger);
    } else {
      applyAttackStatuses(attacker, defender, logger);
      HeroEffects.onSurvivingAttack(attacker, defender, logger);
      this._applyRelicAttackStatuses(attacker, defender, logger);
    }

    applyPostAttackStatusDamage(attacker, logger);
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
    copyUnitSnapshots(playerUnits, result.playerFinalUnits);
    copyUnitSnapshots(enemyUnits, result.enemyFinalUnits);
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
    unit.attackIntervalTicks = resolveAttackInterval(unit);
    unit.attackRange = resolveAttackRange(unit);
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

  for (let i = 0; i < encounter.enemies.length; i++) {
    const enemy = encounter.enemies[i];
    const raceScale = getRivalRaceScale(encounter);
    const attack = GameRulesFns.scaleCombatStat(
      GameRulesFns.scaleCombatStat(enemy.attack, run ? run.enemyDamageMultiplier : GameRules.NoCombatMultiplier),
      raceScale.attack,
    );
    const health = GameRulesFns.scaleCombatStat(
      GameRulesFns.scaleCombatStat(enemy.health, run ? run.enemyHealthMultiplier : GameRules.NoCombatMultiplier),
      raceScale.health,
    );
    const unitId = `e${i}`;
    const unit = new CombatUnitState(unitId, enemy.displayName, attack, health, health, false, i, null, enemy);
    unit.attackIntervalTicks = resolveAttackInterval(unit);
    unit.attackRange = resolveAttackRange(unit);
    for (const status of enemy.startingStatuses) {
      unit.statuses.add(status);
    }
    enemyUnits.push(unit);
  }

  sortUnitsBySlot(enemyUnits);
  return enemyUnits;
}

// --- Timing helpers -----------------------------------------------------------

function resolveAttackInterval(unit) {
  // All units share the default interval in the MVP. Later issues may specialise this
  // per definition for heroes/enemies with different attack speeds.
  return GameRules.DefaultAttackIntervalTicks;
}

function resolveAttackRange(unit) {
  if (!unit.sourceHero || !unit.sourceHero.definition) return GameRules.DefaultMeleeRange;
  // Ranger and Ninja are designated ranged units in the MVP slot model.
  const effectId = unit.sourceHero.definition.effectId;
  if (effectId === HeroEffectId.RangerBackline || effectId === HeroEffectId.NinjaLowestTarget) {
    return GameRules.DefaultRangedRange;
  }
  return GameRules.DefaultMeleeRange;
}

// Sort comparator: lower nextAttackAt first, then player-side first (tie-break only),
// then lower slot, then unitId lexicographic order for full stability.
function combatActionOrder(a, b) {
  if (a.nextAttackAt !== b.nextAttackAt) return a.nextAttackAt - b.nextAttackAt;
  if (a.isPlayerSide !== b.isPlayerSide) return a.isPlayerSide ? -1 : 1;
  if (a.slot !== b.slot) return a.slot - b.slot;
  if (a.unitId < b.unitId) return -1;
  if (a.unitId > b.unitId) return 1;
  return 0;
}

// --- Target selection ---------------------------------------------------------

function findTarget(attacker, defenders, combatRound) {
  const overridden = HeroEffects.overrideTarget(attacker, defenders, combatRound);
  if (overridden) return overridden;

  const frontlineTarget = findLeftmostLivingUnit(defenders, 0, GameRules.FrontlineSlots - 1);
  if (frontlineTarget) return frontlineTarget;

  return findLeftmostLivingUnit(defenders, GameRules.FrontlineSlots, GameRules.MaxPartySize - 1);
}

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
    if (!unit.isAlive) logger.logDeath(unit);
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
