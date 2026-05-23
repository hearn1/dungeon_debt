// Seeded PRNG (mulberry32). Replaces the single System.Random instance that
// RunManager owned in the Unity build. Deterministic for a given seed so runs
// are replayable; the sequence does NOT match .NET's System.Random.
//
// API mirrors the System.Random surface the C# code actually used:
//   next(maxExclusive)        -> int in [0, maxExclusive)
//   nextRange(min, maxExcl)   -> int in [min, maxExcl)
//   nextDouble()              -> float in [0, 1)

export class Rng {
  constructor(seed) {
    if (seed === undefined || seed === null) {
      seed = (Date.now() ^ (Math.random() * 0x100000000)) >>> 0;
    }
    this._seed = seed >>> 0;
    this._state = this._seed;
  }

  get seed() {
    return this._seed;
  }

  nextDouble() {
    // mulberry32
    this._state = (this._state + 0x6d2b79f5) >>> 0;
    let t = this._state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // System.Random.Next(maxExclusive) / Next(min, maxExclusive)
  next(a, b) {
    if (b === undefined) {
      const maxExclusive = a;
      if (maxExclusive <= 0) {
        return 0;
      }
      return Math.floor(this.nextDouble() * maxExclusive);
    }
    const min = a;
    const maxExclusive = b;
    if (maxExclusive <= min) {
      return min;
    }
    return min + Math.floor(this.nextDouble() * (maxExclusive - min));
  }

  nextRange(min, maxExclusive) {
    return this.next(min, maxExclusive);
  }
}
