---
description: Pick up exactly where the build stopped (after a usage limit, crash or new machine)
---
Resume the build cheaply. Do not re-read the PRD or other phases.

1. Read `RESUME.md` and the "Current:" line of `PROGRESS.md`. (The session-start hook may already have shown you both — don't read them twice.)
2. Run `git status --short` and `git log --oneline -5`. If there are uncommitted changes, run `git diff --stat` (not the full diff); open only the files you need, by line range.
3. Decide the state:
   - `Status: idle` → there is nothing to recover. Run `/next`.
   - `Status: blocked` → repeat the user action from `RESUME.md` to the user in ≤3 lines and stop.
   - `Status: in-progress` → grep that one step's section from `docs/build/phase-NN.md`, then:
     a. Re-run `Last command` from `RESUME.md` (trimmed) to see the real current state — files on disk are the truth, not the note.
     b. If it passes and the step's "Done when" is met → finish the step (squash, commit, tick, reset `RESUME.md`) as in `/next` step 7.
     c. If it fails → continue fixing from `Next action`, keeping the attempt count from `RESUME.md` (it does not reset because of the break).
     d. If a file is broken beyond repair (e.g. half-written and no longer parses, and the note can't explain it) → copy it to `.claude/state/broken/` for reference, then restore only that file from the last checkpoint with `git restore --source=<last checkpoint> -- <file>`, note it in `RESUME.md`, and redo only the part after that checkpoint. Never use `git reset --hard`, `git checkout -- .` or `git clean` (auto mode blocks them, and they can destroy work). If unattended and the restore is blocked, set `Status: blocked` and explain.
   - A Gate is in progress (`Step: Gate NN`) → re-run `/gate` from the first command that hadn't passed.
4. Save a checkpoint as soon as you've confirmed the state.
5. Carry on with `/next` behaviour for the rest of the phase.

First reply line: "Resuming <step> — <one-line state>". Then work. Final reply ≤3 lines.
