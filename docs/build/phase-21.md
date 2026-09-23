# Phase 21 — v2.0: Jam mode (backing band that follows you)
Aim: a drum, bass and pad band for any progression and style that follows your tempo and your sections. PRD refs: §18.4.

### 21.1 Band pattern generators (pure)
Do (`src/core/band/`):
- `drumPattern(style, section, bars, seed)` → events for kick/snare/hat/crash/ride/tom: pop punk (fast 8th hats, snare 2 & 4, kick on 1 & 3 plus pushes, open hats in chorus), Britpop (straight 8ths, tambourine 16ths in chorus), lead/grunge (half-time verse, full chorus with crash on 1), thumb/funk (16th hats, ghost snares, syncopated kick), whammy/rap-rock (heavy half-time, big accents on the riff hits). Fills on the last beat before section changes.
- `bassPattern(style, chords, section, bars, seed)` (roots/octaves/walks/syncopation per style, locked to kick in pop punk and rap-rock).
- `padPattern(chords, section)` (sustained voicings, chorus only by default).
- Deterministic for a seed; humanise timing ±6 ms and velocity ±8 % from the seed.
Tests: bar lengths; snare on 2 and 4 where expected; fill placement; bass root on beat 1 of each chord; determinism.
Verify: `npx vitest run src/core/band 2>&1 | tail -n 15`
Done when: passing, 100% coverage.

### 21.2 Band voices
Do (`src/audio/band/`, lazy): kick = `MembraneSynth`, snare = `NoiseSynth` + short tone, hats/ride/crash = `MetalSynth` variants, toms = `MembraneSynth` pitched, bass = `MonoSynth` with a little drive, pad = `PolySynth` with slow attack. Each on its own mixer channel (19.3). Style-specific drum tuning table. `/design` "Band" section to audition each style.
Verify: `npm run verify 2>&1 | tail -n 10`
Done when: passing. Ask the user in one line to audition the five band styles and say if any sound wrong.

### 21.3 Follow tempo + follow sections (pure + worker)
Do:
- `src/core/band/beatTracker.ts`: from strum onsets (17.2), estimate tempo and phase with a simple adaptive comb/Kalman-style tracker; `nextBandTempo(current, estimate)` limited to ±3 bpm per bar and ±15 % of the start tempo; ignores bars with fewer than 3 onsets.
- `src/core/band/sectionFollower.ts`: features per bar = RMS, onset density, high-frequency energy; move to chorus when energy exceeds the verse baseline by 30 % for 2 bars; back to verse when it falls below +10 % for 2 bars; hysteresis so it can't flap; manual override always wins for 4 bars.
- Runs in `src/workers/jam.worker.ts` fed by the capture worklet.
Tests: synthetic onset streams (steady, speeding up, rubato, missing bars); section follower with scripted energy curves (no flapping, correct 2-bar latency).
Verify: `npx vitest run src/core/band 2>&1 | tail -n 15`
Done when: passing, 100% coverage.

### 21.4 Jam screen
Do (route `/jam`):
- Pick progression, key and style (or an arrangement); Start → count-in → band plays. Big section indicator (Verse/Chorus), tempo readout with a small "following you" brass dot, style strip (morph from Phase 20 works here), manual Section button (also pedal key), Record (19.1), Stop.
- "Follow me" toggles for tempo and sections (both on by default when the mic is on; with the mic off the band just plays).
- Mobile: simplified single column; works with headphones.
- `tests/e2e/jam.spec.ts`: start a jam with the fake audio file of a louder strumming loop after 4 bars of quieter loop (build the fixture with the 16.4 renderer, < 400 KB) → section indicator changes to Chorus within 4 bars.
Verify: `npx playwright test jam 2>&1 | tail -n 15`
Done when: passing. Ask the user in one line to jam for a few minutes and say if the band follows naturally.

### Gate 21
Run: `npm run verify`, `npx vitest run --coverage src/core 2>&1 | tail -n 20` (100%), `npm run e2e`, `npm run build`, `npm run size`.
CHANGELOG line: `- Jam mode: generated drum, bass and pad band per style that follows your tempo and sections.`
