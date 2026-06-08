import { GameRules } from "./GameRules.js";

const SAVE_KEY = "dungeonDebt.save.v1";
const SCHEMA_VERSION = 1;
const MIN_DIFFICULTY = -1;
const MAX_DIFFICULTY = 10;

function resolveDefaultStorage() {
  try {
    if (typeof globalThis !== "undefined" && globalThis.localStorage) {
      globalThis.localStorage.getItem(SAVE_KEY);
      return globalThis.localStorage;
    }
  } catch (_) {
    // fall through to memory
  }
  return new MemoryStorage();
}

function makeDefaultSave(now) {
  const ts = now().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: ts,
    updatedAt: ts,
    progression: { highestBeatenDifficulty: MIN_DIFFICULTY },
    settings: { lastSelectedDifficulty: GameRules.DefaultDifficultyLevel },
  };
}

function clampDifficulty(value) {
  const n = typeof value === "number" ? value : parseInt(value, 10);
  if (!Number.isFinite(n)) return MIN_DIFFICULTY;
  return Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, n));
}

function normalizeSave(raw, now) {
  const base = makeDefaultSave(now);
  const prog = (raw && typeof raw.progression === "object" && raw.progression) ? raw.progression : {};
  const sett = (raw && typeof raw.settings === "object" && raw.settings) ? raw.settings : {};

  const hbd = (typeof prog.highestBeatenDifficulty === "number")
    ? clampDifficulty(prog.highestBeatenDifficulty)
    : base.progression.highestBeatenDifficulty;

  const lsd = (typeof sett.lastSelectedDifficulty === "number")
    ? clampDifficulty(sett.lastSelectedDifficulty)
    : base.settings.lastSelectedDifficulty;

  const createdAt = (raw && typeof raw.createdAt === "string") ? raw.createdAt : base.createdAt;
  const updatedAt = now().toISOString();

  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt,
    updatedAt,
    progression: { highestBeatenDifficulty: hbd },
    settings: { lastSelectedDifficulty: lsd },
  };
}

export class MemoryStorage {
  constructor() {
    this._store = new Map();
  }
  getItem(key) { return this._store.has(key) ? this._store.get(key) : null; }
  setItem(key, value) { this._store.set(key, String(value)); }
  removeItem(key) { this._store.delete(key); }
}

export class SaveManager {
  constructor(storage = resolveDefaultStorage(), now = () => new Date()) {
    this._storage = storage;
    this._now = now;
    this._data = null;
  }

  load() {
    const raw = this._storage.getItem(SAVE_KEY);
    if (raw === null) {
      this._data = makeDefaultSave(this._now);
      this._write();
      return this._data;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
      this._data = makeDefaultSave(this._now);
      this._write();
      return this._data;
    }

    if (!parsed || typeof parsed !== "object" || parsed.schemaVersion !== SCHEMA_VERSION) {
      this._data = makeDefaultSave(this._now);
      this._write();
      return this._data;
    }

    this._data = normalizeSave(parsed, this._now);
    this._write();
    return this._data;
  }

  save(saveData) {
    this._data = normalizeSave(saveData, this._now);
    this._write();
  }

  reset() {
    this._data = makeDefaultSave(this._now);
    this._write();
    return this._data;
  }

  getHighestBeatenDifficulty() {
    this._ensureLoaded();
    return this._data.progression.highestBeatenDifficulty;
  }

  setHighestBeatenDifficulty(level) {
    this._ensureLoaded();
    const clamped = clampDifficulty(level);
    if (clamped > this._data.progression.highestBeatenDifficulty) {
      this._data.progression.highestBeatenDifficulty = clamped;
      this._data.updatedAt = this._now().toISOString();
      this._write();
    }
  }

  getLastSelectedDifficulty() {
    this._ensureLoaded();
    return this._data.settings.lastSelectedDifficulty;
  }

  setLastSelectedDifficulty(level) {
    this._ensureLoaded();
    this._data.settings.lastSelectedDifficulty = clampDifficulty(level);
    this._data.updatedAt = this._now().toISOString();
    this._write();
  }

  getSaveDataForDebug() {
    this._ensureLoaded();
    return JSON.parse(JSON.stringify(this._data));
  }

  _ensureLoaded() {
    if (!this._data) this.load();
  }

  _write() {
    try {
      this._storage.setItem(SAVE_KEY, JSON.stringify(this._data));
    } catch (_) {
      // storage write failure is non-fatal; data remains in memory
    }
  }
}
