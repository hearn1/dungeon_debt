// Renderer entry. Construct the game state machine and the UI layer that
// listens to it. The Electron shell loads this via index.html.
import { GameManager } from "./core/GameManager.js";
import { UIManager } from "./ui/UIManager.js";

const root = document.getElementById("app");
const gm = new GameManager();
const ui = new UIManager(gm, root);
ui.start();

// Expose for ad-hoc debugging from DevTools.
globalThis.dd = { gm, ui };
