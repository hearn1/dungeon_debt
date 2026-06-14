# Combat Visual Direction — Research & Recommendation

_Epic #314 · Subissue #340_

---

## Options Evaluated

### 1. 2.5D Character Sprites on a Board
Pre-rendered or hand-drawn sprites in a fixed isometric or side-view angle. Units appear as flat art on the hex tiles.

| Dimension | Assessment |
|---|---|
| Visual style target | High quality if art is good; looks dated with basic sprites |
| Asset sources | Itch.io sprite packs (CC0/commercial); hand-drawn |
| Licensing | Varies widely; CC0 packs available |
| Animation burden | Medium — needs idle, attack, hit, death sheets per unit |
| Implementation risk | Medium — requires sprite sheet slicing, atlas management, frame timing |

### 2. Low-Poly 3D Minis
Actual 3D meshes (like board game miniatures) rendered via Three.js WebGL.

| Dimension | Assessment |
|---|---|
| Visual style target | Matches the "guild board game" aesthetic well |
| Asset sources | Difficult to source freely; Kenney.nl has some RPG packs |
| Licensing | Kenney: CC0. Others: mixed |
| Animation burden | High — requires rigged glTF models per unit type |
| Implementation risk | High — glTF loading, skeletal animation, shader management |

### 3. Billboarded Animated Sprites
2D sprite sheets rendered as Three.js planes always facing the camera.

| Dimension | Assessment |
|---|---|
| Visual style target | Modern pixel-art look; "RPG Maker" feel |
| Asset sources | Liberated Pixel Cup (CC-BY-SA), RPG Maker packs |
| Licensing | LPC is CC-BY-SA; RPG Maker packs need a license |
| Animation burden | High — full sprite sheet per unit, frame management |
| Implementation risk | Medium-High — sprite atlas management, billboard shader |

### 4. Token + Portrait Hybrid
Styled circular/diamond medallion tokens that display the existing hero portrait. The portrait is the primary visual; shape, border color, and CSS animations carry role identity and combat state.

| Dimension | Assessment |
|---|---|
| Visual style target | "Board game token" feel; fits the fantasy-bureaucracy theme |
| Asset sources | Already have portraits for all 12 heroes and 20+ enemies |
| Licensing | All art is in-repo with no third-party licensing concern |
| Animation burden | Low — CSS keyframe animations per state (no sprite sheets) |
| Implementation risk | Low — extends existing Three.js overlay DOM system |

### 5. VFX-Heavy Board Pieces
Minimal or abstract unit shapes (simple colored tokens) but with heavy particle/CSS VFX for attacks, deaths, heals.

| Dimension | Assessment |
|---|---|
| Visual style target | Abstract / arcade feel; not a strong match for the theme |
| Asset sources | CSS-only; no external dependency |
| Licensing | N/A |
| Animation burden | Medium — VFX design per effect type |
| Implementation risk | Low — pure CSS/DOM, no new pipeline |

---

## Recommendation: Token + Portrait Hybrid (Option 4)

**Recommended style: Token + Portrait Hybrid**, enhanced with targeted CSS animations per combat state.

### Rationale

The existing system is already a partial Token+Portrait Hybrid: `ThreeCombatBoardScene` renders a Three.js board with DOM overlays that contain the unit portrait. The current "placeholder" appearance is the diamond-shaped pin (small, rotated, color-coded). The path to closer-to-real visuals is to make the portrait the dominant visual rather than a small inset.

This approach:
- Requires no new art pipeline — all 12 hero and 23 enemy portraits already exist
- Fits the project's "no external libraries, CSS animations only" constraint
- Supports gradual replacement: a unit's portrait can be swapped independently
- Fits the visual identity doc's "guild-management desk / board game" aesthetic

### Visual Style Target

Units on the board appear as **medallion tokens** — circular or hex-shaped portrait frames with:
- A **role-colored border** (Tank: steel blue, Damage: rust red, Support: sage green, Economy: gold)
- The **portrait filling the medallion** at high opacity
- A **glow halo** when the unit is acting
- **CSS state animations** replacing the placeholder lunge/bob: crisp shake for hit, pop-scale for attack, sink+fade for death

Enemy units use the same medallion frame but with a red-tinted border.

### First Real Combat Visual Slice

Implement the `PortraitToken` visual kind (replacing `PlaceholderPawn`) for:

**Heroes (starter set):** Warrior, Knight, Priest  
**Enemies (early encounters):** Slime, Goblin Thief, Cave Bat

These six units cover a typical Round 1–3 combat. All others remain as placeholder pawn until future passes.

### Asset Sources for Future Expansion

If character illustration is needed beyond portraits, the best free sources compatible with this project are:

- **Kenney.nl RPG Pack** — CC0, includes top-down character tokens
- **Liberated Pixel Cup (OpenGameArt)** — CC-BY-SA, large sprite library
- **Lorc's game-icons.net** — CC-BY, SVG icons usable as VFX/status icons

All three support the gradual-replacement model: drop a PNG into `assets/` and the manifest picks it up.

### Animation Burden Summary

| State | Implementation | Notes |
|---|---|---|
| Idle | `unit-idle-bob` CSS keyframe (existing) | Add subtle rotation for PortraitToken |
| Move | CSS position transition (existing) | No change needed |
| Attack | `unit-attack-pop` + lunge class (existing) | Enhanced scale + translate for PortraitToken |
| Hit | `unit-hit-flash` CSS keyframe (existing) | Add red border flash for PortraitToken |
| Death | `unit-death-sink` CSS keyframe (existing) | Add portrait-fade for PortraitToken |
| Cast | `unit-cast-pulse` CSS keyframe (existing) | Add glow ring for PortraitToken |
| Passive | `unit-passive-glow` CSS keyframe (existing) | No change needed |

### Implementation Risk

**Low.** The entire system runs in existing CSS + DOM. No new libraries, no build step, no sprite sheet management. The Three.js board remains unchanged; only the overlay's CSS class and size differ for `PortraitToken` units.

---

## Known Constraints

- Animations must be declarative CSS keyframes (CLAUDE.md §Scope control). No GSAP, anime.js, Lottie.
- The Three.js surface (board tiles, camera, WebGL context) is already approved (epic #259) and must not be extended.
- All unit visuals must fall back safely to `PlaceholderPawn` for any unit without a manifest entry.
- Presentation changes must not affect combat math.
