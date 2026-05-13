# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M0.1 — Project skeleton

**Milestone:** M0 — Project setup (preparation for M1)
**Slice goal:** Get a clean Unity 6.4 project on disk with the folder structure, scene, and player settings required by `CLAUDE.md` and `IMPLEMENTATION_PLAN.md` §2. **No game code yet.**

This slice has two phases:

- **Phase A (manual, you)** — create the Unity project in Unity Hub and apply settings that need the Editor UI. Claude Code cannot do this part.
- **Phase B (Claude Code)** — folder structure, `.gitignore`, `TestPlans/`, and verification.

Complete Phase A before starting a Claude Code session. Then start the session and Claude Code does Phase B.

### Acceptance criteria (whole slice)

1. A Unity 6.4 project exists on disk, created from the Universal 2D template, with the scene `Assets/Scenes/Main.unity` containing a Canvas (1920×1080 reference, match 0.5) and an EventSystem.
2. Player Settings target Windows Standalone at default resolution 1920×1080.
3. URP is active (the Graphics settings SRP asset field is populated by a `UniversalRenderPipelineAsset`).
4. The folder tree under `Assets/` matches `CLAUDE.md` §"Folder structure (target)" — `Scripts/Core`, `Scripts/Data`, `Scripts/Run`, `Scripts/Combat`, `Scripts/UI`, `Prefabs`, `Art` — all empty (each holds only a `.gitkeep`).
5. `TestPlans/` exists at the repo root.
6. A Unity-appropriate `.gitignore` exists at the repo root.
7. Reopening Unity after Phase B shows zero errors and zero warnings in the Console; the project compiles cleanly (there is no code yet, so this should be trivial).
8. `TestPlans/TP_M0.1.md` exists and covers the steps in the Test plan section below.

### Definition of done

See `SESSION_PROTOCOL.md` §"Definition of done". Specific to this slice: the slice is only done after the user reopens Unity, confirms a clean Console, and commits the Phase B result with the git command at the end of this file.

---

## Phase A — manual setup in Unity Hub and Editor (you)

Claude should assume Phase A has been completed by the developer.

Do these in order. Each step lists what to click and what "done" looks like. Unity 6 changed several Editor UI labels and panels compared to 2022; the steps below call those differences out.

### A1. Install Unity 6.4

1. Open **Unity Hub**.
2. Go to **Installs** → **Install Editor**.
3. Pick a **Unity 6.4** version (`6000.4.x`). Any patch is fine; latest is preferred.
4. In the modules list, check **Windows Build Support (IL2CPP)** and **Windows Build Support (Mono)**. Uncheck WebGL, Android, iOS, Mac, Linux — you don't need them.
5. Click **Install**.

**Done when:** the Unity 6.4 version appears under Installs with no spinner.

### A2. Create the project

1. In Unity Hub, go to **Projects** → **New project**.
2. Editor version: the Unity 6.4 you just installed.
3. Template: **Universal 2D** (the 2D URP template). In Unity 6's project creation window the template picker is laid out as a left-side category list with a grid of templates on the right — Universal 2D is in the Core (or 2D) section. If you only see 3D and "Built-In Render Pipeline" entries, make sure you've expanded the **Core** templates group.
4. Project name: `DungeonDebt`.
5. Location: wherever you want the repo to live. The folder Unity creates **is** your repo root.
6. Click **Create project**. Wait for Unity to finish the initial import (1–3 minutes).

**Done when:** the Editor opens to a `SampleScene` in `Assets/Scenes/`.

### A3. Rename the default scene

1. In the **Project** window, navigate to `Assets/Scenes/`.
2. Right-click `SampleScene` → **Rename** → `Main`.
3. Double-click `Main` to make sure it opens (it should already be open).
4. **File → Save** (Ctrl+S).

**Done when:** `Assets/Scenes/Main.unity` exists and is the active scene. There should be no `SampleScene.unity` left.

### A4. Add a Canvas and EventSystem

1. In the **Hierarchy** window, right-click empty space → **UI → Canvas**. This creates a `Canvas` GameObject and also adds an `EventSystem` automatically.
2. Select the `Canvas` in the Hierarchy.
3. In the **Inspector**, find the **Canvas Scaler** component:
   - **UI Scale Mode:** `Scale With Screen Size`
   - **Reference Resolution:** X = `1920`, Y = `1080`
   - **Screen Match Mode:** `Match Width Or Height`
   - **Match:** `0.5`
4. Select the `EventSystem` GameObject in the Hierarchy. In Unity 6, the EventSystem may be auto-created with an `InputSystemUIInputModule` component instead of the legacy `StandaloneInputModule` — that is fine and **expected**. Leave it as-is. The project's user-facing input rule ("uGUI button onClick only, no Input System Action assets") is unaffected; Unity 6 just uses the new Input System under the hood to drive uGUI events.
5. If for some reason no EventSystem exists at the root of the Hierarchy, right-click in Hierarchy → **UI → Event System** to add one.
6. **File → Save** (Ctrl+S).

**Done when:** the Hierarchy contains exactly `Canvas` and `EventSystem` as top-level objects, and the Canvas Scaler shows 1920×1080 / 0.5.

### A5. Set Player Settings for Windows Standalone, 1920×1080

In Unity 6, the **Build Settings** window has been replaced by **Build Profiles**. The steps below cover both layouts; the buttons may be labelled slightly differently but the destination is the same.

1. **File → Build Profiles** (Unity 6) or **File → Build Settings** (older terminology — same window).
2. In the platform list on the left, select **Windows** (it may be labelled "Windows, Mac, Linux"). If a Windows profile is not yet present, click **Add Build Profile** or **+** and pick Windows.
3. Confirm **Target Platform** is `Windows` and **Architecture** is `x86_64`.
4. Click **Switch Platform** if it's not already the active platform. Wait for the reimport.
5. Click **Player Settings...** (in Unity 6 this may be under a **Player Settings** tab inside the Build Profile, or via a button at the bottom of the panel — either is fine).
6. In Player Settings, expand the **Resolution and Presentation** section:
   - **Fullscreen Mode:** `Windowed`
   - **Default Screen Width:** `1920`
   - **Default Screen Height:** `1080`
   - **Resizable Window:** unchecked (optional, but cleaner for a fixed-resolution prototype)
7. Expand **Other Settings**:
   - **Color Space:** `Linear` (URP default — leave it)
8. Close Player Settings. Close Build Profiles / Build Settings.

**Done when:** Build Profiles (or Build Settings) shows Windows as the active platform (Unity icon next to it), and Player Settings shows 1920×1080 defaults.

### A6. Set the Game view aspect ratio

1. Open the **Game** view tab (next to the Scene tab by default).
2. At the top of the Game view, click the aspect-ratio dropdown (usually says `Free Aspect`).
3. If `1920x1080` exists in the list, pick it. If not:
   - Click the **+** at the bottom of the dropdown.
   - **Type:** `Fixed Resolution`
   - **Width:** `1920`, **Height:** `1080`
   - **Label:** `1080p`
   - Click **OK** and select it.

**Done when:** Game view shows a black 16:9 viewport at 1920×1080 with the Canvas's white area visible (or just black if the Canvas has no children — that's fine).

### A7. Verify URP is active

URP is set up automatically by the Universal 2D template, but confirm:

1. **Edit → Project Settings → Graphics**.
2. **Scriptable Render Pipeline Settings** (in Unity 6 this may be split into a default SRP asset slot plus per-quality overrides under the **Quality** settings) should be populated with a `UniversalRenderPipelineAsset`.
3. If the field is empty, the template didn't apply — close the project and re-create using the **Universal 2D** template specifically (not 3D, not Built-in).

**Done when:** the SRP asset field is populated with a `UniversalRenderPipelineAsset`.

### A8. Close Unity before starting Claude Code

Save everything (Ctrl+S), then **close the Unity Editor**. Claude Code will create folders and a `.gitignore`; Unity sometimes locks files or regenerates `.meta` files at inconvenient moments. Closing it avoids race conditions.

**Done when:** Unity Editor is closed. Unity Hub can stay open.

### A9. (Optional but recommended) Initialize git

In your terminal, from the project root:

```
git init
git add -A
git commit -m "Initial Unity project from 2D URP template"
```

This gives you a clean baseline commit *before* Claude Code touches anything. If Phase B goes sideways, you can `git reset --hard` and try again. Note: `.gitignore` does not exist yet, so this first commit will include `Library/` and other generated folders — that's fine for a baseline; the next commit (after Phase B) will exclude them.

**Done when:** `git log` shows one commit.

---

## Phase A checklist (paste back to confirm you're ready)

- [ ] A1 — Unity 6.4 (`6000.4.x`) installed with Windows Build Support (IL2CPP + Mono)
- [ ] A2 — Project created from **Universal 2D** template, named `DungeonDebt`
- [ ] A3 — `SampleScene` renamed to `Main`
- [ ] A4 — Canvas (1920×1080, match 0.5) + EventSystem in scene (EventSystem may use `InputSystemUIInputModule` — fine)
- [ ] A5 — Windows Standalone active, Player Settings 1920×1080
- [ ] A6 — Game view set to 1920×1080 fixed
- [ ] A7 — URP SRP asset populated in Graphics settings
- [ ] A8 — Unity Editor closed
- [ ] A9 — (optional) baseline git commit

---

## Phase B — Claude Code session

Once Phase A is done, drop these files into the repo root if they aren't already there:

- `GAME_DESIGN.md`, `IMPLEMENTATION_PLAN.md`, `CLAUDE.md` (already present)
- `SESSION_PROTOCOL.md`, `NEXT_SESSION.md` (this file), `PROGRESS.md`, `REGRESSIONS.md`
- Apply the changes from `CLAUDE_ADDENDUM.md` to `CLAUDE.md`, then delete `CLAUDE_ADDENDUM.md`

Open Claude Code in the project root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`, Phase B. Phase A is already complete — the Unity project exists, the scene and Canvas are set up. Start with step 1 (Orient) and wait for my confirmation before planning.

### Files Claude Code creates in Phase B

```
Assets/Scripts/Core/.gitkeep
Assets/Scripts/Data/.gitkeep
Assets/Scripts/Run/.gitkeep
Assets/Scripts/Combat/.gitkeep
Assets/Scripts/UI/.gitkeep
Assets/Prefabs/.gitkeep
Assets/Art/.gitkeep
TestPlans/.gitkeep
.gitignore                            (standard Unity gitignore)
TestPlans/TP_M0.1.md                  (manual test plan — see below)
```

### Files Claude Code does NOT create in Phase B

- Any `.cs` script — first code lands in the M1 milestone's opening slice
- Any prefab — those come with their respective milestones
- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/` folders — forbidden per `CLAUDE.md`
- The `.unity` scene — already exists from Phase A

### Phase B acceptance criteria

1. All folders listed above exist under `Assets/`, each containing a `.gitkeep`.
2. `TestPlans/` exists at repo root and contains `.gitkeep` plus `TP_M0.1.md`.
3. `.gitignore` exists at the repo root and excludes at minimum: `Library/`, `Temp/`, `Obj/`, `Build/`, `Builds/`, `Logs/`, `MemoryCaptures/`, `UserSettings/`, `*.csproj`, `*.sln`, `*.suo`, `*.user`, `*.userprefs`, `*.unityproj`, `*.booproj`, `*.pidb`, `.vs/`, `.vsconfig`, `*.apk`, `*.aab`, `*.unitypackage`.
4. Reopening Unity after Phase B shows no new errors and no new warnings in the Console.
5. The project compiles with zero warnings and zero errors (trivially — there is no code yet).

### Test plan output

Claude Code creates `TestPlans/TP_M0.1.md` covering at minimum:

- **Happy path:** Reopen Unity → Console is empty (no errors, no warnings) → Project window shows all the new subfolders under `Assets/Scripts/`, `Assets/Prefabs/`, `Assets/Art/`.
- **Rule checks:** No `Assets/Tests/`, no `Assets/Editor/`, no `Assets/Resources/`, no `Assets/StreamingAssets/`. No `.cs` files anywhere. `Assets/Scenes/Main.unity` still opens with Canvas + EventSystem intact.
- **Regression checks:** Game view still shows the 1920×1080 viewport from A6. URP SRP asset still populated from A7.
- **Observable invariants:** Hierarchy of `Main.unity` is exactly `Canvas` + `EventSystem` at the root; nothing else. `git status` from the project root shows the new files and respects `.gitignore` (no `Library/`, no `Temp/`, etc., listed as untracked).

Each step in the test plan must follow the checkbox format from `SESSION_PROTOCOL.md` step 6: `Action`, `Expected`, `Actual`.

### After Phase B (post-slice commit)

Once Claude Code has handed off and you have run the test plan, commit the result:

```
git add -A
git commit -m "M0.1: folder skeleton and gitignore"
```

Then rewrite this file (`NEXT_SESSION.md`) to describe the next slice. Per `IMPLEMENTATION_PLAN.md` §11 the next milestone is **M1 — Combat Sandbox**; the first slice of M1 will set up the plain-C# data classes used by combat (no `MonoBehaviour`s, no UI, no combat logic yet — just the shapes listed in `IMPLEMENTATION_PLAN.md` §2 and §4 under the `Data/` folder). Define a slice ID, a one-sentence goal, the files to create, and 2–5 acceptance criteria before pasting `NEXT_SESSION.md` into a new Claude Code session.
