# Handoff — Replace block-figure combat models with representative 3D assets

**Branch context:** follows `feat/epic-314-combat-visual-pass`, which landed the 3D-model
pipeline (loader + procedural placeholder models). This next slice swaps the placeholder
geometry for real, recognizable models — a wizard that looks like a wizard, a ranger
drawing a bow, etc. — **without changing the loader/animation contract**.

---

## What already exists (do not rebuild)

The full pipeline is in place and working; only the *art* is placeholder.

- **Loader:** `web/vendor/GLTFLoader.js` (+ `BufferGeometryUtils.js`, `SkeletonUtils.js`,
  three.js r184, MIT) → `web/src/ui/board/UnitModelLoader.js`
  (`instantiateUnitModel(id)` → `{ scene, clips }`, cached + cloned per instance).
- **Board integration:** `web/src/ui/board/ThreeCombatBoardScene.js` `_attachModel()` —
  builds an `AnimationMixer`, plays a clip per `UnitVisualState` via `STATE_TO_CLIP`,
  runs a continuous RAF loop (`THREE.Timer`). Idle loops; attack/hit play once and fade
  back to idle; death plays once and clamps.
- **Coverage / fallback:** `CombatAssetManifest.unitHasModel(id)` is driven by
  `web/src/ui/board/GeneratedModelIds.js` (`MODEL_IDS`). If an id has no model or the file
  fails to load, the DOM **portrait token stays visible** — combat never breaks.
- **Current art:** `web/assets/models/<id>.gltf` — 82 procedural cube-figure models from
  `gen_unit_models.cjs`. These are the things to replace.

### The contract real assets MUST satisfy

1. **File location:** `web/assets/models/<unitId>.gltf` (or `.glb`). Note `unitModelUrl()`
   in `CombatAssetManifest.js` currently hardcodes `.gltf` — if using `.glb`, update that
   to derive the extension (or keep a per-id extension map).
2. **Animation clip names:** the loader's `findClip()` matches **`idle`, `attack`, `hit`,
   `death`** (case-insensitive). Real packs use names like `Idle`, `Attack`, `Spellcast`,
   `Recieve_Hit`, `Death_A`. You must either rename clips at author time or add a
   per-model clip-alias map (extend `STATE_TO_CLIP` / `findClip` to accept aliases).
   Missing clips degrade gracefully (that state just won't animate), but idle is important.
3. **Normalization (the real work):** packs vary in scale, up-axis, origin, and facing.
   Add a normalization step in `_attachModel()` (or in `UnitModelLoader`): scale to a
   target height (~1 unit, current `MODEL_SCALE` assumes a ~1.2–1.4-tall figure),
   recenter on X/Z, drop feet to `y=0`, and confirm forward axis matches the
   `group.rotation.y` facing convention (player `Math.PI`, enemy `0`). Consider a small
   per-model override table for scale/yaw where a pack's defaults are off.

---

## Roster to cover (authoritative — from `DataRepository`, NOT the static manifests)

- **21 heroes:** warrior, knight, golem, wizard, ninja, ranger, priest, bard, enchanter,
  squire, treasurer, apprentice, paladin, cleric, barbarian, rogue, warlock, artificer,
  sorcerer, fighter, druid.
- **61 unique enemies:** slime line, bats, goblins, the frugal/greedy/carry rival sets,
  the `shield_grunt`/`pit_brawler`/`dungeon_archer`/`dungeon_medic`/`hulking_protector`/
  `dungeon_champion` dungeon line, `act3-*` and `act4-*` boss tiers, imps, soul_broker,
  brimstone_brute, infernal_auditor, etc. Get the live list from
  `DataRepository.allEnemies` (dedup) or `MODEL_IDS`.

You do **not** need 82 bespoke meshes. Map ids to **archetypes** and vary by material
tint + swappable weapon/prop:
- wizard / sorcerer / warlock / apprentice / enchanter → robed mage + staff/orb
- ranger / frugal_archer / dungeon_archer → archer + drawn bow (attack clip = loose arrow)
- knight / paladin / squire / shield_grunt / hulking_protector → armored + shield/sword
- barbarian / warrior / fighter / brute → heavy melee + axe/greatsword
- rogue / ninja / goblin_thief → light melee + daggers
- priest / cleric / druid / bard / healer / medic → support caster
- slime / leech / fiend → blob; bats / imp / wraith → flyer
- bosses (act3-mintmaster, act4-banker-king, infernal_auditor, dungeon_champion) →
  bigger/distinct silhouettes; worth bespoke treatment.

---

## Sourcing (keep the CC0 / CC BY license floor — locked, see ART_LICENSING.md)

Prefer **CC0 animated, rigged fantasy character packs**, e.g.:
- **Quaternius** "Ultimate Animated Characters" / fantasy packs (CC0, GLB, rigged,
  Idle/Attack/Hit/Death clips) — the source named in the original goal.
- **KayKit** Adventurers / Skeletons / Dungeon packs (CC0, characters + animations + props).
- **Kenney** 3D (CC0) — good for props/weapons; many character meshes are static (no
  skeletal anim), so verify clips exist before relying on them.

**Reject:** Mixamo (not CC0), anything CC BY-SA or Non-Commercial. CC BY is allowed *with*
attribution. Update `web/ATTRIBUTION.md` + `Design/ART_LICENSING.md` with each real source
(author, pack name, URL, license) and replace the "first-party procedural CC0" note for the
files you swap.

If a pack ships one GLB with many characters, split/export per-archetype GLBs and either
hand-place them as `web/assets/models/<id>.gltf` or extend `gen_unit_models.cjs` into an
asset-mapping step (id → base mesh + tint + weapon) that writes the per-id files and keeps
`GeneratedModelIds.js` in sync.

---

## Acceptance criteria (for the next slice)

1. At least the 21 heroes + the common Act 1–2 enemies render as recognizable, role-appropriate
   3D figures (wizard with staff, ranger with bow, knight with shield, slime as a blob, bat
   as a flyer) — not cubes.
2. Each swapped model animates idle (loop) + attack/hit/death (once) via the existing
   `STATE_TO_CLIP` path; verify in a live combat that attack/hit/death visibly differ from idle.
3. Models are correctly scaled, grounded (`y=0`), centered, and facing the opponent on both sides.
4. Any id without a real asset still falls back to the procedural model or portrait token —
   zero console errors, combat never breaks.
5. `web/ATTRIBUTION.md` + `Design/ART_LICENSING.md` updated with real sources; CC0/CC BY only.
6. `npm run test:headless` passes; combat renders with zero console errors.

---

## Pitfalls

- **Repo size:** real GLBs are far larger than the ~6 KB procedural files. Keep meshes
  low-poly, share rigs across archetypes, and avoid embedding large textures (prefer
  vertex colors / small atlases). Watch total `web/assets/models/` size.
- **Up-axis:** many DCC exports are Z-up; three.js is Y-up. GLTF should be Y-up, but verify.
- **Clip-name drift** (see contract #2) is the most common reason a model loads but doesn't
  animate. Check `clips.map(c=>c.name)` first when a model looks frozen.
- Keep the procedural generator (`gen_unit_models.cjs`) as the fallback/coverage backstop
  even after real art lands.
