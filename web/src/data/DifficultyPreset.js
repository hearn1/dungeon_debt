// Ported from DungeonDebt/Assets/Scripts/Data/DifficultyPreset.cs
export class DifficultyPreset {
  constructor(id, displayName, startingGold, startingDebt, startingMorale, interestDivisor, debtLimit, heroHealthMult, heroDamageMult, enemyHealthMult, enemyDamageMult) {
    this.id = id;
    this.displayName = displayName;
    this.startingGold = startingGold;
    this.startingDebt = startingDebt;
    this.startingMorale = startingMorale;
    this.interestDivisor = interestDivisor;
    this.debtLimit = debtLimit;
    this.heroHealthMult = heroHealthMult;
    this.heroDamageMult = heroDamageMult;
    this.enemyHealthMult = enemyHealthMult;
    this.enemyDamageMult = enemyDamageMult;
    Object.freeze(this);
  }
}
