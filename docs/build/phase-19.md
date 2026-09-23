# Phase 19 — v2.0: Desktop studio
Aim: record takes, compare them with the reference, mix layers, write your own arrangements and export them. PRD refs: §18.2.
Route `/studio`, lazy-loaded; full layout ≥ 1200 px, simplified on tablet, a "best on a bigger screen" note on mobile.

### 19.1 Record takes
Do:
- Reuse the capture worklet (16.1) at the native sample rate. Pure `encodeWav(float32, sampleRate) → Uint8Array` and `peaks(float32, buckets) → [min,max][]` in `src/core/audio/`, tested.
- Record with count-in over a lesson, arrangement or jam; the take's start is aligned using the calibrated latency (17.2). Stored in IndexedDB (`takes` store: blob + metadata: lesson/arrangement id, bpm, tuning, createdAt). Storage estimate shown; oldest takes can be pruned.
- If "Back up my takes" is on and signed in, upload to the `takes` bucket under `<user_id>/` and store metadata in the `takes` table (via sync outbox).
- Take list with play, rename, delete, download (.wav).
Verify: `npx vitest run src/core/audio 2>&1 | tail -n 10`; `tests/e2e/record.spec.ts` with fake mic: record 2 bars → a take appears → playing it sets `isPlaying`.
Done when: passing.

### 19.2 Compare view
Do:
- Waveform (canvas, from `peaks`) of the take above the reference tab lane, both on the same time axis; zoom and scroll.
- Onsets from the take (17.2) vs the beat grid → timing-deviation chart per beat (bars above/below zero, brass for late, bone for early), plus summary: mean ms, % within ±30 ms, most-late beat.
- Chord check per bar using `matchShape` over the take (offline run in the detection worker) → per-bar Clean/Missed row.
- Pure `alignTake(onsets, grid, latencyMs)` tested.
Verify: `npx vitest run src/core 2>&1 | tail -n 10`
Done when: passing.

### 19.3 Layer mixer
Do:
- Mixer panel: one channel strip per layer (rhythm, double, contrast, riff, lead, bass, drums, your take): volume fader, pan knob, mute, solo, peak meter (`Tone.Meter`, 30 fps UI), and a master strip with the limiter meter. Keyboard accessible; ARIA sliders.
- Mixer state is part of the arrangement (saved and synced).
- Pure `soloMuteMatrix(layers)` → audible set, tested.
Verify: `npx vitest run src/core src/features/studio 2>&1 | tail -n 10`
Done when: passing.

### 19.4 Arrangement editor
Do:
- Build a song: sections (intro/verse/pre/chorus/bridge/outro) in order with repeats; each section picks a progression + key, style, rhythm or phrase, register, layers and dynamics. Drag to reorder (with keyboard alternative).
- The engine optimises fingerings per section, and the transition card shows the change *between* sections too.
- Saved locally as `Arrangement` JSON (versioned schema, pure migration fn tested) and synced when signed in.
- `tests/e2e/arrange.spec.ts`: create verse (I–V–vi–IV, pop punk) + chorus (same, Britpop) → play → section label changes at the boundary.
Verify: `npx playwright test arrange 2>&1 | tail -n 15`
Done when: passing.

### 19.5 MIDI, MusicXML and Guitar Pro export
Do:
- Pure `src/core/export/midi.ts`: Standard MIDI File type 1 writer (header, tempo map, one track per layer, program 30 distortion guitar / 26 clean / 34 bass, drums on channel 10). Test by parsing the output with `@tonejs/midi` (dev dependency) and comparing notes, times and tempo.
- Pure `src/core/export/musicxml.ts`: MusicXML 4.0 with a tab staff (`<staff-details>` 6 lines, `<staff-tuning>` from the tuning, `<technical><string>/<fret>`), bends/slides/hammer-ons as `<technical>` elements. Test by parsing with `fast-xml-parser` and checking string/fret per note.
- Guitar Pro 7: lazy-load `@coderline/alphatab`; build its `Score` model from the arrangement (`src/features/studio/toAlphaTab.ts`) and export with alphaTab's GP7 exporter. Test round-trip: export → import with alphaTab's importer → same string/fret/duration sequence.
- Export menu in the studio: `.mid`, `.musicxml`, `.gp`, plus `.txt` (ASCII tab, already exists). File names from the arrangement title.
- Note in README: exports open in MuseScore, TuxGuitar, Guitar Pro and DAWs.
Verify: `npx vitest run src/core/export src/features/studio 2>&1 | tail -n 15 && npm run size 2>&1 | tail -n 5` (alphaTab must be a lazy chunk).
Done when: passing. Ask the user in one line to open an exported `.gp` or `.musicxml` in MuseScore (free) and confirm it looks right.

### Gate 19
Run: `npm run verify`, `npx vitest run --coverage src/core 2>&1 | tail -n 20` (100%), `npm run e2e`, `npm run build`, `npm run size`.
CHANGELOG line: `- Desktop studio: record and compare takes, layer mixer, arrangement editor, MIDI / MusicXML / Guitar Pro export.`
