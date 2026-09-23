---
description: Run the current phase gate and close the phase
---
1. Read the "Current:" line in `PROGRESS.md` (it should name a Gate).
2. Grep the matching `docs/build/phase-NN.md` for `### Gate` and read only that section.
   Write `RESUME.md`: `Status: in-progress`, `Step: Gate NN`, `Step start commit: <HEAD>`.
3. Run every gate command, output trimmed with `2>&1 | tail -n 40`. After each command passes, update `Done so far` in `RESUME.md` so a resumed session skips it.
   If the live site is paused because Netlify's monthly credits ran out, don't block: note `DEPLOY_PENDING` in `PROGRESS.md`, check the build locally with `npm run build && npm run preview`, and carry on (see CLAUDE.md → Limits).
3b. If the gate includes a USER ACTION (a review, a device check, a question) and you're running unattended, finish every automated check first, then set `RESUME.md` to `Status: blocked` with numbered instructions for the user and stop.
4. Any failure → fix using the normal loop (max 3 attempts per failure, add a `LESSONS.md` line for each fix). Re-run the whole gate after fixing.
5. All pass → squash any `wip` checkpoint commits made during the gate (`git reset --soft <Step start commit>`); if the gate section has a `CHANGELOG line:`, append it to `CHANGELOG.md` under `## [Unreleased]` (entries marked "added by the release step" are already in); then commit `chore(release): complete phase NN`, push, tick the gate, set "Current:" to the next phase's first step, reset `RESUME.md` to `Status: idle` (`Next action: new session (⌘N), then /next`).
6. (Skip this step when running unattended — the autopilot scheduled task — and write `?` for windows.) Ask the user one question: "Roughly how many 5-hour usage windows did this phase take? (Count the times you hit the limit, plus one.)" Add a row to the `## Pace log` in `PROGRESS.md`: phase, date, windows. After Gate 3 (and every third gate after), estimate the remaining windows by scaling the average per step to the steps left (heavy steps count 2.5×) and tell the user the expected finish date for the next milestone and for v2.2 in one line.
7. Compact `LESSONS.md` if over 60 lines (merge duplicates).

Reply in ≤5 lines: gate result, what was fixed, then: "Start a new session (⌘N) and type /next." (A fresh session keeps usage low.)
