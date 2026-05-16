using System.Collections.Generic;
using System.Collections.ObjectModel;

public class EnemyDefinition
{
    public EnemyDefinition(
        string id,
        string displayName,
        int attack,
        int health,
        EnemyEffectId effectId,
        string effectDescription,
        params CombatStatusId[] startingStatuses)
        : this(
            id,
            displayName,
            attack,
            health,
            effectId,
            effectDescription,
            startingStatuses,
            null)
    {
    }

    public EnemyDefinition(
        string id,
        string displayName,
        int attack,
        int health,
        EnemyEffectId effectId,
        string effectDescription,
        IReadOnlyList<CombatStatusId> startingStatuses,
        IReadOnlyList<CombatStatusId> attackStatuses)
    {
        Id = id;
        DisplayName = displayName;
        Attack = attack;
        Health = health;
        EffectId = effectId;
        EffectDescription = effectDescription;

        StartingStatuses = BuildStatusList(startingStatuses);
        AttackStatuses = BuildStatusList(attackStatuses);
    }

    public string Id { get; }
    public string DisplayName { get; }
    public int Attack { get; }
    public int Health { get; }
    public EnemyEffectId EffectId { get; }
    public string EffectDescription { get; }
    public IReadOnlyList<CombatStatusId> StartingStatuses { get; }
    public IReadOnlyList<CombatStatusId> AttackStatuses { get; }

    private static IReadOnlyList<CombatStatusId> BuildStatusList(IReadOnlyList<CombatStatusId> source)
    {
        List<CombatStatusId> statuses = new List<CombatStatusId>();
        if (source != null)
        {
            for (int i = 0; i < source.Count; i++)
            {
                if (source[i] != CombatStatusId.None)
                {
                    statuses.Add(source[i]);
                }
            }
        }

        return new ReadOnlyCollection<CombatStatusId>(statuses);
    }
}
