using System.Collections.Generic;
using System.Collections.ObjectModel;

public class EncounterDefinition
{
    public EncounterDefinition(
        int act,
        int slot,
        EncounterType type,
        string displayName,
        string scoutText,
        string dangerCategory,
        IList<EnemyDefinition> enemies,
        int baseGoldReward,
        EncounterEffectId encounterEffectId,
        RivalGuild rivalGuild)
    {
        Act = act;
        Slot = slot;
        Round = GameRules.GetAbsoluteRound(act, slot);
        Type = type;
        DisplayName = displayName;
        ScoutText = scoutText;
        DangerCategory = dangerCategory;
        Enemies = new ReadOnlyCollection<EnemyDefinition>(new List<EnemyDefinition>(enemies));
        BaseGoldReward = baseGoldReward;
        EncounterEffectId = encounterEffectId;
        RivalGuild = rivalGuild;
    }

    public int Act { get; }
    public int Slot { get; }
    public int Round { get; }
    public EncounterType Type { get; }
    public string DisplayName { get; }
    public string ScoutText { get; }
    public string DangerCategory { get; }
    public IReadOnlyList<EnemyDefinition> Enemies { get; }
    public int BaseGoldReward { get; }
    public EncounterEffectId EncounterEffectId { get; }
    public RivalGuild RivalGuild { get; }
}
