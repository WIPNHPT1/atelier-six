# Phase 22 — v2.0: Polish, docs and release
Aim: make v2.0 fast, accessible and well explained, then ship it. PRD refs: §12, §13, §18.

### 22.1 Performance + accessibility pass
Do:
- Re-run budgets: entry JS ≤ 200 KB; studio, jam, alphaTab, Supabase, tfjs and band audio all in lazy chunks (list chunk sizes in `PROGRESS.md` as `CHUNKS=`).
- Lighthouse CI: add `/studio` and `/jam` to `lighthouserc.json` (desktop preset for these two, same thresholds).
- Axe on every new route; keyboard-only walkthrough of studio mixer and arrangement editor (Playwright test tabbing through with visible focus).
- Memory: recording 5 minutes must not grow the JS heap beyond +150 MB (Playwright `performance.memory` check on Chromium; record `REC_MB=`).
Verify: `npm run size 2>&1 | tail -n 10 && npx lhci autorun 2>&1 | tail -n 20 && npx playwright test a11y 2>&1 | tail -n 10`
Done when: all pass.

### 22.2 Docs, ADRs, demo
Do:
- README: new sections "Sync (optional, private)", "Studio", "Style morph", "Jam mode"; updated architecture diagram (add workers, `src/net`, Supabase); updated quality numbers.
- `docs/architecture.md`: sync design (outbox, merge rules, counters), studio data flow, jam pipeline (capture → worker → band).
- ADRs: `0012-supabase-offline-first-sync.md`, `0013-per-device-counters.md`, `0014-own-midi-musicxml-writers-alphatab-for-gp.md`, `0015-rule-based-band-follower.md`.
- Demo mode: add an 8-second v2.0 segment (style morph on the bar → jam section change); total ≤ 40 s; update `demo.spec.ts`.
- STOP (USER ACTION): re-record the demo GIF as in 10.2 and say done.
Verify: `npm run check:links 2>&1 | tail -n 5 && npx playwright test demo 2>&1 | tail -n 10`
Done when: passing; GIF committed.

### 22.3 Release v2.0.0
Do: as 10.4 with `2.0.0` — changelog section, `npm version 2.0.0`, push tags, GitHub release with highlights (sync, studio, exports, morph, jam) and an "Upgrading" note (existing local progress is kept; sign-in optional).
Verify: `git tag --list v2.0.0`
Done when: release exists; CI green on the tag.

### Gate 22
Run: `npm run verify`, `npm run e2e`, `npm run build`, `npm run size`, `npx lhci autorun`; CI `db` job green. Reply with the live URL, v2.0 numbers, and: "v2.0 is live. Start a new session (⌘N) and type /next to start v2.x (Phase 23: camera finger check)."
