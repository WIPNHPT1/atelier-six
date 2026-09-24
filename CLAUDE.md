# Atelier Six — Claude Code rules

Guitar learning PWA. Product spec: `PRD.md` (read a section only when a step points to it).
Stack: Vite + React + TypeScript (strict), Vitest, Playwright, Tone.js, Motion, Canvas 2D. Later: Basic Pitch/TF.js (v1.2), Supabase (v2.0), alphaTab (v2.0), MediaPipe (v2.1), Capacitor (v2.2). Deploy: Netlify via GitHub.
Scope: v1.0 → v2.2 in Phases 0–24 (`PROGRESS.md`). Each milestone ends with a tagged release.

## Talking to the user
The user is not technical, works on a Mac, and uses Claude Code in the **Claude desktop app (Code tab)**, not Terminal. Never ask them to open Terminal or type shell commands: run commands yourself. Whenever you need them to do something: give numbered, click-by-click steps; say where each thing happens (the Claude app, which website, which app, Finder); give exact text to paste; explain any error in one plain sentence before asking anything. Never assume they know git, npm or folder paths. Only if a command truly can't run from your tools (it needs a keyboard prompt), ask them to open the app's built-in terminal pane (**Views → Terminal**, or Control + `) and give the one line to paste. They have `MAC-GUIDE.html` (Part 7 covers every user action) — point to the Part when useful.

## The Claude app
- New phase = new session: the user presses ⌘N. Tell them that instead of `/clear`.
- Sandbox is on for this project. If a command fails with "Operation not permitted" because it writes outside the project (e.g. `.git/config`, `~/.gitconfig`, gh sign-in, the keychain), rerun just that command outside the sandbox; don't widen the sandbox settings.
- The Browser pane preview (`.claude/launch.json`) is for the user to look at the app. Don't use it to check your own work (it costs tokens); use the step's Verify commands. Start the preview only when the user asks to see the app or a USER ACTION needs them to look.

## The loop (every session)
1. Read `PROGRESS.md` → the step on the "Current:" line.
2. Read `LESSONS.md` (short). Apply any lesson matching the area you're touching.
3. Read ONLY that step's section (`### <id>`) in `docs/build/phase-NN.md` via Grep. Do not read other steps or phases.
4. Implement the smallest change that meets "Done when".
5. Run the step's Verify command(s). Always trim output: `2>&1 | tail -n 40`.
6. Pass → commit (Conventional Commits, e.g. `feat(engine): add move classifier`), tick the step in `PROGRESS.md`, go to next step.
7. Fail → fix and re-verify. Max 3 attempts per failure.
   - Fixed after ≥1 failed attempt → add ONE line to `LESSONS.md`.
   - Still failing after 3 → mark step `BLOCKED: <reason>` in `PROGRESS.md`, stop, ask the user.
8. End of phase → run the phase gate, tick the phase, then tell the user to start a new session (⌘N) before the next phase.

## Checkpoints (usage limits WILL interrupt the build)
- `RESUME.md` is the single source of truth for an unfinished step. Overwrite it (≤20 lines), never append.
- Save a checkpoint after every piece of work that runs (a file finished, a test passing), before any command expected to take > 1 minute (e2e, build, model download), and whenever the user runs `/checkpoint`: update `RESUME.md`, then `git add -A && git commit --no-verify -m "wip(<scope>): <step id> checkpoint"`.
- `Next action` must be specific enough for a fresh session to act without re-reading anything else.
- When a step is done, squash its checkpoints: `git reset --soft <Step start commit>`, then the real commit (hooks on).
- `wip` commits stay local; never push them. Pushes happen only at gates, after squashing.
- On a new session, the session-start hook shows the build status. If `Status` isn't `idle`, follow `/pickup`.

## Unattended runs
- The autopilot scheduled task runs `.claude/commands/autopilot.md`. When running unattended, never ask questions or wait for input: finish what you can, then set `RESUME.md` to `Status: blocked` with plain-English instructions and stop.
- Never use `git reset --hard`, `git checkout -- .`, `git clean`, force pushes or `sudo`. Restore single files with `git restore --source=<commit> -- <file>`.

## Limits
- Netlify credits run out → the live site pauses until next month. Keep building; mark `DEPLOY_PENDING` in `PROGRESS.md`, verify with `npm run preview`; the next push after the reset deploys everything.
- Supabase free project paused (after a week without use) → tell the user to press Restore in the Supabase dashboard; the app itself keeps working offline.

## Token rules
- Never read: `node_modules/`, `dist/`, `package-lock.json`, `coverage/`, `playwright-report/`, `*.svg` assets, generated data, `MAC-GUIDE.*`, `DRIVE-AND-AUTOPILOT.*`, `WALKTHROUGH.*` and `START-HERE.md` (those are for the user).
- Read files by line range when you only need part. Use Grep before Read.
- Edit, don't rewrite whole files. Don't re-read a file you just wrote.
- No narration between tool calls. Summaries at phase end only: ≤5 lines.
- Run only the tests for what changed (`npx vitest run <path>`); full suite at phase gates.
- Generate bulk data (chord tables) with a script, not by hand in chat.

## Code rules
- Pure logic lives in `src/core/` with zero DOM/audio imports and full unit tests.
- Components in `src/ui/`, audio in `src/audio/`, features in `src/features/<name>/`.
- Design tokens only from `src/styles/tokens.css`; no raw hex in components.
- Every animation respects `prefers-reduced-motion` and the in-app motion toggle.
- No song tabs or lyrics in the repo. Techniques, shapes and generic progressions only.
- No artist or song names anywhere in the app, its name, icon, store title/keywords, README or store listings — decided in Gate 7 (reversing an earlier "listening references" allowance). Modules are described by genre only (e.g. "Britpop", "Grunge-melodic lead"), never by artist.
- All user-facing wording lives in `src/content/copy.en-GB.ts`; no raw text in components.
- All musical content follows PRD §20: built from the module's style sheet, humanised on playback, and passing `checkPlayable`, `checkHarmony`, `checkBars` and `lintAgainstStyle` (`npm run lint:style`). Never hand-write music that skips these.
- Accessibility: all controls keyboard-reachable, labelled, 4.5:1 contrast.
- Network: only `src/net/` may call the network, only after user opt-in; add exact hosts to CSP `connect-src`. Never commit secrets; client uses only `VITE_` env vars (public anon key). Never use a service-role key in the app.
- Heavy work (ML, beat tracking) runs in `src/workers/`, lazy-loaded; the entry bundle stays ≤ 200 KB gzip.
- ML models are self-hosted in `public/models/` and never read in chat. No LLM or AI-coach features.
- Every milestone keeps earlier features working: gates run the full e2e suite.

## Slash commands
`/setup` one-time Mac setup · `/next` do steps · `/next one` do one step · `/gate` close a phase · `/pickup` pick up after an interruption · `/checkpoint` save now · `/fix <bug>` fix + record lesson · `/progress` cheap summary · `/autopilot` one unattended run (used by the scheduled task).

## npm scripts
`npm run verify` = lint + typecheck + unit tests (quiet). `npm run e2e` = Playwright (phase gates only). `npm run build` = production build.
