# Phase 12 — Module 3: Lead (reference style: Nirvana)
Aim: melodic, simple lead playing — the vocal-melody-as-solo idea, bends checked by the mic, loud-quiet dynamics. PRD refs: §16.4.
Content rule: every phrase in the repo is original. Songs are named only as listening references.

### 12.1 Scale explorer
Do (`src/features/lead/ScaleExplorer`):
- Neck-orientation Fretboard showing a pentatonic box for a chosen key (default E minor and A minor), roots in brass, other notes in bone outline, degree labels toggle (1 ♭3 4 5 ♭7).
- "Link to power chord" toggle: overlays the matching power-chord shape from Module 1 and highlights the shared notes (from 11.5).
- Tap a note to hear it (lead voice, clean tone). Box 1–5 selector; box 1 is the default and the only one used in lessons.
- Add Module 3 tab ("Lead") to the Library (enabled) with the explorer at the top.
Verify: `npx vitest run src/features/lead 2>&1 | tail -n 10`
Done when: passing; explorer on `/design`.

### 12.2 Bend trainer
Do:
- Pure `src/core/pitch/bend.ts`: `bendAccuracy(trace: {t, cents}[], targetCents) → { reached, peakCents, overshootCents, timeToTargetMs, heldMs }` — reached = within ±15 cents of target for ≥ 150 ms. `classifyBend` → `'reached'|'short'|'overshoot'`.
- UI (`src/features/lead/BendTrainer`): choose string/fret and target (½ or full); press Start → mic (reuse 7.2 pipeline) → live SVG graph of your pitch over 2 s with a target line; the **bend trace** candy per PRD §16.8; result card with calm feedback ("A little short — push from the wrist, not the finger"). History of last 10 tries.
- Tests: synthetic traces for reached, short, overshoot, wobbly-but-reached.
- `tests/e2e/bend.spec.ts` (fake mic): trainer starts, graph renders, stop releases the mic.
Verify: `npx vitest run src/core/pitch 2>&1 | tail -n 10 && npx playwright test bend 2>&1 | tail -n 10`
Done when: passing. Ask the user in one line to try three bends on their guitar and report if the verdicts feel right.

### 12.3 Melody-to-solo
Do:
- Pure `src/core/pitch/segment.ts`: `segmentNotes(trace: {t, midiFloat, clarity}[]) → {midi, start, dur}[]` (merge frames within ±0.5 semitone, drop notes < 80 ms, median-filter jitter).
- Pure `quantiseToKey(notes, keyPc, scale)` (snap to nearest scale note; keep octave) and `quantiseRhythm(notes, bpm)` → sixteenths.
- Pure `src/core/engine/melodyToTab.ts`: candidate positions per note = every (string, fret ≤ 15) producing that MIDI in the current tuning; `nodeCost` = 0 inside the lesson's box, +2 outside, +0.1·fret; `edgeCost` = 0.4·|Δfret| + 0.6·|Δstring| + 3 if the hand position (lowest fret in a 4-fret window) shifts; uses generic `viterbi`. Output a `Phrase`.
- UI (`src/features/lead/MelodyToSolo`): Hum (mic, 8 s max, count-in, pitch trace shown live) or Tap (tap notes on the fretboard) → result tab + Play → "Add a bend" and "Add a slide" buttons suggest the best note for each (longest note / largest step up) and edit the phrase.
- Tests: segmentation on synthetic traces (glide between notes, vibrato, gaps); quantisation; melodyToTab keeps a 5-note ascending scale run inside box 1; determinism.
Verify: `npx vitest run src/core 2>&1 | tail -n 15`
Done when: passing, 100% core coverage.

### 12.4 Module 3 lessons
Do:
- `scripts/data/lessons.src.ts`: add module `lead` (8 lessons) with original phrases in `scripts/data/phrases.src.ts`; extend the Lesson type with `phrases?`, `tone?`, `pedal?`. Lessons: box 1 over its power chord; first bends (full, E minor); bend-and-release; slides between box notes; sing-then-play drill (uses 12.3); a 4-bar melodic solo over I–V–vi–IV built on a simple original tune; loud-quiet arrangement (chorus-clean verse riff → fuzz chorus with a "step on the pedal" marker as a tab symbol `▼ fuzz`); noise textures (scrape, rake, feedback) as punctuation.
- Lesson player: when a lesson has phrases, show TabLane in phrase mode, the lead voice, tone selector (locked to the lesson's presets, overridable), and the bend trainer inline for bend lessons.
- Finish **Undertow** added to `finishes.css` (washed teal-grey accent tweak, slow shimmer) — contrast check must still pass.
- Listen refs per PRD §16.4.
- `tests/e2e/lead.spec.ts`: open first lead lesson → phrase tab shows a `b` symbol → Play → playhead moves → switch to Chorus → tone label shows "Fuzz".
Verify: `npm run data:phrases && npm run data:lessons 2>&1 | tail -n 5 && npm run check:contrast 2>&1 | tail -n 5 && npx playwright test lead 2>&1 | tail -n 15`
Done when: passing.

### 12.5 Module 3 tune + style review
Do (PRD §20): apply 6.0's style sheet, riff builder and linter to this module (its style JSON already exists); write the module's original tune and two riffs of the week as in 6.7, with full band, humanised playback and full tab notation; every lesson, riff and tune passes `checkPlayable`, `checkHarmony`, `checkBars` and `lintAgainstStyle`. Add "Play along" to its listening references (6.8).
Verify: `npm run data:lessons 2>&1 | tail -n 5 && npm run lint:style 2>&1 | tail -n 10`
Done when: the tune plays end to end and every check passes.

### Gate 12
Run: `npm run verify`, `npm run e2e`, `npm run build`, `npm run size`. Axe on the lead lesson and bend trainer. Then the **review gate** (PRD §20.6, USER ACTION): ask the user to play this module's tune and two lessons and score **playable / sounds like the style / fun** from 1 to 5; rework anything under 4 before closing the gate.
CHANGELOG line: `- Module 3 (lead): scale explorer, mic-checked bend trainer, hum-to-tab melody optimiser, 8 lessons with loud-quiet arrangement.`
