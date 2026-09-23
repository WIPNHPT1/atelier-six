---
description: Do the next build step (or the rest of the current phase)
argument-hint: "[one]"
---
Do the next build step, following "The loop" and "Checkpoints" in CLAUDE.md exactly.

0. If this folder isn't a Git repository yet, or has no `origin` remote, or `node --version` isn't v24 or newer, follow `.claude/commands/setup.md` first, then carry on.
0b. Read `RESUME.md`. If `Status: in-progress` or `blocked`, don't start anything new: follow `/pickup` instead.
1. Read `PROGRESS.md`; take the step on the "Current:" line.
2. Read `LESSONS.md`.
3. Grep `docs/build/phase-NN.md` for the heading `### <step id>` and read only that section (Grep with -A 40, stop at the next `### `).
4. Start the step: write `RESUME.md` with `Status: in-progress`, the step id, `Step start commit: <git rev-parse --short HEAD>` (write `none` if the repo has no commits yet — then skip checkpoint commits for this step and just keep `RESUME.md` updated), and the planned first action.
5. Implement in small pieces. After each piece that works (a file finished, a test passing), save a checkpoint (see CLAUDE.md → Checkpoints).
6. Verify (output trimmed with `2>&1 | tail -n 40`), fix up to 3 times, log a lesson if a fix was needed. Keep `Attempts on current failure` and `Last command/result` in `RESUME.md` up to date.
7. Finish the step: squash checkpoints (`git reset --soft <step start commit>`), make the real Conventional Commit, tick the step, set "Current:" to the next item, reset `RESUME.md` to `Status: idle` with `Next action: Run /next` (or `/gate`), and `rm -f .claude/state/touched.txt` — all in that one commit.
8. If the step says USER ACTION, set `RESUME.md` to `Status: blocked` with the exact thing the user must do, save a checkpoint, and tell the user in ≤5 lines. When the user replies, continue the step and finish it as in 7.
9. If the next item is a Gate, stop and say: "Phase steps done. Run /gate." Otherwise continue with the next step in the same phase, unless $ARGUMENTS is "one".

Reply with at most 3 lines: steps done, last commit hash, anything the user must do.
