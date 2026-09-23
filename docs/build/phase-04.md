# Phase 4 — Rendering
Aim: the three signature visuals (fretboard, tab lane, transition card) as static, accessible SVG components, plus the Library page. Animation comes in Phase 9. PRD refs: §9 items 1–3, §10.

### 4.1 Fretboard component
Do (`src/ui/Fretboard/`):
- Props: `shape`, `orientation: 'box'|'neck'` (box = vertical chord diagram for mobile/library cards; neck = horizontal, strings as rows, matching tab), `fretsShown` (default 5, auto-start at lowest fretted fret − 1), `showFingers`, `ghost?: Shape` (faint outline of the next chord's dots), `highlightStrings?: number[]`, `leftHanded` (reads the settings store if not passed; mirrors via SVG transform, text un-mirrored), `size`.
- Visual: hairline frets, string thickness tapering low→high, dots filled with `--f1…--fT` and the finger number/letter inside (bone text, ≥4.5:1 checked), barre = rounded bar in finger-1 colour, `×` above muted strings, `○` above open strings, fret number label at start fret > 1, nut drawn only when starting at fret 0.
- A11y: `role="img"` with `aria-label` like "C major: 3rd finger 5th string fret 3, 2nd finger 4th string fret 2, 1st finger 2nd string fret 1, 3rd and 1st strings open, 6th string muted". A pure `describeShape(shape)` function in `src/core/shapes/describe.ts` (unit-tested) builds it.
- Tests: renders correct count of dots/barre/mutes for C, F barre, G5; left-handed mirrors x positions; aria-label from `describeShape`.
Verify: `npx vitest run src/ui/Fretboard src/core/shapes 2>&1 | tail -n 15`
Done when: passing; add Fretboard examples to `/design`.

### 4.2 TabLane component
Do:
- Pure `src/core/tab/renderTab.ts`: `(shapes, rhythm, bars, tuning) → TabColumn[]` where each column = `{ step, chordIndex, cells: (string|null)[6], dir, palmMute, accent }`. Ghost steps render `x` on muted strings only if `palmMute`; otherwise blank. Also `toAscii(columns)` returning classic 6-line ASCII tab (high e on top) — used in tests and a "Copy tab" button.
- `src/ui/TabLane/`: renders columns in Geist Mono as SVG/HTML grid; string labels from tuning (`e B G D A E`, drop D shows `D`); chord names above; strum arrows ↓↑ under the lane; `P.M.` bracket; bar lines; `playhead` prop (step index) sets `data-playhead-step` on the root and applies `.is-active` to that column; auto-scrolls the active column into the centre third on tablet/desktop (respect reduced motion: jump instead of smooth).
- Tests: `toAscii` snapshot for C–G–Am–F with `driving-eighths` (1 bar each); drop D labels; playhead class moves.
Verify: `npx vitest run src/core/tab src/ui/TabLane 2>&1 | tail -n 15`
Done when: passing.

### 4.3 TransitionCard component
Do (`src/ui/TransitionCard/`):
- Input: `Transition` from the engine + both shapes.
- Layout: from-chord and to-chord Fretboards side by side (box on mobile, neck on larger) with an overlay layer showing each move: **anchor** = brass pin icon + soft ring; **guide/slide** = straight arrow along the string with brass dotted trail; **shift** = one bracket arrow around the grouped fingers; **lift** = dashed arc from old to new position; **place** = small "+" at the target; **release** = the dot fades to outline.
- Below: plain-English steps built by a pure `explainTransition(t)` in `src/core/engine/explain.ts` (unit-tested), e.g. "Keep fingers 1 and 2 where they are. Lift finger 3 to the 4th string, 2nd fret." / "Move fingers 2 and 3 together across one string, towards the thinner strings." (Always say "towards the thinner/thicker strings", never "up/down", which guitarists use both ways.) Short, calm, imperative. Include the difficulty label pill.
- Tests: `explainTransition` for C→Am, Em→Am, G.open.b→C, G5→A5; overlay renders one element per move/group with accessible labels.
Verify: `npx vitest run src/ui/TransitionCard src/core/engine 2>&1 | tail -n 15`
Done when: passing; examples on `/design`.

### 4.4 Library page
Do (`src/features/library/`):
- Module tabs: "Power (pop punk)", "Open (Britpop)", plus disabled "Thumb-over", "Lead", "Whammy" marked *Coming in v1.1*.
- Grid of chord cards (Fretboard box, chord name in display serif, register pill). Card opens a Sheet with all alternate shapes for that chord, each with its difficulty score, and a "Compare transition" picker: choose a second chord → shows the TransitionCard for the optimised pair.
- Filters: register, tag. Search by chord name.
- `tests/e2e/library.spec.ts`: open Library → Open tab → G card shows 3 shapes → compare with C → card text includes "together".
Verify: `npx vitest run src/features/library 2>&1 | tail -n 10 && npx playwright test library 2>&1 | tail -n 15`
Done when: passing on all 3 viewports.

### 4.5 Tab quality: playable at tempo, with rhythm
Do (PRD §20.2 — read it once here):
- Pure `src/core/tab/playability.ts`: `checkPlayable(events, fingering, bpm, opts) → Issue[]` — every note has a finger; span ≤ 4 frets (5 when `opts.stretch`); position-shift speed ≤ `MAX_SHIFT_FRETS_PER_SEC` (12) at the given tempo; string skips > 2 flagged; unreachable notes for the tuning/capo rejected. Also `checkHarmony(events, chord|scale, tuning, capo)` (chord or scale tones only, passing tones only where marked) and `checkBars(events, timeSig)` (every bar sums exactly). These run in the data scripts (a failing lesson fails the build) and in unit tests.
- Rhythm notation in `TabLane` (own SVG, not alphaTab, so the lesson bundle stays small): stems, beams for 8ths and 16ths, rests, ties, dots; time signature; bar numbers; the count row ("1 & 2 & …", toggleable); section labels and repeat signs; column spacing proportional to duration; a header line with tempo, tuning, capo and key. Articulations: accent `>`, palm-mute bracket, "let ring" bracket, ghost note `( )`, muted strum `x`, pick direction ↓↑ (toggleable), dynamics p / mf / f.
- `toAscii` stays for "Copy tab" and tests; add a rhythm line beneath it (`q e s` durations) so snapshots cover rhythm.
- Tests: an impossible shift at 180 bpm is rejected and allowed at 60 bpm; a 6-fret span is rejected unless `stretch`; a wrong-note chord is rejected; bar-sum errors; snapshot of the SVG structure (counts of stems, beams and rests) for C–G–Am–F in `pop-strum`.
Verify: `npx vitest run src/core/tab src/ui/TabLane 2>&1 | tail -n 15`
Done when: passing; `/design` shows a tab with full rhythm notation and articulations; compare with `docs/screenshots/reference/lesson-*`.

### Gate 4
Run: `npm run verify`, `npm run e2e`, `npm run build`; every chord shape and example progression passes `checkPlayable` at 200 bpm; axe on `/library` has zero serious/critical issues (add to `library.spec.ts`). Update `/design` screenshots.
CHANGELOG line: `- Fretboard, tab lane and transition card components; chord library.`
