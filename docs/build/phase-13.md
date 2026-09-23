# Phase 13 — Module 4: Thumb-over (reference style: John Frusciante)
Aim: thumb-over-neck chords with embellishments, double-stops and funk muting, taught safely. PRD refs: §16.5.

### 13.1 Thumb-over shapes + comfort check
Do:
- Generator in `scripts/data/build-chords.ts` (tag `thumb`, register from fret): for all 12 roots with root fret r (string-0 rule, frets 1–12):
  | Shape | Frets | Fingers | Notes |
  |---|---|---|---|
  | Thumb major | r, x, x, r+1, r, r | `T--211` | mini-barre finger 1 on strings 4–5 |
  | Thumb minor | r, x, x, r, r, r | `T--111` | mini-barre finger 1 on strings 3–5 |
  | Thumb 7 | r, x, x, r+1, r+3, r | `T--241` | |
  | Thumb sus4 | r, x, x, r+2, r, r | `T--311` | mini-barre finger 1 on strings 4–5 |
  String 1 is muted by the thumb tip (not a fretted note). Extend `validateShape` to allow a barre from strings 3–5 and to treat `x` on string 1 as thumb-muted when `T` is present.
- Engine: add `WEIGHTS.thumbPlace = +1` and `WEIGHTS.thumbLift = +1` on top of normal costs; update tests and `docs/engine.md`.
- Comfort check (`src/features/thumb/ComfortCheck`): 3 guided steps (thumb bass notes on frets 3/5/7 with play-along → add finger 1 → full shape), each with "Comfortable / Strained" answers; "Strained" twice → recommends the 6th-string barre alternative, and Module 4 lessons then use `barre` candidates instead of `thumb` (stored in settings as `thumbOver: 'on'|'barre'`). Always visible "Stop if it hurts" note.
Tests: generated shapes validate; G thumb major = `3xx433`, G thumb minor = `3xx333`, G thumb 7 = `3xx463`, G thumb sus4 = `3xx533`; engine costs with thumb; settings switch changes candidates.
Verify: `npm run data:chords 2>&1 | tail -n 5 && npx vitest run src/core 2>&1 | tail -n 15`
Done when: passing, 100% core coverage.

### 13.2 Embellishment + double-stop generators
Do (`src/core/phrase/embellish.ts`, pure):
- `embellish(shape, kind, {bars, key}) → Phrase` for kinds `sus4-to-3` (pull-off on the G string from r+2 to r+1 for major shapes), `add9` (hammer-on on the high E string from r to r+2 — root to 9th — and pull back), `sixth` (hammer-on on the B string from r to r+2 — 5th to 6th), `mixed` (one of each across 2 bars). Every note must be inside a 4-fret window from the shape's lowest fret and each decoration must resolve to a chord tone.
- `doubleStops(chordA, chordB, interval: '3rds'|'6ths', key)` → phrase sliding between two-note shapes (3rds on the G and B strings; 6ths on G + high E or D + B, skipping the string between), fingering chosen with generic `viterbi`.
- Tests: resolution to chord tones; window constraint; determinism; ASCII snapshots for C thumb shape with each embellishment.
Verify: `npx vitest run src/core/phrase 2>&1 | tail -n 15`
Done when: passing.

### 13.3 Funk muting + bass bed
Do:
- Rhythm presets `funk-16ths` (16 steps; chord stabs on steps 0, 3, 6, 10, 14 accented; other steps muted scratches `ghost: false, mute: true`) and `sparse-embellished` (chord on 1, embellishment phrase fills the rest). Add `mute?: boolean` step flag: schedule emits a muted-scratch event (filtered noise + very short pluck on all strings).
- Tab shows muted scratches as `x` across the strummed strings.
- Bass bed: pure `bassLine(chords, style: 'roots'|'roots-octaves'|'walk', bars)` → events; played with a simple `MonoSynth` bass (lazy) so the lesson demonstrates guitar leaving room. Mute/solo in the layers panel.
Tests: funk preset accents; muted events in schedule; bass line lands on each chord root on beat 1.
Verify: `npx vitest run src/core 2>&1 | tail -n 10`
Done when: passing.

### 13.4 Module 4 lessons
Do:
- Add module `thumb` (8 lessons): comfort check; thumb bass notes alone; thumb major/minor shapes; moving the whole thumb shape as one unit (e.g. G→A→G, the engine should report one slide group including T); sus4→3 embellishment; add9 and sixth hammers; double-stop 3rds sliding between two chords; sparse verse arrangement (embellished chords + bass bed) → funk-16ths chorus.
- Enable the "Thumb-over" Library tab. Fretboard shows `T` in the brass thumb colour.
- Finish **Faded** (already in `finishes.css`) applied.
- Listen refs per PRD §16.5.
- `tests/e2e/thumb.spec.ts`: open the thumb module → comfort check → answer "Strained" twice → lessons show barre shapes; reset → thumb shapes with `T` visible.
Verify: `npm run data:lessons 2>&1 | tail -n 5 && npx playwright test thumb 2>&1 | tail -n 15`
Done when: passing.

### 13.5 Module 4 tune + style review
Do (PRD §20): apply 6.0's style sheet, riff builder and linter to this module (its style JSON already exists); write the module's original tune and two riffs of the week as in 6.7, with full band, humanised playback and full tab notation; every lesson, riff and tune passes `checkPlayable`, `checkHarmony`, `checkBars` and `lintAgainstStyle`. Add "Play along" to its listening references (6.8).
Verify: `npm run data:lessons 2>&1 | tail -n 5 && npm run lint:style 2>&1 | tail -n 10`
Done when: the tune plays end to end and every check passes.

### Gate 13
Run: `npm run verify`, `npx vitest run --coverage src/core 2>&1 | tail -n 20` (100%), `npm run e2e`, `npm run build`, `npm run size`. Then the **review gate** (PRD §20.6, USER ACTION): ask the user to play this module's tune and two lessons and score **playable / sounds like the style / fun** from 1 to 5; rework anything under 4 before closing the gate.
CHANGELOG line: `- Module 4 (thumb-over): generated thumb shapes, comfort check with barre fallback, embellishment and double-stop generators, funk muting, bass bed, 8 lessons.`
