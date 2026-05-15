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
        EncounterDefinition encounter = FindEncounterForRound(round);

        if (_runManager != null)
        {
            RunState runState = _runManager.CurrentRunState;
            if (runState != null)
            {
                runState.CurrentEncounter = encounter;
            }
        }

        return encounter;
    }

    private static EncounterDefinition FindEncounterForRound(int round)
    {
        for (int i = 0; i < DataRepository.Encounters.Count; i++)
        {
            EncounterDefinition encounter = DataRepository.Encounters[i];
            if (encounter.Round == round)
            {
                return encounter;
            }
        }

        return null;
    }
}
