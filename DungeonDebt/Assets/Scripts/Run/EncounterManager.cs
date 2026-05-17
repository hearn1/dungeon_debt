using System.Collections.Generic;
using UnityEngine;

public class EncounterManager : MonoBehaviour
{
    [SerializeField] private RunManager _runManager;

    public void Initialize(RunManager runManager)
    {
        _runManager = runManager;
    }

    public EncounterDefinition LoadEncounter(int round)
    {
        RunState runState = _runManager != null ? _runManager.CurrentRunState : null;

        int act = runState != null && runState.Act > 0
            ? runState.Act
            : GameRules.GetActForRound(round);
        int slot = GameRules.GetRoundWithinAct(act, round);

        EncounterDefinition encounter = SelectFromPool(DataRepository.GetEncounterPool(act, slot));

        if (runState != null)
        {
            runState.CurrentEncounter = encounter;
        }

        return encounter;
    }

    // One slot can hold several candidate encounters. Combat stays
    // deterministic; only which encounter the slot serves is randomized,
    // and only through RunManager's single System.Random.
    private EncounterDefinition SelectFromPool(List<EncounterDefinition> pool)
    {
        if (pool == null || pool.Count == 0)
        {
            return null;
        }

        if (pool.Count == 1)
        {
            return pool[0];
        }

        if (_runManager != null && _runManager.Random != null)
        {
            return pool[_runManager.Random.Next(pool.Count)];
        }

        return pool[0];
    }
}
