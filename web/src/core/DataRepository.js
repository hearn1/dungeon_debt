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

const C = CombatStatusId;

// ---- Heroes ----
const Warrior = new HeroDefinition("warrior", "Warrior", HeroRole.Tank, 2, 8, 2, "No effect.", HeroEffectId.None);
const Knight = new HeroDefinition("knight", "Knight", HeroRole.Tank, 1, 10, 4, "Redirects the first backline hit each combat to himself.", HeroEffectId.KnightRedirect);
const Golem = new HeroDefinition("golem", "Golem", HeroRole.Tank, 1, 14, 6, "Reduces incoming damage by 1.", HeroEffectId.GolemArmor);
const Wizard = new HeroDefinition("wizard", "Wizard", HeroRole.Damage, 3, 4, 5, "Gains +1 attack when full upkeep is paid.", HeroEffectId.WizardScaling);
const Ninja = new HeroDefinition("ninja", "Ninja", HeroRole.Damage, 4, 3, 4, "Targets the lowest-HP enemy; +1 gold on each kill.", HeroEffectId.NinjaLowestTarget);
const Ranger = new HeroDefinition("ranger", "Ranger", HeroRole.Damage, 3, 5, 3, "Can safely attack from the backline.", HeroEffectId.RangerBackline);
const Priest = new HeroDefinition("priest", "Priest", HeroRole.Support, 1, 5, 4, "Heals frontmost ally for 2 each combat round.", HeroEffectId.PriestHeal);
const Bard = new HeroDefinition("bard", "Bard", HeroRole.Support, 1, 4, 3, "+2 gold after each combat win.", HeroEffectId.BardGoldOnWin);
const Enchanter = new HeroDefinition("enchanter", "Enchanter", HeroRole.Support, 1, 4, 3, "Adjacent Damage allies gain +1 attack this combat.", HeroEffectId.EnchanterAdjacent);
const Squire = new HeroDefinition("squire", "Squire", HeroRole.Tank, 1, 4, 1, "No effect.", HeroEffectId.None);
const Treasurer = new HeroDefinition("treasurer", "Treasurer", HeroRole.Economy, 0, 4, 2, "Reduces the highest-upkeep ally's upkeep by 2.", HeroEffectId.TreasurerUpkeepReduce);
const Apprentice = new HeroDefinition("apprentice", "Apprentice", HeroRole.Economy, 1, 3, 1, "Reduces a Wizard ally's upkeep by 1.", HeroEffectId.ApprenticeWizardSupport);
const Paladin = new HeroDefinition("paladin", "Paladin", HeroRole.Tank, 2, 14, 4, "Heals all living allies for 1 at the end of each combat round.", HeroEffectId.PaladinAuraHeal);
const Cleric = new HeroDefinition("cleric", "Cleric", HeroRole.Support, 1, 8, 3, "Heals all living allies for 1 at the end of each combat round.", HeroEffectId.ClericGroupHeal);
const Barbarian = new HeroDefinition("barbarian", "Barbarian", HeroRole.Damage, 2, 10, 3, "Gains +2 attack while at half health or below.", HeroEffectId.BarbarianRage);
const Rogue = new HeroDefinition("rogue", "Rogue", HeroRole.Damage, 3, 7, 3, "First attack each combat deals double damage.", HeroEffectId.RogueFirstStrike);
const Warlock = new HeroDefinition("warlock", "Warlock", HeroRole.Damage, 2, 6, 4, "Gains attack based on player debt at combat start.", HeroEffectId.WarlockDebtPact);
const Artificer = new HeroDefinition("artificer", "Artificer", HeroRole.Economy, 1, 7, 2, "Gains attack based on owned relics at combat start.", HeroEffectId.ArtificerRelicCharge);

// ---- Enemies (Act 1) ----
const Slime = new EnemyDefinition("slime", "Slime", 1, 4, EnemyEffectId.None, "No effect.");
const TrainingDummy = new EnemyDefinition("training_dummy", "Training Dummy", 0, 10, EnemyEffectId.None, "No effect.");
const CaveBat = new EnemyDefinition("cave_bat", "Cave Bat", 2, 3, EnemyEffectId.None, "Starts Marked. Applies Burned on attack.", [C.Marked], [C.Burned]);
const GoblinThief = new EnemyDefinition("goblin_thief", "Goblin Thief", 2, 4, EnemyEffectId.GoblinStealGold, "Applies Weakened on attack; steals gold if alive past combat round 3.", null, [C.Weakened]);
const TaxCollector = new EnemyDefinition("tax_collector", "Tax Collector", 1, 8, EnemyEffectId.None, "Applies Weakened on attack. Encounter raises upkeep this round.", null, [C.Weakened]);
const LazyInspector = new EnemyDefinition("lazy_inspector", "Lazy Inspector", 1, 8, EnemyEffectId.None, "Applies Weakened on attack.", null, [C.Weakened]);
const BacklineBat = new EnemyDefinition("backline_bat", "Backline Bat", 3, 4, EnemyEffectId.BackBatBackline, "Starts Marked. Applies Burned on attack; attacks lowest-HP backline hero on combat round 2.", [C.Marked], [C.Burned]);
const DebtWraith = new EnemyDefinition("debt_wraith", "Debt Wraith", 1, 10, EnemyEffectId.DebtWraithScales, "Applies Poisoned on attack. Attack scales with player debt at combat start.", null, [C.Poisoned]);
const TreasureLeech = new EnemyDefinition("treasure_leech", "Treasure Leech", 1, 12, EnemyEffectId.TreasureLeechRewardDrain, "Applies Poisoned on attack. Reduces reward if alive at combat end.", null, [C.Poisoned]);
const SplitTreasureLeech = new EnemyDefinition("split_treasure_leech", "Split Treasure Leech", 1, 8, EnemyEffectId.TreasureLeechRewardDrain, "Applies Poisoned on attack. Reduces reward if alive at combat end.", null, [C.Poisoned]);
const DungeonAuditor = new EnemyDefinition("dungeon_auditor", "Dungeon Auditor", 3, 20, EnemyEffectId.DungeonAuditorBoss, "Starts Inspired and applies Burned on attack. Raises upkeep and deals periodic damage.", [C.Inspired], [C.Burned]);
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

// ---- Enemies (Act 2 rival rematches) ----
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
const InfernalAuditor = createActEnemy(2, "infernal_auditor", "Infernal Auditor", 5, 30, EnemyEffectId.DungeonAuditorBoss, "Starts Inspired and applies Burned on attack. Raises upkeep and deals periodic damage.", [C.Inspired], [C.Burned]);

// ---- Enemies (Act 3: The Mint) ----
const Act3SlimeMint = createActEnemy(3, "act3-slime-mint", "Mint Slime", 2, 5, EnemyEffectId.None, "No effect.");
const Act3GoblinCoiner = createActEnemy(3, "act3-goblin-coiner", "Goblin Coiner", 2, 7, EnemyEffectId.GoblinStealGold, "Applies Weakened on attack; steals gold if alive past combat round 3.", null, [C.Weakened]);
const Act3BatTariff = createActEnemy(3, "act3-bat-tariff", "Tariff Bat", 4, 6, EnemyEffectId.BackBatBackline, "Starts Marked. Applies Burned on attack; attacks lowest-HP backline hero on combat round 2.", [C.Marked], [C.Burned]);
const Act3ImpMint = createActEnemy(3, "act3-imp-mint", "Mint Imp", 2, 5, EnemyEffectId.None, "No effect.");
const Act3SoulBrokerMint = createActEnemy(3, "act3-soul-broker-mint", "Mint Soul Broker", 2, 16, EnemyEffectId.TreasureLeechRewardDrain, "Applies Poisoned on attack. Reduces reward if alive at combat end.", null, [C.Poisoned]);
const Act3BrimstoneMint = createActEnemy(3, "act3-brimstone-mint", "Minted Brimstone Brute", 6, 22, EnemyEffectId.None, "No effect.");
const Act3InfernalAuditorMint = createActEnemy(3, "act3-infernal-auditor-mint", "Mint Infernal Auditor", 2, 16, EnemyEffectId.DebtWraithScales, "Applies Poisoned on attack. Attack scales with player debt at combat start.", null, [C.Poisoned]);
const Act3Mintmaster = createActEnemy(3, "act3-mintmaster", "MintMaster", 5, 30, EnemyEffectId.DungeonAuditorBoss, "Starts Inspired and applies Burned on attack. Raises upkeep and deals periodic damage.", [C.Inspired], [C.Burned]);

const HeroDefinitions = [
  Warrior, Knight, Golem, Wizard, Ninja, Ranger, Priest, Bard, Enchanter, Squire, Treasurer, Apprentice,
  Paladin, Cleric, Barbarian, Rogue, Warlock, Artificer,
];

const EnemyDefinitions = [
  Slime, TrainingDummy, CaveBat, GoblinThief, TaxCollector, LazyInspector, BacklineBat, DebtWraith, TreasureLeech, SplitTreasureLeech, DungeonAuditor,
  GreedyTank, GreedyCarry, CarryProtector, CarryCarry, FrugalGuard, FrugalArcher, FrugalHealer,
  LieutenantFrugalGuard, LieutenantFrugalArcher, LieutenantFrugalHealer,
  Act2GreedyTank, Act2GreedyCarry, Act2CarryProtector, Act2CarryChampion, Act2CarrySupport, Act2FrugalGuard, Act2FrugalArcher, Act2FrugalHealer,
  Imp, SoulBroker, GloomBat, Act2DebtWraith, HoardFiend, BrimstoneBrute, InfernalAuditor,
  Act3SlimeMint, Act3GoblinCoiner, Act3BatTariff, Act3ImpMint, Act3SoulBrokerMint, Act3BrimstoneMint, Act3InfernalAuditorMint, Act3Mintmaster,
];

const PayrollActionDefinitions = [
  new PayrollActionDefinition(PayrollActionId.TakeLoan, "Take Loan",
    `Gain ${GameRules.LoanGoldGain} gold immediately. Adds ${GameRules.LoanDebtCost} debt.`),
  new PayrollActionDefinition(PayrollActionId.CutWages, "Cut Wages",
    `Total upkeep this round drops by ${GameRules.CutWagesUpkeepReduction} (min 0). Each hero's attack drops by ${GameRules.CutWagesAttackPenalty} (min 0).`),
  new PayrollActionDefinition(PayrollActionId.PromiseVictoryBonus, "Promise Victory Bonus",
    `Pay ${GameRules.VictoryBonusGoldCost} gold now. Each hero gains +${GameRules.VictoryBonusAttackBuff} attack this fight.`),
  new PayrollActionDefinition(PayrollActionId.StandardPay, "Skip Payroll", "No effect this round."),
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
];

const EncounterDefinitions = [
  new EncounterDefinition(1, 1, EncounterType.Dungeon, "Slimes", "Simple enemies. Win by having enough basic stats.", "Basic stat check", [Slime, Slime, Slime], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(1, 2, EncounterType.Dungeon, "Goblin Thieves", "If a Goblin Thief survives past combat round 3, lose 3 gold.", "Economy pressure", [GoblinThief, GoblinThief], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(1, 3, EncounterType.RivalGhost, "Greedy Guild Ghost", "A reckless rival guild with expensive heroes. Strong now, but drowning in debt.", "Rival benchmark", [GreedyTank, GreedyTank, GreedyCarry], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Greedy),
  new EncounterDefinition(1, 4, EncounterType.Dungeon, "Tax Collector", "Your total upkeep is increased by 2 this round.", "Payroll pressure", [TaxCollector], GameRules.WinReward, EncounterEffectId.TaxCollectorUpkeep, RivalGuild.None),
  new EncounterDefinition(1, 4, EncounterType.Dungeon, "Lazy Inspector", "A slower inspector skips the payroll audit but weakens whoever it hits.", "Status pressure", [LazyInspector], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "lazy_inspector"),
  new EncounterDefinition(1, 5, EncounterType.Dungeon, "Backline Bat", "Attacks your lowest-health backline hero on turn 2.", "Backline pressure", [BacklineBat, Slime], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(1, 6, EncounterType.RivalGhost, "Carry Guild Ghost", "This rival protects a high-damage carry. Kill it quickly or survive the burst.", "Rival benchmark", [CarryProtector, CarryProtector, CarryCarry], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Carry),
  new EncounterDefinition(1, 6, EncounterType.RivalGhost, "Owl Roost", "This rival protects a high-damage carry with an extra backline threat.", "Rival benchmark", [CarryProtector, CarryProtector, CarryCarry, CarryCarry], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Carry, "owl_roost"),
  new EncounterDefinition(1, 7, EncounterType.Dungeon, "Debt Wraith", "Gains attack based on your current debt.", "Debt punishment", [DebtWraith], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(1, 8, EncounterType.Dungeon, "Treasure Leech", "If Treasure Leech survives, your reward is reduced by 4 gold.", "Reward pressure", [TreasureLeech, Slime], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(1, 8, EncounterType.Dungeon, "Goblin Twin Bruisers", "Two smaller leeches split the local slot's total pressure across the line.", "Reward pressure", [SplitTreasureLeech, SplitTreasureLeech], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None, "goblin_twin_bruisers"),
  new EncounterDefinition(1, 9, EncounterType.RivalGhost, "Frugal Guild Ghost", "A stable rival guild with cheap heroes and strong morale.", "Rival benchmark", [FrugalGuard, FrugalGuard, FrugalArcher, FrugalHealer], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Frugal),
  new EncounterDefinition(1, 9, EncounterType.RivalGhost, "Brigand Lieutenant", "A leaner rival line trades durability for attacks that Mark your heroes.", "Rival benchmark", [LieutenantFrugalGuard, LieutenantFrugalGuard, LieutenantFrugalArcher, LieutenantFrugalHealer], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Frugal, "brigand_lieutenant"),
  new EncounterDefinition(1, 10, EncounterType.FinalBoss, "Dungeon Auditor", "Final boss. Damages your party and adds debt pressure.", "Final boss", [DungeonAuditor], GameRules.WinReward, EncounterEffectId.FinalBossDamage, RivalGuild.None),

  new EncounterDefinition(2, 1, EncounterType.Dungeon, "Imp Swarm", "The descent begins. A pack of imps boils up from the pit.", "Basic stat check", [Imp, Imp, Imp], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(2, 2, EncounterType.Dungeon, "Soul Broker", "If a Soul Broker survives past combat round 3, lose 3 gold.", "Economy pressure", [SoulBroker, Imp], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(2, 3, EncounterType.RivalGhost, "Frugal Guild Rematch", "The Frugal Guild returns, disciplined and resilient, its healer keeping it standing.", "Rival benchmark", [Act2FrugalGuard, Act2FrugalGuard, Act2FrugalArcher, Act2FrugalHealer], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Frugal),
  new EncounterDefinition(2, 4, EncounterType.Dungeon, "Gloom Bat", "Attacks your lowest-health backline hero on turn 2.", "Backline pressure", [GloomBat, Imp], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(2, 5, EncounterType.Dungeon, "Debt Wraith", "Gains attack based on your current debt. Hardened for the descent.", "Debt punishment", [Act2DebtWraith], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(2, 6, EncounterType.RivalGhost, "Greedy Guild Rematch", "The Greedy Guild returns for Act 2, richer and meaner. Bigger tanks, a deadlier carry.", "Rival benchmark", [Act2GreedyTank, Act2GreedyTank, Act2GreedyCarry], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Greedy),
  new EncounterDefinition(2, 7, EncounterType.Dungeon, "Hoard Fiend", "If the Hoard Fiend survives, your reward is reduced by 4 gold.", "Reward pressure", [HoardFiend, Imp], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(2, 8, EncounterType.Dungeon, "Brimstone Brute", "A towering demon. Heavy stress test before the final guild fight.", "Heavy dungeon", [BrimstoneBrute, Imp, Imp], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(2, 9, EncounterType.RivalGhost, "Carry Guild Rematch", "The Carry Guild doubles down: a fortified front line shielding an even stronger champion.", "Rival benchmark", [Act2CarryProtector, Act2CarryProtector, Act2CarryChampion, Act2CarrySupport], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Carry),
  new EncounterDefinition(2, 10, EncounterType.FinalBoss, "Infernal Auditor", "Act 2 capstone. The Infernal Auditor tallies your debts in fire.", "Final boss", [InfernalAuditor], GameRules.WinReward, EncounterEffectId.FinalBossDamage, RivalGuild.None),

  new EncounterDefinition(3, 1, EncounterType.Dungeon, "Mint Slime Press", "The Mint stamps simple slimes into sharper coinage.", "Basic stat check", [Act3SlimeMint, Act3SlimeMint, Act3ImpMint], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(3, 2, EncounterType.Dungeon, "Goblin Coiners", "If a Goblin Coiner survives past combat round 3, lose 3 gold.", "Economy pressure", [Act3GoblinCoiner, Act3ImpMint], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(3, 3, EncounterType.RivalGhost, "Frugal Guild Mint Rematch", "The Frugal Guild returns under the cold lamps of The Mint.", "Rival benchmark", [Act3SlimeMint, Act3SlimeMint, Act3GoblinCoiner, Act3SoulBrokerMint], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Frugal),
  new EncounterDefinition(3, 4, EncounterType.Dungeon, "Tariff Bat", "Attacks your lowest-health backline hero on turn 2.", "Backline pressure", [Act3BatTariff, Act3ImpMint], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(3, 5, EncounterType.Dungeon, "Mint Infernal Auditor", "Gains attack based on your current debt. The Mint records every shortage.", "Debt punishment", [Act3InfernalAuditorMint], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(3, 6, EncounterType.RivalGhost, "Greedy Guild Mint Rematch", "The Greedy Guild returns plated in fresh coin and worse judgment.", "Rival benchmark", [Act3BrimstoneMint, Act3BrimstoneMint, Act3BatTariff], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Greedy),
  new EncounterDefinition(3, 7, EncounterType.Dungeon, "Mint Soul Broker", "If the Mint Soul Broker survives, your reward is reduced by 4 gold.", "Reward pressure", [Act3SoulBrokerMint, Act3ImpMint], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(3, 8, EncounterType.Dungeon, "Minted Brimstone Brute", "A towering press guard. Heavy stress test before the final guild fight.", "Heavy dungeon", [Act3BrimstoneMint, Act3ImpMint, Act3ImpMint], GameRules.WinReward, EncounterEffectId.None, RivalGuild.None),
  new EncounterDefinition(3, 9, EncounterType.RivalGhost, "Carry Guild Mint Rematch", "The Carry Guild shields a hardened champion among the counting engines.", "Rival benchmark", [Act3BrimstoneMint, Act3BrimstoneMint, Act3InfernalAuditorMint, Act3SoulBrokerMint], GameRules.WinReward, EncounterEffectId.None, RivalGuild.Carry),
  new EncounterDefinition(3, 10, EncounterType.FinalBoss, "MintMaster", "Act 3 capstone. The MintMaster audits the run with stamped-fire precision.", "Final boss", [Act3Mintmaster], GameRules.WinReward, EncounterEffectId.FinalBossDamage, RivalGuild.None),
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
    "Interest divisor becomes 4.",
    (settings) => { settings.interestDivisor = 4; },
  ),
  new MutatorDefinition(
    "LowerDebtLimit",
    "Lower Debt Limit",
    "-5 debt limit.",
    (settings) => { settings.debtLimit -= 5; },
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
