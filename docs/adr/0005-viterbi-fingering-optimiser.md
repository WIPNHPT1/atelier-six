# 5. Viterbi fingering optimiser

Date: 2026-09-26

## Status

Accepted

## Context

Each chord has several shapes. Choosing the easiest shape for each chord on its own often makes
the changes between them harder. Trying every combination grows exponentially with the length
of the progression.

## Decision

Treat the progression as a lattice (one column of candidate shapes per chord) and find the
cheapest path with a Viterbi-style dynamic program. Node cost is the shape's own difficulty;
edge cost is the transition cost from classified finger moves. Looping progressions also add
the closing change. Ties break on shape id so results are deterministic. Details and weights:
[docs/engine.md](../engine.md).

## Consequences

- Runtime is O(n·k²) (n chords, k shapes each), fast enough to run live in the browser.
- A hard cap of 400 candidates keeps worst cases bounded.
- The cost weights are the tuning knob; changing them changes fingerings app-wide, so they are
  pinned by tests.
