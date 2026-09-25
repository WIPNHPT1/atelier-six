# Resume state
<!-- Overwrite this file, never append. Keep it under 20 lines. -->
Status: in-progress
Step: 9.6 Visual regression tests
Step start commit: 4e93b7c
Attempts on current failure: 0
Last command: npx playwright test progress a11y smoke
Last result: pass (24/24)
Done so far:
- tests/e2e/visual.spec.ts: 8 routes, motion off + onboardingComplete via seeded localStorage,
  fixed sample progress via seeded IndexedDB (keyval-store/keyval), fixed clock, fonts.ready,
  playhead masked, maxDiffPixelRatio 0.01; skips locally unless VISUAL=1, always runs on CI
- .github/workflows/update-snapshots.yml: manual dispatch, runs --update-snapshots, commits
  baselines back to the branch
- verified locally with VISUAL=1 (all 8 routes seed/render correctly, only fail on missing
  baseline as expected) then deleted the darwin-specific local snapshot dir before committing
Next action:
- squash, commit, push (user approved), then gh workflow run update-snapshots.yml + gh run watch,
  then confirm a normal CI run is green
Updated: 2026-09-25
