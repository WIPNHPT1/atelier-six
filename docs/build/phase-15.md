# Phase 15 — Cross-style lesson, tone recipes, v1.1 release
Aim: tie the five modules together, add tone recipes, and ship v1.1.0. PRD refs: §16.2 (recipes), §16.7, §16.8.

### 15.1 Cross-style lesson
Do:
- Lesson `cross-style` (unlocked when one lesson in each module is complete, with a "Preview anyway" option): I–V–vi–IV in G as five sections — Pop punk (power, driving eighths, palm-muted), Britpop (anchored opens, sixteenth motion), Lead (original melodic phrase over the chords), Thumb-over (thumb shapes + mixed embellishments + bass bed), Whammy (octave-up phrase with pedal lane).
- Switching section changes finish, rhythm/phrase, tone and transition card (a cross-fade between finishes; the *live* mid-playback morph remains v2 — switching applies from the next bar).
- A comparison strip shows the same four chords' optimised shapes per style side by side, with each style's total difficulty.
- `tests/e2e/cross-style.spec.ts`: open via "Preview anyway" → step through all 5 sections → `data-finish` changes each time → Play works in the last section.
Verify: `npm run data:lessons 2>&1 | tail -n 5 && npx playwright test cross-style 2>&1 | tail -n 15`
Done when: passing.

### 15.2 Tone recipes + "Your gear"
Do:
- `src/data/toneRecipes.ts`: one recipe per module: amp gain/bass/mid/treble as 0–10, pickup position, pedals in order with key settings, a budget version (one affordable multi-effect or modeller setting), and 2–3 "listen for" notes. Describe gear generically (e.g. "a pitch-shifting expression pedal such as the DigiTech Whammy") and never claim endorsement.
- Settings → "Your gear": pickups (single-coil / humbucker / P-90), amp (clean amp / modeller / valve amp), has Whammy-style pedal (yes/no), has audio interface (yes/no). Pure `adaptRecipe(recipe, gear)` adjusts gain/treble and swaps "No pedal?" defaults (tested).
- Recipe card in each module's intro and a "Tone" tab in the lesson player; a "Hear the app's version" button plays the matching preset.
Verify: `npx vitest run src/core src/data 2>&1 | tail -n 10`
Done when: passing.

### 15.3 Curriculum integration
Do:
- Course order 1→5 on the Today page and Library; module intro pages (one calm paragraph, what you'll learn, tone recipe, listening references).
- Planner (6.6): include lead drills (bends, stutter, lane-follow) in reviews using their accuracy scores; warm-up alternates chromatic with pentatonic box runs once Module 3 has started.
- Progress: per-module rings; engravings collection now includes phrases mastered (engraved mini tab).
- Heatmap: add a "Technique" view (bend accuracy, stutter timing, lane-follow) next to transitions.
- Demo mode (10.2): extend the script with a 6-second v1.1 segment (bend trace → rocking pedal → finish morph to Stencil); keep the whole tour ≤ 28 s; update `demo.spec.ts`.
Verify: `npx vitest run src/core/practice 2>&1 | tail -n 10 && npx playwright test demo 2>&1 | tail -n 10`
Done when: passing.

### 15.4 Docs, README, v1.1.0 release (USER ACTION: new GIF)
Do:
- README: new features, updated GIF note, "Lead notation" section with the §16.1 token table, engine section mentions the reused Viterbi (chords, melodies, double-stops), updated quality numbers.
- `docs/engine.md`: add "One optimiser, three problems" (chord fingerings, melody-to-tab, double-stops) with the generic interface.
- `docs/architecture.md`: lead/pedal/MIDI/live-input data flow.
- ADR `0009-generic-viterbi.md`.
- STOP and ask the user to re-record the demo GIF (same instructions as 10.2) and say done; commit it.
- Add `- Cross-style lesson, tone recipes with "Your gear", and all five modules in the planner and progress.` to Unreleased, then move Unreleased lines to `## [1.1.0] - <today>`; `npm version 1.1.0 -m "chore(release): v%s"`; `git push --follow-tags`; `gh release create v1.1.0` with notes from the changelog (or give the user the text).
Verify: `npm run check:links 2>&1 | tail -n 5 && git tag --list v1.1.0`
Done when: tag and release exist; CI green on the tag.

### Gate 15
Run: `npm run verify`, `npx vitest run --coverage src/core 2>&1 | tail -n 20` (100%), `npm run e2e`, `npm run build`, `npm run size`, `npx lhci autorun` (same thresholds as v1). Update recorded numbers in `PROGRESS.md`. Reply to the user with the live URL, the v1.1 quality numbers, and: "v1.1 is live. Start a new session (⌘N) and type /next to start v1.2 (Phase 16: chord detection)."
