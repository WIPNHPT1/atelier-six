# 3. Tone.js for audio

Date: 2026-09-26

## Status

Accepted

## Context

Lessons play a humanised backing band (guitars, bass, drums, metronome) in time with a moving
playhead. Raw Web Audio has no musical transport, looping or sample-accurate scheduling
helpers, and getting those right by hand is slow and error-prone.

## Decision

Use Tone.js for the transport, `Tone.Part` scheduling and sample playback. Keep all timing
maths in pure `src/core/schedule` code; `src/audio` only turns events into sound.

## Consequences

- Sample-accurate loops, tempo changes and count-ins with little code.
- Tone.js is large, so it is loaded lazily and banned from the entry chunk (`npm run size`).
- Tone.js crashes in jsdom, so UI tests mock `src/audio` and schedule tests never import it.
