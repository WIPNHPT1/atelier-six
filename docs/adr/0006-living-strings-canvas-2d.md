# 6. Living strings: Canvas 2D, not PixiJS

Date: 2026-09-25

## Status

Accepted

## Context

Step 9.3 (Living strings) draws vibrating strings on the neck-orientation Fretboard during
playback: up to 6 polylines, each ~40 segments, redrawn every animation frame while a chord
rings. The build doc allows reaching for PixiJS (WebGL) "only if Canvas can't hold 60 fps —
measure first and record the decision."

## Decision

Measured first: `tests/e2e/frame-time.spec.ts` drives a real lesson's playback (which mounts
the neck-orientation Fretboard and its `LivingStrings` canvas) and averages `requestAnimationFrame`
deltas over 5 seconds on the desktop project. Result: **FRAME_MS=16.61**, essentially the
display's native ~16.67 ms vsync cadence with no measurable overhead from the drawing work —
recorded in `PROGRESS.md`.

Plain Canvas 2D stays. The per-frame work (a handful of `moveTo`/`lineTo`/`stroke` calls,
computed from a pure `stringDisplacement()`, with no per-frame allocations) is far below
budget, so PixiJS's WebGL context and bundle weight would add cost without a measurable
benefit.

## Consequences

- `src/ui/livingStrings/LivingStrings.tsx` keeps using the 2D canvas context directly.
- If a future step adds a lot more simultaneously-animated geometry (e.g. several fretboards
  animating at once, or a much denser path), re-run `frame-time.spec.ts` and revisit this
  decision if it regresses past ~16.7 ms.
