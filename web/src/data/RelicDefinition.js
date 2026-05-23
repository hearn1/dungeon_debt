// Ported from DungeonDebt/Assets/Scripts/Data/RelicDefinition.cs
export class RelicDefinition {
  constructor(id, displayName, effectDescription) {
    this.id = id;
    this.displayName = displayName;
    this.effectDescription = effectDescription;
    Object.freeze(this);
  }
}
