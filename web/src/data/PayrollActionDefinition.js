// Ported from DungeonDebt/Assets/Scripts/Data/PayrollActionDefinition.cs
export class PayrollActionDefinition {
  constructor(id, displayName, description) {
    this.id = id;
    this.displayName = displayName;
    this.description = description;
    Object.freeze(this);
  }
}
