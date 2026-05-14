using System.Collections.Generic;

public class CombatLogger
{
    private readonly List<string> _lines = new List<string>();

    public IReadOnlyList<string> Lines
    {
        get { return _lines; }
    }

    public void LogAttack(CombatUnit attacker, CombatUnit defender, int damage)
    {
        _lines.Add(attacker.DisplayName + " attacks " + defender.DisplayName + " for " + damage + ".");
    }

    public void LogDeath(CombatUnit unit)
    {
        _lines.Add(unit.DisplayName + " dies.");
    }

    public void LogTurnLimit()
    {
        _lines.Add("Combat lost (turn limit).");
    }

    public void LogFinalResult(bool playerWon)
    {
        if (playerWon)
        {
            _lines.Add("Player wins!");
            return;
        }

        _lines.Add("Player loses.");
    }

    public void LogMessage(string message)
    {
        _lines.Add(message);
    }

    public void CopyTo(List<string> destination)
    {
        for (int i = 0; i < _lines.Count; i++)
        {
            destination.Add(_lines[i]);
        }
    }
}
