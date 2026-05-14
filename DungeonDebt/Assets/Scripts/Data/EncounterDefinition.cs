using System.Collections.Generic;
using System.Collections.ObjectModel;

public class EncounterDefinition
{
    public EncounterDefinition(
        int round,
        EncounterType type,
        string displayName,
        string scoutText,
        string dangerCategory,
        IList<EnemyDefinition> enemies,
        int baseGoldReward,
        EncounterEffectId encounterEffectId,
        string rivalGuildId)
    {
        Round = round;
        Type = type;
        DisplayName = displayName;
        ScoutText = scoutText;
        DangerCategory = dangerCategory;
        Enemies = new ReadOnlyCollection<EnemyDefinition>(new List<EnemyDefinition>(enemies));
        BaseGoldReward = baseGoldReward;
        EncounterEffectId = encounterEffectId;
        RivalGuildId = rivalGuildId;
    }

    public int Round { get; }
    public EncounterType Type { get; }
    public string DisplayName { get; }
    public string ScoutText { get; }
    public string DangerCategory { get; }
    public IReadOnlyList<EnemyDefinition> Enemies { get; }
    public int BaseGoldReward { get; }
    public EncounterEffectId EncounterEffectId { get; }
    public string RivalGuildId { get; }
}
