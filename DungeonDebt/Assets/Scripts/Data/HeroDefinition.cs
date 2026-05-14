public class HeroDefinition
{
    public HeroDefinition(
        string id,
        string displayName,
        HeroRole role,
        int baseAttack,
        int baseHealth,
        int baseUpkeep,
        string effectDescription,
        HeroEffectId effectId)
    {
        Id = id;
        DisplayName = displayName;
        Role = role;
        BaseAttack = baseAttack;
        BaseHealth = baseHealth;
        BaseUpkeep = baseUpkeep;
        EffectDescription = effectDescription;
        EffectId = effectId;
    }

    public string Id { get; }
    public string DisplayName { get; }
    public HeroRole Role { get; }
    public int BaseAttack { get; }
    public int BaseHealth { get; }
    public int BaseUpkeep { get; }
    public string EffectDescription { get; }
    public HeroEffectId EffectId { get; }
}
