# SESSION_PROTOCOL.md

Read this file at the start of **every** Claude Code session before doing anything else. It defines the workflow for working on Dungeon Debt and is paired with:

- `CLAUDE.md` — project rules
- `GAME_DESIGN.md` — design intent (source of truth)
- `IMPLEMENTATION_PLAN.md` — technical plan (source of truth)
- `NEXT_SESSION.md` — the brief for the slice about to be picked up
- `PROGRESS.md` — append-only log of completed slices
- `REGRESSIONS.md` — open and closed bug log
- `TestPlans/TP_<slice-id>.md` — manual test plans, one per slice

---

## The unit of work: a "slice"

The milestones M1–M7 in `IMPLEMENTATION_PLAN.md` §11 are too big for one session. Each milestone is broken into **slices**: 2–4 hours of work that end in something **visible, compilable, and testable**. Each milestone is expected to be 3–5 slices.

A slice has:

- A slice ID (e.g. `M1.2`)
- A one-sentence goal
- A short list of files to create or modify
- 2–5 acceptance criteria
- A manual test plan written at the end of the session

**One slice per session.** Do not start the next slice in the same session, even if there is time left.

---

## The seven-step session flow

The flow is strict. Two of the steps **require the user to confirm before continuing**: after step 1 (Orient) and after step 3 (Plan). Do not proceed past those two checkpoints without explicit user confirmation.

### Step 1 — Orient

Before touching any code, read in this order:

1. `CLAUDE.md` — full file
2. `PROGRESS.md` — last 2–3 entries to see where the previous session ended
3. `REGRESSIONS.md` — the Open section, in full
4. `NEXT_SESSION.md` — the brief for the slice about to be picked up
5. The relevant section of `IMPLEMENTATION_PLAN.md` for the current milestone (use the Appendix at the bottom of that plan to find the right sections)
6. The relevant section of `GAME_DESIGN.md` only if the slice touches design intent (combat math, hero effects, payroll, rivals, run flow)
7. Any source files that will be read or modified in this slice

Then summarize back to the user in 4–6 lines:

- Current milestone and slice name
- What the previous session completed
- What files exist that are relevant to this slice
- Any open regressions that might block or interact with this work
- The acceptance criteria for this slice as you understand them

**Stop here and wait for the user to confirm the orientation is correct.** Do not move on to step 2 until they do.

### Step 2 — Pick up work

The user will indicate one of:

- **(a)** A regression from `REGRESSIONS.md` to fix
- **(b)** The slice described in `NEXT_SESSION.md`
- **(c)** A specific named slice (e.g. "do M2.3")

If none is clear, ask. Do not guess.

If the chosen slice fails the **Definition of ready** below, stop and work with the user to bring it to ready. Do not start implementing an under-specified slice.

### Step 3 — Plan

Before writing any code, output a plan with these sections:

- **Files to create** — full paths
- **Files to modify** — full paths plus a one-line description of the change
- **Files explicitly NOT touched** — anything the user might reasonably expect to be touched but should not be (forces an explicit scope check)
- **Rules from `CLAUDE.md` that apply** — name the specific sections (e.g. "§Architectural rules: combat is deterministic, no `UnityEngine.Random`")
- **Scope check** — does anything in this plan touch files outside the current milestone, or violate any item in `CLAUDE.md` §Scope control? If yes, stop and ask.
- **Open questions** — anything ambiguous in the design or plan. List them as numbered questions so the user can answer in line.

**Stop here and wait for the user to confirm the plan.** Do not start implementing until they do.

### Step 4 — Implement

Stay inside the plan. Rules:

- If you discover a needed change mid-implementation, **finish the unit you're on**, then surface the question before continuing. Do not silently expand scope.
- If you hit a contradiction between `GAME_DESIGN.md` and `IMPLEMENTATION_PLAN.md`, stop and ask.
- Follow `CLAUDE.md` §Coding conventions and §Architectural rules strictly.
- One class per file. File name == class name.
- Do not edit `PROGRESS.md` or `REGRESSIONS.md` mid-session — both are touched only in the summary step.

### Step 5 — Self-verify

Before declaring done, walk through each acceptance criterion and explain — pointing at specific files, methods, or behaviors — how the code satisfies it. Format:

```
Acceptance criterion 1: <text>
Satisfied by: <file>:<method> — <one sentence explaining how>

Acceptance criterion 2: ...
```

If a criterion is not fully satisfied, say so explicitly. Do not paper over gaps.

Also verify in writing:

- Project compiles cleanly (no new warnings introduced)
- No `UnityEngine.Random` usage anywhere this slice touches
- No magic numbers in logic files (constants live in `GameRules.cs` once that file exists)
- No out-of-scope features (cross-check `CLAUDE.md` §Scope control)
- No files outside the slice plan were modified

### Step 6 — Produce a manual test plan

Create `TestPlans/TP_<slice-id>.md` with manual Unity Editor test steps. Every step is a checkbox with three fields:

```
- [ ] Step N. <Action — what the user clicks or does>
      Expected: <Specific observable result, including UI or Console state>
      Actual:   <Left blank for the user to fill in>
```

The test plan must contain these sections (omit a section only if it genuinely does not apply, and say why):

- **Happy path** — the slice working as intended, end-to-end
- **Edge cases** — empty inputs, max values, leftmost-slot tiebreaks, turn-limit conditions, and similar
- **Rule checks** — explicit verification of constraints from `CLAUDE.md` and the design doc that this slice is supposed to honor (e.g. "no `UnityEngine.Random`", "panels do not show or hide themselves")
- **Regression checks** — re-run the critical steps from prior slices that this work might have broken. Pull these from earlier `TestPlans/TP_*.md` files.
- **Observable invariants** — 3–6 things that should always be true at runtime in this slice (e.g. "no hero card displays negative HP", "combat log lines are in monotonically increasing order")

### Step 7 — Session summary

End the session with a structured summary in the chat:

```
## Session summary — <slice id>

Files added:
- <path>

Files modified:
- <path> — <one-line reason>

Acceptance criteria:
- [x] Criterion 1
- [x] Criterion 2
- [ ] Criterion 3 — <reason not met>

Deviations from plan:
- <description and why, or "none">

Flagged for follow-up:
- <items to consider for later slices, or "none">

Suggested next slice:
- <slice id and one-line description>

Append the following block to PROGRESS.md (use the template at the top of that file):
<formatted entry>

Update NEXT_SESSION.md so it describes the next slice.
```

The user — not Claude Code — actually pastes the block into `PROGRESS.md`, files any new regressions into `REGRESSIONS.md`, and rewrites `NEXT_SESSION.md`. Claude Code drafts the text; the user commits it.

---

## When to stop and ask

Per `CLAUDE.md` §"How to ask good questions" — ask before doing when:

- The design doc and the implementation plan disagree
- The slice scope is ambiguous
- A "small improvement" would touch files outside the slice
- A hero or enemy effect could reasonably be implemented multiple ways
- The user's request would violate a `CLAUDE.md` §Scope control rule

The correct response to a scope violation is:

> *"Out of scope for MVP per `CLAUDE.md` §Scope control. Skip it, or update the plan first."*

---

## Definition of ready (before starting a slice)

A slice is ready to start when **all** of these are true:

1. It has a slice ID (e.g. `M1.2`)
2. It has a one-sentence goal
3. Files to create or modify are listed in writing (in `NEXT_SESSION.md` or the chat)
4. 2–5 acceptance criteria are written
5. No open 🔴 Blocker regressions in `REGRESSIONS.md` would be invalidated by this work

If any of these are missing, the first task of the session is to define them with the user — not to start coding.

---

## Definition of done (before ending a slice)

A slice is done when **all** of these are true:

1. All files listed in the plan exist and the project compiles cleanly in the Unity Editor
2. All acceptance criteria pass self-verification (step 5)
3. `TestPlans/TP_<slice-id>.md` exists with happy path, edge cases, rule checks, regression checks, and invariants
4. The user has run the test plan and reported results (this may happen in the next session — that is fine, but it must happen before the slice is marked complete in `PROGRESS.md`)
5. The session summary has been drafted, including the `PROGRESS.md` entry and a rewrite of `NEXT_SESSION.md` for the next slice
6. No out-of-scope features were added
7. No files outside the slice plan were modified

**Do not start the next slice in the same session.** Stop, hand off, let the user verify.
