# Phase 7 — Tuner and listening
Aim: an accurate, beautiful tuner and the first "the app hears you" feature. PRD refs: §8 (Tuner), §9 item 6, §10 (Analog tuner).
Everything stays on-device. Never record or store audio.

### 7.1 Pitch → note/cents
Do:
- Install `pitchy`. `src/core/pitch/`: `detectPitch(buffer: Float32Array, sampleRate) → {freq, clarity} | null` (wraps pitchy's McLeod detector; returns null if clarity < 0.9 or RMS below a noise gate), `freqToNote(freq, a4 = 440) → {midi, name, octave, cents}`, `nearestString(freq, tuning, capo) → {string, targetMidi, cents}`, and `smooth(prev, next, alpha)` (exponential smoothing for the needle).
- Tests use synthetic sine buffers (and sine + 2nd harmonic + noise) at 82.41, 110, 146.83, 196, 246.94, 329.63 Hz and ±10/±30 cent offsets; also drop D low D 73.42 Hz and half-step-down strings. Silence → null.
Verify: `npx vitest run src/core/pitch 2>&1 | tail -n 15`
Done when: every synthetic case within ±2 cents; passing.

### 7.2 Tuner UI
Do (`src/features/tuner/`):
- `src/audio/mic.ts`: `startMic()` → `getUserMedia({audio: {echoCancellation: false, noiseSuppression: false, autoGainControl: false}})`, `AnalyserNode` with 2048/4096 buffer; frame loop on rAF; `stopMic()` releases tracks. Clear permission-denied and unsupported states with calm copy.
- UI: VU-style SVG dial (−50…+50 cents) with a brass needle driven by `smooth()` (spring-like damping; with motion off the needle jumps); big note name in display serif; six string buttons for the current tuning (tap = play reference tone via the guitar voice, auto-detect otherwise); "In tune" state when within ±5 cents for 500 ms — needle glows brass. Tuning selector (standard / half-step down / drop D) synced with settings. A4 calibration 430–450.
- `tests/e2e/tuner.spec.ts` with Chromium flags `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream`: open /tuner → Start → status becomes "Listening" and a note name renders (fake device emits a tone) → Stop → mic released (status "Stopped").
Verify: `npx vitest run src/features/tuner 2>&1 | tail -n 10 && npx playwright test tuner 2>&1 | tail -n 15`
Done when: passing. Ask the user in one line to test with their guitar and report if readings look off.

### 7.3 Root-note auto-advance
Do:
- "Listen" toggle in the lesson toolbar (hidden if no mic support). When on and playback is paused (self-paced mode), the app listens and advances to the next chord when it hears the **root of the next chord in its lowest sounding octave for that shape** (pure `matchesTarget(detectedMidi, targetMidi, toleranceCents = 40, allowOctave = true)` in core, tested) held for 250 ms.
- Records the time taken per change into progress (`lastMs` for that transition) — this feeds the heatmap.
- Pure `autoAdvanceMachine` (states idle → listening → heard → advanced, with debounce) in `src/core/practice/`, tested with scripted pitch sequences.
Verify: `npx vitest run src/core 2>&1 | tail -n 10`
Done when: passing, 100% core coverage.

### Gate 7
Run: `npm run verify`, `npm run e2e`, `npm run build`. Confirm `Permissions-Policy` in `netlify.toml` still allows `microphone=(self)`. Then ask the user to run the matching rows of `docs/device-checklist.md` on their own devices (USER ACTION, ≈ 10 minutes) and record the results in `PROGRESS.md`; fix any failure before closing the gate.
CHANGELOG line: `- Tuner with analog needle and tunings; listen mode that advances when you play the next chord's root.`
