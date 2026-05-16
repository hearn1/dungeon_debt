using System.Collections.Generic;
using System.Collections.ObjectModel;

public class CombatStatusState
{
    private readonly List<CombatStatusId> _activeStatuses = new List<CombatStatusId>();
    private readonly ReadOnlyCollection<CombatStatusId> _readOnlyStatuses;

    public CombatStatusState()
    {
        _readOnlyStatuses = new ReadOnlyCollection<CombatStatusId>(_activeStatuses);
    }

    public IReadOnlyList<CombatStatusId> ActiveStatuses
    {
        get { return _readOnlyStatuses; }
    }

    public int PoisonDamage { get; private set; }

    public bool Has(CombatStatusId statusId)
    {
        for (int i = 0; i < _activeStatuses.Count; i++)
        {
            if (_activeStatuses[i] == statusId)
            {
                return true;
            }
        }

        return false;
    }

    public bool Add(CombatStatusId statusId)
    {
        if (statusId == CombatStatusId.None || Has(statusId))
        {
            return false;
        }

        _activeStatuses.Add(statusId);
        if (statusId == CombatStatusId.Poisoned)
        {
            PoisonDamage = GameRules.PoisonInitialDamage;
        }

        return true;
    }

    public void Remove(CombatStatusId statusId)
    {
        for (int i = 0; i < _activeStatuses.Count; i++)
        {
            if (_activeStatuses[i] == statusId)
            {
                _activeStatuses.RemoveAt(i);
                if (statusId == CombatStatusId.Poisoned)
                {
                    PoisonDamage = 0;
                }
                return;
            }
        }
    }

    public void IncreasePoisonDamage()
    {
        if (!Has(CombatStatusId.Poisoned))
        {
            return;
        }

        PoisonDamage += GameRules.PoisonDamageGrowth;
    }

    public void SetPoisonDamage(int poisonDamage)
    {
        if (!Has(CombatStatusId.Poisoned))
        {
            PoisonDamage = 0;
            return;
        }

        PoisonDamage = poisonDamage;
        if (PoisonDamage < GameRules.PoisonInitialDamage)
        {
            PoisonDamage = GameRules.PoisonInitialDamage;
        }
    }

    public void CopyFrom(CombatStatusState source)
    {
        _activeStatuses.Clear();
        PoisonDamage = 0;

        if (source == null)
        {
            return;
        }

        IReadOnlyList<CombatStatusId> sourceStatuses = source.ActiveStatuses;
        for (int i = 0; i < sourceStatuses.Count; i++)
        {
            _activeStatuses.Add(sourceStatuses[i]);
        }

        PoisonDamage = source.PoisonDamage;
    }
}
