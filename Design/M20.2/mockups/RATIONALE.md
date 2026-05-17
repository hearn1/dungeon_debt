# M20.2 — Dungeon Debt design rationale

One shared visual system ("Guild Ledger") applied across five views. Built strictly inside the brief §2 constraint box: flat uGUI-renderable, no motion, placeholder art only, no new game features.

Open `mockups/index.html` to navigate the per-view files. Each view shows its multi-state variants stacked.

---

## The shared system, before the views

### Type
- **Newsreader** (serif) for headlines and encounter names — ledger / contract feel.
- **IBM Plex Sans** for UI text.
- **IBM Plex Mono** for numerals, severity tier labels, and status letters.
- Treat all three as swappable for a generic sans per brief §2 — the design must read with a single fallback sans. Layout uses size + weight + letter-spacing, never font family, to carry hierarchy.

### Palette
Warm vellum text (`#ECE2C9`) on near-black panels (`#161A20` / `#1F242C`). All accents are muted "ink" colors — no saturated chroma. Background gradients in End/Reward are decorative; they fall back to flat fills with no loss of meaning.

### Severity ramp — **one** color language for "this is getting worse"
| Tier | Range | Hex |
|---|---|---|
| Stable | 0–5 | `#6B9B6B` |
| Strained | 6–11 | `#C9A04A` |
| Dangerous | 12–19 | `#CC7A3A` |
| Critical | 20+ | `#C44A3E` |

Reused unchanged in: the Run Header debt chip, the Reward Summary headline debt cell, the End-screen final-debt stat, Combat ally HP-bar fills at low HP, and the danger callout on Scout. **The single most important readability element in the brief.**

### Per-act identity — the "Act Seal"
A data-driven component, not a per-act layout. One row of data per act:

```
{ act_number_roman, theme_word, accent_hex }
```

| # | Roman | Theme | Accent |
|---|---|---|---|
| 1 | I | Dungeon | `#8A909A` (stone) |
| 2 | II | Demonic | `#A8364A` (sigil red) |
| 3 | III | (TBD) | placeholder `#4F9089` |
| 4 | IV | (TBD) | placeholder `#C9A04A` |
| 5 | V | (TBD) | placeholder `#8C6AA8` |

Acts 3–5 cost zero relayout — three new rows in the data table. The seal renders as a square stamp (Roman in accent) + the theme word. The accent additionally drives: the run-progress ticks for that act, the kind-chip dot when the fight is in that act, and the section accent on the End-screen handoff.

### Run-progress meter
20 ticks split into N act groups, each with an "I / II / III…" label and 10 ticks. Capstone tick is hatched. Past = filled accent · current = filled ink with outline · future = hairline. Scales to 5 acts within the existing header width.

### Components
Buttons (primary brass / secondary outline / danger), the act seal, the runbar, the debt chip, the resource readout, the relic chip, the unit card, the kind chip (dungeon / rival[guild] / capstone), the section head, the key-value row. All are flat fills + 1px borders. Each translates 1:1 to a Unity uGUI Image + Text pair.

---

## View 1 — Run Header (highest priority)

**Problem.** The current 80px bar showed "Act 1 - Round 4/10" with no whole-run sense, no act identity (just text), no severity color on debt (worst offender — Dangerous looked identical to Stable), and an unbounded relics comma string.

**Solution.**
- Two-zone fixed-height chrome (88px primary + 32px relic strip = 120px). Still single thin bar; does not encroach on the panel below.
- **Run/act position is expressed three ways simultaneously:** the act seal (which act), the round counter (`04/10 · 04 / 20`), and the runbar meter (current tick highlighted inside its act group). The player gets identity, within-act position, and run progress in one glance.
- **Debt chip is the dominant element on the right side.** It uses the severity ramp as a left swatch + tier word. At **Critical**, the full chip background turns severity-red and the numeral does too — the design escalates with the data instead of staying decorative.
- **Relics** sit on the secondary line as chips. Overflow rule: show up to 3 chips, then `+N more` as a dashed chip. Bar height is fixed regardless of relic count — the brief's "must not grow into the panel area" is preserved by truncation, not by reflowing.
- **Theme swap is one accent change.** Act 2's header is the same component with `--act-accent` set to demonic red; the runbar's second group, the kind-chip dots, and the section ribbons follow automatically.

**Tradeoffs.**
- I went from a single 80px row to 120px total. The runbar + debt chip + act seal need the vertical room or one of them gets cropped. Brief §2 says "still one thin top bar" — 120px is still thin chrome (11% of 1080), and crucially still fixed-height.
- I dropped the difficulty preset name from the prominent left cluster down to a small "Contract" cell beside the round counter. It's still on screen, just no longer competing with act + round for first-position emphasis.

---

## View 2 — Scout (highest priority)

**Problem.** The current Scout was centered around the encounter name; rival-guild vs dungeon vs capstone read identically (only a small italic word changed); the relic-awarding capstone moment got no emphasis; reward gold competed visually with the tactical brief.

**Solution.**
- A **kind chip** sits in the crumb row at the top. Three variants: `Dungeon · standard encounter` (neutral dot), `Rival Guild · <guild>` (guild-colored dot — Frugal/Greedy/Carry have stable assigned hues), `Final Capstone · Awards Relic` (brass-bordered + brass triangle glyph). One glance answers "what kind of fight is this." Guild fights additionally use the guild color on enemy card borders so the enemy lineup itself reads as "Greedy's roster," not generic.
- **Tactical primacy.** The encounter name is 64px serif. The scout text is 22px serif body — easily readable as the headline. The danger callout uses the severity ramp (dungeons get a brass/orange tier; capstones get severity-red). The reward is a compact two-cell block at the bottom of the right column — present but visually quieter than the brief.
- **Capstone is unmistakable.** Brass accent on the round pill, the kind chip, the encounter name, and the danger box gets escalated to Critical-red. The reward block grows a featured "Relic on victory" cell with a brass crest and "Choose 1 of 3" — the relic is no longer just a passive sentence buried elsewhere.
- **Position is shown three ways** (crumb pill + the persistent header runbar + an explicit "Next capstone · R10/R20" cue on the right) so the player always knows where this fight sits in the act and the run.

**Tradeoffs.**
- Rival-guild fights now visually reskin the enemy cards (top-border in guild color). That's a structural commitment the implementation must honor — the data already knows which guild owns an encounter, so this is free.
- I introduced three guild accent colors (teal/brass/violet). These are *separate from* the severity ramp on purpose — guild identity is not danger. If a guild ever shares a color with a severity tier, severity wins on the page (e.g. Greedy = brass, Strained = brass — but Strained colors a chip with the word "Strained" alongside, no ambiguity).

---

## View 3 — End / Act Transition

**Problem.** The act-clear handoff was a flat congratulatory line with no preview of the next themed act. The three modes (act-clear / final victory / defeat) all looked identical despite carrying very different emotional weight. The end screens showed only current Gold/Debt/Morale — no run-spanning recap.

**Solution.**
- **One layout family, three accent flavors.** Same skeleton: kicker row → title block (left column) + recap card (right column) → footer with single primary action. The title color (`stable green` / `gold` / `severity red`) and a single optional stamp band (laurel for victory, severity-red stamp for defeat) carry the emotional difference. No bespoke per-mode layouts.
- **Act-clear has a dedicated transition block** in the title column: just-cleared seal → arrow → upcoming-act seal in the next act's accent, plus a one-line theme statement. The two seals reuse the shared component; new-act preview is one data lookup. Copy is parameterized (`Act N cleared → Act N+1`); no Act-1 literals.
- **Run recap card** uses only existing data: final gold, final debt + tier (severity-colored), final morale, peak debt this run, acts cleared (rendered as seals), relics earned (rendered as relic chips). Defeat shows the same card with the failed act dimmed and the closest-to-bankrupt stat replaced by the end reason — everything is data the game already tracks.
- **One primary action button**, labeled per mode (`Continue to Act 2 — Demonic` / `Main Menu` / `Main Menu`).

**Tradeoffs.**
- The "closest to bankrupt" stat on Victory and "reached R16 / 20" on Defeat are derived from existing per-round data (max debt seen, last round played). They're not new metrics — just surfaces. If the engine doesn't already retain peak-debt-this-run, this stat is the one to cut without losing the design.

---

## View 4 — Reward Summary

**Problem.** Up to 13 equally-weighted lines, shown up to 20 times per run. The single most important fact (did the debt tier change?) was buried mid-list. Capstone reward — the one moment that earns a relic and clears an act — looked identical to a routine round.

**Solution.**
- **A 4-cell headline strip** at the top resolves the round in one glance: combat outcome (Win/Loss, severity green/red) · net gold (+/-) · morale change · debt + tier. The debt cell uses the severity ramp; at Critical it goes severity-red on a tinted bg. A small delta-pill under each headline explains the swing (`Strained → Dangerous · +6`, `Stable · no change`, `act clear bonus`). The headline cells are intentionally a different visual weight (serif 54px) than the body ledger (mono 16px), so a player who only reads the strip still gets the round.
- **The detail ledger is preserved in two columns**: left = Income + Roster/Veterancy + Payroll action; right = Upkeep + Interest + debt-after readout. Nothing from the current line list is dropped — everything is grouped under monospace section labels and dashed-rule key/value rows so the wall reads as columns of rows.
- **Capstone reward is the same panel + a brass relic banner above the headline strip.** The banner spans the panel width, has a brass crest, the relic name in serif, and a "Review 3 choices" affordance. The act-clear nature of the round is unmistakable at a glance without rebuilding the panel.
- **Severity language is reused everywhere debt appears** — the debt headline cell, the "Debt after" footer, the final-debt readout in the bottom ledger row. If the tier changed, the delta-pill says so in the tier's color.

**Tradeoffs.**
- The headline strip is 140px tall — substantial. Worst-case (busy round with payroll + veterancy + interest) the body ledger fits in two columns at the 1920×1080 reference without scrolling. I verified the densest variant (State B in `reward-summary.html`) fills but does not overflow. If real copy strings are longer than my placeholders, the section labels and key/value rows must remain mono and tabular — wrapping long descriptions in the values is the wrong choice; truncate or move to a tooltip in implementation.

---

## View 5 — Combat (re-skin only)

**Problem.** Bare `"Combat"` title with no fight context. Generic chrome that doesn't separate enemy/hero sides or front/back rows beyond text labels. Acts 2+ raise card density (more statuses, demonic enemies) and the existing layout doesn't help disambiguate.

**Constraint.** Brief §4.5 is explicit: **not a rebuild**. Keep the 4-row structure, the cards, the 5-sprite effect budget, the external log.

**Solution.**
- **A context strip replaces the bare title.** It carries the encounter name in serif, a kind chip (Dungeon / Rival[Guild] / Capstone), the position (`Round 03 / 10 · Run 03 / 20`), and the live turn counter. Capstone fights brass-tint the encounter name and kind chip — same component, no new layout.
- **Stronger side / row separation without resizing cards.** The board uses a tinted band per side (cool blue-tinted bg on the two hero rows, warm red-tinted bg on the two enemy rows) and a 4px **battle line** divider between Enemy Front and Hero Front. Each row keeps its left gutter with a mono uppercase row label, now with a colored side word (`Enemy` red, `Hero` blue). Front-vs-back is communicated by tint, divider, and a "slots" count in the gutter — the existing text labels survived; they now have visual reinforcement.
- **The six status indicators** use one-letter mono glyphs on solid-color squares, distinct from each other against any side-tinted background. The status legend lives in the right-side fx column (always on, doesn't compete with cards for space). The legend is part of the persistent chrome — players don't need to memorize letters.
- **Acting / hit / dead states** map to flat outlines and opacity, no glow, no motion: `acting` = brass outline + brass name bar (also reuses the brass act-clear accent); `hit` = severity-red outline; `dead` = 45% opacity + line-through name. All single-frame state changes — within the brief's "color flash" motion budget.

**Tradeoffs.**
- The side tints are subtle (a few percent saturation lift). They must stay subtle, or they'll fight with portrait colors and the side colors on the unit-card top border. I verified the tinted bg reads with a flat-fallback fill (mid-gray on both sides) and the row labels still tell the story — the tint is reinforcement, not load-bearing.
- I did not redesign the combat log; it lives in the bottom strip with matching palette and that's the entire concession. The brief explicitly puts the log out of scope.
- 20-round / Act 2 legibility issues I flagged but did not fix:
  - With 5 hero units × up to 3 statuses, the status row can crowd to ~5 chips in 16px each — fine at this size, but if Act 3+ adds more statuses the chip strip is the breaking point. A capped "show 4 + tooltip" rule would handle it.
  - On a status-saturated board the `acting` brass outline competes with the brass `kind.capstone` border. Resolved here by making the kind chip live in the top strip only, not on individual cards.

---

## What I intentionally left for implementation

- **Final encounter copy** — the names and danger strings used in the mockups (`The Vault Skinners`, `The Underwriter`, etc.) are placeholders to exercise the layout. Final copy comes from your encounter / guild / boss data tables.
- **Real per-act theme glyphs** — Act 1 and Act 2 use only the Roman numeral and theme word; I deliberately did not draw an icon. uGUI can stamp the seal with either a Unicode mark or a 24×24 placeholder sprite per the act-config table; the chrome accommodates either.
- **Combat log** — out of scope. The screenshots show it stylistically aligned with the new chrome (mono, dashed line separators) for visual continuity, but the log component is not being redesigned in M20.2.
- **Difficulty preset surface** — currently shown as `Contract · Standard / Predatory` in the header. If you want it more prominent (e.g. recolor the entire header at Predatory), that's a follow-up; today it's a chip among others.
- **Localization** — I designed for the English placeholder copy. The Newsreader serif scale + mono numerals tolerate longer translations (German upkeep words, Japanese encounter names) without relayout, but a copy-length sweep before implementation is wise.
- **Per-act configuration table** — Acts 3, 4, 5 use placeholder theme words ("Verdant," "Golden," "Void") and placeholder accents purely to prove the seal/runbar scale. Real Act 3+ themes are your design call.

All five files load `system.css`; that file is the single source of truth for the design tokens. New tokens, new act rows, and new severity adjustments should be made there, not in per-view stylesheets.
