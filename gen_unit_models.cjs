/*
 * gen_unit_models.cjs — generates one distinct animated glTF model per combat unit.
 *
 * Output: web/assets/models/<unitId>.gltf  (+ hero-fallback.gltf, enemy-fallback.gltf)
 *
 * Each model is a small low-poly figure built from a single shared unit-cube mesh,
 * instanced by several nodes (body / head / arms / weapon / wings) with per-node
 * transforms and per-color materials. Every model embeds four named animation
 * clips — "idle", "attack", "hit", "death" — driven by node TRS channels, which
 * three.js' AnimationMixer plays directly. No skinning, no external binaries.
 *
 * These models are authored here (procedurally), so they are released CC0 1.0 with
 * the rest of Dungeon Debt's first-party art. See web/ATTRIBUTION.md / Design/ART_LICENSING.md.
 *
 * Run: node gen_unit_models.cjs
 */
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "web", "assets", "models");

// ---- glTF constants ----
const FLOAT = 5126;
const USHORT = 5123;
const ARRAY_BUFFER = 34962;
const ELEMENT_ARRAY_BUFFER = 34963;

// ---- math helpers ----
function quatAxisAngle(ax, ay, az, angle) {
  const h = angle / 2;
  const s = Math.sin(h);
  return [ax * s, ay * s, az * s, Math.cos(h)];
}
const QID = [0, 0, 0, 1];

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function hslToRgb(h, s, l) {
  // h in [0,1]
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

// ---- glTF document builder ----
class Gltf {
  constructor() {
    this.chunks = [];
    this.byteLength = 0;
    this.bufferViews = [];
    this.accessors = [];
    this.materials = [];
    this.meshes = [];
    this.nodes = [];
    this.animations = [];
    this._materialCache = new Map();
  }

  _align() {
    while (this.byteLength % 4 !== 0) {
      this.chunks.push(Buffer.from([0]));
      this.byteLength += 1;
    }
  }
  _appendBufferView(buf, target) {
    this._align();
    const byteOffset = this.byteLength;
    this.chunks.push(buf);
    this.byteLength += buf.length;
    const bv = { buffer: 0, byteOffset, byteLength: buf.length };
    if (target) bv.target = target;
    this.bufferViews.push(bv);
    return this.bufferViews.length - 1;
  }
  _compCount(type) {
    return { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[type];
  }
  addFloatAccessor(arr, type, { target, min, max } = {}) {
    const buf = Buffer.alloc(arr.length * 4);
    for (let i = 0; i < arr.length; i++) buf.writeFloatLE(arr[i], i * 4);
    const bv = this._appendBufferView(buf, target);
    const acc = {
      bufferView: bv,
      byteOffset: 0,
      componentType: FLOAT,
      count: arr.length / this._compCount(type),
      type,
    };
    if (min) acc.min = min;
    if (max) acc.max = max;
    this.accessors.push(acc);
    return this.accessors.length - 1;
  }
  addIndexAccessor(arr) {
    const buf = Buffer.alloc(arr.length * 2);
    for (let i = 0; i < arr.length; i++) buf.writeUInt16LE(arr[i], i * 2);
    const bv = this._appendBufferView(buf, ELEMENT_ARRAY_BUFFER);
    this.accessors.push({
      bufferView: bv,
      byteOffset: 0,
      componentType: USHORT,
      count: arr.length,
      type: "SCALAR",
    });
    return this.accessors.length - 1;
  }
  addMaterial(rgb, { metallic = 0.0, rough = 0.85 } = {}) {
    const key = `${rgb.map((v) => v.toFixed(3)).join(",")}|${metallic}|${rough}`;
    if (this._materialCache.has(key)) return this._materialCache.get(key);
    const idx = this.materials.length;
    this.materials.push({
      pbrMetallicRoughness: {
        baseColorFactor: [rgb[0], rgb[1], rgb[2], 1],
        metallicFactor: metallic,
        roughnessFactor: rough,
      },
    });
    this._materialCache.set(key, idx);
    return idx;
  }
  addNode(node) {
    this.nodes.push(node);
    return this.nodes.length - 1;
  }

  // animation builder: tracks = [{node, path, times:[...], values:[...]}]
  addAnimation(name, tracks) {
    const samplers = [];
    const channels = [];
    for (const t of tracks) {
      const tMin = [t.times[0]];
      const tMax = [t.times[t.times.length - 1]];
      const input = this.addFloatAccessor(t.times, "SCALAR", { min: tMin, max: tMax });
      const valType = t.path === "rotation" ? "VEC4" : "VEC3";
      const output = this.addFloatAccessor(t.values, valType);
      const samplerIndex = samplers.length;
      samplers.push({ input, output, interpolation: "LINEAR" });
      channels.push({ sampler: samplerIndex, target: { node: t.node, path: t.path } });
    }
    this.animations.push({ name, samplers, channels });
  }

  toJSON(rootNode) {
    const base64 = Buffer.concat(this.chunks).toString("base64");
    return {
      asset: { version: "2.0", generator: "dungeon_debt gen_unit_models.cjs" },
      scene: 0,
      scenes: [{ nodes: [rootNode] }],
      nodes: this.nodes,
      meshes: this.meshes,
      materials: this.materials,
      accessors: this.accessors,
      bufferViews: this.bufferViews,
      buffers: [
        {
          byteLength: this.byteLength,
          uri: "data:application/octet-stream;base64," + base64,
        },
      ],
      animations: this.animations,
    };
  }
}

// Shared unit cube [-0.5,0.5]^3 with per-face normals (24 verts, 36 indices).
function unitCube() {
  const p = [];
  const n = [];
  const idx = [];
  const faces = [
    { nor: [0, 0, 1], v: [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]] },
    { nor: [0, 0, -1], v: [[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]] },
    { nor: [0, 1, 0], v: [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]] },
    { nor: [0, -1, 0], v: [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5]] },
    { nor: [1, 0, 0], v: [[0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5]] },
    { nor: [-1, 0, 0], v: [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]] },
  ];
  for (const f of faces) {
    const base = p.length / 3;
    for (const vert of f.v) {
      p.push(vert[0], vert[1], vert[2]);
      n.push(f.nor[0], f.nor[1], f.nor[2]);
    }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return { positions: p, normals: n, indices: idx };
}

// Build the shared cube accessors once per document and return a factory that
// makes a single-primitive mesh for a given material color.
function makeCubeMeshFactory(g) {
  const cube = unitCube();
  const posAcc = g.addFloatAccessor(cube.positions, "VEC3", {
    target: ARRAY_BUFFER,
    min: [-0.5, -0.5, -0.5],
    max: [0.5, 0.5, 0.5],
  });
  const normAcc = g.addFloatAccessor(cube.normals, "VEC3", { target: ARRAY_BUFFER });
  const idxAcc = g.addIndexAccessor(cube.indices);
  const meshCache = new Map();
  return function cubeMesh(rgb, matOpts) {
    const mat = g.addMaterial(rgb, matOpts);
    if (meshCache.has(mat)) return meshCache.get(mat);
    const meshIndex = g.meshes.length;
    g.meshes.push({
      primitives: [{ attributes: { POSITION: posAcc, NORMAL: normAcc }, indices: idxAcc, material: mat }],
    });
    meshCache.set(mat, meshIndex);
    return meshIndex;
  };
}

// A simple cube-part node: position p=[x,y,z], size s=[sx,sy,sz].
// Optional rot is a quaternion [x,y,z,w] for angled props (hat brims, bow limbs).
function partNode(meshIndex, p, s, name, rot) {
  const node = { name, mesh: meshIndex, translation: p, scale: s };
  if (rot) node.rotation = rot;
  return node;
}

// ---- animation clip generators (shared across rigs) ----
// All clips animate the root node (idle bob, hit recoil, death topple, attack lunge)
// plus an optional limb pivot node for attack swing / idle flap.
function idleTrack(rootNode) {
  return [
    {
      node: rootNode,
      path: "translation",
      times: [0, 0.7, 1.4],
      values: [0, 0, 0, 0, 0.06, 0, 0, 0, 0],
    },
  ];
}
function attackTracks(rootNode, pivotNode) {
  const tracks = [
    {
      node: rootNode,
      path: "translation",
      times: [0, 0.12, 0.28, 0.45],
      values: [0, 0, 0, 0, 0, 0.28, 0, 0, 0.1, 0, 0, 0],
    },
  ];
  if (pivotNode != null) {
    tracks.push({
      node: pivotNode,
      path: "rotation",
      times: [0, 0.12, 0.28, 0.45],
      values: [
        ...QID,
        ...quatAxisAngle(1, 0, 0, -1.3),
        ...quatAxisAngle(1, 0, 0, 0.5),
        ...QID,
      ],
    });
  }
  return tracks;
}
function hitTracks(rootNode) {
  return [
    {
      node: rootNode,
      path: "translation",
      times: [0, 0.08, 0.3],
      values: [0, 0, 0, 0, 0.04, -0.16, 0, 0, 0],
    },
    {
      node: rootNode,
      path: "rotation",
      times: [0, 0.08, 0.3],
      values: [...QID, ...quatAxisAngle(1, 0, 0, 0.22), ...QID],
    },
  ];
}
function deathTracks(rootNode) {
  return [
    {
      node: rootNode,
      path: "rotation",
      times: [0, 0.5, 0.6],
      values: [...QID, ...quatAxisAngle(1, 0, 0, 1.45), ...quatAxisAngle(1, 0, 0, 1.55)],
    },
    {
      node: rootNode,
      path: "translation",
      times: [0, 0.5, 0.6],
      values: [0, 0, 0, 0, -0.18, 0.1, 0, -0.22, 0.12],
    },
  ];
}

function addStandardClips(g, rootNode, pivotNode) {
  g.addAnimation("idle", idleTrack(rootNode));
  g.addAnimation("attack", attackTracks(rootNode, pivotNode));
  g.addAnimation("hit", hitTracks(rootNode));
  g.addAnimation("death", deathTracks(rootNode));
}

// ---- rigs ----
// Each rig returns the root node index after populating g.nodes; children are
// authored first, then the root references them. The root's TRS is what the
// standard clips animate, so per-rig idle/attack also work uniformly.

const SKIN = [0.85, 0.7, 0.58];
const SKIN_RUDDY = [0.8, 0.62, 0.5];

// Per-id hue jitter so units sharing an archetype still read as distinct.
function jitterHue(base, id, range) {
  const j = ((hashStr(id) % 1000) / 1000 - 0.5) * 2 * range;
  return (base + j + 1) % 1;
}

// Returns { body, accent, skin } for a named palette family, jittered by id.
function paletteFor(key, id) {
  switch (key) {
    case "arcane": { const h = jitterHue(0.7, id, 0.07); return { body: hslToRgb(h, 0.5, 0.4), accent: hslToRgb((h + 0.06) % 1, 0.62, 0.62), skin: SKIN }; }
    case "forest": { const h = jitterHue(0.33, id, 0.05); return { body: hslToRgb(h, 0.45, 0.34), accent: [0.5, 0.34, 0.18], skin: SKIN }; }
    case "brute":  { const h = jitterHue(0.03, id, 0.04); return { body: hslToRgb(h, 0.5, 0.4), accent: hslToRgb(h, 0.4, 0.25), skin: SKIN_RUDDY }; }
    case "holy":   { const l = 0.86 + (hashStr(id) % 40) / 1000; return { body: [l, l - 0.02, l - 0.08], accent: [0.85, 0.72, 0.3], skin: SKIN }; }
    case "steel":  { const h = jitterHue(0.6, id, 0.05); return { body: hslToRgb(h, 0.22, 0.5), accent: [0.75, 0.77, 0.82], skin: SKIN }; }
    case "shadow": { const v = 0.2 + (hashStr(id) % 30) / 1000; return { body: [v, v + 0.02, v + 0.07], accent: [0.42, 0.44, 0.55], skin: SKIN_RUDDY }; }
    case "stone":  return { body: [0.5, 0.5, 0.53], accent: [0.4, 0.4, 0.43], skin: [0.55, 0.55, 0.58] };
    case "gold":   return { body: [0.55, 0.42, 0.14], accent: [0.95, 0.82, 0.3], skin: SKIN };
    case "slime":  { const h = jitterHue(0.3, id, 0.08); return { body: hslToRgb(h, 0.55, 0.5), accent: hslToRgb(h, 0.6, 0.7), skin: SKIN }; }
    case "shade":  { const h = jitterHue(0.74, id, 0.1); return { body: hslToRgb(h, 0.4, 0.35), accent: hslToRgb(h, 0.5, 0.55), skin: SKIN }; }
    default:       { const h = jitterHue(0.55, id, 0.1); return { body: hslToRgb(h, 0.45, 0.45), accent: hslToRgb((h + 0.08) % 1, 0.55, 0.6), skin: SKIN }; }
  }
}

// Adds the main-hand weapon prop to the animated right-arm pivot's child list.
function buildWeapon(g, cube, out, weapon, accent) {
  const steel = cube([0.7, 0.72, 0.78], { metallic: 0.6, rough: 0.35 });
  const wood = cube([0.45, 0.3, 0.16], { rough: 0.7 });
  if (weapon === "staff" || weapon === "staff-holy") {
    out.push(g.addNode(partNode(wood, [0, -0.32, 0.12], [0.06, 0.8, 0.06], "staff")));
    const orbColor = weapon === "staff-holy" ? [0.95, 0.85, 0.4] : accent.map((v) => Math.min(1, v * 1.4));
    out.push(g.addNode(partNode(cube(orbColor, { metallic: 0.3, rough: 0.25 }), [0, -0.74, 0.12], [0.2, 0.2, 0.2], "orb")));
  } else if (weapon === "axe") {
    out.push(g.addNode(partNode(wood, [0, -0.34, 0.12], [0.06, 0.66, 0.06], "haft")));
    out.push(g.addNode(partNode(steel, [0.06, -0.62, 0.12], [0.28, 0.24, 0.06], "axehead")));
  } else if (weapon === "daggers") {
    out.push(g.addNode(partNode(steel, [0, -0.42, 0.12], [0.06, 0.4, 0.04], "dagger")));
  } else if (weapon === "fists") {
    out.push(g.addNode(partNode(cube([0.5, 0.5, 0.53]), [0, -0.34, 0.06], [0.3, 0.3, 0.3], "fist")));
  } else if (weapon === "bow") {
    // The bow itself sits in the off-hand; the draw hand just nocks a short arrow.
    out.push(g.addNode(partNode(wood, [0, -0.1, 0.1], [0.03, 0.03, 0.5], "arrow")));
  } else {
    out.push(g.addNode(partNode(steel, [0, -0.5, 0.12], [0.08, 0.66, 0.05], "blade")));
    out.push(g.addNode(partNode(cube([0.3, 0.22, 0.1]), [0, -0.16, 0.12], [0.26, 0.06, 0.08], "guard")));
  }
}

// Feature-driven humanoid: robe/hat/hood/helmet/shield/crown/cape flags plus a
// weapon give each archetype a recognizable silhouette. All parts are authored
// grounded near y=0, centered on X/Z, and facing +Z (the board flips per side).
function buildHumanoid(g, cube, pal, feat) {
  const body = pal.body;
  const accent = pal.accent;
  const skin = pal.skin;
  const steel = [0.66, 0.68, 0.74];
  const dark = body.map((v) => v * 0.6);
  const girth = feat.girth || 1;
  const H = feat.height || 1;

  const bodyMesh = cube(body);
  const headMesh = cube(skin);
  const limbMesh = cube(dark);
  const accentMesh = cube(accent);
  const steelMesh = cube(steel, { metallic: 0.6, rough: 0.35 });
  const woodMesh = cube([0.45, 0.3, 0.16], { rough: 0.7 });
  const stringMesh = cube([0.85, 0.82, 0.7], { rough: 0.5 });

  const children = [];

  // ---- lower body: robe skirt or legs+boots ----
  if (feat.robe) {
    children.push(g.addNode(partNode(bodyMesh, [0, 0.34 * H, 0], [0.46 * girth, 0.5 * H, 0.32 * girth], "robeHips")));
    children.push(g.addNode(partNode(cube(body.map((v) => v * 0.85)), [0, 0.1 * H, 0], [0.64 * girth, 0.26 * H, 0.46 * girth], "robeHem")));
  } else {
    const bootMesh = cube(body.map((v) => v * 0.45));
    children.push(g.addNode(partNode(limbMesh, [-0.15 * girth, 0.18 * H, 0], [0.18, 0.4 * H, 0.22], "legL")));
    children.push(g.addNode(partNode(limbMesh, [0.15 * girth, 0.18 * H, 0], [0.18, 0.4 * H, 0.22], "legR")));
    children.push(g.addNode(partNode(bootMesh, [-0.15 * girth, 0.03, 0.03], [0.2, 0.1, 0.28], "bootL")));
    children.push(g.addNode(partNode(bootMesh, [0.15 * girth, 0.03, 0.03], [0.2, 0.1, 0.28], "bootR")));
  }

  // ---- torso + chest layer ----
  const torsoY = feat.robe ? 0.62 * H : 0.56 * H;
  children.push(g.addNode(partNode(bodyMesh, [0, torsoY, 0], [0.5 * girth, 0.5 * H, 0.32 * girth], "torso")));
  if (feat.helmet || feat.shield) {
    children.push(g.addNode(partNode(steelMesh, [0, torsoY + 0.02, 0.02], [0.46 * girth, 0.4 * H, 0.3 * girth], "breastplate")));
  } else {
    children.push(g.addNode(partNode(accentMesh, [0, torsoY - 0.04, 0.16 * girth], [0.12, 0.34 * H, 0.04], "sash")));
  }

  // ---- head + eyes ----
  const headY = torsoY + 0.42 * H;
  children.push(g.addNode(partNode(headMesh, [0, headY, 0], [0.32, 0.32, 0.32], "head")));
  const eyeMesh = cube([0.08, 0.08, 0.1], { rough: 0.3 });
  children.push(g.addNode(partNode(eyeMesh, [-0.08, headY + 0.02, 0.16], [0.06, 0.08, 0.05], "eyeL")));
  children.push(g.addNode(partNode(eyeMesh, [0.08, headY + 0.02, 0.16], [0.06, 0.08, 0.05], "eyeR")));

  // ---- headgear ----
  if (feat.hat === "wizard") {
    children.push(g.addNode(partNode(accentMesh, [0, headY + 0.18, 0], [0.48, 0.06, 0.48], "hatBrim")));
    children.push(g.addNode(partNode(accentMesh, [0, headY + 0.3, 0], [0.3, 0.18, 0.3], "hat1")));
    children.push(g.addNode(partNode(accentMesh, [0, headY + 0.46, 0], [0.18, 0.18, 0.18], "hat2")));
    children.push(g.addNode(partNode(accentMesh, [0, headY + 0.6, 0], [0.08, 0.16, 0.08], "hat3")));
  } else if (feat.hood) {
    children.push(g.addNode(partNode(cube(body.map((v) => v * 0.7)), [0, headY + 0.04, -0.04], [0.42, 0.42, 0.44], "hood")));
    children.push(g.addNode(partNode(cube([0.04, 0.04, 0.05]), [0, headY, 0.17], [0.34, 0.12, 0.04], "visor")));
  } else if (feat.helmet) {
    children.push(g.addNode(partNode(steelMesh, [0, headY + 0.04, 0], [0.36, 0.34, 0.36], "helm")));
    children.push(g.addNode(partNode(cube([0.04, 0.04, 0.05]), [0, headY - 0.02, 0.17], [0.3, 0.08, 0.04], "visorSlit")));
    children.push(g.addNode(partNode(accentMesh, [0, headY + 0.28, -0.02], [0.06, 0.16, 0.3], "crest")));
  }
  if (feat.crown) {
    const goldMesh = cube([0.95, 0.82, 0.28], { metallic: 0.7, rough: 0.25 });
    children.push(g.addNode(partNode(goldMesh, [0, headY + 0.2, 0], [0.42, 0.1, 0.42], "crownBand")));
    children.push(g.addNode(partNode(goldMesh, [0, headY + 0.3, 0], [0.06, 0.12, 0.06], "crownSpikeC")));
    children.push(g.addNode(partNode(goldMesh, [-0.15, headY + 0.28, 0], [0.06, 0.1, 0.06], "crownSpikeL")));
    children.push(g.addNode(partNode(goldMesh, [0.15, headY + 0.28, 0], [0.06, 0.1, 0.06], "crownSpikeR")));
  }

  // ---- cape (bosses) ----
  if (feat.cape) {
    children.push(g.addNode(partNode(cube(accent.map((v) => Math.min(1, v * 0.9)), { rough: 0.6 }), [0, torsoY - 0.02, -0.2 * girth], [0.6 * girth, 0.84 * H, 0.05], "cape")));
  }

  // ---- off-hand: shield, bow, or plain arm ----
  const shoulderY = torsoY + 0.18 * H;
  if (feat.shield) {
    children.push(g.addNode(partNode(limbMesh, [-0.34 * girth, shoulderY - 0.16, 0], [0.16, 0.4 * H, 0.18], "armL")));
    children.push(g.addNode(partNode(cube(accent, { metallic: 0.4, rough: 0.45 }), [-0.48 * girth, torsoY, 0.14], [0.1, 0.52 * H, 0.42], "shield")));
    children.push(g.addNode(partNode(steelMesh, [-0.52 * girth, torsoY, 0.14], [0.06, 0.16, 0.16], "shieldBoss")));
  } else if (feat.weapon === "bow") {
    children.push(g.addNode(partNode(limbMesh, [-0.3 * girth, shoulderY - 0.1, 0.18], [0.16, 0.16, 0.4], "armL")));
    const bx = -0.34 * girth;
    children.push(g.addNode(partNode(woodMesh, [bx, shoulderY, 0.4], [0.06, 0.36, 0.06], "bowGrip")));
    children.push(g.addNode(partNode(woodMesh, [bx, shoulderY + 0.28, 0.36], [0.05, 0.28, 0.05], "bowTop", quatAxisAngle(1, 0, 0, 0.5))));
    children.push(g.addNode(partNode(woodMesh, [bx, shoulderY - 0.28, 0.36], [0.05, 0.28, 0.05], "bowBot", quatAxisAngle(1, 0, 0, -0.5))));
    children.push(g.addNode(partNode(stringMesh, [bx, shoulderY, 0.34], [0.02, 0.7, 0.02], "bowString")));
  } else {
    children.push(g.addNode(partNode(limbMesh, [-0.34 * girth, shoulderY - 0.16, 0], [0.16, 0.42 * H, 0.18], "armL")));
  }

  // ---- main hand: animated weapon-arm pivot ----
  const weaponChildren = [];
  weaponChildren.push(g.addNode(partNode(limbMesh, [0, -0.2, 0.02], [0.16, 0.42 * H, 0.18], "armR")));
  buildWeapon(g, cube, weaponChildren, feat.weapon, accent);
  const pivot = g.addNode({ name: "weaponArm", translation: [0.36 * girth, shoulderY, 0.04], children: weaponChildren });
  children.push(pivot);

  const root = g.addNode({ name: "root", translation: [0, 0, 0], children });
  addStandardClips(g, root, pivot);
  return root;
}

function buildBlob(g, cube, pal, boss) {
  const s = boss ? 1.4 : 1;
  const bodyMesh = cube(pal.body, { rough: 0.5 });
  const eyeMesh = cube([0.05, 0.05, 0.07], { rough: 0.3 });
  const accentMesh = cube(pal.accent, { rough: 0.4 });

  const children = [];
  children.push(g.addNode(partNode(bodyMesh, [0, 0.34 * s, 0], [0.95 * s, 0.62 * s, 0.85 * s], "blob")));
  children.push(g.addNode(partNode(accentMesh, [0, 0.64 * s, 0.08 * s], [0.66 * s, 0.3 * s, 0.5 * s], "dome")));
  children.push(g.addNode(partNode(eyeMesh, [-0.17 * s, 0.42 * s, 0.4 * s], [0.12, 0.16, 0.06], "eyeL")));
  children.push(g.addNode(partNode(eyeMesh, [0.17 * s, 0.42 * s, 0.4 * s], [0.12, 0.16, 0.06], "eyeR")));
  if (boss) {
    children.push(g.addNode(partNode(cube([0.95, 0.82, 0.28], { metallic: 0.6, rough: 0.3 }), [0, 0.78 * s, 0], [0.5, 0.12, 0.5], "crown")));
  }

  const root = g.addNode({ name: "root", translation: [0, 0, 0], children });
  // blob has no weapon arm; attack lunges the whole body
  addStandardClips(g, root, null);
  return root;
}

function buildFlyer(g, cube, pal, boss) {
  const s = boss ? 1.35 : 1;
  const bodyMesh = cube(pal.body);
  const wingMesh = cube(pal.accent, { rough: 0.7 });
  const eyeMesh = cube([0.9, 0.3, 0.2], { metallic: 0.2, rough: 0.3 });

  const children = [];
  children.push(g.addNode(partNode(bodyMesh, [0, 0.62 * s, 0], [0.36 * s, 0.42 * s, 0.36 * s], "body")));
  children.push(g.addNode(partNode(eyeMesh, [-0.1 * s, 0.7 * s, 0.18 * s], [0.08, 0.1, 0.05], "eyeL")));
  children.push(g.addNode(partNode(eyeMesh, [0.1 * s, 0.7 * s, 0.18 * s], [0.08, 0.1, 0.05], "eyeR")));
  // pointed ears / horns
  children.push(g.addNode(partNode(bodyMesh, [-0.13 * s, 0.86 * s, 0], [0.08, 0.18, 0.06], "earL", quatAxisAngle(0, 0, 1, 0.4))));
  children.push(g.addNode(partNode(bodyMesh, [0.13 * s, 0.86 * s, 0], [0.08, 0.18, 0.06], "earR", quatAxisAngle(0, 0, 1, -0.4))));

  const wingL = g.addNode(partNode(wingMesh, [-0.42 * s, 0.64 * s, 0], [0.52 * s, 0.06, 0.36 * s], "wingL"));
  const wingR = g.addNode(partNode(wingMesh, [0.42 * s, 0.64 * s, 0], [0.52 * s, 0.06, 0.36 * s], "wingR"));
  children.push(wingL, wingR);
  if (boss) {
    children.push(g.addNode(partNode(cube([0.95, 0.82, 0.28], { metallic: 0.6, rough: 0.3 }), [0, 0.92 * s, 0], [0.4, 0.1, 0.4], "crown")));
  }

  const root = g.addNode({ name: "root", translation: [0, 0.18, 0], children });

  // Custom clips: idle flaps wings + bobs; attack lunges; hit/death standard.
  g.addAnimation("idle", [
    { node: root, path: "translation", times: [0, 0.4, 0.8], values: [0, 0.18, 0, 0, 0.32, 0, 0, 0.18, 0] },
    { node: wingL, path: "rotation", times: [0, 0.4, 0.8], values: [...QID, ...quatAxisAngle(0, 0, 1, 0.6), ...QID] },
    { node: wingR, path: "rotation", times: [0, 0.4, 0.8], values: [...QID, ...quatAxisAngle(0, 0, 1, -0.6), ...QID] },
  ]);
  g.addAnimation("attack", attackTracks(root, null));
  g.addAnimation("hit", hitTracks(root));
  g.addAnimation("death", deathTracks(root));
  return root;
}

// ---- archetype classification (id + optional role heuristics) ----
// Maps each unit id to a rig (humanoid archetype, blob, or flyer) + boss flag.
function archetypeFor(id, role) {
  const boss = /mintmaster|banker-king|infernal_auditor|dungeon_champion|hoard_fiend/.test(id);
  // Shape-defining non-humanoids first.
  if (/bat|gloom|tariff|imp|wraith/.test(id)) return { rig: "flyer", boss };
  if (/slime|leech|fiend|dummy/.test(id)) return { rig: "blob", boss };

  let rig;
  if (/wizard|sorcerer|warlock|apprentice|enchanter|mage/.test(id)) rig = "mage";
  else if (/archer|ranger/.test(id)) rig = "archer";
  else if (/priest|cleric|druid|bard|heal|medic|treasurer/.test(id)) rig = "support";
  else if (/ninja|rogue|thief/.test(id)) rig = "rogue";
  else if (/golem/.test(id)) rig = "golem";
  else if (/knight|paladin|squire|guard|protector|grunt|shield|tank|champion|armsman/.test(id)) rig = "knight";
  else if (/warrior|barbarian|fighter|brute|brawler|brimstone/.test(id)) rig = "heavy";
  // Economy/caster-flavored enemies (mints, brokers, auditors, coiners, bankers).
  else if (/mint|broker|auditor|coiner|ledger|banker|accountant|collector|inspector/.test(id)) rig = "mage";
  else if (role === "Tank") rig = "knight";
  else if (role === "Support" || role === "Economy") rig = "support";
  else rig = "heavy";
  return { rig, boss };
}

// Translates an archetype name into the humanoid feature flags + palette.
function featFor(name, boss) {
  const base = {
    mage:    { palette: "arcane", robe: true, hat: "wizard", weapon: "staff", girth: 1, height: 1.02 },
    support: { palette: "holy", robe: true, weapon: "staff-holy", girth: 1, height: 1 },
    knight:  { palette: "steel", helmet: true, shield: true, weapon: "sword", girth: 1.08, height: 1 },
    heavy:   { palette: "brute", weapon: "axe", girth: 1.3, height: 1.06 },
    archer:  { palette: "forest", weapon: "bow", girth: 0.95, height: 1 },
    rogue:   { palette: "shadow", hood: true, weapon: "daggers", girth: 0.9, height: 0.95 },
    golem:   { palette: "stone", weapon: "fists", girth: 1.5, height: 1.12 },
  }[name];
  const feat = Object.assign({}, base);
  if (boss) {
    feat.crown = true;
    feat.cape = true;
    feat.girth = (feat.girth || 1) * 1.25;
    feat.height = (feat.height || 1) * 1.18;
  }
  return feat;
}

function buildModel(id, role) {
  const g = new Gltf();
  const cube = makeCubeMeshFactory(g);
  const arch = archetypeFor(id, role);
  let root;
  if (arch.rig === "flyer") root = buildFlyer(g, cube, paletteFor("shade", id), arch.boss);
  else if (arch.rig === "blob") root = buildBlob(g, cube, paletteFor("slime", id), arch.boss);
  else {
    const feat = featFor(arch.rig, arch.boss);
    root = buildHumanoid(g, cube, paletteFor(feat.palette, id), feat);
  }
  return g.toJSON(root);
}

async function loadRoster() {
  const { pathToFileURL } = require("url");
  const drUrl = pathToFileURL(path.join(__dirname, "web", "src", "core", "DataRepository.js")).href;
  const dr = await import(drUrl);
  const D = dr.DataRepository;
  const heroes = D.allHeroes.map((h) => ({ id: h.id, role: h.role }));
  const seen = new Set();
  const enemies = [];
  for (const e of D.allEnemies) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    enemies.push({ id: e.id, role: null });
  }
  return { heroes, enemies };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const { heroes, enemies } = await loadRoster();
  const written = [];
  for (const { id, role } of [...heroes, ...enemies]) {
    fs.writeFileSync(path.join(OUT_DIR, `${id}.gltf`), JSON.stringify(buildModel(id, role)));
    written.push(id);
  }
  // Generic fallbacks (used by the loader if a per-unit file is ever missing).
  fs.writeFileSync(path.join(OUT_DIR, "hero-fallback.gltf"), JSON.stringify(buildModel("hero-fallback", "Tank")));
  fs.writeFileSync(path.join(OUT_DIR, "enemy-fallback.gltf"), JSON.stringify(buildModel("enemy-fallback", null)));

  // Emit the authoritative id list so CombatAssetManifest stays in sync with
  // exactly the model files that exist on disk (single source of truth).
  const idsModule =
    "// AUTO-GENERATED by gen_unit_models.cjs — do not edit by hand.\n" +
    "// Lists every unit id that has an animated glTF model under assets/models/.\n" +
    `export const MODEL_IDS = Object.freeze(${JSON.stringify(written, null, 2)});\n`;
  fs.writeFileSync(path.join(__dirname, "web", "src", "ui", "board", "GeneratedModelIds.js"), idsModule);

  console.log(`Wrote ${written.length} unit models (${heroes.length} heroes, ${enemies.length} enemies) + 2 fallbacks to ${OUT_DIR}`);
}

main();
