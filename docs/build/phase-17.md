# Phase 17 — v1.2: Chord auto-advance, mic-based adaptive tempo, release
Aim: practise without touching anything — the app moves on when you play the chord and adjusts tempo from how you played. PRD refs: §17.2, §17.3.

### 17.1 Chord auto-advance
Do:
- Extend the Phase 7.3 `autoAdvanceMachine` to accept chord results: advance when `matchShape.score ≥ DETECT.advance (0.8)` for 300 ms; root-note mode remains as the "Simple" option.
- Lesson "Listen" toggle now offers Chord / Root note. Live strip under the fretboard: six small string lights (lit = sounding, dim = muffled, off = missing) and a calm line of feedback ("5th string not sounding — check finger 3 isn't touching it").
- Time per change → progress `transition_stats.lastMs` (feeds heatmap and planner).
- `tests/e2e/listen.spec.ts`: using Chromium's fake audio device with `--use-file-for-fake-audio-capture=tests/fixtures/c-major.wav` (a short WAV rendered by the 16.4 renderer and committed, < 200 KB), open an open-chord lesson whose next chord is C → enable Listen (Chord) → the lesson advances within 3 s.
Verify: `npx vitest run src/core 2>&1 | tail -n 10 && npx playwright test listen 2>&1 | tail -n 15`
Done when: passing.

### 17.2 Onset + timing analysis
Do:
- Pure `src/core/dsp/onsets.ts`: `detectOnsets(fluxSeries, hopSec, {threshold, minGapMs}) → seconds[]` (adaptive median threshold, peak picking).
- Pure `src/core/practice/barResult.ts`: `scoreBar({ onsets, grid, matches, latencyMs }) → { match, meanTimingMs, early, late, muffled, clean }` using PRD §17.3 thresholds. Compensates for measured round-trip latency.
- Latency calibration in Settings → Listening: play 8 clicks, user strums muted strings on each; median offset stored (pure `calibrateLatency(clicks, onsets)` tested).
- Tests: synthetic flux series with known onsets; early/late classification; latency compensation.
Verify: `npx vitest run src/core 2>&1 | tail -n 15`
Done when: passing, 100% coverage.

### 17.3 Mic-based adaptive tempo
Do:
- In lessons and drills with Listen on, each bar produces a `barResult`; after each loop, `nextTempo` (6.4) is fed `clean`/`missed` automatically. Manual Clean/Missed still overrides the last result.
- Headphone check on first use ("Are you on headphones?"). If not, the app ducks playback by 12 dB during listening bars and uses a longer detection window.
- Per-loop summary chip: "Clean · +12 ms late on average" / "Missed · 2nd string muffled". The **resonance ripple** fires on clean bars automatically.
- Progress: new "Timing" sparkline per lesson; heatmap uses detected misses when available.
- One-minute changes drill counts changes automatically when Listen is on.
- `tests/e2e/adaptive.spec.ts`: with the fake audio file of a clean C loop, the tempo increases by 4 bpm after two loops.
Verify: `npx playwright test adaptive 2>&1 | tail -n 15`
Done when: passing. Ask the user in one line to try a lesson with Listen on and say whether the Clean/Missed calls feel fair.

### 17.4 Docs + v1.2.0 release
Do:
- README: "The app listens" section with a short explanation, accuracy numbers from `docs/detection.md`, and privacy note (on-device).
- ADRs: `0010-verification-not-recognition.md`, `0011-basic-pitch-with-chroma-fallback.md`.
- Demo mode: add a 4-second listen segment using the fixture WAV (keep the tour ≤ 32 s).
- Release `v1.2.0` as in 10.4 (changelog section, adding `- Chord auto-advance with per-string feedback, onset timing analysis and mic-based adaptive tempo.` to it, `npm version 1.2.0`, push tags, GitHub release).
Verify: `npm run check:links 2>&1 | tail -n 5 && git tag --list v1.2.0`
Done when: release exists; CI green on the tag.

### Gate 17
Run: `npm run verify`, `npm run e2e`, `npm run build`, `npm run size`, `npx lhci autorun`. Update recorded numbers in `PROGRESS.md` (add `DETECT_ACC=<n>%`). Reply with the live URL and: "v1.2 is live. Start a new session (⌘N) and type /next to start v2.0 (Phase 18: accounts and sync)." Then ask the user to run the matching rows of `docs/device-checklist.md` on their own devices (USER ACTION, ≈ 10 minutes) and record the results in `PROGRESS.md`; fix any failure before closing the gate.
