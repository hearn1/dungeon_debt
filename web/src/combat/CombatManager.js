// Ported from DungeonDebt/Assets/Scripts/Combat/CombatManager.cs
import { CombatResult } from "../data/CombatResult.js";
import { CombatLogger } from "./CombatLogger.js";
import { CombatUnit } from "../data/CombatUnit.js";
import { HeroEffects } from "./HeroEffects.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { HeroRole, RelicId, CombatStatusId } from "../data/enums.js";
import { getScaledHeroMaxHealth, getRelicAttackBonus, hasRelic } from "../run/heroStats.js";

export class CombatManager {
  constructor() {
    this._run = null;
    this._knightRedirectsRemaining = 0;
    this._redInkBrandApplied = false;
  }

  startCombat(run, encounter) {
    const result = new CombatResult();
    const logger = new CombatLogger();
    const playerUnits = buildPlayerUnits(run);
    const enemyUnits = buildEnemyUnits(run, encounter);

    this._run = run;
    this._knightRedirectsRemaining = 0;
    this._redInkBrandApplied = false;

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

    for (let combatRound = 1; combatRound <= GameRules.CombatTurnLimit; combatRound++) {
      this._resolveSideActions(playerUnits, enemyUnits, combatRound, logger);
      if (!hasLivingUnits(enemyUnits)) {
        result.playerWon = true;
        result.combatRoundsElapsed = combatRound;
        logger.logFinalResult(true);
        this._finishResult(result, playerUnits, enemyUnits, logger);
        return result;
      }

      this._resolveSideActions(enemyUnits, playerUnits, combatRound, logger);
      if (!hasLivingUnits(playerUnits)) {
        result.playerWon = false;
        result.combatRoundsElapsed = combatRound;
        logger.logFinalResult(false);
        this._finishResult(result, playerUnits, enemyUnits, logger);
        return result;
      }

      HeroEffects.onEndOfCombatRound(combatRound, run, encounter, playerUnits, enemyUnits, result, logger);

      if (!hasLivingUnits(playerUnits)) {
        result.playerWon = false;
        result.combatRoundsElapsed = combatRound;
        logger.logFinalResult(false);
        this._finishResult(result, playerUnits, enemyUnits, logger);
        return result;
      }

      result.combatRoundsElapsed = combatRound;
    }

    result.playerWon = false;
    logger.logTurnLimit();
    logger.logFinalResult(false);
    this._finishResult(result, playerUnits, enemyUnits, logger);
    return result;
  }

  _resolveSideActions(attackers, defenders, combatRound, logger) {
    for (const attacker of attackers) {
      if (!attacker.isAlive) continue;

      let defender = findTarget(attacker, defenders, combatRound);
      if (!defender) return;

      // Knight redirect only applies when an enemy hits a player backline hero.
      if (!attacker.isPlayerSide) {
        const redirect = HeroEffects.tryRedirectToKnight(defender, defenders, this._knightRedirectsRemaining, logger);
        defender = redirect.target;
        this._knightRedirectsRemaining = redirect.remaining;
        if (!defender) return;
      }

      HeroEffects.onAttack(attacker, defender, logger);
      this._applyAttack(attacker, defender, logger);
    }
  }

  _applyAttack(attacker, defender, logger) {
    let damage = attacker.attack;
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

function buildPlayerUnits(run) {
  const playerUnits = [];
  if (!run) return playerUnits;

  for (const hero of run.party) {
    const maxHealth = getScaledHeroMaxHealth(hero, run);
    const attack = GameRulesFns.scaleCombatStat(hero.attack, run.heroDamageMultiplier)
      + getRelicAttackBonus(run, hero);
    const unit = new CombatUnit(hero.definition.displayName, attack, maxHealth, maxHealth, true, hero.formationSlot, hero, null);
    playerUnits.push(unit);
  }

  sortUnitsBySlot(playerUnits);
  return playerUnits;
}

function buildEnemyUnits(run, encounter) {
  const enemyUnits = [];
  if (!encounter) return enemyUnits;

  for (let i = 0; i < encounter.enemies.length; i++) {
    const enemy = encounter.enemies[i];
    const attack = GameRulesFns.scaleCombatStat(enemy.attack, run ? run.enemyDamageMultiplier : GameRules.NoCombatMultiplier);
    const health = GameRulesFns.scaleCombatStat(enemy.health, run ? run.enemyHealthMultiplier : GameRules.NoCombatMultiplier);
    const unit = new CombatUnit(enemy.displayName, attack, health, health, false, i, null, enemy);
    for (const status of enemy.startingStatuses) {
      unit.statuses.add(status);
    }
    enemyUnits.push(unit);
  }

  sortUnitsBySlot(enemyUnits);
  return enemyUnits;
}

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
