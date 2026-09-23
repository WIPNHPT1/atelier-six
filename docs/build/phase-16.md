# Phase 16 — v1.2: Chord detection in the browser
Aim: the app can tell whether you're sounding the target shape, and which string is missing or muffled. PRD refs: §17.1 (read once at 16.1).
Everything runs on the device. Audio is analysed in memory and never stored.

### 16.1 Audio capture worklet + pure DSP
Do:
- `src/audio/capture/`: an `AudioWorkletProcessor` that downmixes the mic to mono and resamples to 22,050 Hz (linear-phase windowed-sinc; pure resampler function in core so it can be tested), posting 1,024-sample blocks to a ring buffer shared with a worker (`SharedArrayBuffer` when cross-origin isolated, else `postMessage` transfer).
- Pure DSP in `src/core/dsp/`: `resample(buf, fromRate, toRate)`, `fft` (radix-2, real input), `hann`, `chromagram(frame, sampleRate, tuningA4) → number[12]` (log-frequency binning from 70 Hz to 1,400 Hz, harmonic weighting), `rms`, `spectralFlux(prevMag, mag)`.
- Tests with synthetic signals: resampler preserves a 440 Hz sine (±1 Hz) and removes content above the new Nyquist; chromagram of a synthetic C major triad peaks at C, E, G; flux spikes on a synthetic onset.
Verify: `npx vitest run src/core/dsp 2>&1 | tail -n 15`
Done when: passing, 100% coverage.

### 16.2 Basic Pitch engine in a worker
Do:
- Install `@spotify/basic-pitch` and `@tensorflow/tfjs`. Copy the model files into `public/models/basic-pitch/` with a small script (`npm run models:copy`); never load from a CDN. Record the model licence (Apache-2.0) in `docs/licences.md`.
- `src/workers/detect.worker.ts`: loads the model lazily on the first "Listen" (WebGL backend; WASM backend fallback — if used, add `'wasm-unsafe-eval'` to `script-src` in `netlify.toml` and note it in an ADR), analyses overlapping windows (1 s window, 250 ms hop), and returns note activations per window. Uses Comlink-style typed messages (`src/workers/protocol.ts`).
- Pure `activationsToProfile(frames, onsets, threshold) → { pitchClass: number[12], midiPresence: Record<number, number> }` in core, tested with fixture arrays (small JSON fixtures produced once by the harness in 16.4; keep each fixture < 20 KB).
- PWA: add the model to runtime caching (cache-first, only after first use) — not the precache, so the install stays small.
Verify: `npx vitest run src/core 2>&1 | tail -n 10 && npm run build 2>&1 | tail -n 8` (confirm tfjs and the model are in lazy chunks only; `npm run size` still passes).
Done when: passing.

### 16.3 Shape matching + engine choice
Do:
- Pure `src/core/detect/matchShape.ts`: `matchShape(profile, shape, tuning, capo) → { score, missingStrings: number[], muffled: number[], extraNotes: number[] }`. Expected pitches come from `pitchesOf(shape)` (Phase 2). Score = weighted cosine similarity of pitch-class profiles × per-string presence factor. A string is *missing* when its expected MIDI has presence < 0.15, *muffled* when 0.15–0.4.
- Chroma fallback engine: the same `matchShape` using `chromagram` (presence per string estimated from harmonic energy at the expected fundamentals).
- `src/core/detect/benchmark.ts` + UI: on the first Listen, run 3 s of timing on a synthetic buffer; pick Basic Pitch if a window completes in < 120 ms, else chroma. Settings → Listening: engine (Auto / Basic Pitch / Lightweight), sensitivity, "Test my mic" meter.
- Tests: synthetic profiles for C open vs Am (must discriminate), a C with the 5th string missing, G5 vs A5, capo 2 mapping.
Verify: `npx vitest run src/core/detect 2>&1 | tail -n 15`
Done when: passing, 100% coverage.

### 16.4 Evaluation harness + docs/detection.md
Do:
- `scripts/eval/render.ts`: pure-JS Karplus-Strong renderer (runs in Node) that renders every library shape with strum spread, random detune (±8 cents), pink noise at 20 dB and 10 dB SNR, and variants with one string removed or damped. Writes WAVs to `eval/tmp/` (git-ignored).
- `scripts/eval/run.ts` (`npm run eval:detect`): runs both engines in Node (tfjs Node backend as a dev dependency) over the rendered set; reports accuracy (target vs top-3 nearest distractors from the same lesson), missing-string recall, false-alarm rate, and ms per window. Writes `docs/detection.md` with tables and a short method section. Also accepts user recordings from `eval/user/<shape-id>.wav`; if the user drops in `.m4a` files from Voice Memos, convert them first with macOS's built-in `afconvert -f WAVE -d LEI16@22050 -c 1 in.m4a out.wav`.
- Tune `matchShape` thresholds from the results (keep them in one exported `DETECT` object). Target on synthetic 20 dB set: ≥ 95 % accuracy, ≥ 85 % missing-string recall.
- STOP (USER ACTION, optional but recommended): "Record yourself playing the 10 chords listed in `eval/user/README.md` (2 s each, phone voice memo is fine), put the WAVs in `eval/user/`, and say done." Re-run the eval and add a "Real guitar" table.
Verify: `npm run eval:detect 2>&1 | tail -n 20`
Done when: targets met on the synthetic set; `docs/detection.md` committed.

### Gate 16
Run: `npm run verify`, `npx vitest run --coverage src/core 2>&1 | tail -n 20` (100%), `npm run e2e`, `npm run build`, `npm run size`.
CHANGELOG line: `- In-browser chord detection: Basic Pitch worker with lightweight fallback, per-string feedback, published accuracy report.`
