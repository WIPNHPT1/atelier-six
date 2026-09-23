---
description: Save a checkpoint now (use when you're close to your usage limit or about to stop)
---
Save the build state now, using as few tokens as possible. No new work.

1. Overwrite `RESUME.md` (≤20 lines): Status, Step, Step start commit, Attempts on current failure, Last command, Last result (one line), Done so far (≤5 bullets), Next action (≤3 bullets, specific enough that a fresh session can act without re-deriving anything), Updated (`date -u +%FT%TZ`).
2. `git add -A && git commit --no-verify -m "wip(<scope>): <step id> checkpoint"` (skip if nothing changed).
3. Reply with one line: "Checkpoint saved at <hash>. Run /pickup when you're back."
