// Runtime mutable ability state per CombatUnitState.
// Never written back to HeroDefinition or HeroInstance.
export class AbilityState {
  constructor() {
    // Generic stack counter for passive abilities that accumulate stacks.
    this.stacks = 0;

    // Tick at which the active ability may fire next.
    // Starts at cooldownTicks so the first cast happens after one full cooldown.
    this.nextActiveAt = -1;

    // Cast count for abilities that scale with repeated casts (e.g. ArcanePower).
    this.castCount = 0;

    // Generic flag storage for abilities that need one-time or per-combat tracking.
    this.flags = {};
  }
}
