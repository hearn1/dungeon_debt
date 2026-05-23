// Ported from DungeonDebt/Assets/Scripts/Data/EncounterDefinition.cs
import { GameRulesFns } from "../core/GameRules.js";

export class EncounterDefinition {
  constructor(act, slot, type, displayName, scoutText, dangerCategory, enemies, baseGoldReward, encounterEffectId, rivalGuild) {
    this.act = act;
    this.slot = slot;
    this.round = GameRulesFns.getAbsoluteRound(act, slot);
    this.type = type;
    this.displayName = displayName;
    this.scoutText = scoutText;
    this.dangerCategory = dangerCategory;
    this.enemies = Object.freeze([...enemies]);
    this.baseGoldReward = baseGoldReward;
    this.encounterEffectId = encounterEffectId;
    this.rivalGuild = rivalGuild;
    Object.freeze(this);
  }
}
