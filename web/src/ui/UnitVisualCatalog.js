import { HeroRole } from "../data/enums.js";
import { unitPortrait } from "./SpriteCatalog.js";
import { resolveManifestEntry, VisualTier } from "./CombatAssetManifest.js";

// UnitVisualCatalog maps game units to presentation metadata for board visuals.
// Lookup order:
//   hero by id -> hero role group -> hero fallback placeholder
//   opponent by id family -> opponent fallback placeholder
//   unknown input -> neutral fallback placeholder
// Each result includes the existing PNG portrait URL so DOM/UI surfaces can keep
// using SpriteCatalog assets while the board renderer uses 2.5D placeholders.
//
// UnitVisualKind.PortraitToken is used for units in the first real visual slice
// (warrior, knight, priest, slime, goblin_thief, cave_bat). All others remain
// PlaceholderPawn until future passes.

export const UnitVisualKind = Object.freeze({
  PlaceholderPawn: "PlaceholderPawn",
  PortraitToken: "PortraitToken",
});

export const UnitVisualState = Object.freeze({
  Idle: "idle",
  Move: "move",
  Attack: "attack",
  Hit: "hit",
  Death: "death",
  Cast: "cast",
  Passive: "passive",
});

const FALLBACK_STATES = Object.freeze({
  [UnitVisualState.Idle]: "bob",
  [UnitVisualState.Move]: "translate",
  [UnitVisualState.Attack]: "lunge",
  [UnitVisualState.Hit]: "flash",
  [UnitVisualState.Death]: "fade",
  [UnitVisualState.Cast]: "pulse",
  [UnitVisualState.Passive]: "glow",
});

const HERO_ROLE_VISUALS = Object.freeze({
  [HeroRole.Tank]: Object.freeze({
    group: "hero-tank",
    label: "Tank placeholder",
    color: 0xc9a04a,
    cssClass: "visual-hero-tank",
    silhouette: "shield",
  }),
  [HeroRole.Damage]: Object.freeze({
    group: "hero-damage",
    label: "Damage placeholder",
    color: 0xa75648,
    cssClass: "visual-hero-damage",
    silhouette: "blade",
  }),
  [HeroRole.Support]: Object.freeze({
    group: "hero-support",
    label: "Support placeholder",
    color: 0x6b9b6b,
    cssClass: "visual-hero-support",
    silhouette: "staff",
  }),
  [HeroRole.Economy]: Object.freeze({
    group: "hero-economy",
    label: "Economy placeholder",
    color: 0x8a6fd1,
    cssClass: "visual-hero-economy",
    silhouette: "coin",
  }),
});

const ENEMY_FAMILY_VISUALS = Object.freeze({
  slime: Object.freeze({
    group: "enemy-slime",
    label: "Slime placeholder",
    color: 0x6b9b6b,
    cssClass: "visual-enemy-slime",
    silhouette: "blob",
  }),
  goblin: Object.freeze({
    group: "enemy-goblin",
    label: "Goblin placeholder",
    color: 0xa66a40,
    cssClass: "visual-enemy-goblin",
    silhouette: "knife",
  }),
  bat: Object.freeze({
    group: "enemy-bat",
    label: "Bat placeholder",
    color: 0x765f8f,
    cssClass: "visual-enemy-bat",
    silhouette: "wing",
  }),
  rival: Object.freeze({
    group: "enemy-rival",
    label: "Rival placeholder",
    color: 0xa64a40,
    cssClass: "visual-enemy-rival",
    silhouette: "banner",
  }),
  boss: Object.freeze({
    group: "enemy-boss",
    label: "Boss placeholder",
    color: 0x7f2830,
    cssClass: "visual-enemy-boss",
    silhouette: "crown",
  }),
  default: Object.freeze({
    group: "enemy-default",
    label: "Enemy placeholder",
    color: 0xa64a40,
    cssClass: "visual-enemy-default",
    silhouette: "claw",
  }),
});

const FALLBACK_VISUAL = Object.freeze({
  group: "fallback-unit",
  label: "Fallback placeholder",
  color: 0x8b8374,
  cssClass: "visual-fallback",
  silhouette: "token",
});

export function resolveUnitVisual(unitOrDef) {
  const heroDef = getHeroDefinition(unitOrDef);
  if (heroDef) return buildHeroVisual(heroDef, unitOrDef);

  const enemyDef = getEnemyDefinition(unitOrDef);
  if (enemyDef) return buildEnemyVisual(enemyDef, unitOrDef);

  return buildVisual({
    id: "fallback",
    displayName: "Unknown Unit",
    side: "fallback",
    sourceType: "fallback",
    base: FALLBACK_VISUAL,
    portraitUrl: unitPortrait(null),
  });
}

export function resolveFallbackUnitVisual() {
  return resolveUnitVisual(null);
}

function buildHeroVisual(heroDef, source) {
  const base = HERO_ROLE_VISUALS[heroDef.role] || HERO_ROLE_VISUALS[HeroRole.Tank] || FALLBACK_VISUAL;
  return buildVisual({
    id: heroDef.id || "hero-fallback",
    displayName: heroDef.displayName || base.label,
    side: "hero",
    sourceType: "hero",
    base,
    portraitUrl: unitPortrait(source),
  });
}

function buildEnemyVisual(enemyDef, source) {
  const base = ENEMY_FAMILY_VISUALS[getEnemyFamily(enemyDef.id)] || ENEMY_FAMILY_VISUALS.default;
  return buildVisual({
    id: enemyDef.id || "enemy-fallback",
    displayName: enemyDef.displayName || base.label,
    side: "opponent",
    sourceType: "opponent",
    base,
    portraitUrl: unitPortrait(source),
  });
}

function buildVisual({ id, displayName, side, sourceType, base, portraitUrl }) {
  const manifest = resolveManifestEntry(id);
  const kind = manifest.tier === VisualTier.PortraitToken
    ? UnitVisualKind.PortraitToken
    : UnitVisualKind.PlaceholderPawn;
  return Object.freeze({
    id,
    displayName,
    side,
    sourceType,
    kind,
    group: base.group,
    groupLabel: base.label,
    color: base.color,
    cssClass: base.cssClass,
    silhouette: base.silhouette,
    portraitUrl,
    states: FALLBACK_STATES,
  });
}

function getHeroDefinition(unitOrDef) {
  if (!unitOrDef) return null;
  if (unitOrDef.sourceHero?.definition) return unitOrDef.sourceHero.definition;
  if (unitOrDef.definition?.role !== undefined) return unitOrDef.definition;
  if (unitOrDef.role !== undefined) return unitOrDef;
  return null;
}

function getEnemyDefinition(unitOrDef) {
  if (!unitOrDef) return null;
  if (unitOrDef.sourceEnemy) return unitOrDef.sourceEnemy;
  if (unitOrDef.attack !== undefined && unitOrDef.health !== undefined && unitOrDef.role === undefined) return unitOrDef;
  return null;
}

function getEnemyFamily(enemyId) {
  if (!enemyId) return "default";
  if (enemyId.includes("slime")) return "slime";
  if (enemyId.includes("goblin")) return "goblin";
  if (enemyId.includes("bat")) return "bat";
  if (enemyId.includes("greedy") || enemyId.includes("carry_") || enemyId.includes("frugal")) return "rival";
  if (enemyId.includes("auditor") || enemyId.includes("champion") || enemyId.includes("boss")) return "boss";
  return "default";
}
