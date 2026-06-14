// CombatAnimationBridge — maps CombatReplayEvent kinds to UnitVisualState values.
//
// This is a pure, data-driven bridge with no side effects. CombatPanel calls
// actorStateForEvent() and targetStateForEvent() to drive ThreeCombatBoardScene
// animation state rather than encoding the mapping inline per event handler.
//
// Rules:
//   - State is driven by replay data only — no combat re-simulation.
//   - Grouped same-tick events are each mapped independently; the last write wins.
//   - Missing or unknown event kinds return null (caller keeps current state).
//   - Reduced-motion callers may ignore non-null states; the bridge does not check.

import { CombatReplayEventKind } from "../../data/CombatReplayEvent.js";
import { UnitVisualState } from "../UnitVisualCatalog.js";

const K = CombatReplayEventKind;
const S = UnitVisualState;

// Maps each replay event kind to the visual state it triggers on the actor.
// null means "no state change for the actor".
const ACTOR_STATE_MAP = Object.freeze({
  [K.UnitSpawn]:      S.Idle,
  [K.Movement]:       S.Move,
  [K.AttackStart]:    S.Attack,
  [K.AbilityStart]:   S.Cast,
  [K.AbilityCast]:    S.Cast,
  [K.PassiveTrigger]: S.Passive,
  [K.Heal]:           S.Cast,
  [K.Attack]:         null,   // actor state already set by AttackStart
  [K.StatusDamage]:   null,
  [K.StatusChange]:   null,
  [K.Death]:          null,
  [K.RoundBoundary]:  null,
  [K.CombatStart]:    null,
  [K.CombatEnd]:      null,
  [K.Message]:        null,
});

// Maps each replay event kind to the visual state it triggers on the target.
// null means "no state change for the target".
const TARGET_STATE_MAP = Object.freeze({
  [K.Attack]:         S.Hit,
  [K.StatusDamage]:   S.Hit,
  [K.Heal]:           S.Hit,    // re-uses Hit slot; CSS class distinguishes heal vs damage
  [K.Death]:          S.Death,
  [K.StatusChange]:   S.Hit,
  [K.AttackStart]:    null,
  [K.AbilityStart]:   null,
  [K.AbilityCast]:    null,
  [K.PassiveTrigger]: null,
  [K.UnitSpawn]:      null,
  [K.Movement]:       null,
  [K.RoundBoundary]:  null,
  [K.CombatStart]:    null,
  [K.CombatEnd]:      null,
  [K.Message]:        null,
});

// Returns the UnitVisualState for the event's actor, or null if unchanged.
export function actorStateForEvent(eventKind) {
  if (eventKind === undefined || eventKind === null) return null;
  return ACTOR_STATE_MAP[eventKind] ?? null;
}

// Returns the UnitVisualState for the event's target, or null if unchanged.
export function targetStateForEvent(eventKind) {
  if (eventKind === undefined || eventKind === null) return null;
  return TARGET_STATE_MAP[eventKind] ?? null;
}

// Returns duration hint in ms for transient actor states (states that should
// auto-revert to Idle). Permanent states (Idle, Death) return 0.
export function actorStateDuration(eventKind, stepMs) {
  const state = ACTOR_STATE_MAP[eventKind];
  if (!state || state === S.Idle || state === S.Death) return 0;
  return stepMs;
}

// Returns duration hint in ms for transient target states.
export function targetStateDuration(eventKind, stepMs) {
  const state = TARGET_STATE_MAP[eventKind];
  if (!state || state === S.Idle || state === S.Death) return 0;
  return stepMs;
}
