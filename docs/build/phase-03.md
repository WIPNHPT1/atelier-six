# Phase 3 — Transition engine (the centrepiece)
Aim: classify every finger move between two shapes, cost it, and find the easiest fingering route through a progression. Pure TS in `src/core/engine/`, 100% coverage. PRD refs: §7 (this file is the authority where they differ).
Write the tests for each step FIRST (from the cases given), watch them fail, then implement.

Shared definitions:
- A finger's **position** in a shape = `{string, fret}` of the lowest-index string it frets. A barre finger's position is its lowest barred string.
- Fingers compared: 1, 2, 3, 4, T. Open strings and muted strings have no finger.
- `vector(f)` = `{dString: posB.string − posA.string, dFret: posB.fret − posA.fret}` for fingers present in both shapes.

### 3.1 Move classifier
Do: `classifyMoves(a: Shape, b: Shape): Move[]` where `Move = { finger, type: 'anchor'|'guide'|'lift'|'place'|'release', from?, to? }` (group handling comes in 3.2 — for now fingers with a non-zero vector and dString ≠ 0 are `lift`).
- anchor: vector (0,0). guide: dString 0, dFret ≠ 0. lift: dString ≠ 0. place: only in B. release: only in A.
- Output sorted by finger (1,2,3,4,T).
Tests (from PRD §7.5, shapes via the Phase 2 library loader or `parseShape`):
- C `x32010 -32-1-` → Am `x02210 --231-`: 1 anchor, 2 anchor, 3 lift.
- Em7 `022033 -12-34` → G `320033 21--34`: anchors ≥ 3 (1, 3, 4); 2 lift.
- a finger only in A → release; only in B → place.
Verify: `npx vitest run src/core/engine 2>&1 | tail -n 15`
Done when: passing.

### 3.2 Slide/shift grouping
Do: extend to `analyseTransition(a, b): Transition` = `{ moves: Move[], groups: Group[] }`, `Group = { kind: 'slide'|'shift', fingers: Finger[], vector }`.
- Group = ≥2 fingers present in both shapes with the identical NON-ZERO vector. dString = 0 → slide; else shift.
- Fingers in a group get move type `'group'` with `groupIndex`; anchors are never grouped.
- If two different vectors both have ≥2 fingers, make two groups. Deterministic order: by lowest finger number.
Tests:
- Em `022000 -23---` → Am `x02210 --231-`: one shift group {2,3} vector (1,0); 1 place.
- G.open.b `320003 32---4` → C `x32010 -32-1-`: one shift group {2,3} vector (1,0); 4 release; 1 place.
- G5 `355xxx 134---` → A5 `577xxx 134---`: one slide group {1,3,4}, vector (0,2).
- G5 `355xxx` → C5 `x355xx -134--`: one shift group {1,3,4}, vector (1,0).
- Anchors with same (0,0) vector: never a group.
Verify: same as 3.1.
Done when: passing.

### 3.3 Costs + shape difficulty
Do (`src/core/engine/cost.ts`), all weights in one exported `WEIGHTS` object so they can be tuned:
- Move costs: anchor 0; guide `1 + 0.25·|dFret|`; place 2; release 0; lift `3 + 0.3·√(dString² + dFret²)`.
- Group costs (whole group, once): slide `1 + 0.2·|dFret|`; shift `1.5 + 0.25·|dFret|`.
- `transitionCost(t)` = Σ moves (non-grouped) + Σ groups. Round to 2 dp for output only.
- `shapeDifficulty(s)` = `2·max(0, span − 3)` (span = highest − lowest fretted fret, ignoring open strings) + 2 if barre + 1 if thumb + 0.5 per *interior* muted string (a muted string with sounding strings on both sides).
Tests: exact numeric expectations for every 3.2 case; E-shape F barre difficulty = 2; `x32010` interior mutes = 0; `x3x010`-style shape has 1 interior mute.
Verify: same as 3.1.
Done when: passing.

### 3.4 Viterbi optimiser
Do (`src/core/engine/optimise.ts`): `optimise(chords: Shape[][], {loop}): Result` where `chords[i]` = candidate shapes for chord i.
- Result = `{ shapes: Shape[], transitions: Transition[], total: number }`.
- DP: `cost[i][k] = shapeDifficulty(k) + min_j (cost[i-1][j] + transitionCost(j→k))`; keep back-pointers.
- Loop: for each candidate `s` of chord 0, run the DP with chord 0 fixed to `s`, add `transitionCost(last→s)`; take the minimum. Include the closing transition in `transitions`.
- Tie-break: lower `shape.id` (string compare) wins, at every step, for determinism.
- Complexity guard: throw if Σ candidates > 400 (callers filter by tags/register first).
- `candidatesFor(chordNames, {tags, register})` helper using the library loader.
Tests:
- [G, C] with G candidates {G.open.a, G.open.b} and C {C.open}: picks **G.open.b** (3-2-4).
- Loop G–C–Em–D (open + anchored candidates): same result across 100 runs; total equals the sum of its parts.
- Power I–V–vi–IV in C with power candidates: every transition contains a slide or shift group (no lifts).
- Single chord; empty input returns total 0; > 400 candidates throws.
Verify: same as 3.1.
Done when: passing.

### 3.5 Difficulty scoring
Do: `scoreProgression(chordNames, filter, {loop})` → `{ total, perTransition: {from, to, cost, hardestMove}[] , label: 'gentle'|'moderate'|'demanding' }` (thresholds on the average transition cost: < 4 gentle, < 7 moderate, else demanding — e.g. C→Am ≈ 3.67, G.open.b→C = 3.5). `hardestMove` = the costliest move or group — this feeds the UI hints and the heatmap.
Tests: C→Am is gentle; G.open.a-only G→C is harder than with G.open.b available; labels at boundary values.
Verify: `npx vitest run --coverage src/core/engine 2>&1 | tail -n 20`
Done when: passing, engine coverage 100%.

### 3.6 docs/engine.md
Do: a 1–2 page write-up for technical readers:
- Problem (chords are easy, changes are hard), the move taxonomy with a table, grouping, cost model, why Viterbi (it's the same shortest-path-through-a-lattice idea used in speech decoding), loop handling, determinism, complexity O(n·k²), how weights were chosen and how to tune them.
- A Mermaid diagram of the lattice (chords as columns, shapes as nodes, chosen path highlighted).
- The G→C worked example with real numbers from the tests.
- Link it from README.
Verify: `npx prettier --check docs/engine.md 2>&1 | tail -n 3`
Done when: file exists and numbers in it match test expectations.

### Gate 3
Run: `npm run verify`, `npx vitest run --coverage src/core 2>&1 | tail -n 20` (100%), `npm run build`.
CHANGELOG line: `- Transition engine: move classification, slide/shift groups, cost model, Viterbi fingering optimiser.`
