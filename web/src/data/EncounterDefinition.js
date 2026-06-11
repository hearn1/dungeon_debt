// Ported from DungeonDebt/Assets/Scripts/Data/EncounterDefinition.cs
import { GameRulesFns } from "../core/GameRules.js";

export class EncounterDefinition {
  constructor(act, slot, type, displayName, scoutText, dangerCategory, enemies, baseGoldReward, encounterEffectId, rivalGuild, variantId = "base", enemyBoardPositions = null) {
    this.act = act;
    this.slot = slot;
    this.round = GameRulesFns.getAbsoluteRound(act, slot);
    this.variantId = variantId;
    this.type = type;
    this.displayName = displayName;
    this.scoutText = scoutText;
    this.dangerCategory = dangerCategory;
    this.enemies = Object.freeze([...enemies]);
    this.baseGoldReward = baseGoldReward;
    this.encounterEffectId = encounterEffectId;
    this.rivalGuild = rivalGuild;
    // Optional array of {q,r} authored board positions per enemy slot (index-matched
    // to enemies[]). Null entries fall back to the default enemy deployment mapping.
    this.enemyBoardPositions = enemyBoardPositions ? Object.freeze([...enemyBoardPositions]) : null;
    Object.freeze(this);
  }
}
