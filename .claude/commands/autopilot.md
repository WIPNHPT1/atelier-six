---
description: One unattended build run (the autopilot scheduled task uses this; never asks questions)
---
You are running unattended as the "atelier-six-autopilot" scheduled task. Nobody is watching: never ask a question and never wait for input.

1. Read `RESUME.md` and the "Current:" line of `PROGRESS.md` (the session-start hook may already have shown them; don't read them twice).
2. `Status: blocked` → pause this scheduled task if your tools let you (set it to Paused / disabled; otherwise skip), reply `Needs you: <the user action in one line>. Open a new session and type /pickup.` and stop. Do nothing else.
3. Every step and gate in `PROGRESS.md` is ticked → pause this scheduled task, reply `Build complete.` and stop.
4. Otherwise do the work: `Status: in-progress` → follow `.claude/commands/pickup.md`; "Current:" is a Gate → follow `.claude/commands/gate.md`; anything else → follow `.claude/commands/next.md`.
5. If the work needs the user (anything marked USER ACTION, a review, a device check, a decision, an account, a password, or a permission you don't have): finish every automated part first, then set `RESUME.md` to `Status: blocked` with numbered, plain-English, click-by-click instructions, save a checkpoint, pause this scheduled task (if you can), and stop.
6. When a phase gate passes, stop. The next run starts the next phase in a fresh session, which keeps usage low. Skip the pace-log question (write `?` for windows).
7. Never use `git reset --hard`, `git checkout -- .`, `git clean`, force pushes or `sudo`.

Final reply, at most 3 lines: what got done, the last commit hash, and whether the user is needed.
