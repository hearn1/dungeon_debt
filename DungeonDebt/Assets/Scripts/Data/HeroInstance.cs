using System;

public class HeroInstance
{
    public HeroInstance(HeroDefinition definition, int formationSlot)
    {
        Definition = definition;
        CurrentHealth = definition.BaseHealth;
        Attack = definition.BaseAttack;
        UpkeepThisRound = definition.BaseUpkeep;
        FormationSlot = formationSlot;
        InstanceId = Guid.NewGuid();
        Tier = HeroTier.Bronze;
    }

    public HeroDefinition Definition { get; set; }
    public int CurrentHealth { get; set; }
    public int Attack { get; set; }
    public int UpkeepThisRound { get; set; }
    public int FormationSlot { get; set; }
    public Guid InstanceId { get; set; }
    public HeroTier Tier { get; set; }
}
