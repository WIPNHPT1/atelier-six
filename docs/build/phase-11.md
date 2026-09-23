# Phase 11 — v1.1 foundation: lead notation, lead voice, pedal lane
Aim: everything Modules 3–5 share. PRD refs: §16.1–16.3, §16.9 (read §16 once at 11.1; afterwards only the sub-section named).
v1 must keep working: run the full `npm run e2e` at the gate, not only new tests.

### 11.1 Phrase notation parser
Do (`src/core/phrase/`):
- Types exactly as PRD §16.1.
- `parsePhrase(src: string, opts) → Phrase` using the token table in §16.1 (tokens separated by spaces; `|` = bar line, ignored except for validation). Clear error messages with token index.
- `validatePhrase(p)`: frets 0–22; bend `toFret` > fret and ≤ fret+3; release target ≤ bend target; hammer target > fret; pull target < fret; slides change fret; each bar sums to 16 sixteenths when `|` is used; double-stops on different strings.
- `phraseToSource(p)` (inverse) so round-trips can be tested.
- `scripts/data/build-phrases.ts` + `npm run data:phrases` → `src/data/phrases.json` (empty list for now, fails on any invalid phrase). Add the JSON to `.prettierignore`.
Tests: every token type; round-trip on 10 mixed phrases; each validation error.
Verify: `npx vitest run src/core/phrase 2>&1 | tail -n 15`
Done when: passing, 100% coverage.

### 11.2 Lead scheduling
Do: extend `src/core/schedule/` with `buildPhraseSchedule({ phrase, bpm, tuning, capo, countIn }) → LeadEvent[]`, keeping v1 `buildSchedule` untouched.
- `LeadEvent = { t, dur, kind: 'noteOn'|'glide'|'noteOff'|'kill'|'scrape'|'feedback', midi, targetMidi?, rampSec?, vibrato?: {rateHz, depthCents}, retrigger: boolean, velocity, strings? }`.
- Rules: bend = `glide` to `targetMidi` over 40% of the note (min 60 ms); release = glide back; slide = glide over 25% then hold; hammer/pull = new pitch with `retrigger: false`, velocity ×0.8; vibrato 5.5 Hz ±20 cents on the last 60% of the note; double-stop = two noteOns (lead voice is duophonic for this case only); mute = short noise-tick event.
- Pedal: `pedalToSemitones(mode, pos)` (pure, §16.3 ranges, linear) and `samplePedal(points, t)` (step/linear interpolation). Lead events inside a pedal section get a `pitchOffset` curve sampled every sixteenth.
- Same no-drift rule: times computed from indices, never accumulated.
Tests: bend/release timing; hammer not retriggered; vibrato only on marked notes; pedal interpolation at segment edges; octave-up at pos 1 = +12; dive at pos 1 = −24.
Verify: `npx vitest run src/core/schedule 2>&1 | tail -n 15`
Done when: passing, 100% coverage.

### 11.3 Lead voice + tone presets
Do (`src/audio/lead/`, lazy-loaded chunk):
- Lead voice: `MonoSynth` (sawtooth, filter envelope) with a second voice for double-stops. `frequency.linearRampTo` for glides; an LFO on `detune` for vibrato; `pitchOffset` applied through `detune` automation (zero-latency Whammy for playback).
- Tone presets per §16.2 as a table of settings in `src/audio/lead/tones.ts`: `EQ3` → `Distortion`/`Chebyshev` drive → cabinet (lowpass ~5 kHz + peaking EQ at 1.8 kHz) → `Chorus` (chorus-clean only) → `Reverb` → shared master `Limiter(-1)`. Preset switch crossfades 80 ms (no clicks).
- Noise textures: scrape = band-passed noise sweep 3 kHz→800 Hz; feedback = sine at the held note's octave fading in over 1 s; mute tick = 15 ms filtered noise.
- Route the lead voice through the cabinet impulse response from 5.5, and blend a short sampled pick attack (from the 5.5 guitar samples) with the synth onset so single notes sound like a real guitar.
- Add a limiter to the v1 chord chain too, so loudness is consistent.
- Mock in UI tests, as for v1 audio.
- `/design` gets a "Tones" section: play a fixed original test phrase through each preset.
Verify: `npm run verify 2>&1 | tail -n 15`; `npx playwright test audio 2>&1 | tail -n 10` still passes; add an e2e check that selecting "fuzz" on `/design` keeps `window.__a6audio.state === 'running'` with no console errors.
Done when: passing. Ask the user in one line to listen to the six tones and say if any need changing.

### 11.4 Tab symbols + pedal lane rendering
Do:
- Extend `src/core/tab/` with `renderPhrase(phrase, tuning) → TabColumn[]` (same column type plus `symbols`) and `toAscii` support for every §16.1 symbol, double-stops, `P.M.` brackets, `K` markers above the staff, and a pedal row below the tab drawn with `▁▂▃▄▅▆▇█`.
- `TabLane`: render technique symbols in Geist Mono with small brass arcs for bends (arrow + target label like "full" or "½"), curved slurs for h/p, slanted lines for slides, wavy line for vibrato.
- `src/ui/PedalLane/`: SVG line from heel to toe aligned to the tab columns, playhead-synced, with heel/toe labels; a11y description ("rock to toe over beats 1–2, back to heel on beat 3").
- Phrases use the full tab standard from 4.5 (rhythm notation, articulations) and must pass `checkPlayable` / `checkHarmony` / `checkBars` in `npm run data:phrases`.
- Tests: `toAscii` snapshots for 4 original phrases covering all symbols; pedal row snapshot; PedalLane point count and aria text.
Verify: `npx vitest run src/core/tab src/ui/TabLane src/ui/PedalLane 2>&1 | tail -n 15`
Done when: passing; examples on `/design`.

### 11.5 Scales + generic Viterbi
Do:
- `src/core/theory/scales.ts`: minor pentatonic, major pentatonic, blues, natural minor, major; `scaleNotes(keyPc, scale)`; `pentatonicBox(keyPc, boxNumber 1–5, tuning)` → positions `{string, fret, degree, isRoot}` (box 1 starts at the root on the low E string, fret 0–12 range with the usual 2-note-per-string pattern).
- `linkBoxToPowerChord(box, powerShape)`: marks which box notes the power-chord fingers are already on.
- Refactor: extract a generic `viterbi<T>(columns: T[][], nodeCost, edgeCost, {loop, tieBreak})` into `src/core/engine/viterbi.ts`; the chord optimiser now calls it. All Phase 3 tests must still pass unchanged.
Tests: A minor box 1 starts at fret 5 on string 0 with roots at string 0 fret 5, string 2 fret 7 and string 5 fret 5; every box note is in the scale; generic Viterbi on a hand-computed 3×3 lattice; Phase 3 suite green.
Verify: `npx vitest run src/core 2>&1 | tail -n 15`
Done when: passing, 100% core coverage.

### Gate 11
Run: `npm run verify`, `npx vitest run --coverage src/core 2>&1 | tail -n 20` (100%), `npm run e2e` (full, v1 included), `npm run build`, `npm run size` (entry still ≤ 200 KB — lead audio must be a lazy chunk).
CHANGELOG line: `- v1.1 foundation: lead phrase notation, lead voice and tones, tab technique symbols, pedal lane, scale boxes, generic Viterbi.`
