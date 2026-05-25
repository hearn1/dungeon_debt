// SpriteCatalog — maps a hero / enemy / combat unit to an image URL.
//
// Lookup order (always falls through to the last entry, never returns null):
//   heroPortrait(def)   : assets/heroes/<id>.png
//                       → assets/heroes/role-<role>.png
//                       → assets/heroes/role-tank.png
//   enemyPortrait(def)  : assets/enemies/<id>.png
//                       → assets/enemies/enemy-default.png
//   attackEffect(unit)  : assets/effects/<id>.png            (per-character; not yet authored — future)
//                       → assets/effects/role-<role>.png     (hero-role fallback)
//                       → assets/effects/enemy-generic.png   (any non-player unit)
//                       → assets/effects/effect-default.png
//   healEffect()        : assets/effects/heal.png
//
// Per-character art is intentionally a no-op today: dropping a new PNG into
// assets/effects/<heroId>.png lights it up without touching this module.
//
// The catalog is data-only and stateless. It never touches the DOM.

const BASE = "assets";

const HERO_ROLE_TO_FILE = {
  Tank: "role-tank.png",
  Damage: "role-damage.png",
  Support: "role-support.png",
  Economy: "role-economy.png",
};

const KNOWN_HERO_IDS = new Set([
  "warrior", "knight", "golem",
  "wizard", "ninja", "ranger",
  "priest", "bard", "enchanter",
  "squire", "treasurer", "apprentice",
]);

const KNOWN_ENEMY_IDS = new Set([
  "slime", "training_dummy", "cave_bat", "goblin_thief", "tax_collector",
  "backline_bat", "debt_wraith", "treasure_leech", "dungeon_auditor",
  "greedy_tank", "greedy_carry", "carry_protector", "carry_carry",
  "frugal_guard", "frugal_archer", "frugal_healer",
  "imp", "soul_broker", "gloom_bat", "hoard_fiend",
  "brimstone_brute", "infernal_auditor",
]);

// Per-character attack art slot. Empty today; populated in a future slice
// without changing any consumer code.
const KNOWN_ATTACK_OVERRIDE_IDS = new Set();

export function heroPortrait(heroDef) {
  if (!heroDef) return `${BASE}/heroes/role-tank.png`;
  if (KNOWN_HERO_IDS.has(heroDef.id)) return `${BASE}/heroes/${heroDef.id}.png`;
  const roleFile = HERO_ROLE_TO_FILE[heroDef.role] || HERO_ROLE_TO_FILE.Tank;
  return `${BASE}/heroes/${roleFile}`;
}

export function enemyPortrait(enemyDef) {
  if (enemyDef && KNOWN_ENEMY_IDS.has(enemyDef.id)) {
    return `${BASE}/enemies/${enemyDef.id}.png`;
  }
  return `${BASE}/enemies/enemy-default.png`;
}

// unitOrDef: either a CombatUnit (with sourceHero / sourceEnemy) or, for the
// formation/shop preview cases, a HeroDefinition or EnemyDefinition directly.
export function unitPortrait(unitOrDef) {
  if (!unitOrDef) return `${BASE}/enemies/enemy-default.png`;
  if (unitOrDef.sourceHero) return heroPortrait(unitOrDef.sourceHero.definition);
  if (unitOrDef.sourceEnemy) return enemyPortrait(unitOrDef.sourceEnemy);
  // raw definition fallback (HeroDefinition has a .role field, EnemyDefinition does not)
  if (unitOrDef.role !== undefined) return heroPortrait(unitOrDef);
  return enemyPortrait(unitOrDef);
}

export function attackEffect(unit) {
  if (!unit) return `${BASE}/effects/effect-default.png`;

  // Per-character override (future-expansion seam).
  const heroId = unit.sourceHero?.definition?.id;
  const enemyId = unit.sourceEnemy?.id;
  const overrideId = heroId || enemyId;
  if (overrideId && KNOWN_ATTACK_OVERRIDE_IDS.has(overrideId)) {
    return `${BASE}/effects/${overrideId}.png`;
  }

  // Hero-role fallback.
  if (unit.sourceHero) {
    const roleFile = HERO_ROLE_TO_FILE[unit.sourceHero.definition.role] || HERO_ROLE_TO_FILE.Tank;
    return `${BASE}/effects/${roleFile}`;
  }

  // Enemy generic.
  if (unit.sourceEnemy) return `${BASE}/effects/enemy-generic.png`;

  return `${BASE}/effects/effect-default.png`;
}

export function healEffect() {
  return `${BASE}/effects/heal.png`;
}
