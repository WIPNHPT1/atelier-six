# Phase 14 — Module 5: Whammy and noise (reference style: Tom Morello)
Aim: pedal-driven lead lines, stutter and drop D riffs — with or without a real pedal. PRD refs: §16.3, §16.6, §16.8.

### 14.1 Whammy in playback
Do:
- Wire `pedalToSemitones` + `samplePedal` (11.2) into the lead voice: `detune` automation scheduled per sixteenth from the phrase's pedal lane, `rampTo` between points for `linear`, `setValueAtTime` for `step`. Modes per §16.3; mode shown as a small label above the pedal lane.
- `whammy-lead` tone preset (fuzz + a touch of octave) as the default for Module 5.
- Tests (pure): automation point list for a heel→toe→heel lane at 100 bpm; dive mode sign; step vs linear.
Verify: `npx vitest run src/core/schedule 2>&1 | tail -n 10 && npm run verify 2>&1 | tail -n 10`
Done when: passing.

### 14.2 Pedal input: on-screen rocker + MIDI pedal
Do:
- `src/ui/PedalRocker/`: SVG/CSS 3D rocker (perspective, rotateX from −12° heel to +12° toe) with the **rocking pedal** candy; drag, wheel, touch, and ↑/↓ keys (±0.1; PageUp/PageDown = toe/heel). ARIA `role="slider"` 0–100 with value text "heel/halfway/toe".
- `src/audio/midi.ts`: feature-detect `navigator.requestMIDIAccess`; "Connect MIDI pedal" button (never prompt on load); **learn mode**: next CC that changes (CC 4 or 11 typical) becomes the pedal; value 0–127 → pos 0–1; saved in settings. Hot-plug handling. Hidden with a one-line explanation where unsupported (Safari/iOS).
- **Follow the lane drill:** the pedal lane plays; your rocker/MIDI position is drawn as a second line; pure `laneAccuracy(target: PedalPoint[], actual: {t,pos}[]) → { meanError, withinPct }` in core, tested; result card.
- Tests: rocker keyboard steps and aria values; MIDI mapping pure fn `ccToPos`; lane accuracy on synthetic data.
- `tests/e2e/pedal.spec.ts`: on a Module 5 lesson, focus the rocker, press ↑ five times → aria value 50 → the lane's live marker moves.
Verify: `npx vitest run src/core src/ui/PedalRocker 2>&1 | tail -n 15 && npx playwright test pedal 2>&1 | tail -n 10`
Done when: passing.

### 14.3 Killswitch stutter drill
Do:
- Schedule `kill` events → master gain square-wave automation (5 ms ramps to avoid clicks) at 8ths, triplets or 16ths.
- Drill: phrase sustains while the user "flicks the switch" by tapping (button, Space, pedal key or MIDI note); pure `stutterAccuracy(taps, grid, bpm) → { meanAbsMs, early, late, hitPct }` (hit = within 30 ms); adaptive tempo (6.4) applies.
- **Stutter indicator** candy per §16.8: a small brass bar pulses — never full-screen, and capped below 3 flashes/second (above that it shows a steady "stutter on" state instead). Unit-test the cap.
Tests: accuracy maths; flash cap; kill automation timing.
Verify: `npx vitest run src/core 2>&1 | tail -n 10`
Done when: passing, 100% core coverage.

### 14.4 Live input (desktop, optional)
Do:
- `src/audio/liveInput.ts`: "Play through" in Module 5 on desktop only (hidden < 1200 px): requires ticking "I'm wearing headphones"; `getUserMedia` with processing off → lead tone chain → `Tone.PitchShift` (windowSize 0.03) driven by the pedal → limiter. Input device picker. Off by default; stops on route change.
- Show measured latency: `baseLatency + outputLatency + pitch-shift window`, as "≈ 28 ms". Pure `estimateLatency(ctxInfo, windowSize)` tested.
- Write ADR `docs/adr/0008-whammy-playback-vs-live-pitch-shift.md`: direct frequency control for playback (zero latency) vs granular shifting for live input (latency, artefacts).
Verify: `npx vitest run src/core 2>&1 | tail -n 10 && npm run lint 2>&1 | tail -n 5`
Done when: passing. Tell the user in one line: if they have an audio interface, try Play through with headphones and report the latency shown.

### 14.5 Module 5 lessons
Do:
- Add module `whammy` (8 lessons, all phrases and riffs original): what the pedal does (gear lesson text + rocker demo); drop D riffs with one-finger power chords (uses 8.3 drop D shapes); octave-up line with the pedal rocked on the beat; rhythmic rocking on 16ths; dive-bomb accents; harmony-5th line; killswitch stutter; full arrangement (drop D riff verse → Whammy lead break → stutter outro). Each lesson has a "No pedal?" alternative phrase (bends or tremolo-arm dips) shown with a toggle.
- Enable the "Whammy" Library tab. Finish **Stencil** applied; stencil heading type from a free, self-hosted stencil font (e.g. Big Shoulders Stencil via `@fontsource`), loaded only in this module.
- Listen refs per PRD §16.6.
- `tests/e2e/whammy.spec.ts`: open the octave-up lesson → pedal lane visible → Play → rocker follows the lane automatically → toggle "No pedal?" → pedal lane hidden and tab shows bends.
Verify: `npm run data:phrases && npm run data:lessons 2>&1 | tail -n 5 && npx playwright test whammy 2>&1 | tail -n 15`
Done when: passing.

### 14.6 Module 5 tune + style review
Do (PRD §20): apply 6.0's style sheet, riff builder and linter to this module (its style JSON already exists); write the module's original tune and two riffs of the week as in 6.7, with full band, humanised playback and full tab notation; every lesson, riff and tune passes `checkPlayable`, `checkHarmony`, `checkBars` and `lintAgainstStyle`. Add "Play along" to its listening references (6.8).
Verify: `npm run data:lessons 2>&1 | tail -n 5 && npm run lint:style 2>&1 | tail -n 10`
Done when: the tune plays end to end and every check passes.

### Gate 14
Run: `npm run verify`, `npm run e2e`, `npm run build`, `npm run size`, axe on Module 5 pages. Then the **review gate** (PRD §20.6, USER ACTION): ask the user to play this module's tune and two lessons and score **playable / sounds like the style / fun** from 1 to 5; rework anything under 4 before closing the gate.
CHANGELOG line: `- Module 5 (Whammy): pedal lane playback, on-screen and MIDI pedals, stutter drill, optional live input, 8 lessons with no-pedal alternatives.`
