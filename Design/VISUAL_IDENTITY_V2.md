# Dungeon Debt — Visual Identity V2

## North star

Dungeon Debt should feel like a **grimy fantasy guild accountant's desk**: parchment contracts, dungeon job-board notices, candlelit ledgers, debt stamps, wax seals, and guild management paperwork under pressure.

The goal is not "pretty generic fantasy UI." The goal is **fantasy bureaucracy under financial threat.**

---

## Core references

- Parchment ledger / notice board
- Dungeon contract paperwork
- Grimy fantasy accounting office
- Guild management desk with stacked papers
- Red-ink debt stamps and overdue notices
- Candlelit bureaucracy

---

## Palette

| Token | Value | Semantic role |
|---|---|---|
| `--dd-parchment` | `#e3dcc6` | Light ink / readable text |
| `--dd-candle` | `#b8924a` | Candle gold — primary accent, gold resource |
| `--dd-ink` | `#1a1612` | Deep ink — inverted text on bright surfaces |
| `--dd-rust-accent` | `#a64a40` | Rust red — danger, debt critical |
| `--morale` | `rgb(185, 198, 215)` | Cool steel — crew condition indicator |
| `--bg` | `rgb(14, 13, 18)` | Near-black desk surface |
| `--bg-panel` | `rgb(22, 26, 32)` | Dark ledger panel |
| `--bg-card` | `rgb(31, 36, 44)` | Dark card surface |
| `--debt-stable` | `rgb(107, 155, 107)` | Muted green — healthy ledger |
| `--debt-strained` | `rgb(201, 160, 74)` | Amber — watch the ledger |
| `--debt-dangerous` | `rgb(204, 122, 58)` | Orange-red — interest pressure |
| `--debt-critical` | `var(--dd-rust-accent)` | Rust red — bankruptcy risk |

Role accent colors: Tank blue, Damage red, Support green, Economy gold — applied as card left-strip markers.

---

## Typography

- **Font stack:** System UI (`Segoe UI`, `system-ui`, `sans-serif`) — no new font dependency.
- **Numbers:** `font-variant-numeric: tabular-nums` on all resource values (gold, morale, debt, HP, stats) so columns align in ledger rows.
- **Labels:** `text-transform: uppercase` + wide `letter-spacing` for category kickers and resource labels — reads as stamped ledger metadata.
- **Titles:** `font-weight: 800` for panel headings — stamped contract heading weight.
- **Primary buttons:** `text-transform: uppercase` — signed/authorized stamp feel.

---

## Layout rules

- 8px spacing step throughout.
- Panels feel like stacked papers or notice-board cards — sharp corners (`border-radius: 0`) for buttons and contract cards; mild rounding (`10px`) only on summary/modal containers.
- Cards share a **left-strip marker** (4px `::before` pseudo-element) whose color identifies type: role color for hero cards, gold on selection/hover for choice cards, gold for capstone contracts.
- No floating shadows except debt-critical pulse and capstone glow.
- 1280×720 minimum; no mobile.

---

## Component hierarchy

### Buttons
- **Primary:** Candle-gold fill, dark ink text, uppercase stamp label. Used for contract confirmation, "File Report", "Sign Contract".
- **Secondary (default `.btn`):** Dark card background, gold border on hover. Used for shop actions, reroll, secondary choices.
- **Danger:** Rust-red border and text. Used for debt-risk payroll actions, contest, dismiss.
- **Small:** Same as secondary but compact. Used for hire/dismiss on hero cards.

### Cards
All choice cards share the `difficulty-card` base with a left accent strip:
- **Default:** Gray strip (`--rule-strong`), upgrades to gold on hover.
- **Selected/primary:** Gold strip, gold background, dark text.
- **Locked/disabled:** Reduced opacity.

Hero cards (`unit-card`) use role-colored left strips to communicate role at a glance.

Scout encounter cards (`scout-card`) use a left strip: gray for normal contracts, gold for capstone.

### Header chrome (`run-header`)
The persistent header shows four types of information that should read as distinct:
- **Round / contract:** Stamped contract reference numbers.
- **Gold (CASH):** Warm candle-gold numeric — earned coin.
- **Morale (CREW MORALE):** Cool steel numeric — crew condition, not wealth.
- **Debt (LEDGER DEBT):** Dominant pressure readout. Rectangular chip (no pill radius), left-strip width 4px in severity color, pulsing box-shadow at critical tier.

### Relic chips
Flat rectangular chips (`border-radius: 2px`), uppercase labels — ledger clause entries, not decorative pills.

---

## Economy treatment

- **Gold:** Warm candle-gold. The thing you earn and spend.
- **Morale:** Cool steel-blue. The crew's condition. Different register from gold.
- **Debt:** Red-ink stamp. The threat. Dominates the header. Pulses when critical.
- **Payroll choices:** Risk rows highlighted in `--debt-dangerous` orange to communicate cost.
- **Contract payout / upkeep / interest:** Green (pos), red (neg) in the post-combat summary ledger.

---

## Screen-by-screen intent

| Screen | Feel |
|---|---|
| Main Menu | Ledger cover — signed guild charter, contract selection board |
| Scout | Dungeon job-board notice — posted contract card with enemy roster |
| Shop | Guild hiring ledger — candidate cards, payroll cash readout |
| Payroll | Risky contract clauses — choice cards with ledger previews |
| Combat | Tabletop encounter board — unit cards, floating numbers, encounter-type glow |
| Relic Reward | Sealed reward clauses — choice cards for permanent ledger additions |
| Post-Combat Summary | Signed ledger page — itemized income, expenses, debt movement |

---

## What changed in V2 (vs V1 functional prototype)

1. **Left-strip card language** extended from hero cards to all choice cards (difficulty, payroll, relic) and scout encounter cards.
2. **Debt chip** converted to rectangular stamp format with 4px severity-colored left border and critical-tier pulse animation.
3. **Morale** given a distinct cool-steel color, no longer identical to gold.
4. **Panel kickers** given a candle-gold bottom accent underline.
5. **Panel rule** uses a centered gradient fade (ledger ink stroke, not a hard rule).
6. **Primary buttons** made uppercase (authorized stamp convention).
7. **Relic chips** converted to flat rectangular ledger entries.
8. **Payroll risk rows** highlighted in `--debt-dangerous` orange.
9. `font-variant-numeric: tabular-nums` applied consistently to numeric displays.

---

## Out of scope (V2)

- New fonts or font loading
- Custom sprite assets or illustrations
- Animation library (GSAP, Lottie, etc.)
- Canvas or WebGL
- Gameplay balance or economy changes
- New screens or game features
