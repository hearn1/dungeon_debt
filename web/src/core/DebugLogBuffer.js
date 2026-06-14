const MAX_ENTRIES = 100;

export const DebugLogBuffer = {
  _entries: [],
  _installed: false,

  install() {
    if (this._installed || typeof globalThis.window === "undefined") return;
    this._installed = true;

    const origWarn = console.warn.bind(console);
    const origError = console.error.bind(console);

    console.warn = (...args) => {
      origWarn(...args);
      this._push("warn", args);
    };
    console.error = (...args) => {
      origError(...args);
      this._push("error", args);
    };

    window.onerror = (message, source, line, col, error) => {
      this._push("onerror", [`${message} (${source}:${line}:${col})`, error?.stack || ""]);
    };

    window.addEventListener("unhandledrejection", (e) => {
      const reason = e.reason instanceof Error ? e.reason.stack || e.reason.message : String(e.reason);
      this._push("unhandledrejection", [reason]);
    });
  },

  _push(level, args) {
    const text = args.map(a => {
      if (a === null || a === undefined) return String(a);
      if (typeof a === "object") { try { return JSON.stringify(a); } catch { return String(a); } }
      return String(a);
    }).join(" ");
    this._entries.push({ ts: new Date().toISOString(), level, text });
    if (this._entries.length > MAX_ENTRIES) this._entries.shift();
  },

  getEntries() {
    return this._entries.slice();
  },

  clear() {
    this._entries = [];
  },
};
