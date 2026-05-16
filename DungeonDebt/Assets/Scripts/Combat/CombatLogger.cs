using System.Collections.Generic;

public class CombatLogger
{
    private readonly List<string> _lines = new List<string>();
    private readonly List<CombatReplayEvent> _events = new List<CombatReplayEvent>();

    public IReadOnlyList<string> Lines
    {
        get { return _lines; }
    }

    public IReadOnlyList<CombatReplayEvent> ReplayEvents
    {
        get { return _events; }
    }

    public void LogAttack(CombatUnit attacker, CombatUnit defender, int damage)
    {
        string text = attacker.DisplayName + " attacks " + defender.DisplayName + " for " + damage + ".";
        _lines.Add(text);

        CombatReplayEvent evt = new CombatReplayEvent(CombatReplayEventKind.Attack, text);
        evt.AttackerSlot = attacker.Slot;
        evt.AttackerIsPlayerSide = attacker.IsPlayerSide;
        evt.AttackerHeroId = ResolveHeroId(attacker);
        CopyStatusSnapshot(attacker, evt.AttackerStatuses);
        evt.AttackerPoisonDamage = attacker.Statuses.PoisonDamage;
        evt.TargetSlot = defender.Slot;
        evt.TargetIsPlayerSide = defender.IsPlayerSide;
        evt.Amount = damage;
        evt.TargetHealthAfter = defender.CurrentHealth;
        evt.TargetMaxHealth = defender.MaxHealth;
        CopyStatusSnapshot(defender, evt.TargetStatuses);
        evt.TargetPoisonDamage = defender.Statuses.PoisonDamage;
        _events.Add(evt);
    }

    public void LogHeal(CombatUnit healer, CombatUnit target, int amount)
    {
        string text = healer.DisplayName + " heals " + target.DisplayName + " for " + amount + ".";
        _lines.Add(text);

        CombatReplayEvent evt = new CombatReplayEvent(CombatReplayEventKind.Heal, text);
        evt.AttackerSlot = healer.Slot;
        evt.AttackerIsPlayerSide = healer.IsPlayerSide;
        evt.AttackerHeroId = ResolveHeroId(healer);
        CopyStatusSnapshot(healer, evt.AttackerStatuses);
        evt.AttackerPoisonDamage = healer.Statuses.PoisonDamage;
        evt.TargetSlot = target.Slot;
        evt.TargetIsPlayerSide = target.IsPlayerSide;
        evt.Amount = amount;
        evt.TargetHealthAfter = target.CurrentHealth;
        evt.TargetMaxHealth = target.MaxHealth;
        CopyStatusSnapshot(target, evt.TargetStatuses);
        evt.TargetPoisonDamage = target.Statuses.PoisonDamage;
        _events.Add(evt);
    }

    public void LogDeath(CombatUnit unit)
    {
        string text = unit.DisplayName + " dies.";
        _lines.Add(text);

        CombatReplayEvent evt = new CombatReplayEvent(CombatReplayEventKind.Death, text);
        evt.TargetSlot = unit.Slot;
        evt.TargetIsPlayerSide = unit.IsPlayerSide;
        evt.TargetHealthAfter = 0;
        evt.TargetMaxHealth = unit.MaxHealth;
        CopyStatusSnapshot(unit, evt.TargetStatuses);
        evt.TargetPoisonDamage = unit.Statuses.PoisonDamage;
        _events.Add(evt);
    }

    public void LogStatusChange(CombatUnit unit, string message)
    {
        _lines.Add(message);

        CombatReplayEvent evt = new CombatReplayEvent(CombatReplayEventKind.StatusChange, message);
        evt.TargetSlot = unit.Slot;
        evt.TargetIsPlayerSide = unit.IsPlayerSide;
        evt.TargetHealthAfter = unit.CurrentHealth;
        evt.TargetMaxHealth = unit.MaxHealth;
        CopyStatusSnapshot(unit, evt.TargetStatuses);
        evt.TargetPoisonDamage = unit.Statuses.PoisonDamage;
        _events.Add(evt);
    }

    public void LogStatusDamage(CombatUnit unit, CombatStatusId statusId, int damage)
    {
        string text = unit.DisplayName + " takes " + damage + " " + GameRules.GetCombatStatusLabel(statusId) + " damage.";
        _lines.Add(text);

        CombatReplayEvent evt = new CombatReplayEvent(CombatReplayEventKind.StatusDamage, text);
        evt.TargetSlot = unit.Slot;
        evt.TargetIsPlayerSide = unit.IsPlayerSide;
        evt.Amount = damage;
        evt.TargetHealthAfter = unit.CurrentHealth;
        evt.TargetMaxHealth = unit.MaxHealth;
        CopyStatusSnapshot(unit, evt.TargetStatuses);
        evt.TargetPoisonDamage = unit.Statuses.PoisonDamage;
        _events.Add(evt);
    }

    public void LogTurnLimit()
    {
        AddMessage("Combat lost (turn limit).");
    }

    public void LogFinalResult(bool playerWon)
    {
        AddMessage(playerWon ? "Player wins!" : "Player loses.");
    }

    public void LogMessage(string message)
    {
        AddMessage(message);
    }

    public void CopyTo(List<string> destination)
    {
        for (int i = 0; i < _lines.Count; i++)
        {
            destination.Add(_lines[i]);
        }
    }

    public void CopyReplayTo(List<CombatReplayEvent> destination)
    {
        for (int i = 0; i < _events.Count; i++)
        {
            destination.Add(_events[i]);
        }
    }

    private void AddMessage(string text)
    {
        _lines.Add(text);
        _events.Add(new CombatReplayEvent(CombatReplayEventKind.Message, text));
    }

    private static string ResolveHeroId(CombatUnit unit)
    {
        if (unit == null || unit.SourceHero == null || unit.SourceHero.Definition == null)
        {
            return null;
        }
        return unit.SourceHero.Definition.Id;
    }

    private static void CopyStatusSnapshot(CombatUnit unit, List<CombatStatusId> destination)
    {
        if (unit == null || unit.Statuses == null || destination == null)
        {
            return;
        }

        IReadOnlyList<CombatStatusId> statuses = unit.Statuses.ActiveStatuses;
        for (int i = 0; i < statuses.Count; i++)
        {
            destination.Add(statuses[i]);
        }
    }
}
