import * as THREE from "../../../vendor/three.module.js";
import { GameRules } from "../../core/GameRules.js";
import { el, clear } from "../dom.js";
import { resolveUnitVisual, UnitVisualState } from "../UnitVisualCatalog.js";
import { BoardVisualSide, getBoardVisualSide } from "./BoardProjection.js";
import { unitHasModel } from "../CombatAssetManifest.js";
import { instantiateUnitModel, findClip } from "./UnitModelLoader.js";

const MODEL_SCALE = 0.84;
const MODEL_FADE = 0.12;

// Maps a UnitVisualState to the glTF animation clip name to play on a 3D model.
const STATE_TO_CLIP = Object.freeze({
  [UnitVisualState.Idle]: "idle",
  [UnitVisualState.Move]: "idle",
  [UnitVisualState.Attack]: "attack",
  [UnitVisualState.Cast]: "attack",
  [UnitVisualState.Hit]: "hit",
  [UnitVisualState.Death]: "death",
  [UnitVisualState.Passive]: "idle",
});

const SCENE_WIDTH = 760;
const SCENE_HEIGHT = 430;
const TILE_RADIUS = 0.54;
const TILE_X = 1.18;
const TILE_Z = 0.92;
const STAGGER_X = 0.58;

const COLORS = Object.freeze({
  playerTile: 0x3a3328,
  enemyTile: 0x38282a,
  neutralTile: 0x242a32,
});

export class ThreeCombatBoardScene {
  constructor({ run = null, encounter = null } = {}) {
    this.run = run;
    this.encounter = encounter;
    this.root = el("div", { class: "three-combat-scene" });
    this.canvasHost = el("div", { class: "three-combat-canvas-host" });
    this.overlay = el("div", { class: "three-combat-overlay" });
    this.effectLayer = el("div", { class: "three-effect-layer" });
    this.unitLayer = el("div", { class: "three-unit-layer" });
    this.root.appendChild(this.canvasHost);
    this.root.appendChild(this.overlay);
    this.overlay.appendChild(this.effectLayer);
    this.overlay.appendChild(this.unitLayer);

    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.units = new Map();
    this.isWebGlActive = false;
    this._raf = null;
    this._stateTimers = new Map();
    this._frameTimer = null;
    this._animLoopActive = false;
    // Actual pixel size of the viewport. Seeded with the design constants and
    // kept in sync with the (now flexible) container by a ResizeObserver.
    this.viewportWidth = SCENE_WIDTH;
    this.viewportHeight = SCENE_HEIGHT;
    this._resizeObserver = null;

    this._initThree();
    this._buildBoard();
    this._observeResize();
    this._render();
  }

  // The container is flexible (it fills the combat panel), so track its real
  // pixel size and keep the renderer + camera aspect in sync.
  getViewportSize() {
    return { width: this.viewportWidth, height: this.viewportHeight };
  }

  _observeResize() {
    if (!this.isWebGlActive || typeof ResizeObserver === "undefined") return;
    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(this.root);
  }

  _resize() {
    const w = Math.round(this.root.clientWidth) || SCENE_WIDTH;
    const h = Math.round(this.root.clientHeight) || SCENE_HEIGHT;
    if (w === this.viewportWidth && h === this.viewportHeight) return;
    this.viewportWidth = w;
    this.viewportHeight = h;
    if (this.renderer) this.renderer.setSize(w, h, false);
    if (this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    this._render();
  }

  addUnit(unitId, unit, coord, isPlayerSide) {
    if (!unitId || !coord) return null;
    const side = isPlayerSide ? BoardVisualSide.Player : BoardVisualSide.Opponent;
    const visual = resolveUnitVisual(unit);
    const entry = {
      unit,
      visual,
      coord: { q: coord.q, r: coord.r },
      // Units render as DOM portrait tokens (the overlay) on top of the WebGL
      // board. No 3D unit mesh — the old cone/cylinder placeholder was removed
      // in favor of the Kenney CC0 portrait art shown in the overlay.
      group: null,
      overlay: this._buildUnitOverlay(unit, isPlayerSide, visual),
      isPlayerSide,
      maxHp: unit?.maxHealth || 1,
      currentHp: unit?.currentHealth || unit?.maxHealth || 1,
      side,
      // 3D model state (populated async once the glTF loads; null = portrait token)
      hasModel: false,
      mixer: null,
      actions: null,
      currentAction: null,
      baseScale: 1,
      baseY: 0,
      lastState: UnitVisualState.Idle,
      isDead: false,
    };

    if (entry.group) this.scene.add(entry.group);
    this.unitLayer.appendChild(entry.overlay);
    this.units.set(unitId, entry);
    this.setUnitVisualState(unitId, UnitVisualState.Idle);
    this.moveUnit(unitId, coord, { instant: true });
    this._attachModel(unitId, entry, isPlayerSide, visual);
    return entry;
  }

  // Loads the unit's animated glTF model and swaps it in over the portrait token.
  // On any failure the portrait token (already rendered in the overlay) remains.
  _attachModel(unitId, entry, isPlayerSide, visual) {
    if (!this.isWebGlActive || !visual || !unitHasModel(visual.id)) return;
    instantiateUnitModel(visual.id)
      .then(({ scene, clips }) => {
        // Unit may have been torn down (panel re-render) while loading.
        if (!this.units.has(unitId) || this.units.get(unitId) !== entry) return;

        const group = new THREE.Group();
        group.add(scene);
        group.scale.setScalar(MODEL_SCALE);
        // Player figures face the opponent side (away from camera); enemies face in.
        group.rotation.y = isPlayerSide ? Math.PI : 0;
        const world = this.worldPositionFromCoord(entry.coord);
        group.position.set(world.x, entry.baseY, world.z);

        const mixer = new THREE.AnimationMixer(scene);
        const actions = {};
        for (const name of ["idle", "attack", "hit", "death"]) {
          const clip = findClip(clips, name);
          if (clip) actions[name] = mixer.clipAction(clip);
        }
        // Transient clips (attack/hit) auto-return to idle when they finish.
        mixer.addEventListener("finished", () => {
          if (!entry.isDead) this._playModelClip(entry, UnitVisualState.Idle);
        });

        entry.group = group;
        entry.mixer = mixer;
        entry.actions = actions;
        entry.baseScale = MODEL_SCALE;
        entry.hasModel = true;
        this.scene.add(group);

        // Hide the 2D portrait pin now that a real model is showing.
        const pin = entry.overlay.querySelector(".three-unit-pin");
        if (pin) pin.style.display = "none";
        entry.overlay.classList.add("has-model");

        this._playModelClip(entry, entry.lastState || UnitVisualState.Idle);
        this._startAnimationLoop();
      })
      .catch(() => {
        // Keep the portrait token fallback; nothing else to do.
      });
  }

  _playModelClip(entry, state) {
    if (!entry || !entry.actions) return;
    const clipName = STATE_TO_CLIP[state] || "idle";
    const action = entry.actions[clipName];
    if (!action) return;

    const looping = clipName === "idle";
    action.reset();
    action.setLoop(looping ? THREE.LoopRepeat : THREE.LoopOnce, looping ? Infinity : 1);
    action.clampWhenFinished = clipName === "death";

    if (entry.currentAction && entry.currentAction !== action) {
      entry.currentAction.fadeOut(MODEL_FADE);
      action.fadeIn(MODEL_FADE);
    }
    action.play();
    entry.currentAction = action;
  }

  _startAnimationLoop() {
    if (this._animLoopActive || !this.isWebGlActive) return;
    this._animLoopActive = true;
    this._frameTimer = this._frameTimer || new THREE.Timer();
    this._frameTimer.update(); // seed previous time so the first frame steps small
    const tick = () => {
      this._raf = requestAnimationFrame(tick);
      this._frameTimer.update();
      const dt = this._frameTimer.getDelta();
      for (const entry of this.units.values()) {
        if (entry.mixer) entry.mixer.update(dt);
      }
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    this._raf = requestAnimationFrame(tick);
  }

  _buildUnitOverlay(unit, isPlayerSide, visual) {
    const overlay = el("div", {
      class: `three-unit-anchor ${isPlayerSide ? "player" : "enemy"} ${visual.cssClass}`,
      title: unit?.displayName || "",
      dataset: {
        visualGroup: visual.group,
        visualKind: visual.kind,
        visualState: UnitVisualState.Idle,
      },
    });
    overlay.style.setProperty("--unit-visual-color", `#${visual.color.toString(16).padStart(6, "0")}`);

    overlay.appendChild(el("div", { class: "three-unit-ring" }));
    overlay.appendChild(el("div", { class: "three-unit-pin" }, [
      el("img", { class: "three-unit-portrait", src: visual.portraitUrl, alt: "" }),
    ]));
    overlay.appendChild(el("div", { class: "three-unit-name", text: unit?.displayName || "" }));
    overlay.appendChild(el("div", { class: "ct-hpbar three-hpbar" }, [
      el("div", { class: "ct-hpfill three-hpfill" }),
    ]));
    overlay.appendChild(el("div", { class: "three-action-bars" }, [
      el("div", { class: "three-action-bar basic", title: "Basic attack" }, [
        el("div", { class: "three-action-fill three-action-fill-basic basic" }),
      ]),
      el("div", { class: "three-action-bar three-action-bar-ability ability hidden", title: "Active ability" }, [
        el("div", { class: "three-action-fill three-action-fill-ability ability" }),
      ]),
    ]));
    return overlay;
  }

  moveUnit(unitId, coord, _options = {}) {
    const entry = this.units.get(unitId);
    if (!entry || !coord) return;
    entry.coord = { q: coord.q, r: coord.r };
    const world = this.worldPositionFromCoord(coord);
    if (entry.group) entry.group.position.set(world.x, entry.baseY, world.z);
    const screen = this.screenPositionFromCoord(coord);
    entry.overlay.style.left = `${screen.x}%`;
    entry.overlay.style.top = `${screen.y}%`;
    this._render();
  }

  setUnitVisualState(unitId, state, { durationMs = 0 } = {}) {
    const entry = this.units.get(unitId);
    if (!entry) return;
    this._clearStateTimer(unitId);

    const classes = Object.values(UnitVisualState).map((value) => `visual-state-${value}`);
    entry.overlay.classList.remove(...classes);
    entry.overlay.classList.add(`visual-state-${state}`);
    entry.overlay.dataset.visualState = state;
    entry.lastState = state;

    if (entry.hasModel) {
      this._playModelClip(entry, state);
    }

    if (durationMs > 0 && state !== UnitVisualState.Death) {
      const timer = setTimeout(() => this.setUnitVisualState(unitId, UnitVisualState.Idle), durationMs);
      this._stateTimers.set(unitId, timer);
    }
    this._render();
  }

  setActiveUnit(unitId) {
    this.clearActiveUnits();
    const entry = this.units.get(unitId);
    if (!entry) return;
    entry.overlay.classList.add("acting");
    if (entry.group) entry.group.scale.setScalar(entry.baseScale * 1.12);
    this._render();
  }

  clearActiveUnits() {
    for (const entry of this.units.values()) {
      entry.overlay.classList.remove("acting");
      if (entry.group) entry.group.scale.setScalar(entry.baseScale);
    }
    this._render();
  }

  pulseUnit(unitId, className) {
    const entry = this.units.get(unitId);
    if (!entry) return;
    entry.overlay.classList.remove(className);
    void entry.overlay.offsetWidth;
    entry.overlay.classList.add(className);
    this._render();
  }

  markUnitDefeated(unitId) {
    const entry = this.units.get(unitId);
    if (!entry) return;
    entry.isDead = true;
    this.setUnitVisualState(unitId, UnitVisualState.Death);
    entry.overlay.classList.add("dead");
    this._render();
  }

  updateUnitTimeline(unitId, timeline) {
    const entry = this.units.get(unitId);
    if (!entry || !timeline) return;

    const currentTick = Number.isFinite(timeline.currentTick) ? timeline.currentTick : 0;
    const actionProgress = cooldownProgress(currentTick, timeline.actionReadyTick, timeline.actionCooldownTicks);
    const actionFill = entry.overlay.querySelector(".three-action-fill-basic");
    if (actionFill) actionFill.style.width = `${Math.round(actionProgress * 100)}%`;
    entry.overlay.dataset.actionProgress = String(Math.round(actionProgress * 100));

    const abilityBar = entry.overlay.querySelector(".three-action-bar-ability");
    const abilityFill = entry.overlay.querySelector(".three-action-fill-ability");
    const abilityCooldown = timeline.abilityCooldownTicks || 0;
    if (abilityBar) abilityBar.classList.toggle("hidden", abilityCooldown <= 0);
    if (abilityFill) {
      const abilityProgress = cooldownProgress(currentTick, timeline.abilityReadyTick, abilityCooldown);
      abilityFill.style.width = `${Math.round(abilityProgress * 100)}%`;
      entry.overlay.dataset.abilityProgress = String(Math.round(abilityProgress * 100));
    }
  }

  destroy() {
    if (this._raf !== null && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(this._raf);
    }
    for (const timer of this._stateTimers.values()) clearTimeout(timer);
    this._stateTimers.clear();
    if (this._resizeObserver) { this._resizeObserver.disconnect(); this._resizeObserver = null; }
    this._raf = null;
    this._animLoopActive = false;
    for (const entry of this.units.values()) {
      if (entry.mixer) entry.mixer.stopAllAction();
    }
    this.units.clear();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement?.remove?.();
    }
    clear(this.root);
    if (this.root.parentNode) this.root.parentNode.removeChild(this.root);
  }

  worldPositionFromCoord(coord) {
    const visualRow = GameRules.HexBoardWidth - 1 - coord.q;
    const x = (coord.r - (GameRules.HexBoardHeight - 1) / 2) * TILE_X
      + (visualRow % 2 === 1 ? STAGGER_X : 0);
    const z = (visualRow - (GameRules.HexBoardWidth - 1) / 2) * TILE_Z;
    return { x, z };
  }

  screenPositionFromCoord(coord) {
    const visualRow = GameRules.HexBoardWidth - 1 - coord.q;
    const xSteps = GameRules.HexBoardHeight - 1;
    const ySteps = GameRules.HexBoardWidth - 1;
    return {
      x: 16 + ((coord.r + (visualRow % 2 === 1 ? 0.5 : 0)) / (xSteps + 0.5)) * 68,
      y: 12 + (visualRow / ySteps) * 76,
    };
  }

  _initThree() {
    if (typeof document === "undefined") return;

    try {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x11141a);

      this.camera = new THREE.PerspectiveCamera(38, SCENE_WIDTH / SCENE_HEIGHT, 0.1, 100);
      this.camera.position.set(0, 6.4, 7.9);
      this.camera.lookAt(0, 0, 0);

      const ambient = new THREE.HemisphereLight(0xd8cfb4, 0x141820, 1.8);
      const key = new THREE.DirectionalLight(0xffdf9a, 2.2);
      key.position.set(-4, 7, 5);
      this.scene.add(ambient, key);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2));
      this.renderer.setSize(SCENE_WIDTH, SCENE_HEIGHT, false);
      this.renderer.domElement.className = "three-combat-canvas";
      this.canvasHost.appendChild(this.renderer.domElement);
      this.isWebGlActive = true;
    } catch (_err) {
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.isWebGlActive = false;
      this.canvasHost.appendChild(el("div", { class: "three-combat-fallback" }));
    }
  }

  _buildBoard() {
    if (!this.isWebGlActive) {
      this._buildFallbackBoard();
      return;
    }

    const tileGeo = new THREE.CylinderGeometry(TILE_RADIUS, TILE_RADIUS, 0.08, 6);
    for (let q = 0; q < GameRules.HexBoardWidth; q++) {
      for (let r = 0; r < GameRules.HexBoardHeight; r++) {
        const side = getBoardVisualSide({ q, r });
        const color = side === BoardVisualSide.Player ? COLORS.playerTile
          : side === BoardVisualSide.Opponent ? COLORS.enemyTile
          : COLORS.neutralTile;
        const tile = new THREE.Mesh(tileGeo, new THREE.MeshStandardMaterial({
          color,
          roughness: 0.75,
          metalness: 0.05,
        }));
        const world = this.worldPositionFromCoord({ q, r });
        tile.position.set(world.x, 0, world.z);
        tile.rotation.y = Math.PI / 6;
        this.scene.add(tile);
      }
    }
  }

  _buildFallbackBoard() {
    const fallback = this.canvasHost.querySelector?.(".three-combat-fallback")
      || el("div", { class: "three-combat-fallback" });
    if (!fallback.parentNode) this.canvasHost.appendChild(fallback);

    for (let q = 0; q < GameRules.HexBoardWidth; q++) {
      for (let r = 0; r < GameRules.HexBoardHeight; r++) {
        const side = getBoardVisualSide({ q, r }).toLowerCase();
        const tile = el("div", { class: `three-fallback-tile ${side}` });
        const pos = this.screenPositionFromCoord({ q, r });
        tile.style.left = `${pos.x}%`;
        tile.style.top = `${pos.y}%`;
        fallback.appendChild(tile);
      }
    }
  }

  _clearStateTimer(unitId) {
    const timer = this._stateTimers.get(unitId);
    if (!timer) return;
    clearTimeout(timer);
    this._stateTimers.delete(unitId);
  }

  _render() {
    if (!this.isWebGlActive || !this.renderer || !this.scene || !this.camera) return;
    this.renderer.render(this.scene, this.camera);
  }
}

function cooldownProgress(currentTick, readyTick, cooldownTicks) {
  if (!cooldownTicks || cooldownTicks <= 0) return 1;
  if (!Number.isFinite(readyTick) || readyTick <= currentTick) return 1;
  const remaining = readyTick - currentTick;
  const progress = 1 - (remaining / cooldownTicks);
  return Math.max(0, Math.min(1, progress));
}
