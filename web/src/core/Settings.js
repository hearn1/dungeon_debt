export const Settings = {
  animationSpeed: "normal", // "normal" | "fast"
  reducedMotion: false,
  combatLogVisible: false, // hidden by default per #168

  setAnimationSpeed(value) {
    this.animationSpeed = value;
    this._applyToDOM();
  },

  setReducedMotion(value) {
    this.reducedMotion = value;
    this._applyToDOM();
  },

  setCombatLogVisible(value) {
    this.combatLogVisible = value;
  },

  get stepMs() {
    return this.animationSpeed === "fast" ? 80 : 280;
  },

  _applyToDOM() {
    if (typeof document === "undefined" || !document.documentElement) return;
    const html = document.documentElement;
    html.dataset.animationSpeed = this.animationSpeed;
    html.dataset.reducedMotion = String(this.reducedMotion);
  },
};
