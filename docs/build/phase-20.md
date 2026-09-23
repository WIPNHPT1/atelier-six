# Phase 20 — v2.0: Live style morph
Aim: switch style while the music plays — audio, tab and finish change together on the next bar. PRD refs: §18.3.

### 20.1 Morph planner (pure)
Do (`src/core/morph/`):
- `StyleId = 'popPunk'|'britpop'|'lead'|'thumb'|'whammy'`. `styleProfile(style)` → candidate filter, rhythm or phrase generator, tone preset, finish, dynamics, default layers.
- `planMorph({ from, to, progression, key, currentBar, bpm, quantise: 'bar'|'beat' }) → { atTime, atBar, fadeBeats, newSchedule, newShapes }`. New shapes are optimised with continuity: the first transition cost *from the currently sounding shape* is included, so the change into the new style is the easiest available.
- `blend(a, b)` → layered plan (e.g. pop punk rhythm + Britpop anchored layer at −6 dB).
- For `lead` and `whammy`, generate an original phrase over the progression with `melodyToTab`-style constraints from a small pure motif generator (seeded, deterministic; notes from the pentatonic box, rhythm from style templates).
Tests: morph lands exactly on the next bar boundary; continuity cost included; blend layer levels; motif generator deterministic for a seed and in-scale.
Verify: `npx vitest run src/core/morph 2>&1 | tail -n 15`
Done when: passing, 100% coverage.

### 20.2 Audio + visual morph
Do:
- Transport: schedule the new plan from `atTime`; crossfade old → new layers over `fadeBeats` (equal-power, per-layer gain ramps); no clicks, no double-triggered notes at the boundary (unit test on the merged event list).
- Visuals: finish morph over one beat (CSS variables interpolated), TabLane shows the new style's columns from the boundary with a thin brass seam, TransitionCard shows the cross-style change.
- Controls: style strip with five buttons (keys 1–5, pedal next/prev), "Blend" toggle with a second picker. Available in lessons with multiple styles, the cross-style lesson, the studio and jam mode.
- `tests/e2e/morph.spec.ts`: play cross-style lesson → press 2 → at the next bar `data-finish` becomes `sunburst` and `data-style` becomes `britpop`; no console errors.
Verify: `npx playwright test morph 2>&1 | tail -n 15`
Done when: passing on all viewports. Ask the user in one line to try switching styles while playing and say if the transitions sound smooth.

### Gate 20
Run: `npm run verify`, `npm run e2e`, `npm run build`, `npm run size`; record the average frame time during a morph (same method as 9.3) as `MORPH_FRAME_MS` — must be < 16.7 ms.
CHANGELOG line: `- Live style morph: switch between five styles mid-playback on the bar, with blend mode and visual finish morph.`
