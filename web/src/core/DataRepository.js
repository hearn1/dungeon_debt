// Ported from DungeonDebt/Assets/Scripts/Core/DataRepository.cs
// Static, read-only data tables: heroes, enemies, encounters, payroll actions,
// relics, difficulty levels, rival guilds.

import { HeroDefinition } from "../data/HeroDefinition.js";
import { EnemyDefinition } from "../data/EnemyDefinition.js";
import { EncounterDefinition } from "../data/EncounterDefinition.js";
import { PayrollActionDefinition } from "../data/PayrollActionDefinition.js";
import { RelicDefinition } from "../data/RelicDefinition.js";
import { MutatorDefinition } from "../data/MutatorDefinition.js";
import { RivalGuildState } from "../data/RivalGuildState.js";
import { GameRules, GameRulesFns } from "./GameRules.js";
import {
  HeroRole, HeroEffectId, EnemyEffectId, EncounterType, EncounterEffectId,
  RivalGuild, PayrollActionId, DifficultyLevel, RelicId, CombatStatusId,
} from "../data/enums.js";
import {
  BattleHardenedPassive, CleaveActive,
  MomentumPassive, GuardBreakActive,
  ProtectorPassive, InterceptActive,
  HolyAuraPassive, DivineShieldActive,
  RagePassive, LeapSlamActive,
  StoneSkinPassive, EarthquakeActive,
  EagleEyePassive, PowerShotActive,
  BackstabPassive, ShadowstepActive,
  ExecutionerPassive, AssassinateActive,
  ArcanePowerPassive, FireballActive,
  BurnPassive, FlameWaveActive,
  DebtMagicPassive, CurseActive,
  CompassionPassive, HealActive,
  RestorationPassive, GreaterHealActive,
  GrowthPassive, RejuvenationActive,
  EmpowerPassive, EnchantWeaponActive,
  BuskerPassive, InspireActive,
  EfficientPayrollPassive, InvestmentActive,
  StudyPassive, MimicActive,
  TinkererPassive, OverclockActive,
} from "../combat/HeroAbilities.js";

const C = CombatStatusId;

// ---- Heroes ----
const Warrior = new HeroDefinition(
  "warrior", "Warrior", HeroRole.Tank, 2, 8, 2,
  "Battle Hardened: gain attack when damaged (stacks). Active: Cleave adjacent enemies.",
  HeroEffectId.None, BattleHardenedPassive, CleaveActive);

const Knight = new HeroDefinition(
  "knight", "Knight", HeroRole.Tank, 1, 10, 4,
  "Protector: redirects backline hits to himself. Active: Intercept grants Guarded to lowest-HP ally.",
  HeroEffectId.KnightRedirect, ProtectorPassive, InterceptActive);

const Golem = new HeroDefinition(
  "golem", "Golem", HeroRole.Tank, 1, 14, 6,
  "Stone Skin: reduces incoming damage by 1. Active: Earthquake damages adjacent enemies.",
  HeroEffectId.GolemArmor, StoneSkinPassive, EarthquakeActive);

const Wizard = new HeroDefinition(
  "wizard", "Wizard", HeroRole.Damage, 3, 4, 5,
  "Arcane Power: Fireball damage increases each cast. Active: Fireball hits nearby enemies.",
  HeroEffectId.WizardScaling, ArcanePowerPassive, FireballActive);

const Ninja = new HeroDefinition(
  "ninja", "Ninja", HeroRole.Damage, 4, 3, 4,
  "Executioner: bonus damage against low-HP enemies. Active: Assassinate the lowest-HP enemy.",
  HeroEffectId.NinjaLowestTarget, ExecutionerPassive, AssassinateActive);

const Ranger = new HeroDefinition(
  "ranger", "Ranger", HeroRole.Damage, 3, 5, 3,
  "Eagle Eye: targets furthest enemy. Active: Power Shot deals high single-target damage.",
  HeroEffectId.RangerBackline, EagleEyePassive, PowerShotActive);

const Priest = new HeroDefinition(
  "priest", "Priest", HeroRole.Support, 1, 5, 4,
  "Compassion: heals most-wounded ally each round; bonus when below 50% HP. Active: Heal lowest-HP ally.",
  HeroEffectId.PriestHeal, CompassionPassive, HealActive);

const Bard = new HeroDefinition(
  "bard", "Bard", HeroRole.Support, 1, 4, 3,
  "Busker: gain gold after each combat win. Active: Inspire grants Inspired to all allies.",
  HeroEffectId.BardGoldOnWin, BuskerPassive, InspireActive);

const Enchanter = new HeroDefinition(
  "enchanter", "Enchanter", HeroRole.Support, 1, 4, 3,
  "Empower: adjacent allies gain attack at combat start. Active: Enchant Weapon boosts an ally's attack.",
  HeroEffectId.EnchanterAdjacent, EmpowerPassive, EnchantWeaponActive);

const Squire = new HeroDefinition(
  "squire", "Squire", HeroRole.Tank, 1, 4, 1,
  "No effect.", HeroEffectId.None);

const Treasurer = new HeroDefinition(
  "treasurer", "Treasurer", HeroRole.Economy, 0, 4, 2,
  "Efficient Payroll: reduces highest-upkeep ally's wages. Active: Investment gains gold and boosts own attack.",
  HeroEffectId.TreasurerUpkeepReduce, EfficientPayrollPassive, InvestmentActive);

const Apprentice = new HeroDefinition(
  "apprentice", "Apprentice", HeroRole.Economy, 1, 3, 1,
  "Study: flags bonus XP after a combat win. Active: Mimic copies an ally's active ability.",
  HeroEffectId.ApprenticeWizardSupport, StudyPassive, MimicActive);

const Paladin = new HeroDefinition(
  "paladin", "Paladin", HeroRole.Tank, 2, 14, 4,
  "Holy Aura: heals most-wounded ally each round. Active: Divine Shield grants Guarded to lowest-HP ally.",
  HeroEffectId.PaladinAuraHeal, HolyAuraPassive, DivineShieldActive);

const Cleric = new HeroDefinition(
  "cleric", "Cleric", HeroRole.Support, 1, 8, 3,
  "Restoration: small heal to all allies each round. Active: Greater Heal restores significant HP to lowest-HP ally.",
  HeroEffectId.ClericGroupHeal, RestorationPassive, GreaterHealActive);

const Barbarian = new HeroDefinition(
  "barbarian", "Barbarian", HeroRole.Damage, 2, 10, 3,
  "Rage: gains attack when below 50% HP. Active: Leap Slam damages the furthest enemy and adjacent foes.",
  HeroEffectId.BarbarianRage, RagePassive, LeapSlamActive);

const Rogue = new HeroDefinition(
  "rogue", "Rogue", HeroRole.Damage, 3, 7, 3,
  "Backstab: bonus damage when not targeted by the victim. Active: Shadowstep strikes the highest-attack enemy.",
  HeroEffectId.RogueFirstStrike, BackstabPassive, ShadowstepActive);

const Warlock = new HeroDefinition(
  "warlock", "Warlock", HeroRole.Damage, 2, 6, 4,
  "Debt Magic: gains attack based on player debt. Active: Curse weakens the highest-attack enemy.",
  HeroEffectId.WarlockDebtPact, DebtMagicPassive, CurseActive);

const Artificer = new HeroDefinition(
  "artificer", "Artificer", HeroRole.Economy, 1, 7, 2,
  "Tinkerer: relic synergies improved. Active: Overclock boosts an ally's attack, Inspired, and CritCharged.",
  HeroEffectId.ArtificerRelicCharge, TinkererPassive, OverclockActive);

const Sorcerer = new HeroDefinition(
  "sorcerer", "Sorcerer", HeroRole.Damage, 3, 5, 4,
  "Burn: applies Burned on each attack. Active: Flame Wave burns adjacent enemies.",
  HeroEffectId.SorcererBurned, BurnPassive, FlameWaveActive);

const Fighter = new HeroDefinition(
  "fighter", "Fighter", HeroRole.Tank, 2, 12, 4,
  "Momentum: gains attack after each attack (stacks). Active: Guard Break deals bonus damage.",
  HeroEffectId.FighterTenacity, MomentumPassive, GuardBreakActive);

const Druid = new HeroDefinition(
  "druid", "Druid", HeroRole.Support, 1, 6, 3,
  "Growth: allies gain max HP at combat start. Active: Rejuvenation heals all allies.",
  HeroEffectId.DruidInspire, GrowthPassive, RejuvenationActive);

// ---- Enemies (Act 1) ----
const Slime = new EnemyDefinition("slime", "Slime", 1, 4, EnemyEffectId.None, "No effect.");
const TrainingDummy = new EnemyDefinition("training_dummy", "Training Dummy", 0, 10, EnemyEffectId.None, "No effect.");
const CaveBat = new EnemyDefinition("cave_bat", "Cave Bat", 2, 3, EnemyEffectId.None, "Starts Marked. Applies Burned on attack.", [C.Marked], [C.Burned]);
const GoblinThief = new EnemyDefinition("goblin_thief", "Goblin Thief", 2, 4, EnemyEffectId.GoblinStealGold, "Applies Weakened on attack; steals gold if alive past combat round 3.", null, [C.Weakened]);
const TaxCollector = new EnemyDefinition("tax_collector", "Tax Collector", 1, 8, EnemyEffectId.None, "Applies Weakened on attack. Encounter raises wages this round.", null, [C.Weakened]);
const LazyInspector = new EnemyDefinition("lazy_inspector", "Lazy Inspector", 1, 8, EnemyEffectId.None, "Applies Weakened on attack.", null, [C.Weakened]);
const BacklineBat = new EnemyDefinition("backline_bat", "Backline Bat", 3, 4, EnemyEffectId.BackBatBackline, "Starts Marked. Applies Burned on attack; attacks lowest-HP backline hero on combat round 2.", [C.Marked], [C.Burned]);
const DebtWraith = new EnemyDefinition("debt_wraith", "Debt Wraith", 1, 10, EnemyEffectId.DebtWraithScales, "Applies Poisoned on attack. Attack scales with player debt at combat start.", null, [C.Poisoned]);
const TreasureLeech = new EnemyDefinition("treasure_leech", "Treasure Leech", 1, 12, EnemyEffectId.TreasureLeechRewardDrain, "Applies Poisoned on attack. Reduces reward if alive at combat end.", null, [C.Poisoned]);
const SplitTreasureLeech = new EnemyDefinition("split_treasure_leech", "Split Treasure Leech", 1, 8, EnemyEffectId.TreasureLeechRewardDrain, "Applies Poisoned on attack. Reduces reward if alive at combat end.", null, [C.Poisoned]);
const DungeonAuditor = new EnemyDefinition("dungeon_auditor", "Dungeon Auditor", 3, 20, EnemyEffectId.DungeonAuditorBoss, "Starts Inspired and applies Burned on attack. Raises wages and deals periodic damage.", [C.Inspired], [C.Burned]);
const GreedyTank = new EnemyDefinition("greedy_tank", "Greedy Tank", 3, 8, EnemyEffectId.None, "No effect.");
const GreedyCarry = new EnemyDefinition("greedy_carry", "Greedy Carry", 4, 4, EnemyEffectId.None, "Starts Inspired and Marked.", [C.Inspired], [C.Marked]);
const CarryProtector = new EnemyDefinition("carry_protector", "Carry Protector", 1, 10, EnemyEffectId.None, "Starts Guarded.", [C.Guarded]);
const CarryCarry = new EnemyDefinition("carry_carry", "Carry Champion", 6, 6, EnemyEffectId.None, "Starts Inspired.", [C.Inspired]);
const FrugalGuard = new EnemyDefinition("frugal_guard", "Frugal Guard", 2, 6, EnemyEffectId.None, "Starts Guarded.", [C.Guarded]);
const FrugalArcher = new EnemyDefinition("frugal_archer", "Frugal Archer", 3, 4, EnemyEffectId.None, "Applies Weakened on attack.", null, [C.Weakened]);
const FrugalHealer = new EnemyDefinition("frugal_healer", "Frugal Healer", 1, 5, EnemyEffectId.FrugalGhostHeal, "Heals leftmost living ally each combat round.");
const LieutenantFrugalGuard = new EnemyDefinition("lieutenant_frugal_guard", "Lieutenant Frugal Guard", 2, 5, EnemyEffectId.None, "Starts Guarded. Applies Marked on attack.", [C.Guarded], [C.Marked]);
const LieutenantFrugalArcher = new EnemyDefinition("lieutenant_frugal_archer", "Lieutenant Frugal Archer", 3, 3, EnemyEffectId.None, "Applies Marked on attack.", null, [C.Marked]);
const LieutenantFrugalHealer = new EnemyDefinition("lieutenant_frugal_healer", "Lieutenant Frugal Healer", 1, 4, EnemyEffectId.FrugalGhostHeal, "Applies Marked on attack. Heals leftmost living ally each combat round.", null, [C.Marked]);

// ---- Enemies (Archetype: Bruiser) ----
const ShieldGrunt = new EnemyDefinition("shield_grunt", "Shield Grunt", 2, 5, EnemyEffectId.None, "Starts Guarded.", [C.Guarded]);
const PitBrawler = new EnemyDefinition("pit_brawler", "Pit Brawler", 3, 5, EnemyEffectId.None, "No effect.");

// ---- Enemies (Archetype: Backline) ----
const DungeonArcher = new EnemyDefinition("dungeon_archer", "Dungeon Archer", 3, 3, EnemyEffectId.None, "Starts Marked. Applies Burned on attack.", [C.Marked], [C.Burned]);

// ---- Enemies (Archetype: Sustain) ----
const DungeonMedic = new EnemyDefinition("dungeon_medic", "Dungeon Medic", 1, 5, EnemyEffectId.FrugalGhostHeal, "Applies Poisoned on attack. Heals leftmost living ally each combat round.", null, [C.Poisoned]);

// ---- Enemies (Archetype: Carry) ----
const HulkingProtector = new EnemyDefinition("hulking_protector", "Hulking Protector", 1, 12, EnemyEffectId.None, "Starts Guarded.", [C.Guarded]);
const DungeonChampion = new EnemyDefinition("dungeon_champion", "Dungeon Champion", 5, 5, EnemyEffectId.None, "Starts Inspired.", [C.Inspired]);

// ---- Enemies (Boss support) ----
const AuditorArmsman = new EnemyDefinition("auditor_armsman", "Auditor's Armsman", 2, 8, EnemyEffectId.None, "Starts Guarded. Protects the Dungeon Auditor.", [C.Guarded]);
const AuditorAccountant = new EnemyDefinition("auditor_accountant", "Auditor's Accountant", 1, 6, EnemyEffectId.None, "Applies Weakened on attack.", null, [C.Weakened]);

// ---- Enemies (Act 2 rival rematches) ----
const Act2ShieldGrunt = createActEnemy(2, "shield_grunt", "Iron Grunt", 3, 11, EnemyEffectId.None, "Starts Guarded.", [C.Guarded]);
const Act2PitBrawler = createActEnemy(2, "pit_brawler", "Pit Bruiser", 6, 8, EnemyEffectId.None, "No effect.");
const Act2DungeonArcher = createActEnemy(2, "dungeon_archer", "Dungeon Sniper", 5, 5, EnemyEffectId.None, "Starts Marked. Applies Burned on attack.", [C.Marked], [C.Burned]);
const Act2DungeonMedic = createActEnemy(2, "dungeon_medic", "Dungeon Surgeon", 2, 8, EnemyEffectId.FrugalGhostHeal, "Applies Poisoned on attack. Heals leftmost living ally each combat round.", null, [C.Poisoned]);
const Act2HulkingProtector = createActEnemy(2, "hulking_protector", "Hulking Vanguard", 2, 18, EnemyEffectId.None, "Starts Guarded.", [C.Guarded]);
const Act2DungeonChampion = createActEnemy(2, "dungeon_champion", "Dungeon Warlord", 8, 8, EnemyEffectId.None, "Starts Inspired.", [C.Inspired]);
const Act2GreedyTank = createActEnemy(2, "greedy_tank", "Greedy Tank", 4, 12, EnemyEffectId.None, "No effect.");
const Act2GreedyCarry = createActEnemy(2, "greedy_carry", "Greedy Carry", 6, 7, EnemyEffectId.None, "Starts Inspired and Marked.", [C.Inspired], [C.Marked]);
const Act2CarryProtector = createActEnemy(2, "carry_protector", "Carry Protector", 2, 14, EnemyEffectId.None, "Starts Guarded.", [C.Guarded]);
const Act2CarryChampion = createActEnemy(2, "carry_carry", "Carry Champion", 8, 9, EnemyEffectId.None, "Starts Inspired.", [C.Inspired]);
const Act2CarrySupport = createActEnemy(2, "carry_protector", "Carry Vanguard", 2, 10, EnemyEffectId.None, "Starts Guarded.", [C.Guarded]);
const Act2FrugalGuard = createActEnemy(2, "frugal_guard", "Frugal Guard", 3, 9, EnemyEffectId.None, "Starts Guarded.", [C.Guarded]);
const Act2FrugalArcher = createActEnemy(2, "frugal_archer", "Frugal Archer", 4, 6, EnemyEffectId.None, "Applies Weakened on attack.", null, [C.Weakened]);
const Act2FrugalHealer = createActEnemy(2, "frugal_healer", "Frugal Healer", 2, 8, EnemyEffectId.FrugalGhostHeal, "Applies Poisoned on attack. Heals leftmost living ally each combat round.", null, [C.Poisoned]);

// ---- Enemies (Act 2 demonic dungeon) ----
const Imp = createActEnemy(2, "imp", "Imp", 2, 5, EnemyEffectId.None, "No effect.");
const SoulBroker = createActEnemy(2, "soul_broker", "Soul Broker", 2, 7, EnemyEffectId.GoblinStealGold, "Applies Weakened on attack; steals gold if alive past combat round 3.", null, [C.Weakened]);
const GloomBat = createActEnemy(2, "gloom_bat", "Gloom Bat", 4, 6, EnemyEffectId.BackBatBackline, "Starts Marked. Applies Burned on attack; attacks lowest-HP backline hero on combat round 2.", [C.Marked], [C.Burned]);
const Act2DebtWraith = createActEnemy(2, "debt_wraith", "Debt Wraith", 2, 16, EnemyEffectId.DebtWraithScales, "Applies Poisoned on attack. Attack scales with player debt at combat start.", null, [C.Poisoned]);
const HoardFiend = createActEnemy(2, "hoard_fiend", "Hoard Fiend", 2, 16, EnemyEffectId.TreasureLeechRewardDrain, "Applies Poisoned on attack. Reduces reward if alive at combat end.", null, [C.Poisoned]);
const BrimstoneBrute = createActEnemy(2, "brimstone_brute", "Brimstone Brute", 6, 22, EnemyEffectId.None, "No effect.");
const InfernalAuditor = createActEnemy(2, "infernal_auditor", "Infernal Auditor", 5, 30, EnemyEffectId.DungeonAuditorBoss, "Starts Inspired and applies Burned on attack. Raises wages and deals periodic damage.", [C.Inspired], [C.Burned]);

// ---- Enemies (Act 3: The Mint) ----
const Act3SlimeMint = createActEnemy(3, "act3-slime-mint", "Mint Slime", 2, 5, EnemyEffectId.None, "No effect.");
const Act3GoblinCoiner = createActEnemy(3, "act3-goblin-coiner", "Goblin Coiner", 2, 7, EnemyEffectId.GoblinStealGold, "Applies Weakened on attack; steals gold if alive past combat round 3.", null, [C.Weakened]);
const Act3BatTariff = createActEnemy(3, "act3-bat-tariff", "Tariff Bat", 4, 6, EnemyEffectId.BackBatBackline, "Starts Marked. Applies Burned on attack; attacks lowest-HP backline hero on combat round 2.", [C.Marked], [C.Burned]);
const Act3ImpMint = createActEnemy(3, "act3-imp-mint", "Mint Imp", 2, 5, EnemyEffectId.None, "No effect.");
const Act3SoulBrokerMint = createActEnemy(3, "act3-soul-broker-mint", "Mint Soul Broker", 2, 16, EnemyEffectId.TreasureLeechRewardDrain, "Applies Poisoned on attack. Reduces reward if alive at combat end.", null, [C.Poisoned]);
const Act3BrimstoneMint = createActEnemy(3, "act3-brimstone-mint", "Minted Brimstone Brute", 6, 22, EnemyEffectId.None, "No effect.");
const Act3InfernalAuditorMint = createActEnemy(3, "act3-infernal-auditor-mint", "Mint Infernal Auditor", 2, 16, EnemyEffectId.DebtWraithScales, "Applies Poisoned on attack. Attack scales with player debt at combat start.", null, [C.Poisoned]);
const Act3Mintmaster = createActEnemy(3, "act3-mintmaster", "MintMaster", 5, 30, EnemyEffectId.DungeonAuditorBoss, "Starts Inspired and applies Burned on attack. Raises wages and deals periodic damage.", [C.Inspired], [C.Burned]);
const Act3ShieldGrunt = createActEnemy(3, "act3-shield-grunt", "Mint Enforcer", 3, 7, EnemyEffectId.None, "Starts Guarded.", [C.Guarded]);
const Act3DungeonArcher = createActEnemy(3, "act3-dungeon-archer", "Mint Crossbowman", 4, 4, EnemyEffectId.None, "Starts Marked. Applies Burned on attack.", [C.Marked], [C.Burned]);
const Act3DungeonMedic = createActEnemy(3, "act3-dungeon-medic", "Mint Mender", 2, 7, EnemyEffectId.FrugalGhostHeal, "Applies Poisoned on attack. Heals leftmost living ally each combat round.", null, [C.Poisoned]);
const Act3HulkingProtector = createActEnemy(3, "act3-hulking-protector", "Mint Vault Guard", 2, 17, EnemyEffectId.None, "Starts Guarded.", [C.Guarded]);
const Act3DungeonChampion = createActEnemy(3, "act3-dungeon-champion", "Mint Enforcer Champion", 7, 7, EnemyEffectId.None, "Starts Inspired.", [C.Inspired]);

// ---- Enemies (Act 4: The Vault) ----
const Act4VaultSlime = createActEnemy(4, "act4-vault-slime", "Vault Slime", 2, 5, EnemyEffectId.None, "No effect.");
const Act4VaultCoiner = createActEnemy(4, "act4-vault-coiner", "Vault Coiner", 2, 7, EnemyEffectId.GoblinStealGold, "Applies Weakened on attack; steals gold if alive past combat round 3.", null, [C.Weakened]);
const Act4VaultBat = createActEnemy(4, "act4-vault-bat", "Vault Bat", 4, 6, EnemyEffectId.BackBatBackline, "Starts Marked. Applies Burned on attack; attacks lowest-HP backline hero on combat round 2.", [C.Marked], [C.Burned]);
const Act4VaultImp = createActEnemy(4, "act4-vault-imp", "Vault Imp", 2, 5, EnemyEffectId.None, "No effect.");
const Act4LedgerBroker = createActEnemy(4, "act4-ledger-broker", "Ledger Broker", 2, 16, EnemyEffectId.TreasureLeechRewardDrain, "Applies Poisoned on attack. Reduces reward if alive at combat end.", null, [C.Poisoned]);
const Act4VaultBrute = createActEnemy(4, "act4-vault-brute", "Vault Brute", 6, 22, EnemyEffectId.None, "No effect.");
const Act4VaultAuditor = createActEnemy(4, "act4-vault-auditor", "Vault Auditor", 2, 16, EnemyEffectId.DebtWraithScales, "Applies Poisoned on attack. Attack scales with player debt at combat start.", null, [C.Poisoned]);
const Act4BankerKing = createActEnemy(4, "act4-banker-king", "The Banker King", 5, 30, EnemyEffectId.BankerKingDebtJudgment, "Starts Inspired and applies Burned on attack. Gains attack from player debt at combat start.", [C.Inspired], [C.Burned]);
const Act4ShieldGrunt = createActEnemy(4, "act4-shield-grunt", "Vault Enforcer", 4, 9, EnemyEffectId.None, "Starts Guarded.", [C.Guarded]);
const Act4DungeonArcher = createActEnemy(4, "act4-dungeon-archer", "Vault Marksman", 5, 5, EnemyEffectId.None, "Starts Marked. Applies Burned on attack.", [C.Marked], [C.Burned]);
const Act4DungeonMedic = createActEnemy(4, "act4-dungeon-medic", "Vault Surgeon", 3, 9, EnemyEffectId.FrugalGhostHeal, "Applies Poisoned on attack. Heals leftmost living ally each combat round.", null, [C.Poisoned]);
const Act4HulkingProtector = createActEnemy(4, "act4-hulking-protector", "Vault Iron Guard", 3, 20, EnemyEffectId.None, "Starts Guarded.", [C.Guarded]);
const Act4DungeonChampion = createActEnemy(4, "act4-dungeon-champion", "Vault Warlord", 8, 9, EnemyEffectId.None, "Starts Inspired.", [C.Inspired]);

const HeroDefinitions = [
  Warrior, Knight, Golem, Wizard, Ninja, Ranger, Priest, Bard, Enchanter, Squire, Treasurer, Apprentice,
  Paladin, Cleric, Barbarian, Rogue, Warlock, Artificer,
  Sorcerer, Fighter, Druid,
];

const EnemyDefinitions = [
  Slime, TrainingDummy, CaveBat, GoblinThief, TaxCollector, LazyInspector, BacklineBat, DebtWraith, TreasureLeech, SplitTreasureLeech, DungeonAuditor,
  GreedyTank, GreedyCarry, CarryProtector, CarryCarry, FrugalGuard, FrugalArcher, FrugalHealer,
  LieutenantFrugalGuard, LieutenantFrugalArcher, LieutenantFrugalHealer,
  ShieldGrunt, PitBrawler,
  DungeonArcher, DungeonMedic, HulkingProtector, DungeonChampion,
  AuditorArmsman, AuditorAccountant,
  Act2ShieldGrunt, Act2PitBrawler, Act2DungeonArcher, Act2DungeonMedic, Act2HulkingProtector, Act2DungeonChampion,
  Act2GreedyTank, Act2GreedyCarry, Act2CarryProtector, Act2CarryChampion, Act2CarrySupport, Act2FrugalGuard, Act2FrugalArcher, Act2FrugalHealer,
  Imp, SoulBroker, GloomBat, Act2DebtWraith, HoardFiend, BrimstoneBrute, InfernalAuditor,
  Act3SlimeMint, Act3GoblinCoiner, Act3BatTariff, Act3ImpMint, Act3SoulBrokerMint, Act3BrimstoneMint, Act3InfernalAuditorMint, Act3Mintmaster,
  Act3ShieldGrunt, Act3DungeonArcher, Act3DungeonMedic, Act3HulkingProtector, Act3DungeonChampion,
  Act4VaultSlime, Act4VaultCoiner, Act4VaultBat, Act4VaultImp, Act4LedgerBroker, Act4VaultBrute, Act4VaultAuditor, Act4BankerKing,
  Act4ShieldGrunt, Act4DungeonArcher, Act4DungeonMedic, Act4HulkingProtector, Act4DungeonChampion,
];

const PayrollActionDefinitions = [
  new PayrollActionDefinition(PayrollActionId.TakeLoan, "Take Operating Loan",
    `Borrow now. +${GameRules.LoanGoldGain} gold and +${GameRules.LoanDebtCost} debt immediately. Use when you need a gold buffer before wages and interest resolve.`),
  new PayrollActionDefinition(PayrollActionId.CutWages, "Cut Wages",
    `Cut payroll. Saves up to ${GameRules.CutWagesUpkeepReduction} wages after combat. All heroes fight at -${GameRules.CutWagesAttackPenalty} attack. Use when you cannot afford wages without weakening the party.`),
  new PayrollActionDefinition(PayrollActionId.PromiseVictoryBonus, "Promise Victory Bonus",
    `All heroes gain +${GameRules.VictoryBonusAttackBuff} attack this fight. Win: pay ${GameRules.VictoryBonusGoldCost} gold after reward (unpaid→debt). Lose: +${GameRules.VictoryBonusDebtOnLoss} debt. Use when a damage spike secures the win.`),
  new PayrollActionDefinition(PayrollActionId.StandardPay, "Standard Payroll",
    `No bonus. No penalty. No gold change, no debt, no stat change. Use when you are stable and need no extra risk.`),
];

const RelicDefinitions = [
  new RelicDefinition(RelicId.BladeCharter, "Blade Charter", "Damage-role heroes get +1 attack in combat."),
  new RelicDefinition(RelicId.IronOath, "Iron Oath", "Tank-role heroes get +1 max health in combat."),
  new RelicDefinition(RelicId.CampRations, "Camp Rations", "All heroes get +1 max health in combat."),
  new RelicDefinition(RelicId.GuildDividend, "Guild Dividend", "Gain +1 extra gold in each reward phase."),
  new RelicDefinition(RelicId.ShieldClause, GameRules.ShieldClauseRelicName, GameRules.ShieldClauseRelicDescription),
  new RelicDefinition(RelicId.RedInkBrand, GameRules.RedInkBrandRelicName, GameRules.RedInkBrandRelicDescription),
  new RelicDefinition(RelicId.CausticWrit, GameRules.CausticWritRelicName, GameRules.CausticWritRelicDescription),
  new RelicDefinition(RelicId.ToxicCollateral, GameRules.ToxicCollateralRelicName, GameRules.ToxicCollateralRelicDescription),
  new RelicDefinition(RelicId.DebtPact, GameRules.DebtPactRelicName, GameRules.DebtPactRelicDescription),
  new RelicDefinition(RelicId.BloodContract, GameRules.BloodContractRelicName, GameRules.BloodContractRelicDescription),
];

const EncounterDefinitions = [
  new EncounterDefinition(1, 1, EncounterType.Dungeon, "Slimes", "Simple enemies. Win by having enough basic stats.", "Basic stat check", [Slime, Slime, Slime], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(1, 1, EncounterType.Dungeon, "Shield Grunts", "Two shielded brutes spread across the line. Your first taste of Guarded — hit each twice to break through.", "Frontline durability", [ShieldGrunt, ShieldGrunt], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "shield_grunts", [{q:5,r:1}, {q:5,r:3}], "Bruiser"),
  new EncounterDefinition(1, 2, EncounterType.Dungeon, "Goblin Thieves", "If a Goblin Thief survives past combat round 3, lose 3 gold.", "Economy pressure", [GoblinThief, GoblinThief], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(1, 2, EncounterType.Dungeon, "Dungeon Archers", "Two fragile archers hang back in the corners. They're Marked and fragile — kill them before Burned stacks up.", "Backline pressure", [DungeonArcher, DungeonArcher], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "dungeon_archers", [{q:6,r:0}, {q:6,r:4}], "Backline"),
  new EncounterDefinition(1, 3, EncounterType.RivalGhost, "Greedy Guild Ghost", "A reckless rival guild with expensive heroes. Strong now, but drowning in debt.", "Rival benchmark", [GreedyTank, GreedyTank, GreedyCarry], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Greedy, "base", [{q:5,r:0}, {q:5,r:4}, {q:6,r:2}]),
  new EncounterDefinition(1, 4, EncounterType.Dungeon, "Tax Collector", "Your total wages are increased by 2 this round.", "Payroll pressure", [TaxCollector], GameRules.WinReward, EncounterEffectId.TaxCollectorUpkeep, RivalGuild.None),
  new EncounterDefinition(1, 4, EncounterType.Dungeon, "Lazy Inspector", "A slower inspector skips the payroll audit but weakens whoever it hits.", "Status pressure", [LazyInspector], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "lazy_inspector"),
  new EncounterDefinition(1, 5, EncounterType.Dungeon, "Backline Bat", "Attacks your lowest-health backline hero on turn 2.", "Backline pressure", [BacklineBat, Slime], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(1, 5, EncounterType.Dungeon, "Pit Brawlers", "Two aggressive brawlers charge ahead of a shielded grunt. High damage — stop them fast.", "Melee rush", [PitBrawler, PitBrawler, ShieldGrunt], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "pit_brawlers", [{q:5,r:1}, {q:5,r:3}, {q:6,r:2}], "Bruiser"),
  new EncounterDefinition(1, 5, EncounterType.Dungeon, "Healing Ward", "A grunt guards a dungeon medic. Burst the medic before Poisoned accumulates or you'll be outlasted.", "Attrition fight", [ShieldGrunt, DungeonMedic], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "healing_ward", [{q:5,r:2}, {q:6,r:2}], "Sustain"),
  new EncounterDefinition(1, 6, EncounterType.RivalGhost, "Carry Guild Ghost", "This rival protects a high-damage carry. Kill it quickly or survive the burst.", "Rival benchmark", [CarryProtector, CarryProtector, CarryCarry], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Carry, "base", [{q:5,r:1}, {q:5,r:3}, {q:6,r:2}]),
  new EncounterDefinition(1, 6, EncounterType.RivalGhost, "Owl Roost", "This rival protects a high-damage carry with an extra backline threat.", "Rival benchmark", [CarryProtector, CarryProtector, CarryCarry, CarryCarry], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Carry, "owl_roost", [{q:5,r:0}, {q:5,r:4}, {q:6,r:1}, {q:6,r:3}]),
  new EncounterDefinition(1, 7, EncounterType.Dungeon, "Debt Wraith", "Gains attack based on your current debt.", "Debt punishment", [DebtWraith], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(1, 7, EncounterType.Dungeon, "Champion's Guard", "Two hulking protectors shield a powerful champion. Kill the champion before it shreds your party.", "Burst carry", [HulkingProtector, DungeonChampion, HulkingProtector], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "champions_guard", [{q:5,r:1}, {q:6,r:2}, {q:5,r:3}], "Carry"),
  new EncounterDefinition(1, 8, EncounterType.Dungeon, "Treasure Leech", "If Treasure Leech survives, your reward is reduced by 4 gold.", "Reward pressure", [TreasureLeech, Slime], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(1, 8, EncounterType.Dungeon, "Goblin Twin Bruisers", "Two smaller leeches split the local slot's total pressure across the line.", "Reward pressure", [SplitTreasureLeech, SplitTreasureLeech], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "goblin_twin_bruisers"),
  new EncounterDefinition(1, 9, EncounterType.RivalGhost, "Frugal Guild Ghost", "A stable rival guild with cheap heroes and strong morale.", "Rival benchmark", [FrugalGuard, FrugalGuard, FrugalArcher, FrugalHealer], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Frugal, "base", [{q:5,r:0}, {q:5,r:4}, {q:6,r:0}, {q:6,r:4}]),
  new EncounterDefinition(1, 9, EncounterType.RivalGhost, "Brigand Lieutenant", "A leaner rival line trades durability for attacks that Mark your heroes.", "Rival benchmark", [LieutenantFrugalGuard, LieutenantFrugalGuard, LieutenantFrugalArcher, LieutenantFrugalHealer], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Frugal, "brigand_lieutenant", [{q:5,r:1}, {q:5,r:3}, {q:6,r:0}, {q:6,r:4}]),
  new EncounterDefinition(1, 10, EncounterType.FinalBoss, "Dungeon Auditor", "Final boss. The Auditor is flanked by armsmen and a weakening accountant. Damages your party and raises wages.", "Final boss", [AuditorArmsman, DungeonAuditor, AuditorAccountant], GameRules.WinReward, EncounterEffectId.FinalBossDamage, RivalGuild.None, "base", [{q:5,r:0}, {q:6,r:2}, {q:5,r:4}]),

  new EncounterDefinition(2, 1, EncounterType.Dungeon, "Imp Swarm", "The descent begins. A pack of imps boils up from the pit.", "Basic stat check", [Imp, Imp, Imp], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(2, 1, EncounterType.Dungeon, "Iron Grunt Squad", "Two hardened iron grunts hold the line. Their Guarded armor has thickened since Act 1.", "Frontline durability", [Act2ShieldGrunt, Act2ShieldGrunt], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "iron_grunt_squad", [{q:5,r:1}, {q:5,r:3}], "Bruiser"),
  new EncounterDefinition(2, 2, EncounterType.Dungeon, "Soul Broker", "An iron grunt buys time for a Soul Broker to collect. If the broker survives past combat round 3, lose 3 gold.", "Economy pressure", [Act2ShieldGrunt, SoulBroker, Imp], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "base", [{q:5,r:2}, {q:6,r:1}, {q:6,r:3}]),
  new EncounterDefinition(2, 2, EncounterType.Dungeon, "Demonic Archers", "A guarded front line pins your heroes while two demonic snipers stack Burned from the corners.", "Backline pressure", [Act2ShieldGrunt, Act2DungeonArcher, Act2DungeonArcher], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "demonic_archers", [{q:5,r:2}, {q:6,r:0}, {q:6,r:4}], "Backline"),
  new EncounterDefinition(2, 3, EncounterType.RivalGhost, "Frugal Guild Rematch", "The Frugal Guild returns, disciplined and resilient, with a protected healer and backup surgeon keeping it standing.", "Rival benchmark", [Act2FrugalGuard, Act2FrugalGuard, Act2FrugalArcher, Act2FrugalHealer, Act2DungeonMedic], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Frugal, "base", [{q:5,r:0}, {q:5,r:2}, {q:5,r:4}, {q:6,r:1}, {q:6,r:3}]),
  new EncounterDefinition(2, 4, EncounterType.Dungeon, "Gloom Bat", "A guarded bat pack pressures your backline while the front holds your first attacks.", "Backline pressure", [Act2ShieldGrunt, GloomBat, Imp], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "base", [{q:5,r:2}, {q:6,r:2}, {q:6,r:0}]),
  new EncounterDefinition(2, 5, EncounterType.Dungeon, "Debt Wraith", "A guarded wraith gains attack based on your current debt while a sniper punishes slow clears.", "Debt punishment", [Act2ShieldGrunt, Act2DebtWraith, Act2DungeonArcher], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "base", [{q:5,r:2}, {q:6,r:2}, {q:6,r:4}]),
  new EncounterDefinition(2, 5, EncounterType.Dungeon, "Infernal Ward", "A demon grunt guards a pit surgeon while a sniper adds Burned pressure from the wing.", "Attrition fight", [Act2ShieldGrunt, Act2DungeonMedic, Act2DungeonArcher], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "infernal_ward", [{q:5,r:2}, {q:6,r:2}, {q:6,r:4}], "Sustain"),
  new EncounterDefinition(2, 6, EncounterType.RivalGhost, "Greedy Guild Rematch", "The Greedy Guild returns for Act 2, richer and meaner. Bigger tanks, a deadlier carry, and a sniper to punish slow clears.", "Rival benchmark", [Act2GreedyTank, Act2GreedyTank, Act2GreedyCarry, Act2DungeonArcher], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Greedy, "base", [{q:5,r:0}, {q:5,r:4}, {q:6,r:1}, {q:6,r:3}]),
  new EncounterDefinition(2, 7, EncounterType.Dungeon, "Hoard Fiend", "A hulking vanguard shields the Hoard Fiend long enough for its reward drain to matter.", "Reward pressure", [Act2HulkingProtector, HoardFiend, Imp], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "base", [{q:5,r:2}, {q:6,r:1}, {q:6,r:3}]),
  new EncounterDefinition(2, 7, EncounterType.Dungeon, "Demon Champion's Guard", "Two hulking vanguards and a pit surgeon protect a demonic warlord. Kill the warlord before it shreds your formation.", "Burst carry", [Act2HulkingProtector, Act2DungeonChampion, Act2HulkingProtector, Act2DungeonMedic], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "demon_champions_guard", [{q:5,r:1}, {q:6,r:2}, {q:5,r:3}, {q:6,r:4}], "Carry"),
  new EncounterDefinition(2, 8, EncounterType.Dungeon, "Brimstone Brute", "A towering demon pushes the line while a sniper and surgeon keep the stress test from collapsing early.", "Heavy dungeon", [Act2ShieldGrunt, BrimstoneBrute, Act2DungeonArcher, Act2DungeonMedic], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "base", [{q:5,r:1}, {q:5,r:3}, {q:6,r:0}, {q:6,r:4}]),
  new EncounterDefinition(2, 9, EncounterType.RivalGhost, "Carry Guild Rematch", "The Carry Guild doubles down: a fortified front line shielding an even stronger champion.", "Rival benchmark", [Act2CarryProtector, Act2CarryProtector, Act2CarryChampion, Act2CarrySupport], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Carry, "base", [{q:5,r:0}, {q:5,r:4}, {q:6,r:2}, {q:6,r:0}]),
  new EncounterDefinition(2, 10, EncounterType.FinalBoss, "Infernal Auditor", "Act 2 capstone. An iron guard and sniper buy time while the Infernal Auditor tallies your debts in fire.", "Final boss", [Act2ShieldGrunt, InfernalAuditor, Act2DungeonArcher], GameRules.WinReward, EncounterEffectId.FinalBossDamage, RivalGuild.None, "base", [{q:5,r:0}, {q:6,r:2}, {q:5,r:4}]),

  new EncounterDefinition(3, 1, EncounterType.Dungeon, "Mint Slime Press", "The Mint stamps simple slimes into sharper coinage.", "Basic stat check", [Act3SlimeMint, Act3SlimeMint, Act3ImpMint], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(3, 1, EncounterType.Dungeon, "Mint Enforcers", "Two mint enforcers hold the production floor. Their Guarded plating is freshly minted.", "Frontline durability", [Act3ShieldGrunt, Act3ShieldGrunt], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "mint_enforcers", [{q:5,r:1}, {q:5,r:3}], "Bruiser"),
  new EncounterDefinition(3, 2, EncounterType.Dungeon, "Goblin Coiners", "A mint enforcer buys time for a Goblin Coiner to skim your purse. If the coiner survives past combat round 3, lose 3 gold.", "Economy pressure", [Act3ShieldGrunt, Act3GoblinCoiner, Act3ImpMint], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "base", [{q:5,r:2}, {q:6,r:1}, {q:6,r:3}]),
  new EncounterDefinition(3, 2, EncounterType.Dungeon, "Mint Crossbowmen", "A mint enforcer pins the line while two crossbowmen stack Burned from behind the presses.", "Backline pressure", [Act3ShieldGrunt, Act3DungeonArcher, Act3DungeonArcher], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "mint_crossbowmen", [{q:5,r:2}, {q:6,r:0}, {q:6,r:4}], "Backline"),
  new EncounterDefinition(3, 3, EncounterType.RivalGhost, "Frugal Guild Mint Rematch", "The Frugal Guild returns under the cold lamps of The Mint with guards, crossbow support, and a mender.", "Rival benchmark", [Act3ShieldGrunt, Act3ShieldGrunt, Act3DungeonArcher, Act3DungeonMedic, Act3SoulBrokerMint], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Frugal, "base", [{q:5,r:0}, {q:5,r:2}, {q:5,r:4}, {q:6,r:1}, {q:6,r:3}]),
  new EncounterDefinition(3, 4, EncounterType.Dungeon, "Tariff Bat", "A mint enforcer screens for a bat pack that dives your lowest-health backline hero on turn 2.", "Backline pressure", [Act3ShieldGrunt, Act3BatTariff, Act3ImpMint], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "base", [{q:5,r:2}, {q:6,r:2}, {q:6,r:0}]),
  new EncounterDefinition(3, 5, EncounterType.Dungeon, "Mint Infernal Auditor", "A mint enforcer protects a debt-scaling auditor while a crossbowman punishes slow clears.", "Debt punishment", [Act3ShieldGrunt, Act3InfernalAuditorMint, Act3DungeonArcher], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "base", [{q:5,r:2}, {q:6,r:2}, {q:6,r:4}]),
  new EncounterDefinition(3, 5, EncounterType.Dungeon, "Mint Mending Post", "A mint enforcer guards a Mint Mender while a crossbowman adds Burned pressure from the wing.", "Attrition fight", [Act3ShieldGrunt, Act3DungeonMedic, Act3DungeonArcher], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "mint_mending_post", [{q:5,r:2}, {q:6,r:2}, {q:6,r:4}], "Sustain"),
  new EncounterDefinition(3, 6, EncounterType.RivalGhost, "Greedy Guild Mint Rematch", "The Greedy Guild returns plated in fresh coin, with brute force screened by crossbow fire.", "Rival benchmark", [Act3BrimstoneMint, Act3BrimstoneMint, Act3BatTariff, Act3DungeonArcher], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Greedy, "base", [{q:5,r:0}, {q:5,r:4}, {q:6,r:1}, {q:6,r:3}]),
  new EncounterDefinition(3, 7, EncounterType.Dungeon, "Mint Soul Broker", "A vault guard shields the Mint Soul Broker long enough for its reward drain to matter.", "Reward pressure", [Act3HulkingProtector, Act3SoulBrokerMint, Act3ImpMint], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "base", [{q:5,r:2}, {q:6,r:1}, {q:6,r:3}]),
  new EncounterDefinition(3, 7, EncounterType.Dungeon, "Mint Champion's Detail", "Two vault guards and a Mint Mender protect a mint enforcer champion. Kill the champion before it dismantles your formation.", "Burst carry", [Act3HulkingProtector, Act3DungeonChampion, Act3HulkingProtector, Act3DungeonMedic], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "mint_champions_detail", [{q:5,r:1}, {q:6,r:2}, {q:5,r:3}, {q:6,r:4}], "Carry"),
  new EncounterDefinition(3, 8, EncounterType.Dungeon, "Minted Brimstone Brute", "A towering press guard pushes the line while a crossbowman and mender keep the stress test from collapsing early.", "Heavy dungeon", [Act3ShieldGrunt, Act3BrimstoneMint, Act3DungeonArcher, Act3DungeonMedic], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "base", [{q:5,r:1}, {q:5,r:3}, {q:6,r:0}, {q:6,r:4}]),
  new EncounterDefinition(3, 9, EncounterType.RivalGhost, "Carry Guild Mint Rematch", "The Carry Guild shields a hardened champion among the counting engines.", "Rival benchmark", [Act3BrimstoneMint, Act3BrimstoneMint, Act3InfernalAuditorMint, Act3SoulBrokerMint], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Carry),
  new EncounterDefinition(3, 10, EncounterType.FinalBoss, "MintMaster", "Act 3 capstone. A mint enforcer and mender protect the MintMaster while it mints extra wages from your debt.", "Final boss", [Act3ShieldGrunt, Act3Mintmaster, Act3DungeonMedic], GameRules.WinReward, EncounterEffectId.MintMasterOvermint, RivalGuild.None, "base", [{q:5,r:0}, {q:6,r:2}, {q:5,r:4}]),

  new EncounterDefinition(4, 1, EncounterType.Dungeon, "Vault Slime Lockbox", "The Vault hardens simple slimes into sealed ledgers.", "Basic stat check", [Act4VaultSlime, Act4VaultSlime, Act4VaultImp], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(4, 1, EncounterType.Dungeon, "Vault Enforcers", "Two iron-plated vault enforcers bar the entry hall. Their Guarded armor is the thickest yet.", "Frontline durability", [Act4ShieldGrunt, Act4ShieldGrunt], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "vault_enforcers", [{q:5,r:1}, {q:5,r:3}], "Bruiser"),
  new EncounterDefinition(4, 2, EncounterType.Dungeon, "Vault Coiners", "A vault enforcer buys time for a Vault Coiner to skim your purse. If the coiner survives past combat round 3, lose 3 gold.", "Economy pressure", [Act4ShieldGrunt, Act4VaultCoiner, Act4VaultImp], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "base", [{q:5,r:2}, {q:6,r:1}, {q:6,r:3}]),
  new EncounterDefinition(4, 2, EncounterType.Dungeon, "Vault Marksmen", "A vault enforcer pins the line while two marksmen stack Burned from the rear passages.", "Backline pressure", [Act4ShieldGrunt, Act4DungeonArcher, Act4DungeonArcher], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "vault_marksmen", [{q:5,r:2}, {q:6,r:0}, {q:6,r:4}], "Backline"),
  new EncounterDefinition(4, 3, EncounterType.RivalGhost, "Frugal Guild Vault Rematch", "The Frugal Guild returns to audit every step in The Vault with guards, marksman support, and a surgeon.", "Rival benchmark", [Act4ShieldGrunt, Act4ShieldGrunt, Act4DungeonArcher, Act4DungeonMedic, Act4LedgerBroker], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Frugal, "base", [{q:5,r:0}, {q:5,r:2}, {q:5,r:4}, {q:6,r:1}, {q:6,r:3}]),
  new EncounterDefinition(4, 4, EncounterType.Dungeon, "Vault Bat", "A vault enforcer screens for a bat pack that dives your lowest-health backline hero on turn 2.", "Backline pressure", [Act4ShieldGrunt, Act4VaultBat, Act4VaultImp], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "base", [{q:5,r:2}, {q:6,r:2}, {q:6,r:0}]),
  new EncounterDefinition(4, 5, EncounterType.Dungeon, "Vault Auditor", "A vault enforcer protects a debt-scaling auditor while a marksman punishes slow clears.", "Debt punishment", [Act4ShieldGrunt, Act4VaultAuditor, Act4DungeonArcher], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "base", [{q:5,r:2}, {q:6,r:2}, {q:6,r:4}]),
  new EncounterDefinition(4, 5, EncounterType.Dungeon, "Vault Surgical Ward", "A vault enforcer shields a vault surgeon while a marksman adds Burned pressure from the wing.", "Attrition fight", [Act4ShieldGrunt, Act4DungeonMedic, Act4DungeonArcher], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "vault_surgical_ward", [{q:5,r:2}, {q:6,r:2}, {q:6,r:4}], "Sustain"),
  new EncounterDefinition(4, 6, EncounterType.RivalGhost, "Greedy Guild Vault Rematch", "The Greedy Guild returns with heavier locks and sharper claims, backed by vault marksman fire.", "Rival benchmark", [Act4VaultBrute, Act4VaultBrute, Act4VaultBat, Act4DungeonArcher], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Greedy, "base", [{q:5,r:0}, {q:5,r:4}, {q:6,r:1}, {q:6,r:3}]),
  new EncounterDefinition(4, 7, EncounterType.Dungeon, "Ledger Broker", "A vault iron guard shields the Ledger Broker long enough for its reward drain to matter.", "Reward pressure", [Act4HulkingProtector, Act4LedgerBroker, Act4VaultImp], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "base", [{q:5,r:2}, {q:6,r:1}, {q:6,r:3}]),
  new EncounterDefinition(4, 7, EncounterType.Dungeon, "Vault Warlord's Guard", "Two iron vault guards and a vault surgeon protect a vault warlord. Kill the warlord before it tears through everything.", "Burst carry", [Act4HulkingProtector, Act4DungeonChampion, Act4HulkingProtector, Act4DungeonMedic], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "vault_warlords_guard", [{q:5,r:1}, {q:6,r:2}, {q:5,r:3}, {q:6,r:4}], "Carry"),
  new EncounterDefinition(4, 8, EncounterType.Dungeon, "Vault Brute", "A sealed-vault guard pushes the line while a marksman and surgeon keep the stress test from collapsing early.", "Heavy dungeon", [Act4ShieldGrunt, Act4VaultBrute, Act4DungeonArcher, Act4DungeonMedic], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "base", [{q:5,r:1}, {q:5,r:3}, {q:6,r:0}, {q:6,r:4}]),
  new EncounterDefinition(4, 9, EncounterType.RivalGhost, "Carry Guild Vault Rematch", "The Carry Guild shields its champion behind final-ledger muscle.", "Rival benchmark", [Act4VaultBrute, Act4VaultBrute, Act4VaultAuditor, Act4LedgerBroker], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Carry),
  new EncounterDefinition(4, 10, EncounterType.FinalBoss, "The Banker King", "Act 4 capstone. A vault enforcer and surgeon protect the Banker King as it judges the run by the debt it carries.", "Final boss", [Act4ShieldGrunt, Act4BankerKing, Act4DungeonMedic], GameRules.WinReward, EncounterEffectId.FinalBossDamage, RivalGuild.None, "base", [{q:5,r:0}, {q:6,r:2}, {q:5,r:4}]),
];

const DifficultyMutatorDefinitions = [
  new MutatorDefinition(
    "LessStartingGold",
    "Less Starting Gold",
    "-3 starting gold.",
    (settings) => { settings.startingGold -= 3; },
  ),
  new MutatorDefinition(
    "HigherInterest",
    "Higher Interest",
    "Interest on debt is charged at a higher rate (divisor 2).",
    (settings) => { settings.interestDivisor = 2; },
  ),
  new MutatorDefinition(
    "LowerDebtLimit",
    "Lower Debt Limit",
    "-5 debt limit.",
    (settings) => { settings.debtLimit -= 5; },
  ),
  new MutatorDefinition(
    "InitialDebt",
    "Initial Debt",
    "Start the run with +3 debt.",
    (settings) => { settings.startingDebt += 3; },
  ),
  new MutatorDefinition(
    "ReducedMorale",
    "Reduced Morale",
    "-5 starting morale.",
    (settings) => { settings.startingMorale -= 5; },
  ),
  new MutatorDefinition(
    "ReducedReward",
    "Reduced Reward",
    "Combat win rewards reduced by 2 gold.",
    (settings) => { settings.rewardGoldModifier -= 2; },
  ),
  new MutatorDefinition(
    "CostlyRerolls",
    "Costly Rerolls",
    "Shop rerolls cost 1 extra gold.",
    (settings) => { settings.rerollCostModifier += 1; },
  ),
  new MutatorDefinition(
    "SlowerGrowth",
    "Slower Growth",
    "Heroes earn 1 less veterancy XP per combat.",
    (settings) => { settings.veteranXpModifier -= 1; },
  ),
  new MutatorDefinition(
    "TougherEnemies",
    "Tougher Enemies",
    "Enemies have 15% more HP.",
    (settings) => { settings.enemyHealthMultiplier = 1.15; },
  ),
  new MutatorDefinition(
    "BrutalContract",
    "Brutal Contract",
    "Heroes have 15% less HP and deal 15% less damage; enemies deal 15% more damage.",
    (settings) => {
      settings.heroHealthMultiplier = 0.85;
      settings.heroDamageMultiplier = 0.85;
      settings.enemyDamageMultiplier = 1.15;
    },
  ),
];

const DifficultyLevelDefinitions = Object.freeze([
  createDifficultyLevel(DifficultyLevel.Level0),
  createDifficultyLevel(DifficultyLevel.Level1),
  createDifficultyLevel(DifficultyLevel.Level2),
  createDifficultyLevel(DifficultyLevel.Level3),
  createDifficultyLevel(DifficultyLevel.Level4),
  createDifficultyLevel(DifficultyLevel.Level5),
  createDifficultyLevel(DifficultyLevel.Level6),
  createDifficultyLevel(DifficultyLevel.Level7),
  createDifficultyLevel(DifficultyLevel.Level8),
  createDifficultyLevel(DifficultyLevel.Level9),
  createDifficultyLevel(DifficultyLevel.Level10),
]);

export const DataRepository = {
  allHeroes: Object.freeze([...HeroDefinitions]),
  allEnemies: Object.freeze([...EnemyDefinitions]),
  encounters: Object.freeze([...EncounterDefinitions]),
  allPayrollActions: Object.freeze([...PayrollActionDefinitions]),
  allRelics: Object.freeze([...RelicDefinitions]),
  allDifficultyLevels: DifficultyLevelDefinitions,
  allDifficultyMutators: Object.freeze([...DifficultyMutatorDefinitions]),

  getEncounterPool(act, slot) {
    const pool = [];
    for (const encounter of EncounterDefinitions) {
      if (encounter.act === act && encounter.slot === slot) pool.push(encounter);
    }
    return pool;
  },

  getRivalEncounter(act, guild) {
    if (guild === RivalGuild.None) return null;
    for (const encounter of EncounterDefinitions) {
      if (encounter.act === act && encounter.rivalGuild === guild) return encounter;
    }
    return null;
  },

  getDifficultyLevel(level) {
    for (const definition of DifficultyLevelDefinitions) {
      if (definition.level === level) return definition;
    }
    return null;
  },

  getDifficultyMutatorsForLevel(level) {
    const applied = [];
    for (let i = 0; i < level && i < DifficultyMutatorDefinitions.length; i++) {
      applied.push(DifficultyMutatorDefinitions[i]);
    }
    return applied;
  },

  getRelic(id) {
    for (const relic of RelicDefinitions) {
      if (relic.id === id) return relic;
    }
    return RelicDefinitions[0];
  },

  createRivalGuilds() {
    return [
      new RivalGuildState(RivalGuild.Greedy, "Greedy Guild", GameRules.StartingMorale, GameRules.StartingDebt, GameRules.GreedyRivalStartingPayroll, "Dangerous", GameRules.GreedyRivalPayrollGrowth, 0, null, false),
      new RivalGuildState(RivalGuild.Frugal, "Frugal Guild", GameRules.StartingMorale, GameRules.StartingDebt, GameRules.FrugalRivalStartingPayroll, "Safe", GameRules.FrugalRivalPayrollGrowth, 0, null, false),
      new RivalGuildState(RivalGuild.Carry, "Carry Guild", GameRules.StartingMorale, GameRules.StartingDebt, GameRules.CarryRivalStartingPayroll, "Scaling", GameRules.CarryRivalOddRoundPayrollGrowth, 0, null, false),
    ];
  },
};

function createDifficultyLevel(level) {
  const mutators = previewMutatorsForLevel(level);
  return Object.freeze({
    level,
    displayName: "Level " + level,
    isImplemented: level <= GameRules.MaxImplementedDifficultyLevel,
    mutators,
  });
}

function previewMutatorsForLevel(level) {
  const mutators = [];
  for (let i = 0; i < level && i < DifficultyMutatorDefinitions.length; i++) {
    mutators.push(DifficultyMutatorDefinitions[i]);
  }
  return Object.freeze(mutators);
}

function createActEnemy(act, id, displayName, baseAttack, baseHealth, effectId, effectDescription, startingStatuses = null, attackStatuses = null) {
  return new EnemyDefinition(
    id,
    displayName,
    GameRulesFns.scaleEnemyAttackForAct(baseAttack, act),
    GameRulesFns.scaleEnemyHealthForAct(baseHealth, act),
    effectId,
    effectDescription,
    startingStatuses,
    attackStatuses,
  );
}
