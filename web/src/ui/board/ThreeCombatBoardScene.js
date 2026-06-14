import * as THREE from "../../../vendor/three.module.js";
import { GameRules } from "../../core/GameRules.js";
import { el, clear } from "../dom.js";
import { resolveUnitVisual, UnitVisualState } from "../UnitVisualCatalog.js";
import { BoardVisualSide, getBoardVisualSide } from "./BoardProjection.js";

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
  playerUnit: 0xc9a04a,
  enemyUnit: 0xa64a40,
  defeated: 0x56514a,
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

    this._initThree();
    this._buildBoard();
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
      group: this.isWebGlActive ? this._buildUnitMesh(isPlayerSide, visual) : null,
      overlay: this._buildUnitOverlay(unit, isPlayerSide, visual),
      isPlayerSide,
      maxHp: unit?.maxHealth || 1,
      currentHp: unit?.currentHealth || unit?.maxHealth || 1,
      side,
    };

    if (entry.group) this.scene.add(entry.group);
    this.unitLayer.appendChild(entry.overlay);
    this.units.set(unitId, entry);
    this.setUnitVisualState(unitId, UnitVisualState.Idle);
    this.moveUnit(unitId, coord, { instant: true });
    return entry;
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
    if (entry.group) entry.group.position.set(world.x, 0.22, world.z);
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

    if (entry.group) {
      const isDeath = state === UnitVisualState.Death;
      const isAttack = state === UnitVisualState.Attack || state === UnitVisualState.Cast;
      entry.group.position.y = isDeath ? 0.08 : isAttack ? 0.34 : 0.22;
      entry.group.scale.set(isAttack ? 1.16 : 1, isAttack ? 1.16 : 1, isAttack ? 1.16 : 1);
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
    if (entry.group) entry.group.scale.set(1.18, 1.18, 1.18);
    this._render();
  }

  clearActiveUnits() {
    for (const entry of this.units.values()) {
      entry.overlay.classList.remove("acting");
      if (entry.group) entry.group.scale.set(1, 1, 1);
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
    this.setUnitVisualState(unitId, UnitVisualState.Death);
    entry.overlay.classList.add("dead");
    if (entry.group) {
      entry.group.traverse((child) => {
        if (child.material) child.material.color.setHex(COLORS.defeated);
      });
      entry.group.position.y = 0.08;
      entry.group.scale.set(0.82, 0.82, 0.82);
    }
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
    this._raf = null;
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

  _buildUnitMesh(isPlayerSide, visual) {
    const color = visual?.color || (isPlayerSide ? COLORS.playerUnit : COLORS.enemyUnit);
    const group = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.33, 0.4, 0.22, 18),
      new THREE.MeshStandardMaterial({ color, roughness: 0.65 }),
    );
    const body = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 0.7, 18),
      new THREE.MeshStandardMaterial({ color, roughness: 0.55 }),
    );
    body.position.y = 0.46;
    group.add(base, body);
    return group;
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
