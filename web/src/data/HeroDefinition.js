// Ported from DungeonDebt/Assets/Scripts/Data/HeroDefinition.cs
// Immutable hero template.
export class HeroDefinition {
  constructor(id, displayName, role, baseAttack, baseHealth, baseUpkeep, effectDescription, effectId,
    passiveAbility = null, activeAbility = null) {
    this.id = id;
    this.displayName = displayName;
    this.role = role;
    this.baseAttack = baseAttack;
    this.baseHealth = baseHealth;
    this.baseUpkeep = baseUpkeep;
    this.effectDescription = effectDescription;
    this.effectId = effectId;
    this.passiveAbility = passiveAbility;
    this.activeAbility = activeAbility;
    Object.freeze(this);
  }
}
