// Passive and active ability definitions for all MVP heroes (#159).
// Execute functions receive a ctx object shaped as:
//   Combat ctx: { caster, target, targets[], match, run, logger, abilityState }
//   PreUpkeep  : { hero, run }
//   CombatEnd  : { hero, run, result, logger }

import { AbilityDefinition } from "./AbilityDefinition.js";
import { AbilityId, AbilityType, AbilityTrigger, TargetShape, TargetingMode, CombatStatusId, HeroTier } from "../data/enums.js";
import { GameRules } from "../core/GameRules.js";
import { filterLiving, getAlliesOf, getEnemiesOf } from "./TargetingRules.js";
import { hexDistance } from "./CombatBoard.js";

// ---- Shared helpers --------------------------------------------------------

function healUnit(healer, target, amount, logger) {
  if (!target || !target.isAlive || amount <= 0) return;
  const capped = Math.min(amount, target.maxHealth - target.currentHealth);
  if (capped <= 0) return;
  target.currentHealth += capped;
  if (logger) logger.logHeal(healer, target, capped);
}

function applyStatus(target, statusId, sourceName, logger) {
  if (!target || !target.statuses) return;
  const added = target.statuses.add(statusId);
  if (added && logger) {
    logger.logStatusChange(target, `${sourceName} applies ${statusId} to ${target.displayName}.`);
  }
}

function dealDamage(source, target, damage, label, logger) {
  if (!target || !target.isAlive || damage <= 0) return;
  target.currentHealth -= damage;
  if (target.currentHealth < 0) target.currentHealth = 0;
  if (logger) {
    logger.logMessage(`${source.displayName} ${label} ${target.displayName} for ${damage}.`);
    if (!target.isAlive) logger.logDeath(target);
  }
}

function isSilver(hero) {
  return hero && (hero.tier === HeroTier.Silver || hero.tier === HeroTier.Gold || hero.tier === HeroTier.Diamond);
}

// Resolve AoE targets around a primary position for AdjacentEnemies shape.
function adjacentEnemies(caster, primary, match) {
  const primaryPos = match.board.getUnitPosition(primary);
  if (!primaryPos) return [primary];
  const enemies = filterLiving(getEnemiesOf(caster, match));
  const adj = enemies.filter(u => {
    const pos = match.board.getUnitPosition(u);
    return pos && hexDistance(primaryPos, pos) <= 1;
  });
  adj.sort((a, b) => {
    const pa = match.board.getUnitPosition(a);
    const pb = match.board.getUnitPosition(b);
    if (pa.q !== pb.q) return pa.q - pb.q;
    return pa.r - pb.r;
  });
  return adj.length > 0 ? adj : [primary];
}

// ============================================================
// WARRIOR
// ============================================================

export const BattleHardenedPassive = new AbilityDefinition({
  id: AbilityId.BattleHardened,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.OnDamageTaken,
  maxStacks: GameRules.AbilityBattleHardenedMaxStacks,
  execute({ caster, abilityState, logger }) {
    if (abilityState.stacks >= GameRules.AbilityBattleHardenedMaxStacks) return;
    abilityState.stacks += 1;
    caster.attack += GameRules.AbilityBattleHardenedAttackPerStack;
    if (logger) {
      logger.logMessage(`${caster.displayName} hardens (Battle Hardened +${GameRules.AbilityBattleHardenedAttackPerStack} attack, ${abilityState.stacks} stack(s)).`);
    }
  },
});

export const CleaveActive = new AbilityDefinition({
  id: AbilityId.Cleave,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownCleave,
  targetMode: TargetingMode.NearestEnemy,
  targetShape: TargetShape.AdjacentEnemies,
  execute({ caster, target, match, logger }) {
    const targets = adjacentEnemies(caster, target, match);
    for (const t of targets) {
      const damage = Math.max(1, Math.round(caster.attack * GameRules.AbilityCleaveAdjDamageMult));
      dealDamage(caster, t, damage, "Cleaves", logger);
    }
  },
});

// ============================================================
// FIGHTER
// ============================================================

export const MomentumPassive = new AbilityDefinition({
  id: AbilityId.Momentum,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.AfterAttack,
  maxStacks: GameRules.AbilityMomentumMaxStacks,
  execute({ caster, abilityState, logger }) {
    if (abilityState.stacks >= GameRules.AbilityMomentumMaxStacks) return;
    abilityState.stacks += 1;
    caster.attack += GameRules.AbilityMomentumAttackPerStack;
    if (logger) {
      logger.logMessage(`${caster.displayName} gains Momentum (+${GameRules.AbilityMomentumAttackPerStack} attack, ${abilityState.stacks} stack(s)).`);
    }
  },
});

export const GuardBreakActive = new AbilityDefinition({
  id: AbilityId.GuardBreak,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownGuardBreak,
  targetMode: TargetingMode.NearestEnemy,
  targetShape: TargetShape.Single,
  execute({ caster, target, logger }) {
    if (!target || !target.isAlive) return;
    dealDamage(caster, target, caster.attack + GameRules.AbilityGuardBreakDamageBonus, "Guard Breaks", logger);
  },
});

// ============================================================
// KNIGHT
// ============================================================

export const ProtectorPassive = new AbilityDefinition({
  id: AbilityId.Protector,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.CombatStart,
  execute() {
    // Knight redirect counter armed by CombatManager via HeroEffects.onCombatStart.
  },
});

export const InterceptActive = new AbilityDefinition({
  id: AbilityId.Intercept,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownIntercept,
  targetMode: TargetingMode.LowestHealthAlly,
  targetShape: TargetShape.Single,
  execute({ caster, target, logger }) {
    if (!target || !target.isAlive) return;
    applyStatus(target, CombatStatusId.Guarded, caster.displayName, logger);
    if (logger) logger.logMessage(`${caster.displayName} intercepts for ${target.displayName}.`);
  },
});

// ============================================================
// PALADIN
// ============================================================

export const HolyAuraPassive = new AbilityDefinition({
  id: AbilityId.HolyAura,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.EndOfRound,
  execute({ caster, match, logger }) {
    const allies = filterLiving(getAlliesOf(caster, match));
    let target = caster;
    for (const a of allies) {
      const pct = a.maxHealth > 0 ? a.currentHealth / a.maxHealth : 1;
      const selfPct = target.maxHealth > 0 ? target.currentHealth / target.maxHealth : 1;
      if (pct < selfPct) target = a;
    }
    healUnit(caster, target, 1, logger);
  },
});

export const DivineShieldActive = new AbilityDefinition({
  id: AbilityId.DivineShield,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownDivineShield,
  targetMode: TargetingMode.LowestHealthAlly,
  targetShape: TargetShape.Single,
  execute({ caster, target, logger }) {
    if (!target || !target.isAlive) return;
    applyStatus(target, CombatStatusId.Guarded, caster.displayName, logger);
    if (logger) logger.logMessage(`${caster.displayName} grants Divine Shield to ${target.displayName}.`);
  },
});

// ============================================================
// BARBARIAN
// ============================================================

export const RagePassive = new AbilityDefinition({
  id: AbilityId.Rage,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.AfterAttack,
  execute({ caster, abilityState, logger }) {
    if (abilityState.flags.baseAttack === undefined) {
      abilityState.flags.baseAttack = caster.attack;
    }
    const rageActive = caster.currentHealth * 2 <= caster.maxHealth;
    const desired = abilityState.flags.baseAttack + (rageActive ? GameRules.AbilityRageAttackBonus : 0);
    if (caster.attack === desired) return;
    caster.attack = desired;
    if (logger && rageActive) logger.logMessage(`${caster.displayName} rages (+${GameRules.AbilityRageAttackBonus} attack).`);
  },
});

export const LeapSlamActive = new AbilityDefinition({
  id: AbilityId.LeapSlam,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownLeapSlam,
  targetMode: TargetingMode.FurthestEnemy,
  targetShape: TargetShape.AdjacentEnemies,
  execute({ caster, target, match, logger }) {
    const targets = adjacentEnemies(caster, target, match);
    for (const t of targets) {
      const damage = Math.max(1, Math.round(caster.attack * GameRules.AbilityLeapSlamAdjDamageMult));
      dealDamage(caster, t, damage, "Leap Slams", logger);
    }
  },
});

// ============================================================
// GOLEM
// ============================================================

export const StoneSkinPassive = new AbilityDefinition({
  id: AbilityId.StoneSkin,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.CombatStart,
  execute() {
    // Damage reduction enforced in CombatManager._applyAttack via HeroEffects.getDamageReduction.
  },
});

export const EarthquakeActive = new AbilityDefinition({
  id: AbilityId.Earthquake,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownEarthquake,
  targetMode: TargetingMode.NearestEnemy,
  targetShape: TargetShape.AdjacentEnemies,
  execute({ caster, target, match, logger }) {
    const targets = adjacentEnemies(caster, target, match);
    for (const t of targets) {
      dealDamage(caster, t, GameRules.AbilityEarthquakeDamage, "Earthquake hits", logger);
    }
  },
});

// ============================================================
// RANGER
// ============================================================

export const EagleEyePassive = new AbilityDefinition({
  id: AbilityId.EagleEye,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.CombatStart,
  execute() {
    // FurthestEnemy targeting override lives in RoleBehavior._effectTargetOverrides.
  },
});

export const PowerShotActive = new AbilityDefinition({
  id: AbilityId.PowerShot,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownPowerShot,
  targetMode: TargetingMode.LowestHealthEnemy,
  targetShape: TargetShape.Single,
  execute({ caster, target, logger }) {
    if (!target || !target.isAlive) return;
    dealDamage(caster, target, caster.attack + GameRules.AbilityPowerShotDamageBonus, "Power Shots", logger);
  },
});

// ============================================================
// ROGUE
// ============================================================

export const BackstabPassive = new AbilityDefinition({
  id: AbilityId.Backstab,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.AfterAttack,
  execute({ caster, target, logger }) {
    if (!target || !target.isAlive) return;
    if (target.currentTargetUnitId === caster.unitId) return;
    dealDamage(caster, target, GameRules.AbilityBackstabDamageBonus, "Backstabs", logger);
  },
});

export const ShadowstepActive = new AbilityDefinition({
  id: AbilityId.Shadowstep,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownShadowstep,
  targetMode: TargetingMode.HighestAttackEnemy,
  targetShape: TargetShape.Single,
  execute({ caster, target, logger }) {
    if (!target || !target.isAlive) return;
    dealDamage(caster, target, caster.attack + GameRules.AbilityBackstabDamageBonus, "Shadowsteps on", logger);
  },
});

// ============================================================
// NINJA
// ============================================================

export const ExecutionerPassive = new AbilityDefinition({
  id: AbilityId.Executioner,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.AfterAttack,
  execute({ caster, target, logger }) {
    if (!target || !target.isAlive) return;
    const hpPct = target.maxHealth > 0 ? target.currentHealth / target.maxHealth : 1;
    if (hpPct > GameRules.AbilityExecutorLowHpThreshold) return;
    dealDamage(caster, target, GameRules.AbilityExecutorDamageBonus, "Executes", logger);
  },
});

export const AssassinateActive = new AbilityDefinition({
  id: AbilityId.Assassinate,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownAssassinate,
  targetMode: TargetingMode.LowestHealthEnemy,
  targetShape: TargetShape.Single,
  execute({ caster, target, logger }) {
    if (!target || !target.isAlive) return;
    dealDamage(caster, target, caster.attack + GameRules.AbilityExecutorDamageBonus, "Assassinates", logger);
  },
});

// ============================================================
// WIZARD
// ============================================================

export const ArcanePowerPassive = new AbilityDefinition({
  id: AbilityId.ArcanePower,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.CombatStart,
  execute() {
    // Scaling tracked via abilityState.castCount inside FireballActive.
  },
});

export const FireballActive = new AbilityDefinition({
  id: AbilityId.Fireball,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownFireball,
  targetMode: TargetingMode.NearestEnemy,
  targetShape: TargetShape.AdjacentEnemies,
  execute({ caster, target, match, abilityState, logger }) {
    const bonus = Math.min(abilityState.castCount, GameRules.AbilityArcanePowerMaxBonus);
    const targets = adjacentEnemies(caster, target, match);
    for (const t of targets) {
      const damage = caster.attack + GameRules.AbilityFireballDamage + bonus;
      const label = `Fireballs${bonus > 0 ? ` (Arcane Power +${bonus})` : ""}`;
      dealDamage(caster, t, damage, label, logger);
    }
  },
});

// ============================================================
// SORCERER
// ============================================================

export const BurnPassive = new AbilityDefinition({
  id: AbilityId.Burn,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.AfterAttack,
  execute({ caster, target, logger }) {
    if (!target || !target.isAlive) return;
    applyStatus(target, CombatStatusId.Burned, caster.displayName, logger);
  },
});

export const FlameWaveActive = new AbilityDefinition({
  id: AbilityId.FlameWave,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownFlameWave,
  targetMode: TargetingMode.NearestEnemy,
  targetShape: TargetShape.AdjacentEnemies,
  execute({ caster, target, match, logger }) {
    const targets = adjacentEnemies(caster, target, match);
    for (const t of targets) {
      const damage = Math.max(1, Math.round(caster.attack * GameRules.AbilityFlameWaveDamageMult));
      dealDamage(caster, t, damage, "Flame Waves", logger);
      applyStatus(t, CombatStatusId.Burned, caster.displayName, logger);
    }
  },
});

// ============================================================
// WARLOCK
// ============================================================

export const DebtMagicPassive = new AbilityDefinition({
  id: AbilityId.DebtMagic,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.CombatStart,
  execute({ caster, run, logger }) {
    if (!run) return;
    const boost = Math.min(
      GameRules.AbilityWarlockDebtCap,
      Math.floor(run.debt / GameRules.AbilityWarlockDebtDivisor),
    );
    if (boost > 0) {
      caster.attack += boost;
      if (logger) logger.logMessage(`${caster.displayName} channels Debt Magic (+${boost} attack, debt ${run.debt}).`);
    }
  },
});

export const CurseActive = new AbilityDefinition({
  id: AbilityId.Curse,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownCurse,
  targetMode: TargetingMode.HighestAttackEnemy,
  targetShape: TargetShape.Single,
  execute({ caster, target, logger }) {
    if (!target || !target.isAlive) return;
    const pen = GameRules.AbilityWarlockCurseAttackPenalty;
    target.attack = Math.max(0, target.attack - pen);
    applyStatus(target, CombatStatusId.Weakened, caster.displayName, logger);
    if (logger) logger.logMessage(`${caster.displayName} Curses ${target.displayName} (-${pen} attack, Weakened).`);
  },
});

// ============================================================
// PRIEST
// ============================================================

export const CompassionPassive = new AbilityDefinition({
  id: AbilityId.Compassion,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.EndOfRound,
  execute({ caster, match, logger }) {
    const allies = filterLiving(getAlliesOf(caster, match));
    let target = null;
    let lowestPct = 1;
    for (const a of allies) {
      const pct = a.maxHealth > 0 ? a.currentHealth / a.maxHealth : 1;
      if (pct < lowestPct || target === null) { lowestPct = pct; target = a; }
    }
    if (!target) return;
    const amount = lowestPct < 0.5
      ? GameRules.AbilityPriestHealAmount + GameRules.AbilityCompassionLowHpBonusHeal
      : GameRules.AbilityPriestHealAmount;
    healUnit(caster, target, amount, logger);
  },
});

export const HealActive = new AbilityDefinition({
  id: AbilityId.Heal,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownHeal,
  targetMode: TargetingMode.LowestHealthAlly,
  targetShape: TargetShape.Single,
  execute({ caster, target, logger }) {
    if (!target || !target.isAlive) return;
    healUnit(caster, target, GameRules.AbilityPriestHealAmount, logger);
    if (logger) logger.logMessage(`${caster.displayName} Heals ${target.displayName}.`);
  },
});

// ============================================================
// CLERIC
// ============================================================

export const RestorationPassive = new AbilityDefinition({
  id: AbilityId.Restoration,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.EndOfRound,
  execute({ caster, match, logger }) {
    const all = filterLiving([caster, ...getAlliesOf(caster, match)]);
    for (const a of all) {
      healUnit(caster, a, GameRules.AbilityClericRestorationHeal, logger);
    }
  },
});

export const GreaterHealActive = new AbilityDefinition({
  id: AbilityId.GreaterHeal,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownGreaterHeal,
  targetMode: TargetingMode.LowestHealthAlly,
  targetShape: TargetShape.Single,
  execute({ caster, target, logger }) {
    if (!target || !target.isAlive) return;
    healUnit(caster, target, GameRules.AbilityClericGreaterHealAmount, logger);
    if (logger) logger.logMessage(`${caster.displayName} Greater Heals ${target.displayName}.`);
  },
});

// ============================================================
// DRUID
// ============================================================

export const GrowthPassive = new AbilityDefinition({
  id: AbilityId.Growth,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.CombatStart,
  execute({ caster, match, logger }) {
    const allies = filterLiving(getAlliesOf(caster, match));
    for (const a of allies) {
      a.maxHealth += GameRules.AbilityDruidGrowthHealthBonus;
      a.currentHealth += GameRules.AbilityDruidGrowthHealthBonus;
      if (logger) logger.logMessage(`${caster.displayName} Growth: ${a.displayName} gains +${GameRules.AbilityDruidGrowthHealthBonus} max HP.`);
    }
  },
});

export const RejuvenationActive = new AbilityDefinition({
  id: AbilityId.Rejuvenation,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownRejuvenation,
  targetMode: TargetingMode.Self,
  targetShape: TargetShape.AllAllies,
  execute({ caster, match, logger }) {
    const all = filterLiving([caster, ...getAlliesOf(caster, match)]);
    for (const a of all) {
      healUnit(caster, a, GameRules.AbilityDruidRejuvenationHeal, logger);
    }
    if (logger) logger.logMessage(`${caster.displayName} casts Rejuvenation.`);
  },
});

// ============================================================
// ENCHANTER
// ============================================================

export const EmpowerPassive = new AbilityDefinition({
  id: AbilityId.Empower,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.CombatStart,
  execute({ caster, match, logger }) {
    // Use formation-slot adjacency (within 1 slot) to match the original Enchanter identity.
    // Silver Enchanters buff all allies regardless of slot (slot delta check removed).
    const silver = caster.sourceHero && (
      caster.sourceHero.tier === "Silver" || caster.sourceHero.tier === "Gold" || caster.sourceHero.tier === "Diamond"
    );
    const allies = filterLiving(getAlliesOf(caster, match));
    for (const a of allies) {
      const slotDelta = Math.abs((a.slot || 0) - (caster.slot || 0));
      if (!silver && slotDelta !== 1) continue;
      a.attack += GameRules.AbilityEnchanterEmpowerBonus;
      if (logger) logger.logMessage(`${caster.displayName} Empowers ${a.displayName} (+${GameRules.AbilityEnchanterEmpowerBonus} attack).`);
    }
  },
});

export const EnchantWeaponActive = new AbilityDefinition({
  id: AbilityId.EnchantWeapon,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownEnchantWeapon,
  targetMode: TargetingMode.LowestHealthAlly,
  targetShape: TargetShape.Single,
  execute({ caster, target, logger }) {
    if (!target || !target.isAlive) return;
    target.attack += GameRules.AbilityEnchanterEnchantBonus;
    if (logger) logger.logMessage(`${caster.displayName} Enchants ${target.displayName}'s weapon (+${GameRules.AbilityEnchanterEnchantBonus} attack).`);
  },
});

// ============================================================
// BARD
// ============================================================

export const BuskerPassive = new AbilityDefinition({
  id: AbilityId.Busker,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.CombatEnd,
  execute({ hero, run, result, logger }) {
    if (!result || !result.playerWon || !run) return;
    const gain = isSilver(hero) ? GameRules.SilverBardWinGold : GameRules.AbilityBardBuskerGold;
    run.gold += gain;
    if (logger) logger.logMessage(`${hero.definition.displayName} busks for +${gain} gold.`);
  },
});

export const InspireActive = new AbilityDefinition({
  id: AbilityId.Inspire,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownInspire,
  targetMode: TargetingMode.Self,
  targetShape: TargetShape.AllAllies,
  execute({ caster, match, logger }) {
    const allies = filterLiving(getAlliesOf(caster, match));
    for (const a of allies) {
      applyStatus(a, CombatStatusId.Inspired, caster.displayName, logger);
    }
    if (logger) logger.logMessage(`${caster.displayName} Inspires the party.`);
  },
});

// ============================================================
// TREASURER
// ============================================================

export const EfficientPayrollPassive = new AbilityDefinition({
  id: AbilityId.EfficientPayroll,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.PreUpkeep,
  execute({ hero, run }) {
    if (!hero || !run) return;
    let best = null;
    for (const h of run.party) {
      if (!h || h === hero) continue;
      if (!best || h.upkeepThisRound > best.upkeepThisRound) best = h;
    }
    if (best && best.upkeepThisRound > 0) {
      best.upkeepThisRound = Math.max(0, best.upkeepThisRound - GameRules.TreasurerUpkeepReduction);
    }
  },
});

export const InvestmentActive = new AbilityDefinition({
  id: AbilityId.Investment,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownInvestment,
  targetMode: TargetingMode.Self,
  targetShape: TargetShape.Self,
  execute({ caster, run, logger }) {
    if (run) {
      run.gold += GameRules.AbilityTreasurerInvestmentGold;
      if (logger) logger.logMessage(`${caster.displayName} invests (+${GameRules.AbilityTreasurerInvestmentGold} gold).`);
    }
    caster.attack += GameRules.AbilityTreasurerInvestmentAttack;
    if (logger) logger.logMessage(`${caster.displayName} rallies (+${GameRules.AbilityTreasurerInvestmentAttack} attack).`);
  },
});

// ============================================================
// APPRENTICE
// ============================================================

export const StudyPassive = new AbilityDefinition({
  id: AbilityId.Study,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.CombatEnd,
  execute({ hero, run, result, logger }) {
    if (!result || !result.playerWon || !run || !hero) return;
    if (!result.bonusXpHeroIds) result.bonusXpHeroIds = [];
    result.bonusXpHeroIds.push(hero.instanceId);
    if (logger) logger.logMessage(`${hero.definition.displayName} studies hard (bonus XP flagged).`);
  },
});

export const MimicActive = new AbilityDefinition({
  id: AbilityId.Mimic,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownMimic,
  targetMode: TargetingMode.NearestEnemy,
  targetShape: TargetShape.Single,
  execute({ caster, target, match, run, logger, abilityState }) {
    if (!target || !target.isAlive) return;

    // Find first ally with an active ability to copy.
    const allies = filterLiving(getAlliesOf(caster, match));
    let allyWithActive = null;
    for (const a of allies) {
      if (a.sourceHero && a.sourceHero.definition && a.sourceHero.definition.activeAbility) {
        allyWithActive = a;
        break;
      }
    }

    if (!allyWithActive) {
      // No ally ability available — basic strike at 75% power.
      const damage = Math.max(1, Math.round(caster.attack * 0.75));
      dealDamage(caster, target, damage, "Mimics a basic strike on", logger);
      return;
    }

    const copiedAbility = allyWithActive.sourceHero.definition.activeAbility;
    const savedAttack = caster.attack;
    caster.attack = Math.max(1, Math.round(caster.attack * 0.75));

    // Resolve targets for copied ability using local adjacency helper.
    let mimicTargets;
    if (copiedAbility.targetShape === TargetShape.AdjacentEnemies) {
      mimicTargets = adjacentEnemies(caster, target, match);
    } else if (copiedAbility.targetShape === TargetShape.AllAllies) {
      mimicTargets = filterLiving(getAlliesOf(caster, match));
    } else {
      mimicTargets = [target];
    }

    copiedAbility.execute({ caster, target, targets: mimicTargets, match, run, logger, abilityState });
    caster.attack = savedAttack;

    if (logger) logger.logMessage(`${caster.displayName} Mimics ${allyWithActive.displayName}'s ${copiedAbility.id}.`);
  },
});

// ============================================================
// ARTIFICER
// ============================================================

export const TinkererPassive = new AbilityDefinition({
  id: AbilityId.Tinkerer,
  type: AbilityType.Passive,
  trigger: AbilityTrigger.CombatStart,
  execute() {
    // Relic bonus increase handled in HeroEffects via ArtificerRelicCharge path.
  },
});

export const OverclockActive = new AbilityDefinition({
  id: AbilityId.Overclock,
  type: AbilityType.Active,
  cooldownTicks: GameRules.CooldownOverclock,
  targetMode: TargetingMode.LowestHealthAlly,
  targetShape: TargetShape.Single,
  execute({ caster, target, logger }) {
    if (!target || !target.isAlive) return;
    target.attack += GameRules.AbilityArtificerOverclockAttack;
    applyStatus(target, CombatStatusId.Inspired, caster.displayName, logger);
    applyStatus(target, CombatStatusId.CritCharged, caster.displayName, logger);
    if (logger) {
      logger.logMessage(`${caster.displayName} Overclocks ${target.displayName} (+${GameRules.AbilityArtificerOverclockAttack} atk, Inspired, CritCharged).`);
    }
  },
});
