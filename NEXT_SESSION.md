# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M20.3 - Implement shared-system re-skin for Run Header + Scout

**Milestone:** M20 - Act expansion foundation
**Slice goal:** Using the Claude-design HTML/JSX reference mockups returned into `Design/M20.2/`, implement the shared visual system for the two highest-priority views - **Run Header / Run Contract** and **Scout** - in Unity uGUI, so both read correctly across a 20-round, multi-act, per-act-identity run, **without changing any game logic**.

### Why this slice exists

M20.1 made Act 2 a real 10-round demonic act, so a 20-round run is playable end to end. M20.2 produced a Claude-design handoff package (`Design/M20.2/DESIGN_BRIEF.md` + `SCREENSHOT_MANIFEST.md`) and escalated Combat into the design set. The four (now five, +Combat) major views were designed for a 10-round single act; the M20.0 checklist made the readability work a **prerequisite gate before bulk Act 2 content**. M20.3 is the first **implementation** slice of that gate, scoped to the two highest-priority views (most affected by run length + per-act identity). The other views (End/Act Transition, Reward Summary, Combat re-skin) follow in M20.4+.

### Precondition (satisfied — verify and read first)

Claude design **has delivered** the full mockup set into `Design/M20.2/mockups/`: `system.css` (single token source), `index.html`, `run-header.html`, `scout.html`, `end-transition.html`, `reward-summary.html`, `combat.html`, `RATIONALE.md`, and `_review/*.png`. These were reviewed in the M20.2 session and verified complete + brief-§2-compliant (no forbidden motion, no box-shadow; the two `repeating-linear-gradient` hatches are decorative-only with flat fallback). **Step 1 of this session: open `Design/M20.2/mockups/index.html`, then read `system.css`, `run-header.html`, `scout.html`, and `RATIONALE.md`** (the "Guild Ledger" shared system + the Run Header / Scout view sections) before planning. Do not invent or deviate from the delivered visual system.

### Confirmed direction (locked in M20.2)

- One shared visual system (type scale, palette, one debt-severity color language, one data-driven per-act identity treatment), expressed as per-view mockups.
- M20.3 implements **Run Header + Scout only**. End/Act Transition, Reward Summary, and the Combat re-skin are M20.4+.
- Combat is a **re-skin to the shared system, not a rebuild** (relevant later; not this slice).
- Per-act identity must be data-driven so Acts 3-5 are content-only (new accent color + theme word), no relayout. The delivered system implements this as the "Act Seal" + a per-act `{roman, theme_word, accent_hex}` data row and a 20-tick runbar (see `system.css` / `RATIONALE.md`).
- **Run Header height 80px -> 120px is LOCKED** (user-accepted): 88px primary + 32px relic strip, fixed-height thin chrome. M20.3 must reclaim ~40px from the panel region below the header (in `MainMenuPanel.cs` screen-region layout) so the header does not overlap the panel content. The 80px-locked variant was explicitly NOT requested.
- Narrow act expansion: no save/load, no campaign meta, no new systems, no new resources/stats/mechanics.

### Scope

**In scope for M20.3:**
- Re-skin `RunHeaderView.cs` to satisfy `DESIGN_BRIEF.md` §4.1 acceptance criteria (run + act position, dominant debt-status tier with shared severity color, theme-swappable per-act identity, defined relic-overflow behavior).
- Re-skin `ScoutPanelView.cs` to satisfy `DESIGN_BRIEF.md` §4.2 acceptance criteria (fight classification dungeon/guild/capstone, encounter position, tactical-problem primacy, capstone relic emphasis, shared act-theme treatment).
- Shared palette / severity-color / theme constants in `GameRules.cs` **only if** they belong on the tuning surface (no logic change).
- `MainMenuPanel.cs` - **required** this slice: reclaim ~40px from the panel region below the header so the locked 120px Run Header does not overlap panel content; plus any view-construction/wiring the re-skin needs. Stay within the screen-region split model; no new state, no panel self-show/hide.
- `TestPlans/TP_M20.3.md` (new manual Unity Editor test plan).

**Not in scope for M20.3:**
- End/Act Transition, Reward Summary, Combat re-skins (M20.4+).
- Any game-logic / encounter / economy / combat-math / state-routing change. This is presentation-only.
- New systems, tweens/animation/particles/VFX/audio, new folders, art beyond placeholder.
- Encounter-pool randomization, guild-evolution balance, late-hire catch-up, Acts 3-5 content - all later M20.x.
- The Rival Leaderboard player-debt-status / shared-color follow-up noted in M20.2 (fold into a later M20.x view slice).

### Definition of ready

- ID: M20.3.
- One-sentence goal: above.
- Files: listed below.
- Acceptance criteria: 5, below (mirroring `IMPLEMENTATION_PLAN.md` §16 M20.3 block).
- No open Blocker regressions in `REGRESSIONS.md` (Open section currently empty).
- **Gating precondition:** SATISFIED - Claude-design mockups present in `Design/M20.2/mockups/` (verified + reviewed in M20.2). Step 1 is to read them, not to wait on them.

### Relevant plan/design sections

- `SESSION_PROTOCOL.md` seven-step session flow (this is a runtime UI slice - full manual Editor test plan required).
- `CLAUDE.md` core tech decisions (uGUI, 1920x1080, mouse-only), §Architectural rules (UIManager owns show/hide; panels presentation-only), §Scope control (Phase 3 carve-outs; no animation/tweens beyond carve-outs).
- `IMPLEMENTATION_PLAN.md` §16: M20.2 outcome subsection + the M20.3 block; M20.0 major-view checklist; M20.1 outcome.
- `Design/M20.2/DESIGN_BRIEF.md` §4.1 (Run Header) and §4.2 (Scout) acceptance criteria; the returned `Design/M20.2/mockups/*` + `RATIONALE.md`.
- `GAME_DESIGN.md` Scout Phase (the tactical-problem intent) and Run Screen sections.
- `PROGRESS.md` latest M20.2 / M20.1 entries; `REGRESSIONS.md` Open section.

### Files Claude Code Should Read

```
SESSION_PROTOCOL.md
CLAUDE.md
REGRESSIONS.md
PROGRESS.md (latest M20.2 / M20.1 entries)
NEXT_SESSION.md
IMPLEMENTATION_PLAN.md (section 16: M20.2 outcome + M20.3 block)
Design/M20.2/DESIGN_BRIEF.md (§4.1, §4.2)
Design/M20.2/mockups/* and RATIONALE.md (the returned Claude-design reference)
GAME_DESIGN.md (Scout Phase, Run Screen)
DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs
DungeonDebt/Assets/Scripts/UI/ScoutPanelView.cs
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs (view construction / wiring context)
DungeonDebt/Assets/Scripts/Core/GameRules.cs (act helpers, debt-status labels)
```

### Files Claude Code Should Create

```
TestPlans/TP_M20.3.md   (manual Unity Editor test plan)
```

### Files Claude Code Should Modify

```
DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs   - shared-system re-skin (presentation only)
DungeonDebt/Assets/Scripts/UI/ScoutPanelView.cs  - shared-system re-skin (presentation only)
DungeonDebt/Assets/Scripts/Core/GameRules.cs     - only if shared visual constants belong here
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs   - REQUIRED: reclaim ~40px below header for the locked 120px bar; + re-skin wiring
IMPLEMENTATION_PLAN.md                           - add M20.3 outcome + ready M20.4 (end-of-session)
NEXT_SESSION.md                                  - rewrite for M20.4 (end-of-session)
```

### Files Claude Code Does NOT Touch

- Other UI views (EndScreenView, RewardSummaryView, CombatPanelView, RivalLeaderboardView, etc.) - M20.4+.
- Any non-UI runtime C# (combat, run, data, encounters, economy) - this is presentation-only.
- `Main.unity`, prefabs, art beyond existing placeholder.
- `PROGRESS.md` / `REGRESSIONS.md` directly unless the user explicitly asks for the end-of-session doc updates.
- `GAME_DESIGN.md`, `CLAUDE.md`, `SESSION_PROTOCOL.md`, `Design/M20.2/DESIGN_BRIEF.md` (read-only reference).
- New top-level folders, `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/`.

### Acceptance criteria

1. `RunHeaderView` communicates both whole-run and act position, makes debt-status tier the dominant element with a shared severity color language, uses a data-driven theme-swappable per-act identity treatment, and has defined relic behavior that never overflows the fixed-height bar at end of a 20-round run. The bar is the locked 120px (88+32); `MainMenuPanel.cs` reclaims the matching ~40px so no panel content is overlapped in any state.
2. `ScoutPanelView` lets the player classify the fight at a glance (dungeon vs. specific rival guild vs. act capstone), shows encounter/act position, gives the tactical problem visual primacy over reward, and emphasizes the relic moment on capstone scouts.
3. Both views use the same shared visual system (type scale, palette, severity colors, act-theme treatment) consistent with the M20.2 mockups; the per-act treatment is parameterized so Acts 3-5 need only data, no relayout.
4. No game logic, encounter, economy, combat, or state-routing behavior changes; a full 20-round run plays identically except for the re-skinned Run Header and Scout; project compiles 0/0.
5. `TestPlans/TP_M20.3.md` exists with happy-path, multi-act/edge (Act 1 vs Act 2, dungeon vs guild vs capstone, Stable->Critical debt, many-relics), and targeted regression checks for the touched views.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
