public class CombatUnit
{
    public CombatUnit(
        string displayName,
        int attack,
        int currentHealth,
        int maxHealth,
        bool isPlayerSide,
        int slot,
        HeroInstance sourceHero,
        EnemyDefinition sourceEnemy)
    {
        DisplayName = displayName;
        Attack = attack;
        CurrentHealth = currentHealth;
        MaxHealth = maxHealth;
        IsPlayerSide = isPlayerSide;
        Slot = slot;
        SourceHero = sourceHero;
        SourceEnemy = sourceEnemy;
        Statuses = new CombatStatusState();
    }

    public string DisplayName { get; set; }
    public int Attack { get; set; }
    public int CurrentHealth { get; set; }
    public int MaxHealth { get; set; }
    public bool IsPlayerSide { get; set; }
    public int Slot { get; set; }
    public HeroInstance SourceHero { get; set; }
    public EnemyDefinition SourceEnemy { get; set; }
    public CombatStatusState Statuses { get; private set; }
    public bool IsAlive
    {
        get { return CurrentHealth > 0; }
    }

    public void CopyStatusesFrom(CombatUnit source)
    {
        if (source == null)
        {
            Statuses.CopyFrom(null);
            return;
        }

        Statuses.CopyFrom(source.Statuses);
    }
}
