public class EnemyDefinition
{
    public EnemyDefinition(
        string id,
        string displayName,
        int attack,
        int health,
        EnemyEffectId effectId,
        string effectDescription)
    {
        Id = id;
        DisplayName = displayName;
        Attack = attack;
        Health = health;
        EffectId = effectId;
        EffectDescription = effectDescription;
    }

    public string Id { get; }
    public string DisplayName { get; }
    public int Attack { get; }
    public int Health { get; }
    public EnemyEffectId EffectId { get; }
    public string EffectDescription { get; }
}
