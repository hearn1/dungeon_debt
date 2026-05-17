# TP_M20.2 — Planning-document review checklist

M20.2 is a **documentation/design-only** slice (mirrors M20.0 / M18.0). There is no Unity runtime behavior to test, so this is a review checklist, not an Editor test plan. The reviewer reads the produced documents and checks each box. `Actual:` is left blank for the reviewer.

Artifacts under review:
- `Design/M20.2/DESIGN_BRIEF.md`
- `Design/M20.2/SCREENSHOT_MANIFEST.md`
- `Design/Inputs/` (existing current-state screenshots; manifest points here)
- `IMPLEMENTATION_PLAN.md` §16 (M20.2 outcome + ready M20.3)
- `NEXT_SESSION.md` (rewritten for M20.3)

---

## A. Design brief completeness

- [ ] A1. The brief is self-contained: a reader with **no repo access** gets the project one-pager, the 20-round/2-act + per-act-identity context, and the deliverable expected (HTML/JSX reference mockups + rationale).
      Expected: Sections 1 and 3 of `DESIGN_BRIEF.md` cover this without referencing repo files the designer cannot see.
      Actual:
- [ ] A2. All **five** views have a section with (a) current data, (b) the 20-round/multi-act problem, (c) what must stay the same, (d) 2–5 implementation acceptance criteria: **Run Header, Scout, End/Act Transition, Reward Summary, Combat**.
      Expected: §4.1–§4.5 each present with all four parts; each (d) has 2–5 numbered criteria.
      Actual:
- [ ] A3. Combat is framed as a **re-skin to the shared system, not a rebuild**, and explicitly forbids new combat layout/mechanics and >5 effect sprites.
      Expected: §4.5 preamble and criteria state this.
      Actual:
- [ ] A4. The brief asks for **one shared visual system** (type scale, palette, one severity color language for debt tiers, one data-driven per-act identity treatment) expressed as per-view mockups.
      Expected: §3 and §5 state this.
      Actual:

## B. Constraints fidelity (no out-of-scope design invited)

- [ ] B1. Locked tech constraints are encoded as hard MUST/MUST NOT: uGUI/flat-renderable, 1920×1080 16:9, single-screen panel-swap, mouse-only.
      Expected: `DESIGN_BRIEF.md` §2 "Rendering & layout".
      Actual:
- [ ] B2. The motion budget is explicit: no tweens/animation framework, no particles/VFX/screen-shake/glow/audio; combat effect art capped at the existing 5 shared sprites.
      Expected: §2 "Motion & effects" and §4.5.
      Actual:
- [ ] B3. Placeholder-art-only is stated; per-act theme must be conveyed via color/label/glyph/layout, **not** painted environment art.
      Expected: §2 "Art".
      Actual:
- [ ] B4. The brief forbids inventing game features in the UI (no map, act-select, save/load, meta, inventory, new resources/stats/mechanics); mockups use only existing data.
      Expected: §2 "Scope".
      Actual:
- [ ] B5. Nothing in the brief contradicts `GAME_DESIGN.md` (core loop unchanged; Scout still poses a tactical problem; debt tiers Stable/Strained/Dangerous/Critical) or `CLAUDE.md` §Scope control.
      Expected: cross-read confirms no contradiction.
      Actual:

## C. Screenshot manifest

- [ ] C1. The manifest lists concrete capture rows with filename, state/how-to-reach, and why-it-matters, covering all five views.
      Expected: `SCREENSHOT_MANIFEST.md` "Already captured" baseline table + "Still needed" table.
      Actual:
- [ ] C2. Multi-act coverage is present: Act 1 baseline (`scout.PNG`/`combat.PNG`) **and** the still-needed Act 2 + capstone + high-debt + End-screen rows.
      Expected: `header-critical`, `header-act2-relics`, `scout-act2`, `scout-guild`, `scout-capstone`, `combat-act2`, `combat-capstone`, `reward-capstone`, `end-act-clear`, `end-victory`, `end-defeat` rows present.
      Actual:
- [ ] C3. The manifest points captures at the existing `Design/Inputs/` folder and is consistent with the brief (brief §"Read alongside" references `Design/Inputs/` and `Design/M20.2/mockups/`).
      Expected: folder + naming consistent between the two docs.
      Actual:

## D. No runtime change (slice-type invariant)

- [ ] D1. No runtime C# / `Main.unity` / prefab / `Assets/Art/` file was modified by this slice.
      Expected: `git status` shows only `Design/M20.2/**`, `TestPlans/TP_M20.2.md`, `IMPLEMENTATION_PLAN.md`, `NEXT_SESSION.md` (plus the pre-existing unrelated working-copy edits to `PROGRESS.md`/`NEXT_SESSION.md` and any `Design/Inputs/` screenshots the user added).
      Actual:
- [ ] D2. New artifacts live in the repo-root `Design/` folder (not under `Assets/`, not a forbidden `Resources/`/`Tests/`/`Editor/` folder).
      Expected: path is `Design/M20.2/...`; screenshots in `Design/Inputs/`.
      Actual:

## E. Handoff readiness for M20.3

- [ ] E1. `IMPLEMENTATION_PLAN.md` §16 records the M20.2 outcome and leaves a ready, concretely-scoped **M20.3** (ID, one-sentence goal, file list, 2–5 acceptance criteria) covering ingest of the returned mockups + implementation of the highest-priority view group (Run Header + Scout).
      Expected: a new M20.2 outcome subsection + M20.3 slice block in §16.
      Actual:
- [ ] E2. `NEXT_SESSION.md` is rewritten to describe M20.3 (depends on Claude design having returned HTML/JSX into `Design/M20.2/mockups/`).
      Expected: `NEXT_SESSION.md` session header reads M20.3 with scope/criteria/file lists.
      Actual:

---

**Observable invariants** (always true for this slice):
- This slice changes no game behavior; running the game before vs. after M20.2 is identical.
- Every acceptance criterion in `DESIGN_BRIEF.md` §4 is phrased so a future Unity implementation can be checked against it (testable, not aspirational).

(No Happy-path / Edge-case / Regression-check sections: this slice ships no runtime diff, so there is no prior runtime behavior at risk.)
