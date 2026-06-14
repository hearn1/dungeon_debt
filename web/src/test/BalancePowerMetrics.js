import { HeroEffects } from "../combat/HeroEffects.js";
import { HeroRole, HeroTier } from "../data/enums.js";

const RangedHeroIds = new Set(["ranger", "ninja"]);

export function summarizePartyPower(run) {
  const party = Array.isArray(run?.party) ? run.party : [];
  let totalAttack = 0;
  let totalHealth = 0;
  let totalUpkeep = 0;
  let tierScore = 0;
  let veteranTierTotal = 0;
  let activeAbilityCount = 0;
  let activeCooldownTotal = 0;
  let rangedAttack = 0;
  const roleCounts = {
    [HeroRole.Tank]: 0,
    [HeroRole.Damage]: 0,
    [HeroRole.Support]: 0,
    [HeroRole.Economy]: 0,
  };

  for (const hero of party) {
    if (!hero || !hero.definition) continue;
    const attack = getHeroAttack(hero);
    const health = HeroEffects.getTierAdjustedMaxHealth(hero);
    totalAttack += attack;
    totalHealth += health;
    totalUpkeep += HeroEffects.getTierAdjustedUpkeep(hero.definition, hero.tier);
    tierScore += getTierOrdinal(hero.tier);
    veteranTierTotal += hero.veteranTier || 0;
    if (roleCounts[hero.definition.role] !== undefined) roleCounts[hero.definition.role] += 1;
    if (hero.definition.activeAbility) {
      activeAbilityCount += 1;
      activeCooldownTotal += hero.definition.activeAbility.cooldownTicks || 0;
    }
    if (RangedHeroIds.has(hero.definition.id)) rangedAttack += attack;
  }

  const heroCount = party.length;
  const economySurplus = (run?.gold || 0) - (run?.debt || 0);

  return {
    partySize: heroCount,
    totalHealth,
    totalAttack,
    totalUpkeep,
    tierScore,
    avgTier: round2(ratio(tierScore, heroCount)),
    veteranTierTotal,
    activeAbilityCount,
    avgActiveCooldownTicks: round2(ratio(activeCooldownTotal, activeAbilityCount)),
    relicCount: Array.isArray(run?.activeRelics) ? run.activeRelics.length : 0,
    rangedAttackShare: round4(ratio(rangedAttack, totalAttack)),
    tankCount: roleCounts[HeroRole.Tank],
    damageCount: roleCounts[HeroRole.Damage],
    supportCount: roleCounts[HeroRole.Support],
    economyCount: roleCounts[HeroRole.Economy],
    economySurplus,
  };
}

export function formatPowerRows(powerRows) {
  const rows = Array.isArray(powerRows) ? powerRows : [];
  const lines = [PowerColumns.join("\t")];
  for (const row of rows) {
    lines.push(PowerColumns.map((column) => sanitizeTsvValue(row[column])).join("\t"));
  }
  return `${lines.join("\n")}\n`;
}

export const PowerColumns = Object.freeze([
  "seed",
  "strategy",
  "phase",
  "act",
  "slot",
  "round",
  "encounterId",
  "partySize",
  "totalHealth",
  "totalAttack",
  "totalUpkeep",
  "tierScore",
  "avgTier",
  "veteranTierTotal",
  "activeAbilityCount",
  "avgActiveCooldownTicks",
  "relicCount",
  "rangedAttackShare",
  "tankCount",
  "damageCount",
  "supportCount",
  "economyCount",
  "gold",
  "debt",
  "economySurplus",
  "enemyHealthScale",
  "enemyAttackScale",
]);

function getHeroAttack(hero) {
  if (Number.isFinite(hero.attack)) return hero.attack;
  return HeroEffects.getTierAdjustedAttack(hero.definition, hero.tier);
}

function getTierOrdinal(tier) {
  if (tier === HeroTier.Diamond) return 4;
  if (tier === HeroTier.Gold) return 3;
  if (tier === HeroTier.Silver) return 2;
  return 1;
}

function ratio(part, total) {
  if (!total || total <= 0) return 0;
  return part / total;
}

function round2(value) {
  return Number(value.toFixed(2));
}

function round4(value) {
  return Number(value.toFixed(4));
}

function sanitizeTsvValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[\t\r\n]/g, " ");
}
