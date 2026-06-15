// UnitModelLoader — loads per-unit animated glTF models for the combat board.
//
// Each model lives at assets/models/<unitId>.gltf and ships four named animation
// clips: "idle", "attack", "hit", "death" (see gen_unit_models.cjs). The loader
// caches the parsed glTF per id and hands out a fresh clone for every combat
// instance (two slimes get independent meshes + mixers).
//
// Every call is safe: a missing file or parse error rejects, and the caller
// (ThreeCombatBoardScene) falls back to the DOM portrait token. No throw escapes.

import * as THREE from "../../../vendor/three.module.js";
import { GLTFLoader } from "../../../vendor/GLTFLoader.js";

const MODEL_BASE = "assets/models";

let _loader = null;
const _gltfCache = new Map(); // id -> Promise<GLTF>

function loader() {
  if (!_loader) _loader = new GLTFLoader();
  return _loader;
}

function loadGltf(id) {
  if (_gltfCache.has(id)) return _gltfCache.get(id);
  const url = `${MODEL_BASE}/${id}.gltf`;
  const promise = new Promise((resolve, reject) => {
    try {
      loader().load(url, resolve, undefined, reject);
    } catch (err) {
      reject(err);
    }
  });
  // Don't poison the cache permanently on failure — let a later retry try again.
  promise.catch(() => _gltfCache.delete(id));
  _gltfCache.set(id, promise);
  return promise;
}

// Resolves to { scene, clips } where scene is an independent clone ready to add
// to the board and clips is the shared (read-only) AnimationClip array. Rejects
// if the model can't be loaded so the caller can fall back.
export function instantiateUnitModel(id) {
  if (!id) return Promise.reject(new Error("no model id"));
  return loadGltf(id).then((gltf) => ({
    scene: gltf.scene.clone(true),
    clips: gltf.animations || [],
  }));
}

// Looks up an AnimationClip by name within a clip array (case-insensitive).
export function findClip(clips, name) {
  if (!clips) return null;
  const lower = name.toLowerCase();
  return clips.find((c) => (c.name || "").toLowerCase() === lower) || null;
}

export { THREE as ModelThree };
