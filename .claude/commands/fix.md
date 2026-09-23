---
description: Fix a bug the user reports, and record the lesson
argument-hint: "<what is wrong>"
---
The user reports: $ARGUMENTS

1. Read `LESSONS.md`. If a lesson already covers this, apply it first.
2. Reproduce with the smallest check: a failing unit test if the bug is in logic, else a Playwright check or a command. Write the test before the fix.
3. Grep for the cause; read only the lines needed. Fix it.
4. Run the new test plus `npm run verify 2>&1 | tail -n 40`.
5. Add one line to `LESSONS.md`: `- [area] symptom → cause → fix (step)`.
6. Commit `fix(<area>): <summary>`. If interrupted before this, `RESUME.md` must say `Step: fix — <bug>` with the next action.

Reply in ≤3 lines.
