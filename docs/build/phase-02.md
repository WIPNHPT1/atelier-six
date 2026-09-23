# Phase 2 — Music core
Aim: pure, fully tested music data and theory in `src/core/`. No DOM, no audio. PRD refs: §5, §6.
Convention everywhere: string index 0 = low E (6th string) … 5 = high E. MIDI numbers for pitch.

### 2.1 Pitch and key math
Do (`src/core/theory/`):
- `PitchClass` = 0–11 (C=0). `noteName(pc, preferFlats)`, `parseNote("F#")`, `transpose(pc, semis)`.
- `midiToFreq`, `freqToMidi` (A4=440, overridable).
- `romanToChord(roman, keyPc)` for major keys: `I ii iii IV V vi vii°` plus `bVII`, `IV5`/`I5` style suffix `5` for power chords, and lowercase = minor. Returns `{ root, quality: 'maj'|'min'|'5'|'dim'|'7'|'sus2'|'sus4'|'add9'|'m7' }`.
- `chordName({root, quality})` → "Am", "G5", "Cadd9".
Verify: `npx vitest run src/core/theory 2>&1 | tail -n 15`
Done when: tests cover every function incl. round-trips (all 12 keys × 7 degrees) and pass at 100% coverage.

### 2.2 Shape types + validator
Do (`src/core/shapes/`):
- Types exactly as PRD §6 (`Finger`, `StringNote`, `Shape`, `Chord`).
- Compact notation parser: `parseShape(id, chord, frets, fingers, opts)` where `frets` = 6 chars (`x` muted, `0`–`9`, or `(10)` style for ≥10) and `fingers` = 6 chars (`-` none, `1`–`4`, `T`). Example C: `parseShape('C.open.a','C','x32010','-32-1-')`.
- `validateShape(shape)` returns error list: finger on open/muted string; fretted note without finger (unless covered by `barre`); same finger on two different frets; span > 5 frets; thumb not on string 0 or 1; barre finger not 1.
- `pitchesOf(shape, tuning, capo)` → MIDI per string (null if muted).
- `mirror(shape)` for left-handed display is NOT needed here (display concern) — don't add it.
Verify: `npx vitest run src/core/shapes 2>&1 | tail -n 15`
Done when: parser + validator tests pass, including one test per invalid case above.

### 2.3 Chord data generator
Do:
- `scripts/data/shapes.src.ts`: the hand-written source list (compact notation) — keep it here, not in chat output.
  - **Open (low register, tag `open`):** E `022100 -231--`; A `x02220 --123-` and `x02220 --213-`; D `xx0232 ---132`; G `320003 21---3` (id `G.open.a`) and `320003 32---4` (id `G.open.b`); C `x32010 -32-1-`; Am `x02210 --231-`; Em `022000 -23---` and `022000 -12---`; Dm `xx0231 ---231`; E7 `020100 -2-1--`; A7 `x02020 --2-3-`; D7 `xx0212 ---213`.
  - **Anchored (tag `anchored`, Module 2):** Em7 `022033 -12-34`; G `320033 21--34` (id `G.anchored`); Dsus4 `xx0233 ---134`; A7sus4 `x02033 --1-34`; Cadd9 `x32033 -21-34`.
  - **Barre (tag `barre`)**, generated for all 12 roots. `r` = root fret (1–12; string-0 shapes: r = (root − 4) mod 12, string-1 shapes: r = (root − 9) mod 12; if 0 use 12). Offsets per string, `x` = muted:
    | Shape | Frets | Fingers | Barre (finger 1 at fret r) |
    |---|---|---|---|
    | E-shape major | r, r+2, r+2, r+1, r, r | `134211` | strings 0–5 |
    | E-shape minor | r, r+2, r+2, r, r, r | `134111` | strings 0–5 |
    | A-shape major | x, r, r+2, r+2, r+2, r | `-12341` | strings 1–5 |
    | A-shape minor | x, r, r+2, r+2, r+1, r | `-13421` | strings 1–5 |
  - **Power (tag `power`)**, generated for all 12 roots, root on string 0 and on string 1 (same `r` rule, frets 1–12):
    | Shape | Frets (string-0 root) | Fingers |
    |---|---|---|
    | 2-finger | r, r+2, x, x, x, x | `13----` |
    | 3-finger | r, r+2, r+2, x, x, x | `134---` |
    | Octave | r, x, r+2, x, x, x | `1-4---` |
    String-1 versions shift everything one string higher (string 0 muted). Also add open E5 `022xxx -12---` and A5 `x022xx --12--`. Drop D one-finger shapes are derived at runtime in Phase 8, not generated.
- `scripts/data/build-chords.ts` (run via `npm run data:chords`): parses, validates (fail the script on any error), assigns `register` (highest fret ≤ 5 → low, ≤ 9 → mid, else high), writes `src/data/chords.json` grouped by chord name. Sorted keys, stable ids.
- `src/core/shapes/library.ts`: typed loader `getChord(name)`, `getShapes(name, {tags, register})`.
- Add the generated JSON to `.prettierignore`; never read it back in chat (use the loader in tests).
Verify: `npm run data:chords 2>&1 | tail -n 5 && npx vitest run src/core/shapes 2>&1 | tail -n 15`
Done when: script runs clean; tests assert: every shape valid; C, G (3 variants), Em (2), all 5 anchored shapes present; `G5` has ≥3 power shapes; `F` has an E-shape barre at fret 1; `Bm` has an A-shape minor at fret 2.

### 2.4 Progressions, rhythms, tunings
Do:
- `src/core/tuning.ts`: `standard` [40,45,50,55,59,64], `halfDown` (each −1), `dropD` ([38,45,50,55,59,64]); `openStringMidi(tuning, capo)`.
- `src/data/progressions.ts`: `I–V–vi–IV`, `vi–IV–I–V`, `I–IV–V`, `I–vi–IV–V`, `ii–V–I`, `I–IV–vi–V`, 12-bar blues (`I I I I IV IV I I V IV I V`), plus a power variant flag (`power: true` → quality `5`). Each with default `beatsPerChord` and `loop`.
- `src/core/progression.ts`: `resolveProgression(prog, keyPc, {power})` → chord names (uses 2.1).
- `src/data/rhythms.ts`: presets from PRD §6 type: `driving-eighths` (8 × D, palmMute option), `pop-strum` (subdivision 8: steps at 0,2,3,5,6,7 → D D U U D U), `sixteenth-motion` (16 steps alternating D/U; steps that don't sound have `ghost: true`, so the arm keeps moving; sounding steps 0,2,3,6,8,10,11,14), `arpeggio` (pick strings root→5th→3rd→octave), `stops` (hits on 1 and the "and" of 2 then rest), `whole-notes`. Add `ghost?: boolean` to the step type.
- Tests: resolve I–V–vi–IV in G → [G, D, Em, C]; in C power → [C5, G5, A5, F5]; each rhythm's steps sorted and within the bar.
Verify: `npx vitest run src/core 2>&1 | tail -n 15`
Done when: passing, 100% core coverage.

### Gate 2
Run: `npm run verify`, `npx vitest run --coverage src/core 2>&1 | tail -n 20` (100% on `src/core/**`), `npm run build`.
CHANGELOG line: `- Music core: theory, shape notation, generated chord library, progressions, rhythms, tunings.`
