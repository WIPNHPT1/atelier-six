# Phase 5 — Audio
Aim: tight, pleasant playback of any progression with any rhythm, a sample-accurate metronome, and a playhead in sync with the tab. PRD refs: §8.
Rule: all timing maths is pure and tested in `src/core/schedule/`; `src/audio/` only plays event lists. Tone.js is lazy-loaded (`await import('tone')`) on the first Play press.

### 5.1 Pure scheduler
Do: `buildSchedule({ shapes, rhythm, bpm, bars, tuning, capo, countIn, section }) → Event[]`.
- `Event = { t: seconds, kind: 'strum'|'pick'|'click'|'ghost', step, bar, chordIndex, strings: {string, midi, offset}[], dir, velocity, palmMute, accent }`.
- Time of step n is computed as `n · stepDur` (never accumulated) — this is what prevents drift.
- Strum spread: per-string offset `spreadMs` (default 12, clamp 8–20) ordered low→high for D, high→low for U; offsets are included in `strings[].offset`.
- Velocity: base 0.7, accent +4 dB equivalent, section dynamics multiplier (verse 0.75, chorus 1.0).
- Count-in: 1 bar of clicks before bar 0 (beat 1 accented), negative bar index −1.
- Metronome clicks every beat through the whole schedule when `click: true`.
Tests: event count; time of the 10,000th step equals exactly `10000·stepDur` (no float drift beyond 1e-9); D vs U string order; palm-mute flag passthrough; count-in length at 60/120/200 bpm; empty shapes → only clicks.
Verify: `npx vitest run src/core/schedule 2>&1 | tail -n 15`
Done when: passing, 100% coverage.

### 5.2 Guitar voice + strum
Do (`src/audio/`):
- `engine.ts`: `ensureAudio()` calls `Tone.start()` (must be triggered from a click/tap handler) and builds the graph once: 6 `PluckSynth` voices (one per string, `attackNoise` 1, `dampening` 4000, `resonance` 0.96) → per-voice `Panner` (slight spread) → `Filter` (lowpass, used for palm mute) → `Compressor` → `Reverb` (small room, wet 0.12) → destination.
- `playEvent(event, time)`: triggers each string at `time + offset` with its frequency; palm mute = shorter release + lowpass 900 Hz; ghost = no sound.
- Mock `src/audio` in UI tests (`vi.mock`). No unit tests on Tone internals.
- Add a "Hear chord" button on Library cards (strums the shape once).
Verify: `npm run verify 2>&1 | tail -n 15`; add `tests/e2e/audio.spec.ts` (launch flag `--autoplay-policy=no-user-gesture-required`): click "Hear chord" → `window.__a6audio?.state === 'running'` (expose that read-only debug flag only).
Done when: passing. Tell the user in one line to listen to a few chords on their device and say if the tone needs changing.

### 5.3 Metronome + count-in
Do:
- Click voice: short `MembraneSynth`/`Synth` blip, accent pitch higher on beat 1.
- `useMetronome()` hook: bpm (40–240), on/off, count-in bars, tap-tempo (average of last 4 taps, pure fn `tapTempo(timestamps)` in core, tested).
- Standalone metronome control in the lesson toolbar and on the Drills page.
Verify: `npx vitest run src/core 2>&1 | tail -n 10 && npm run lint 2>&1 | tail -n 5`
Done when: passing.

### 5.4 Transport + playhead sync
Do:
- `src/audio/transport.ts`: `play(schedule, {loop})`, `stop()`, `setBpm()` (rebuilds schedule from the next bar), uses `Tone.Transport` + `Tone.Part`; loops cleanly across the bar line.
- `usePlayback()` hook exposing `{ isPlaying, step, bar, chordIndex }`; `step` read from `Tone.Transport.seconds` on `requestAnimationFrame` (not from setTimeout), converted back with the same pure maths as 5.1.
- Wire to TabLane `playhead` and to the active Fretboard.
- **Mini-player** (PRD §10): a playback store at app level so playback survives navigation; slim transport bar above the dock / at the bottom of content showing current → next chord, tempo and play/pause; tap opens the lesson. Media Session API metadata so lock-screen/keyboard media keys control play/pause.
- Tests: pure `secondsToStep` round-trips with `buildSchedule`.
- `tests/e2e/playback.spec.ts`: on `/lesson/demo` (a temporary route playing C–G–Am–F with `driving-eighths`; Phase 6 replaces it with real lessons and keeps the `demo` id working), click Play → `data-playhead-step` increases over 1.5 s → Stop → value stops changing.
Verify: `npx vitest run src/core 2>&1 | tail -n 10 && npx playwright test playback 2>&1 | tail -n 15`
Done when: passing on all viewports.

### 5.5 Real instrument sound + humanised playback
Do (PRD §20.3):
- Find free sample sets whose licence allows use in an open-source app (CC0, or CC-BY with attribution): electric guitar (clean at minimum; driven and palm-muted if available), electric bass, and a drum kit. Candidates: the `tonejs-instruments` sample collection for guitar and bass, and CC0 drum kits. Read each licence file before using it and record source, licence and attribution in `docs/licences.md`. If no suitable guitar set exists, STOP and tell the user, then use the fallback (improved plucked-string model + body impulse response).
- Trim to the notes needed (every 3rd semitone, E2–E5; `Tone.Sampler` fills the gaps), convert to compressed audio (`.m4a` or `.ogg` + `.mp3` fallback), and keep the total under 6 MB. Samples load lazily on first Play, are runtime-cached for offline use, and there's a "Download sounds for offline" button in Settings.
- Cabinet: a short impulse response generated procedurally at build time (`scripts/audio/make-ir.ts` — filtered noise decay shaped like a 1×12 speaker), so there's no licence question; feed it through `Tone.Convolver` after the drive stage in the tone presets.
- Pure `src/core/schedule/humanise.ts`: `humanise(events, {seed, timingMs: 8, velocityPct: 10, swing, accents})` — seeded, deterministic; strum spread scales with velocity (harder = tighter); style accents come from the style sheet. Applied to every schedule by default ("Robot mode" toggle in Settings turns it off for timing practice).
- Tests: `humanise` is deterministic for a seed, stays within bounds, never reorders events, and keeps bar lines exact; swing 0.55 moves off-beat 8ths by the right amount.
Verify: `npx vitest run src/core/schedule 2>&1 | tail -n 10 && npm run build 2>&1 | tail -n 5 && npm run size 2>&1 | tail -n 5`
Done when: passing, samples not in the entry bundle. Ask the user in one line to listen to a strummed chord, a palm-muted riff and a drum groove on `/design` and say whether it sounds like a real guitar and band.

### Gate 5
Run: `npm run verify`, `npm run e2e`, `npm run build`. Check initial JS: Tone.js must NOT be in the entry chunk (grep the build output for the chunk list; `tone` appears only in a lazy chunk). Then ask the user to run the matching rows of `docs/device-checklist.md` on their own devices (USER ACTION, ≈ 10 minutes) and record the results in `PROGRESS.md`; fix any failure before closing the gate.
CHANGELOG line: `- Audio: pure scheduler, sampled guitar, bass and drums with cabinet IR, humanised playback, metronome, synced playhead.`
