// Ported from DungeonDebt/Assets/Scripts/Combat/CombatLogger.cs
import { CombatReplayEvent, CombatReplayEventKind } from "../data/CombatReplayEvent.js";
import { GameRulesFns } from "../core/GameRules.js";

export class CombatLogger {
  constructor() {
    this._lines = [];
    this._events = [];
  }

  get lines() { return this._lines; }
  get replayEvents() { return this._events; }

  logAttack(attacker, defender, damage) {
    const text = `${attacker.displayName} attacks ${defender.displayName} for ${damage}.`;
    this._lines.push(text);

    const evt = new CombatReplayEvent(CombatReplayEventKind.Attack, text);
    evt.attackerSlot = attacker.slot;
    evt.attackerIsPlayerSide = attacker.isPlayerSide;
    evt.attackerHeroId = resolveHeroId(attacker);
    copyStatusSnapshot(attacker, evt.attackerStatuses);
    evt.attackerPoisonDamage = attacker.statuses.poisonDamage;
    evt.targetSlot = defender.slot;
    evt.targetIsPlayerSide = defender.isPlayerSide;
    evt.amount = damage;
    evt.targetHealthAfter = defender.currentHealth;
    evt.targetMaxHealth = defender.maxHealth;
    copyStatusSnapshot(defender, evt.targetStatuses);
    evt.targetPoisonDamage = defender.statuses.poisonDamage;
    this._events.push(evt);
  }

  logHeal(healer, target, amount) {
    const text = `${healer.displayName} heals ${target.displayName} for ${amount}.`;
    this._lines.push(text);

    const evt = new CombatReplayEvent(CombatReplayEventKind.Heal, text);
    evt.attackerSlot = healer.slot;
    evt.attackerIsPlayerSide = healer.isPlayerSide;
    evt.attackerHeroId = resolveHeroId(healer);
    copyStatusSnapshot(healer, evt.attackerStatuses);
    evt.attackerPoisonDamage = healer.statuses.poisonDamage;
    evt.targetSlot = target.slot;
    evt.targetIsPlayerSide = target.isPlayerSide;
    evt.amount = amount;
    evt.targetHealthAfter = target.currentHealth;
    evt.targetMaxHealth = target.maxHealth;
    copyStatusSnapshot(target, evt.targetStatuses);
    evt.targetPoisonDamage = target.statuses.poisonDamage;
    this._events.push(evt);
  }

  logDeath(unit) {
    const text = `${unit.displayName} dies.`;
    this._lines.push(text);

    const evt = new CombatReplayEvent(CombatReplayEventKind.Death, text);
    evt.targetSlot = unit.slot;
    evt.targetIsPlayerSide = unit.isPlayerSide;
    evt.targetHealthAfter = 0;
    evt.targetMaxHealth = unit.maxHealth;
    copyStatusSnapshot(unit, evt.targetStatuses);
    evt.targetPoisonDamage = unit.statuses.poisonDamage;
    this._events.push(evt);
  }

  logStatusChange(unit, message) {
    this._lines.push(message);

    const evt = new CombatReplayEvent(CombatReplayEventKind.StatusChange, message);
    evt.targetSlot = unit.slot;
    evt.targetIsPlayerSide = unit.isPlayerSide;
    evt.targetHealthAfter = unit.currentHealth;
    evt.targetMaxHealth = unit.maxHealth;
    copyStatusSnapshot(unit, evt.targetStatuses);
    evt.targetPoisonDamage = unit.statuses.poisonDamage;
    this._events.push(evt);
  }

  logStatusDamage(unit, statusId, damage) {
    const text = `${unit.displayName} takes ${damage} ${GameRulesFns.getCombatStatusLabel(statusId)} damage.`;
    this._lines.push(text);

    const evt = new CombatReplayEvent(CombatReplayEventKind.StatusDamage, text);
    evt.targetSlot = unit.slot;
    evt.targetIsPlayerSide = unit.isPlayerSide;
    evt.amount = damage;
    evt.targetHealthAfter = unit.currentHealth;
    evt.targetMaxHealth = unit.maxHealth;
    copyStatusSnapshot(unit, evt.targetStatuses);
    evt.targetPoisonDamage = unit.statuses.poisonDamage;
    this._events.push(evt);
  }

  logTurnLimit() {
    this._addMessage("Combat lost (turn limit).");
  }

  logFinalResult(playerWon) {
    this._addMessage(playerWon ? "Player wins!" : "Player loses.");
  }

  logMessage(message) {
    this._addMessage(message);
  }

  copyTo(destination) {
    for (const line of this._lines) destination.push(line);
  }

  copyReplayTo(destination) {
    for (const evt of this._events) destination.push(evt);
  }

  _addMessage(text) {
    this._lines.push(text);
    this._events.push(new CombatReplayEvent(CombatReplayEventKind.Message, text));
  }
}

function resolveHeroId(unit) {
  if (!unit || !unit.sourceHero || !unit.sourceHero.definition) return null;
  return unit.sourceHero.definition.id;
}

function copyStatusSnapshot(unit, destination) {
  if (!unit || !unit.statuses || !destination) return;
  for (const s of unit.statuses.activeStatuses) destination.push(s);
}
