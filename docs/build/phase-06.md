# Phase 6 — Lessons and drills
Aim: the actual course for Modules 1–2, the lesson player with arrangement sections, the four drills, adaptive tempo, progress and the daily planner. PRD refs: §5 (Modules 1–2), §9 items 2, 4, 5, 7, 8.

### 6.0 Style sheets, riff builder, style lint
Do (PRD §20.1 — read it once here):
- `src/data/styles/{power,open,lead,thumb,whammy}.json` with the fields from the table (tempo range, feel, tunings, harmony, structure, must-include, avoid) plus building blocks: `rhythmCells` (named 1-bar patterns in the rhythm-step format), `progressions` (roman numerals), `phraseShapes` (contours for riffs and melodies, e.g. "rise-hold-fall", "call-answer"), `articulations` (which marks are typical). Modules 3–5 get their JSON now too, so the linter can run on them later.
- Pure `src/core/style/riffBuilder.ts`: `buildRiff(style, {key, bars, seed, difficulty})` → rhythm + notes from the style's cells and shapes, fingered by the engine, passing `checkPlayable`, `checkHarmony` and `checkBars`. Deterministic for a seed.
- Pure `src/core/style/lint.ts`: `lintAgainstStyle(lessonOrTune, style) → Issue[]` — tempo in range, feel matches, required idioms present (e.g. pop punk: at least one change pushed onto the "and" of 4, palm-mute contrast between sections), nothing from "avoid". `npm run lint:style` runs it over every lesson, riff and tune; a failure fails the build.
- Tests: generated riffs lint clean for each style across 20 seeds; a hand-made bad example (pop punk in swing at 90 bpm) produces the expected issues.
Verify: `npx vitest run src/core/style 2>&1 | tail -n 15`
Done when: passing, 100% coverage.

### 6.1 Lesson data
Do:
- Types in `src/core/lessons/types.ts`: `Lesson = { id, module: 'power'|'open', title, goal, progression: {id, key} | {chords: string[]}, candidates: {tags, register?}, arrangement: Arrangement, startBpm, targetBpm, tuning, capo, tips: string[], listen: {artist, song, note}[] }`.
- Every lesson declares its style and uses its rhythm cells, progressions and articulations; `npm run data:lessons` runs `checkPlayable`, `checkHarmony`, `checkBars` and `lintAgainstStyle` and fails on any issue.
- `scripts/data/lessons.src.ts` then `npm run data:lessons` → `src/data/lessons.json`. The script runs the optimiser, stores each lesson's chosen shape ids + difficulty, and sorts lessons within a module by difficulty (ties keep source order).
- **Module 1 — Power (pop punk)**, 8 lessons: E5↔A5 open slide; G5→A5 locked-shape slide; G5→C5 string shift; I–V–vi–IV in C (power); vi–IV–I–V in D (power); downpicking stamina (one chord, rising tempo); verse/chorus arrangement (palm-muted eighths → open ringing chorus, stops on the turnaround); octave-shape intro riff over the same progression. Listen refs: Blink-182 "All the Small Things", "What's My Age Again?"; Machine Gun Kelly "I Think I'm OKAY" (verify each name is a real track; drop any you can't verify).
- **Module 2 — Open (Britpop)**, 8 lessons: C→Am anchors; Em→Am shift; G(3-2-4)→C; Em7–G–Dsus4–A7sus4 anchored loop; Cadd9 and friends (G–Cadd9–Em7–Dsus4); continuous sixteenth-strum motion; capo 2 arrangement (strummed rhythm + second layer on higher voicings); I–V–vi–IV in G open. Listen refs: Oasis "Wonderwall", "Don't Look Back in Anger", "Live Forever".
- `tips`: 2–4 short, calm lines per lesson written from the engine output (e.g. which finger anchors) plus technique notes (release pressure between power chords; keep the strumming arm moving). No tab or lyrics of real songs anywhere.
- Tests: every lesson validates (all chords resolve, candidates non-empty, startBpm < targetBpm); module order is ascending by difficulty.
Verify: `npm run data:lessons 2>&1 | tail -n 5 && npx vitest run src/core/lessons 2>&1 | tail -n 10`
Done when: 16 lessons generated and tests pass.

### 6.2 Lesson player + arrangement
Do (`src/features/lesson/`), route `/lesson/:id`:
- Header: module finish applied (`data-finish` xerox for power, sunburst for open), title in display serif, goal line, difficulty pill.
- Section SegmentedControl (from the lesson's arrangement: e.g. Intro/Verse/Chorus). Switching section swaps rhythm preset, register filter (re-optimises shapes), dynamics.
- Layers (tablet/desktop only): list of layers with mute/solo toggles; each layer is its own schedule mixed together with pan.
- Main area: current + next chord Fretboards (next as `ghost`), TabLane with playhead, TransitionCard for the upcoming change (updates as playback advances).
- Toolbar: Play/Stop, Loop, tempo Slider (startBpm…targetBpm+20), metronome toggle, count-in toggle, "Copy tab".
- Tips list and "Listen for" references (plain text; no embeds).
- Layout: mobile = one column (Fretboards large, tab in landscape only with a rotate hint), tablet = tab across top + fretboards/transition below, desktop = three columns.
- **Focus mode:** while playing, dock/rail/sidebar and secondary panels fade out after 3 s (motion off: hide instantly); any pointer move, tap, key or pedal brings them back.
- **Course page** (`/course`) and **module pages** (`/course/:module`), matching `docs/screenshots/reference/course-*` and `module-*` (hero with progress ring and Continue, lesson list gentlest first, tone recipe, listening references, skill chips, the module's finish). Course page: modules as editorial cards (finish colour accent, progress ring, lesson count), each opening a lesson list with difficulty pills, best tempo and a lock-free "Start" (no gating). Register lessons and chords with the command palette (`registerCommands`). Onboarding now ends on the recommended first lesson for the chosen level.
- Replace `/lesson/demo` with a redirect to the first lesson.
- `tests/e2e/lesson.spec.ts`: open first open-chord lesson → switch to Chorus → tab changes (ASCII differs) → Play → playhead moves.
Verify: `npx vitest run src/features/lesson 2>&1 | tail -n 10 && npx playwright test lesson 2>&1 | tail -n 15`
Done when: passing on all viewports.

### 6.3 Drills
Do (`src/features/drills/`), each drill usable from a lesson (for its hardest transition) and from `/drills` (pick any two chords):
- **Two-chord loop:** A↔B, 2 bars each, looped.
- **Early change:** schedule marks beat 4 of each bar as "change now" (brass flash on the target Fretboard; audio plays the next chord from beat 4's "and").
- **Freeze and check:** playback pauses on the target chord for N seconds (default 3) with the target Fretboard enlarged; resumes automatically.
- **One-minute changes:** 60 s countdown dial; user taps a large "Change" button (or presses Space/pedal) per clean change; result saved.
- Pure logic (drill schedules, one-minute session state) in `src/core/drills/`, tested.
Verify: `npx vitest run src/core/drills src/features/drills 2>&1 | tail -n 15`
Done when: passing.

### 6.4 Adaptive tempo
Do: pure `nextTempo(history, {min, max})` in `src/core/practice/` aiming for 80–85 % clean over a rolling window of the last 8 attempts (PRD §20.5): above 85 % → +4 bpm; 80–85 % → hold; below 80 % → −4 bpm; clamp to [startBpm−10, targetBpm+20]. If still below 70 % at the minimum tempo, return `simplify: true` so the lesson switches to its easier part (fewer notes or an easier voicing, defined per lesson). UI: "Clean" / "Missed" buttons after each loop in lessons and drills (also keys C / M). Show a subtle "Target reached" state at targetBpm.
Tests: result sequences → expected tempos and holds; clamping; the simplify trigger.
Verify: `npx vitest run src/core/practice 2>&1 | tail -n 10`
Done when: passing.

### 6.5 Progress storage + heatmap
Do:
- Install `idb-keyval`. `src/features/progress/store.ts`: records `{ lessonId, bestBpm, cleanStreak, lastPracticed }`, `{ transitionKey: "G.open.b>C.open", attempts, misses, lastMs }`, one-minute scores `{ key, date, count }`, sessions `{ date, minutes }`. Versioned schema with a migration function (pure, tested).
- Progress page: practice ring (Dial, today's minutes vs a 20-minute goal), per-module lesson list with best tempo, one-minute score sparkline per transition (simple SVG), **transition heatmap** — grid of chord-from × chord-to cells coloured by miss rate in five stepped brass levels (not a smooth blend), cells stretch to the card width (`repeat(n, minmax(0,1fr))`), same-chord diagonal cells shown as empty dashed cells, the single worst cell outlined with its % printed inside, a one-line caption ("Rows are the chord you leave, columns the one you land on"), a Fewer→More legend and a "Drill <worst>" button; worst first list beside it with "Drill this" buttons (on mobile the Drill button replaces the list). Module summary: five equal columns, rings with no arc at 0%, one-line short names (Power, Open, Lead, Thumb, Whammy) and a state line (`5/8`, `Started`, `Not yet`). Match `docs/design/screens.html` → Progress on all three devices.
- Export/import progress as JSON (Settings page) so data can be moved between devices without accounts.
Verify: `npx vitest run src/features/progress src/core 2>&1 | tail -n 15`; `tests/e2e/progress.spec.ts`: complete a one-minute drill with 5 taps → Progress shows score 5 → reload → still 5.
Done when: passing.

### 6.6 Practice planner
Do: pure `planSession(today, progress, lessons)` in `src/core/practice/planner.ts` → `{ warmup, newLesson, reviews: TransitionKey[3] }`. Reviews = spaced repetition: each transition has `interval` days (start 1); clean session → interval ×2 (max 30), miss → reset to 1; due when `lastPracticed + interval ≤ today`; pick the 3 due transitions with the highest miss rate. Warm-up = a gentle chromatic/finger-independence exercise rendered as tab (pure generator, tested). New lesson = first incomplete lesson in module order.
UI: the Today page (`/`) shows the plan as three calm cards with Start buttons and the practice ring.
Tests: interval doubling/reset, due selection, deterministic output for a fixed date.
Verify: `npx vitest run src/core/practice 2>&1 | tail -n 10`
Done when: passing.

### 6.7 Module tunes + riffs of the week
Do (PRD §20.4):
- One original **module tune** each for Modules 1 and 2 (2–3 minutes, sections per the style sheet), written as arrangement data in `scripts/data/tunes.src.ts` using the riff builder and hand-shaped where needed. Each gets a full band part (drums, bass; pad for Britpop), humanised playback, full tab notation, and passes playability, harmony, bar and style checks. Give each an evocative original title.
- Two **riffs of the week** per module (4–8 bars), unlocked after lessons 3 and 6.
- Tune player = lesson player in "performance" mode: all sections in order, band on, section markers, practise-a-section loop, and a finish screen with a quiet chime and ripple.
- Module pages show the tune as the final card ("The tune"); the planner schedules it once its module's lessons are 75 % done.
Verify: `npm run data:lessons 2>&1 | tail -n 5 && npm run lint:style 2>&1 | tail -n 10 && npx playwright test lesson 2>&1 | tail -n 10`
Done when: both tunes play end to end and pass every check.

### 6.8 Fun and feel
Do (PRD §20.4–20.5):
- **Music in the first minute:** onboarding ends with a two-chord groove in the chosen style (Em–C for open, E5–A5 for power) played with the band; the user plays along before any drill.
- **Play time in every session:** `planSession` gives at least 30 % of the minutes to a tune, riff or jam (test it).
- **"Was that fun?"** thumbs up/down after each lesson and tune (local only); Progress lists lessons with ≥ 2 thumbs-down under "Needs a rethink" (the review gate reads this).
- **Play along with the record:** on module pages, each listening reference has "Play along": sets that module's tuning and capo, a big tap-tempo button (tap with your copy of the song), then loops the current lesson's technique at that tempo with click only (no band). Stores nothing about the song beyond its name.
Verify: `npx vitest run src/core/practice 2>&1 | tail -n 10 && npx playwright test nav 2>&1 | tail -n 10`
Done when: passing.

### 6.9 Foundations module + hand health
Do:
- A short **Foundations** module shown first on the Course page (skippable for "Confident" players from onboarding), 5 lessons, each 3–6 minutes and hands-on:
  1. **How to read tab:** an interactive tab where tapping a number lights the string and fret on the Fretboard and plays it; the rhythm row, counts and main symbols explained one at a time; a 30-second "read and play" check.
  2. **Holding the guitar and the pick:** posture (sitting and standing), pick grip, where the picking hand rests for palm muting; illustrated with simple line drawings made in SVG.
  3. **Your first tune-up:** a guided walkthrough of the tuner string by string, with what "sharp" and "flat" mean.
  4. **Fretting cleanly:** finger just behind the fret, thumb position, why notes buzz; the app's Listen mode tells you which string is muffled (from Phase 16 onwards; a tap-to-confirm version before that).
  5. **Hand-health warm-up:** 2 minutes of gentle finger and wrist movements with a timer, plus clear guidance to stop if anything hurts and to see a professional for pain that continues. No medical claims.
- The hand-health warm-up is offered automatically before downpicking stamina, thumb-over and any session over 30 minutes (it can be skipped; the planner remembers).
- All Foundations material follows the tab standard (4.5) and the copy rules.
Verify: `npm run data:lessons 2>&1 | tail -n 5 && npx playwright test lesson 2>&1 | tail -n 10`
Done when: Foundations appears first for new players, each lesson works on all devices.

### Gate 6
Run: `npm run verify`, `npx vitest run --coverage src/core 2>&1 | tail -n 20` (100%), `npm run lint:style`, `npm run e2e`, `npm run build`.
Then the **review gate** (PRD §20.6, USER ACTION): push, wait for deploy, and ask the user to play each module's tune and two lessons on their guitar and score **playable / sounds like the style / fun** from 1 to 5, for Modules 1 and 2. Rework anything under 4 (log why in `LESSONS.md`) and ask again before closing the gate.
CHANGELOG line: `- Modules 1–2 course, lesson player with arrangement sections and layers, drills, adaptive tempo, progress and daily planner.`
