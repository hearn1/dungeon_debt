# M20.2 — Screenshot Manifest

Current-state screenshots live in the repo's **`Design/Inputs/`** folder (sibling of `Design/M20.2/`). They give Claude design the *current* look so it can see what it is redesigning; `DESIGN_BRIEF.md` defines the target. Capture from the Unity Editor **Play mode** with the Windows Snipping Tool — capture the **whole game window** unless a row says "tight crop." Pixel-exactness is not needed.

## Already captured (baseline, single shot per panel)

These exist in `Design/Inputs/` and serve as the **Act 1 / current-look baseline**:

| File | Covers |
|------|--------|
| `scout.PNG` | Scout view (baseline) |
| `combat.PNG` | Combat view (baseline) |
| `shop.PNG` | Shop (LOW priority — context only) |
| `formation.PNG` | Formation (LOW — context only) |
| `payroll.PNG` | Payroll (LOW — context only) |
| `relic.PNG` | Relic Reward (LOW — context only) |
| `mainMenu.PNG` | Main Menu (LOW — context only) |

The redesign targets five views: **Run Header, Scout, End/Act Transition, Reward Summary, Combat**. The baseline above covers Scout and Combat for Act 1 only. The captures below are the ones that actually exercise the **20-round / multi-act / capstone** problem the redesign solves — these are what matter most.

## Still needed (the multi-act / state variants that drive the redesign)

Save into `Design/Inputs/` with these exact names. Whole-window unless noted.

| File | View | State / how to reach | Why it matters |
|------|------|----------------------|----------------|
| `header-stable.PNG` | Run Header | Tight crop of the top bar, any early Act 1 round | Baseline header: low/Stable debt, no relics, difficulty preset showing |
| `header-critical.PNG` | Run Header | Top-bar tight crop after taking a Loan / a loss or two | Debt in **Dangerous/Critical** tier — the severity-color problem |
| `header-act2-relics.PNG` | Run Header | Top-bar tight crop, any Act 2 round (11+) | Act 2 + at least one **relic earned** — act-identity + relic-overflow problem |
| `scout-act2.PNG` | Scout | `Scout`, round 11 | Act 2 **demonic dungeon** — per-act theme problem |
| `scout-guild.PNG` | Scout | `Scout`, a rival-guild round (e.g. 3 or 13) | **Rival-guild** fight vs. dungeon — classification problem |
| `scout-capstone.PNG` | Scout | `Scout`, round 10 or 20 | **Final Boss capstone** (relic-awarding) — capstone emphasis problem |
| `combat-act2.PNG` | Combat | `Combat`, round 11+ (capture a frame with status indicators if possible) | Act 2 demonic enemies + status density |
| `combat-capstone.PNG` | Combat | `Combat`, round 20 | Act 2 Final Boss fight |
| `reward-normal.PNG` | Reward Summary | `Reward`, an early plain round | Baseline reward wall |
| `reward-busy.PNG` | Reward Summary | `Reward`, a round with a non-standard payroll action (+ a hero tier-up if possible) | Worst-case dense summary (payroll + veterancy + high-debt warning) |
| `reward-capstone.PNG` | Reward Summary | `Reward`, after a round-10 or round-20 capstone win | Relic-earned / act-clear reward — the big moment |
| `end-act-clear.PNG` | End / Act Transition | After winning **round 10** | Act-clear handoff ("Act 1 Clear → Continue to Act 2") |
| `end-victory.PNG` | End / Act Transition | After winning **round 20** | Final victory (run won) |
| `end-defeat.PNG` | End / Act Transition | Any loss (debt 20 / morale 0 / final boss loss) | Defeat screen with end reason |

Combat is deterministic, so encounters are stable — play (or use the usual debug start) to reach Act 2 / late rounds. For high/critical-debt shots, take a payroll **Loan** and/or lose a couple of fights to push Debt up; the goal is just to capture the Dangerous/Critical visuals.

If any state is impractical to reach, capture what you can and note the gap — the **Act 2, capstone, high-debt, and End-screen** rows matter most because those are the multi-act cases the redesign targets. The existing `scout.PNG` / `combat.PNG` already cover the Act 1 baseline.
