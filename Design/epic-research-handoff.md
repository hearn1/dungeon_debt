# Epic Research & Subissue Breakdown — Handoff Prompt

Copy the block below into a new Claude Code session. Replace `EPIC_URL` with the GitHub issue URL.

---

```
I need you to research and break down a GitHub epic into concrete, implementable subissues.

Epic: EPIC_URL

## Your job

1. Fetch the epic from GitHub and read its full body.
2. Read the key project docs (listed below) to understand the current codebase state.
3. Research the relevant source files — find exactly what exists today, what's missing, and what the implementation surface looks like.
4. Produce a subissue breakdown: 3–8 subissues that together close the epic, ordered by dependency.
5. Create each subissue on GitHub under hearn1/dungeon_debt.

## Project docs to read first (in this order)

- CLAUDE.md — rules, constraints, folder layout, coding conventions. Do not propose anything that violates this.
- GAME_DESIGN.md § relevant section — design intent for the feature area.
- IMPLEMENTATION_PLAN.md — current technical state. Cross-reference before proposing new files.
- REGRESSIONS.md — any open blockers that touch this feature area.
- Design/CombatVisualDirection.md — if the epic touches combat visuals.

## Research questions to answer before writing subissues

For each epic, answer:
1. What files currently implement the feature area? (Glob + Grep to find them.)
2. What data structures or enums are already in place that subissues can build on?
3. What is the minimal new file surface? (Prefer extending existing files over creating new ones.)
4. Are there headless tests that will need updating, or new ones that should be added?
5. What is the correct implementation order? Which subissues block others?
6. Are there any CLAUDE.md §Scope control constraints that rule out an approach?

## Subissue format

Each subissue you create on GitHub must include:

**Title:** `[EPIC_NUMBER.N] Short imperative description`

**Body:**
```
Parent epic: #EPIC_NUMBER

## Goal
One sentence.

## Files to create or modify
- `path/to/file.js` — what changes

## Implementation notes
- Concrete guidance: function names, data shapes, call sites
- Reference existing patterns (e.g. "follow the pattern in UnitVisualCatalog.js")
- Call out any pitfalls from CLAUDE.md

## Acceptance criteria
- 2–5 testable, specific criteria
- Include: "npm run test:headless passes" if logic is touched
- Include: "zero console errors in browser" if UI is touched
```

## Constraints (from CLAUDE.md — do not violate these)

- Vanilla JS ES modules only. No bundler, no TypeScript, no React/Vue.
- No new top-level folders under web/src/ without discussion.
- No Math.random() — use the seeded RNG.
- No async/await in combat.
- No third-party libraries beyond the approved vendored Three.js.
- Animations: CSS keyframes and transforms only. No GSAP, anime.js, Lottie.
- No new canvas/WebGL surfaces beyond the existing ThreeCombatBoardScene.
- Data tables in DataRepository are hardcoded JS — no JSON loading.

## Output

After creating all subissues, reply with:
1. A table: subissue number | title | files touched | blocks/depends-on
2. Recommended implementation order with one-line rationale per step
3. Any open questions that need a human decision before implementation can start

Do not start implementing. Research and subissue creation only.
```
