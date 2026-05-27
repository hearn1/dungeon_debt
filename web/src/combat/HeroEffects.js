// Ported from DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs
// Static-style helper object keyed by effect behavior. C# `out`/`ref`
// parameters for the knight-redirect counter become return values here:
//   onCombatStart(...) returns knightRedirectsRemaining (number)
//   tryRedirectToKnight(...) returns { target, remaining }

import { HeroRole, HeroTier, HeroEffectId, EnemyEffectId, EncounterEffectId, CombatStatusId } from "../data/enums.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";

export const HeroEffects = {
  applyTierStatSeed(hero) {
    if (!hero || !hero.definition) return;
    hero.veteranTier = GameRulesFns.getVeteranTierForXp(hero.veteranXp);
    hero.attack = this.getTierAdjustedAttack(hero.definition, hero.tier) + getVeteranAttackBonus(hero);
    hero.upkeepThisRound = this.getTierAdjustedUpkeep(hero.definition, hero.tier);
  },

  getTierAdjustedMaxHealth(hero) {
    if (!hero || !hero.definition) return 0;
    return getTierAdjustedMaxHealthDef(hero.definition, hero.tier) + getVeteranHealthBonus(hero);
  },

  getTierAdjustedAttack(hero, tier) {
    if (!hero) return 0;
    if (tier === HeroTier.Gold) {
      return GameRulesFns.scaleCombatStat(hero.baseAttack, GameRules.GoldStatMultiplier);
    }
    let attack = hero.baseAttack;
    if (tier === HeroTier.Silver && hasSilverAttackBonus(hero)) {
      attack += GameRules.SilverStatAttackBonus;
    }
    return attack;
  },

  getTierAdjustedMaxHealthDef(hero, tier) {
    return getTierAdjustedMaxHealthDef(hero, tier);
  },

  getTierAdjustedUpkeep(hero, tier) {
    if (!hero) return 0;
    if (tier === HeroTier.Gold) return hero.baseUpkeep + GameRules.GoldUpkeepIncrease;
    let upkeep = hero.baseUpkeep;
    if (tier === HeroTier.Silver
      && (hero.effectId === HeroEffectId.GolemArmor
        || hero.effectId === HeroEffectId.WizardScaling
        || hero.effectId === HeroEffectId.NinjaLowestTarget)) {
      upkeep -= GameRules.SilverUpkeepReduction;
      if (upkeep < 0) upkeep = 0;
    }
    return upkeep;
  },

  onCombatStart(run, encounter, playerUnits, enemyUnits, logger) {
    let knightRedirectsRemaining = 0;

    // Knight: arm the redirect counter. Silver Knights redirect twice.
    for (const unit of playerUnits) {
      if (!unit.isAlive || !unit.sourceHero || !unit.sourceHero.definition) continue;
      if (unit.sourceHero.definition.effectId === HeroEffectId.KnightRedirect) {
        const silverKnight = hasSilverEffectTier(unit.sourceHero.tier);
        knightRedirectsRemaining = silverKnight
          ? GameRules.SilverKnightRedirectCount
          : GameRules.BronzeKnightRedirectCount;
        if (silverKnight) {
          const added = unit.statuses.add(CombatStatusId.Guarded);
          if (added && logger) {
            logger.logStatusChange(unit, `${unit.displayName} starts Guarded (Silver upgrade).`);
          }
        }
        break;
      }
    }

    // Wizard scaling: +1 attack if full upkeep was paid last round.
    if (run && run.fullUpkeepPaidLastRound) {
      for (const unit of playerUnits) {
        if (!unit.isAlive || !unit.sourceHero || !unit.sourceHero.definition) continue;
        if (unit.sourceHero.definition.effectId === HeroEffectId.WizardScaling) {
          unit.attack += 1;
          if (logger) logger.logMessage(`${unit.displayName} gains +1 attack (full upkeep paid).`);
        }
      }
    }

    // Enchanter: +1 attack to adjacent Damage allies. Silver buffs all Damage allies.
    for (let i = 0; i < playerUnits.length; i++) {
      const unit = playerUnits[i];
      if (!unit.isAlive || !unit.sourceHero || !unit.sourceHero.definition) continue;
      if (unit.sourceHero.definition.effectId !== HeroEffectId.EnchanterAdjacent) continue;

      const silver = hasSilverEffectTier(unit.sourceHero.tier);
      for (let j = 0; j < playerUnits.length; j++) {
        if (j === i) continue;
        const ally = playerUnits[j];
        if (!ally.isAlive || !ally.sourceHero || !ally.sourceHero.definition) continue;
        if (ally.sourceHero.definition.role !== HeroRole.Damage) continue;
        if (!silver) {
          let slotDelta = ally.slot - unit.slot;
          if (slotDelta < 0) slotDelta = -slotDelta;
          if (slotDelta !== 1) continue;
        }
        ally.attack += 1;
        if (logger) logger.logMessage(`${unit.displayName} enchants ${ally.displayName} (+1 attack).`);
      }
    }

    // Debt Wraith: scale attack with current debt.
    if (run) {
      const wraithBaseAttack = 1 + Math.floor(run.debt / GameRules.DebtWraithDebtDivisor);
      const wraithAttack = GameRulesFns.scaleCombatStat(wraithBaseAttack, run.enemyDamageMultiplier);
      for (const unit of enemyUnits) {
        if (!unit.sourceEnemy) continue;
        if (unit.sourceEnemy.effectId === EnemyEffectId.DebtWraithScales) {
          unit.attack = wraithAttack;
          if (logger) logger.logMessage(`${unit.displayName} scales to ${wraithAttack} attack (debt ${run.debt}).`);
        }
      }
    }

    return knightRedirectsRemaining;
  },

  overrideTarget(attacker, defenders, combatRound) {
    if (!attacker || !defenders) return null;

    // Backline Bat: on combat round 2, hit lowest-HP backline player hero.
    if (!attacker.isPlayerSide
      && combatRound === 2
      && attacker.sourceEnemy
      && attacker.sourceEnemy.effectId === EnemyEffectId.BackBatBackline) {
      const best = findLowestHpInSlotRange(defenders, GameRules.FrontlineSlots, GameRules.MaxPartySize - 1);
      if (best) return best;
    }

    // Ninja: lowest-HP living enemy (ties: leftmost slot).
    if (attacker.isPlayerSide
      && attacker.sourceHero
      && attacker.sourceHero.definition
      && attacker.sourceHero.definition.effectId === HeroEffectId.NinjaLowestTarget) {
      const best = findLowestHpInSlotRange(defenders, 0, Number.MAX_SAFE_INTEGER);
      if (best) return best;
    }

    return null;
  },

  tryRedirectToKnight(defender, playerUnits, knightRedirectsRemaining, logger) {
    if (knightRedirectsRemaining <= 0 || !defender || !playerUnits) {
      return { target: defender, remaining: knightRedirectsRemaining };
    }
    if (!defender.isPlayerSide) return { target: defender, remaining: knightRedirectsRemaining };
    if (defender.slot < GameRules.FrontlineSlots) return { target: defender, remaining: knightRedirectsRemaining };

    const knight = findLivingKnight(playerUnits);
    if (!knight || knight === defender) return { target: defender, remaining: knightRedirectsRemaining };

    knightRedirectsRemaining -= 1;
    if (logger) logger.logMessage(`${knight.displayName} redirects the hit from ${defender.displayName}.`);
    return { target: knight, remaining: knightRedirectsRemaining };
  },

  getDamageReduction(defender) {
    if (!defender || !defender.sourceHero || !defender.sourceHero.definition) return 0;
    if (defender.sourceHero.definition.effectId === HeroEffectId.GolemArmor) return 1;
    return 0;
  },

  onAttack(attacker, _defender, logger) {
    if (!attacker || !attacker.isPlayerSide || !attacker.sourceHero || !attacker.sourceHero.definition) return;
    if (attacker.sourceHero.definition.effectId !== HeroEffectId.BarbarianRage) return;

    if (attacker._barbarianBaseAttack === undefined) {
      attacker._barbarianBaseAttack = attacker.attack;
    }

    const rageActive = attacker.currentHealth * 2 <= attacker.maxHealth;
    const nextAttack = attacker._barbarianBaseAttack + (rageActive ? 2 : 0);
    if (attacker.attack === nextAttack) return;

    attacker.attack = nextAttack;
    if (logger && rageActive) logger.logMessage(`${attacker.displayName} rages (+2 attack).`);
  },

  onSurvivingAttack(attacker, defender, logger) {
    if (!attacker || !defender || !attacker.isPlayerSide) return;
    if (!attacker.sourceHero || !attacker.sourceHero.definition) return;
    if (!hasSilverEffectTier(attacker.sourceHero.tier)) return;

    let statusId = CombatStatusId.None;
    const effectId = attacker.sourceHero.definition.effectId;
    if (effectId === HeroEffectId.NinjaLowestTarget) statusId = CombatStatusId.Poisoned;
    else if (effectId === HeroEffectId.WizardScaling) statusId = CombatStatusId.Burned;
    else if (effectId === HeroEffectId.EnchanterAdjacent) statusId = CombatStatusId.Weakened;

    if (statusId === CombatStatusId.None) return;

    const added = defender.statuses.add(statusId);
    if (added && logger) {
      logger.logStatusChange(defender,
        `${attacker.displayName} applies ${GameRulesFns.getCombatStatusLabel(statusId)} (Silver upgrade) to ${defender.displayName}.`);
    }
  },

  onKill(attacker, _defeatedUnit, run, logger) {
    if (!attacker || !attacker.isPlayerSide) return;
    if (!attacker.sourceHero || !attacker.sourceHero.definition) return;
    if (attacker.sourceHero.definition.effectId === HeroEffectId.NinjaLowestTarget && run) {
      run.gold += 1;
      if (logger) logger.logMessage(`${attacker.displayName} loots +1 gold.`);
    }
  },

  onEndOfCombatRound(combatRound, run, encounter, playerUnits, enemyUnits, result, logger) {
    // Priest heal. Silver Priests heal more per round.
    for (const priest of playerUnits) {
      if (!priest.isAlive || !priest.sourceHero || !priest.sourceHero.definition) continue;
      if (priest.sourceHero.definition.effectId !== HeroEffectId.PriestHeal) continue;
      const amount = hasSilverEffectTier(priest.sourceHero.tier)
        ? GameRules.SilverPriestHealAmount
        : GameRules.FrontlineHealAmount;
      healLeftmostFrontlineAlly(priest, playerUnits, amount, logger);
    }

    // Paladin and Cleric group heals stack independently.
    for (const healer of playerUnits) {
      if (!healer.isAlive || !healer.sourceHero || !healer.sourceHero.definition) continue;
      const effectId = healer.sourceHero.definition.effectId;
      if (effectId !== HeroEffectId.PaladinAuraHeal && effectId !== HeroEffectId.ClericGroupHeal) continue;
      healAllLivingAllies(healer, playerUnits, 1, logger);
    }

    // Frugal Healer reuses the Priest-style frontline heal for its ghost team.
    for (const healer of enemyUnits) {
      if (!healer.isAlive || !healer.sourceEnemy) continue;
      if (healer.sourceEnemy.effectId !== EnemyEffectId.FrugalGhostHeal) continue;
      healLeftmostFrontlineAlly(healer, enemyUnits, GameRules.FrontlineHealAmount, logger);
    }

    // Goblin Thief: flag if any are alive at end of the steal round.
    if (combatRound === GameRules.GoblinThiefStealRound && result) {
      for (const unit of enemyUnits) {
        if (!unit.isAlive || !unit.sourceEnemy) continue;
        if (unit.sourceEnemy.effectId === EnemyEffectId.GoblinStealGold) {
          result.survivorFlags["goblinStoleGold"] = true;
          if (logger) logger.logMessage(`${unit.displayName} escapes with the gold.`);
          break;
        }
      }
    }

    // Dungeon Auditor periodic damage.
    if (encounter
      && encounter.encounterEffectId === EncounterEffectId.FinalBossDamage
      && combatRound % GameRules.AuditorDamageEvery === 0) {
      for (const hero of playerUnits) {
        if (!hero.isAlive) continue;
        const damage = GameRules.AuditorDamage;
        hero.currentHealth -= damage;
        if (hero.currentHealth < 0) hero.currentHealth = 0;
        if (logger) {
          logger.logMessage(`Dungeon Auditor audits ${hero.displayName} for ${damage}.`);
          if (!hero.isAlive) logger.logDeath(hero);
        }
      }
    }
  },

  onCombatEnd(result, run, _playerUnits, enemyUnits, logger) {
    // Bard: gold per Bard in party on a win. Silver Bards earn more.
    if (result && result.playerWon && run) {
      for (const hero of run.party) {
        if (!hero || !hero.definition) continue;
        if (hero.definition.effectId === HeroEffectId.BardGoldOnWin) {
          const gain = hasSilverEffectTier(hero.tier) ? GameRules.SilverBardWinGold : GameRules.BronzeBardWinGold;
          run.gold += gain;
          if (logger) logger.logMessage(`${hero.definition.displayName} sings for +${gain} gold.`);
        }
      }
    }

    // Treasure Leech: flag if any alive at combat end.
    if (result && enemyUnits) {
      for (const unit of enemyUnits) {
        if (!unit.isAlive || !unit.sourceEnemy) continue;
        if (unit.sourceEnemy.effectId === EnemyEffectId.TreasureLeechRewardDrain) {
          result.survivorFlags["treasureLeechSurvived"] = true;
          break;
        }
      }
    }
  },

  applyPreUpkeep(run) {
    if (!run) return;

    // Apprentice: each Apprentice reduces a Wizard ally's upkeep. Silver reduces by 2.
    for (const apprentice of run.party) {
      if (!apprentice || !apprentice.definition) continue;
      if (apprentice.definition.effectId !== HeroEffectId.ApprenticeWizardSupport) continue;
      const wizard = findFirstByEffect(run.party, HeroEffectId.WizardScaling);
      if (!wizard) continue;
      const reduction = hasSilverEffectTier(apprentice.tier)
        ? GameRules.SilverApprenticeWizardReduction
        : GameRules.BronzeApprenticeWizardReduction;
      let reduced = wizard.upkeepThisRound - reduction;
      if (reduced < 0) reduced = 0;
      wizard.upkeepThisRound = reduced;
    }

    // Treasurer: reduce the highest-upkeep ally(ies). Silver reduces top two.
    for (const treasurer of run.party) {
      if (!treasurer || !treasurer.definition) continue;
      if (treasurer.definition.effectId !== HeroEffectId.TreasurerUpkeepReduce) continue;
      const targetCount = hasSilverEffectTier(treasurer.tier)
        ? GameRules.SilverTreasurerTargets
        : GameRules.BronzeTreasurerTargets;
      const targeted = [];
      for (let t = 0; t < targetCount; t++) {
        const target = findHighestUpkeepExcluding(run.party, treasurer, targeted);
        if (!target) break;
        targeted.push(target);
        let reduced = target.upkeepThisRound - GameRules.TreasurerUpkeepReduction;
        if (reduced < 0) reduced = 0;
        target.upkeepThisRound = reduced;
      }
    }
  },
};

function getTierAdjustedMaxHealthDef(hero, tier) {
  if (!hero) return 0;
  if (tier === HeroTier.Gold) {
    return GameRulesFns.scaleCombatStat(hero.baseHealth, GameRules.GoldStatMultiplier);
  }
  let max = hero.baseHealth;
  if (tier === HeroTier.Silver && hasSilverHealthBonus(hero)) {
    max += GameRules.SilverStatHealthBonus;
  }
  return max;
}

function hasSilverEffectTier(tier) {
  return tier === HeroTier.Silver || tier === HeroTier.Gold;
}

function hasSilverAttackBonus(hero) {
  if (!hero) return false;
  return hero.effectId === HeroEffectId.None || hero.effectId === HeroEffectId.RangerBackline;
}

function hasSilverHealthBonus(hero) {
  if (!hero) return false;
  return hero.effectId === HeroEffectId.None;
}

function getVeteranAttackBonus(hero) {
  if (!hero) return 0;
  return hero.veteranTier * GameRules.VeteranAttackBonusPerTier;
}

function getVeteranHealthBonus(hero) {
  if (!hero) return 0;
  return hero.veteranTier * GameRules.VeteranHealthBonusPerTier;
}

function findHighestUpkeepExcluding(party, exclude, alreadyTargeted) {
  let best = null;
  for (const candidate of party) {
    if (!candidate || candidate === exclude) continue;
    if (alreadyTargeted.includes(candidate)) continue;
    if (candidate.upkeepThisRound <= 0) continue;
    if (best === null || candidate.upkeepThisRound > best.upkeepThisRound) {
      best = candidate;
    }
  }
  return best;
}

function findLowestHpInSlotRange(units, minSlot, maxSlot) {
  let best = null;
  for (const unit of units) {
    if (!unit.isAlive || unit.slot < minSlot || unit.slot > maxSlot) continue;
    if (best === null
      || unit.currentHealth < best.currentHealth
      || (unit.currentHealth === best.currentHealth && unit.slot < best.slot)) {
      best = unit;
    }
  }
  return best;
}

function healLeftmostFrontlineAlly(healer, allies, healAmount, logger) {
  if (!healer || !healer.isAlive || !allies) return;
  let healTarget = findLeftmostLivingInSlotRange(allies, 0, GameRules.FrontlineSlots - 1);
  if (!healTarget) healTarget = healer;

  healUnit(healer, healTarget, healAmount, logger);
}

function healAllLivingAllies(healer, allies, healAmount, logger) {
  if (!healer || !healer.isAlive || !allies) return;
  for (const ally of allies) {
    if (!ally.isAlive) continue;
    healUnit(healer, ally, healAmount, logger);
  }
}

function healUnit(healer, healTarget, healAmount, logger) {
  let healed = healAmount;
  let newHealth = healTarget.currentHealth + healed;
  if (newHealth > healTarget.maxHealth) {
    healed = healTarget.maxHealth - healTarget.currentHealth;
    newHealth = healTarget.maxHealth;
  }
  if (healed <= 0) return;

  healTarget.currentHealth = newHealth;
  if (logger) logger.logHeal(healer, healTarget, healed);
}

function findLeftmostLivingInSlotRange(units, minSlot, maxSlot) {
  let best = null;
  for (const unit of units) {
    if (!unit.isAlive || unit.slot < minSlot || unit.slot > maxSlot) continue;
    if (best === null || unit.slot < best.slot) best = unit;
  }
  return best;
}

function findLivingKnight(playerUnits) {
  for (const unit of playerUnits) {
    if (!unit.isAlive || !unit.sourceHero || !unit.sourceHero.definition) continue;
    if (unit.sourceHero.definition.effectId === HeroEffectId.KnightRedirect) return unit;
  }
  return null;
}

function findFirstByEffect(party, effectId) {
  for (const hero of party) {
    if (!hero || !hero.definition) continue;
    if (hero.definition.effectId === effectId) return hero;
  }
  return null;
}
