// CombatAssetManifest — maps unit visual IDs to animation and asset metadata.
//
// Lookup: resolveManifestEntry(unitId) → ManifestEntry
// Every lookup is safe: unknown IDs return the fallback entry.
//
// VisualTier controls which CSS treatment is applied in UnitVisualCatalog:
//   Placeholder   — colored diamond-pin placeholder (original look)
//   PortraitToken — circular medallion with the portrait as primary visual
//
// To graduate a unit to real visuals, change its tier to PortraitToken.
// Missing entries always fall back to Placeholder so nothing can break.

export const VisualTier = Object.freeze({
  Placeholder: "Placeholder",
  PortraitToken: "PortraitToken",
});

// Units in the first real visual slice (epic #314, subissue #342).
const FIRST_SLICE_HERO_IDS = new Set(["warrior", "knight", "priest"]);
const FIRST_SLICE_ENEMY_IDS = new Set(["slime", "goblin_thief", "cave_bat"]);

function heroEntry(id) {
  return Object.freeze({
    id,
    tier: FIRST_SLICE_HERO_IDS.has(id) ? VisualTier.PortraitToken : VisualTier.Placeholder,
    hasAttackVfx: true,
    hasHealVfx: false,
    hasDeathAnim: true,
    fallbackId: "hero-fallback",
  });
}

function enemyEntry(id) {
  return Object.freeze({
    id,
    tier: FIRST_SLICE_ENEMY_IDS.has(id) ? VisualTier.PortraitToken : VisualTier.Placeholder,
    hasAttackVfx: true,
    hasHealVfx: false,
    hasDeathAnim: true,
    fallbackId: "enemy-fallback",
  });
}

function supportHeroEntry(id) {
  return Object.freeze({
    id,
    tier: FIRST_SLICE_HERO_IDS.has(id) ? VisualTier.PortraitToken : VisualTier.Placeholder,
    hasAttackVfx: true,
    hasHealVfx: true,
    hasDeathAnim: true,
    fallbackId: "hero-fallback",
  });
}

const FALLBACK_ENTRY = Object.freeze({
  id: "fallback",
  tier: VisualTier.Placeholder,
  hasAttackVfx: false,
  hasHealVfx: false,
  hasDeathAnim: false,
  fallbackId: "fallback",
});

// ---- Hero manifest ----
const HERO_MANIFEST = Object.freeze({
  warrior:    heroEntry("warrior"),
  knight:     heroEntry("knight"),
  golem:      heroEntry("golem"),
  wizard:     heroEntry("wizard"),
  ninja:      heroEntry("ninja"),
  ranger:     heroEntry("ranger"),
  priest:     supportHeroEntry("priest"),
  bard:       supportHeroEntry("bard"),
  enchanter:  supportHeroEntry("enchanter"),
  squire:     heroEntry("squire"),
  treasurer:  heroEntry("treasurer"),
  apprentice: heroEntry("apprentice"),
});

// ---- Enemy manifest ----
const ENEMY_MANIFEST = Object.freeze({
  slime:            enemyEntry("slime"),
  training_dummy:   enemyEntry("training_dummy"),
  cave_bat:         enemyEntry("cave_bat"),
  goblin_thief:     enemyEntry("goblin_thief"),
  tax_collector:    enemyEntry("tax_collector"),
  backline_bat:     enemyEntry("backline_bat"),
  debt_wraith:      enemyEntry("debt_wraith"),
  treasure_leech:   enemyEntry("treasure_leech"),
  dungeon_auditor:  enemyEntry("dungeon_auditor"),
  greedy_tank:      enemyEntry("greedy_tank"),
  greedy_carry:     enemyEntry("greedy_carry"),
  carry_protector:  enemyEntry("carry_protector"),
  carry_carry:      enemyEntry("carry_carry"),
  frugal_guard:     enemyEntry("frugal_guard"),
  frugal_archer:    enemyEntry("frugal_archer"),
  frugal_healer:    enemyEntry("frugal_healer"),
  imp:              enemyEntry("imp"),
  soul_broker:      enemyEntry("soul_broker"),
  gloom_bat:        enemyEntry("gloom_bat"),
  hoard_fiend:      enemyEntry("hoard_fiend"),
  brimstone_brute:  enemyEntry("brimstone_brute"),
  infernal_auditor: enemyEntry("infernal_auditor"),
});

// ---- Public API ----

export function resolveManifestEntry(unitId) {
  if (!unitId) return FALLBACK_ENTRY;
  return HERO_MANIFEST[unitId] || ENEMY_MANIFEST[unitId] || FALLBACK_ENTRY;
}

export function isFirstSliceUnit(unitId) {
  if (!unitId) return false;
  return FIRST_SLICE_HERO_IDS.has(unitId) || FIRST_SLICE_ENEMY_IDS.has(unitId);
}

// Validates that all known unit IDs resolve to a non-fallback entry.
// Returns an array of missing IDs (empty if all covered).
export function validateManifestCoverage(heroIds, enemyIds) {
  const missing = [];
  for (const id of heroIds) {
    if (!HERO_MANIFEST[id]) missing.push(`hero:${id}`);
  }
  for (const id of enemyIds) {
    if (!ENEMY_MANIFEST[id]) missing.push(`enemy:${id}`);
  }
  return missing;
}
