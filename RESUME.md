# Resume state
<!-- Overwrite this file, never append. Keep it under 20 lines. -->
Status: blocked
Step: 10.2 Demo mode (USER ACTION: record GIF)
Step start commit: a9d462a
Done so far: demo mode built (src/features/demo, AppShell hook, tuner demo needle); tests/e2e/demo.spec.ts passes (desktop+mobile chromium)
Blocked on: user records https://ateliersix.netlify.app/?demo=1 as docs/demo.gif (demo code pushed to main).
User steps: open URL in a 1280×800 window, click "Start the tour", record with Cmd+Shift+5, convert at ezgif.com (≤8 MB, 960 px wide), save into the project's docs folder as demo.gif (replace the placeholder), reply "done".
Next action: when user says done: check docs/demo.gif exists, < 8 MB, > 1 KB (placeholder is 43 bytes); commit `docs(docs): add demo GIF` with 10.2 ticked, Current: 10.3, RESUME idle.
Attempts on current failure: 0
Last command/result: npx playwright test demo → 2 passed, 4 skipped (non-chromium)
Updated: 2026-09-26
