public class PayrollActionDefinition
{
    public PayrollActionDefinition(
        PayrollActionId id,
        string displayName,
        string description)
    {
        Id = id;
        DisplayName = displayName;
        Description = description;
    }

    public PayrollActionId Id { get; }
    public string DisplayName { get; }
    public string Description { get; }
}
