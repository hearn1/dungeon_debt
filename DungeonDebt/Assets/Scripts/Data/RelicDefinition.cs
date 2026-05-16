public class RelicDefinition
{
    public RelicDefinition(RelicId id, string displayName, string effectDescription)
    {
        Id = id;
        DisplayName = displayName;
        EffectDescription = effectDescription;
    }

    public RelicId Id { get; }
    public string DisplayName { get; }
    public string EffectDescription { get; }
}
