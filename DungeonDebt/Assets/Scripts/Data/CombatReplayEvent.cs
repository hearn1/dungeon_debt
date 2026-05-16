using System.Collections.Generic;

public enum CombatReplayEventKind
{
    Message,
    Attack,
    Heal,
    Death,
    StatusChange,
    StatusDamage
}

// Plain C# data emitted by CombatLogger in lockstep with each LogLine, so the
// UI can replay attacks/heals/deaths step by step without re-running the
// resolver. Slot + IsPlayerSide identifies the card on the combat board; no
// reference to HeroInstance/CombatUnit is held so the snapshot stays immutable.
public class CombatReplayEvent
{
    public CombatReplayEvent(CombatReplayEventKind kind, string logText)
    {
        Kind = kind;
        LogText = logText;
        AttackerStatuses = new List<CombatStatusId>();
        TargetStatuses = new List<CombatStatusId>();
    }

    public CombatReplayEventKind Kind { get; private set; }
    public string LogText { get; private set; }

    public int AttackerSlot { get; set; }
    public bool AttackerIsPlayerSide { get; set; }
    public string AttackerHeroId { get; set; }
    public List<CombatStatusId> AttackerStatuses { get; }
    public int AttackerPoisonDamage { get; set; }

    public int TargetSlot { get; set; }
    public bool TargetIsPlayerSide { get; set; }
    public List<CombatStatusId> TargetStatuses { get; }
    public int TargetPoisonDamage { get; set; }

    public int Amount { get; set; }
    public int TargetHealthAfter { get; set; }
    public int TargetMaxHealth { get; set; }
}
