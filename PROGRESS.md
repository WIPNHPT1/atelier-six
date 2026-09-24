# Progress

Current: 6.2
Legend: [ ] todo · [x] done · BLOCKED: reason
Rule: update "Current" and tick the box in the same commit as the step. Unfinished work lives in `RESUME.md`.
Milestones: v1.0 = Phases 0–10 · v1.1 = 11–15 · v1.2 = 16–17 · v2.0 = 18–22 · v2.x = 23–24 (final).
Recorded numbers (fill in as you go): LIVE_URL=https://ateliersix.netlify.app · JS_KB=106 · FRAME_MS= · LH= · DETECT_ACC= · CHUNKS= · REC_MB= · MORPH_FRAME_MS= · CAMERA_ACC=

## Pace log

| Phase | Date finished | Usage windows |
| ----- | ------------- | ------------- |
| 0     | 2026-09-23    | 1             |
| 1     | 2026-09-23    | 1             |
| 2     | 2026-09-23    | ?             |
| 3     | 2026-09-23    | ?             |
| 4     | 2026-09-24    | ?             |
| 5     | 2026-09-24    | 1             |

## Phase 0 — Repo foundation

- [x] 0.1 Scaffold Vite + React + TS (strict)
- [x] 0.2 ESLint, Prettier, npm scripts
- [x] 0.3 Vitest + Testing Library
- [x] 0.4 Playwright smoke test
- [x] 0.5 Husky, lint-staged, commitlint
- [x] 0.6 Repo community + config files
- [x] 0.7 GitHub Actions CI
- [x] 0.8 Netlify config + first deploy (USER ACTION)
- [x] 0.9 Name and artist-reference check (USER ACTION)
- [x] Gate 0

## Phase 1 — Design system

- [x] 1.1 Tokens, finishes, global styles, fonts
- [x] 1.2 Base components
- [x] 1.3 App shell + settings store
- [x] 1.4 Logo + icons
- [x] 1.5 /design gallery + screenshots
- [x] 1.6 Premium navigation layer
- [x] Gate 1

## Phase 2 — Music core

- [x] 2.1 Pitch and key math
- [x] 2.2 Shape types + validator
- [x] 2.3 Chord data generator
- [x] 2.4 Progressions, rhythms, tunings
- [x] Gate 2

## Phase 3 — Transition engine

- [x] 3.1 Move classifier
- [x] 3.2 Slide/shift grouping
- [x] 3.3 Costs + shape difficulty
- [x] 3.4 Viterbi optimiser
- [x] 3.5 Difficulty scoring
- [x] 3.6 docs/engine.md
- [x] Gate 3

## Phase 4 — Rendering

- [x] 4.1 Fretboard component
- [x] 4.2 TabLane component
- [x] 4.3 TransitionCard component
- [x] 4.4 Library page
- [x] 4.5 Tab quality: playable at tempo, with rhythm
- [x] Gate 4

## Phase 5 — Audio

- [x] 5.1 Pure scheduler
- [x] 5.2 Guitar voice + strum
- [x] 5.3 Metronome + count-in
- [x] 5.4 Transport + playhead sync
- [x] 5.5 Real instrument sound + humanised playback
- [x] Gate 5
  - Device check (2026-09-24, Mac + iPhone/iPad over local preview): audio starts after one tap ✓, plays on both devices ✓, sounds like a real guitar and band ✓ (after tuning: distorted palm-mute chug, acoustic punk drums, no bass in the groove). Silent-switch on/off not separately reported. Mic, install, offline, rotation and large-text rows belong to later gates.

## Phase 6 — Lessons and drills

- [x] 6.0 Style sheets, riff builder, style lint
- [x] 6.1 Lesson data
- [ ] 6.2 Lesson player + arrangement
- [ ] 6.3 Drills
- [ ] 6.4 Adaptive tempo
- [ ] 6.5 Progress storage + heatmap
- [ ] 6.6 Practice planner
- [ ] 6.7 Module tunes + riffs of the week
- [ ] 6.8 Fun and feel
- [ ] 6.9 Foundations module + hand health
- [ ] Gate 6 (includes your listening review)

## Phase 7 — Tuner and listening

- [ ] 7.1 Pitch → note/cents
- [ ] 7.2 Tuner UI
- [ ] 7.3 Root-note auto-advance
- [ ] Gate 7

## Phase 8 — Hands-free and settings

- [ ] 8.1 Keyboard/pedal shortcuts
- [ ] 8.2 Voice commands
- [ ] 8.3 Left-handed, tunings, finishes everywhere
- [ ] Gate 8

## Phase 9 — PWA, UI candy, performance

- [ ] 9.1 PWA offline + install
- [ ] 9.2 Motion candy
- [ ] 9.3 Living strings
- [ ] 9.4 Sounds + haptics
- [ ] 9.5 Budgets, Lighthouse CI, axe
- [ ] 9.6 Visual regression tests
- [ ] Gate 9

## Phase 10 — Showcase and release

- [ ] 10.1 README + docs + ADRs
- [ ] 10.2 Demo mode (USER ACTION: record GIF)
- [ ] 10.3 Beta with guitarists (USER ACTION)
- [ ] 10.4 Release v1.0.0
- [ ] Gate 10

---

# v1.1 — Lead, thumb-over and Whammy (PRD §16)

## Phase 11 — v1.1 foundation

- [ ] 11.1 Phrase notation parser
- [ ] 11.2 Lead scheduling
- [ ] 11.3 Lead voice + tone presets
- [ ] 11.4 Tab symbols + pedal lane rendering
- [ ] 11.5 Scales + generic Viterbi
- [ ] Gate 11

## Phase 12 — Module 3: Lead

- [ ] 12.1 Scale explorer
- [ ] 12.2 Bend trainer
- [ ] 12.3 Melody-to-solo
- [ ] 12.4 Module 3 lessons
- [ ] 12.5 Module 3 tune + style review
- [ ] Gate 12

## Phase 13 — Module 4: Thumb-over

- [ ] 13.1 Thumb-over shapes + comfort check
- [ ] 13.2 Embellishment + double-stop generators
- [ ] 13.3 Funk muting + bass bed
- [ ] 13.4 Module 4 lessons
- [ ] 13.5 Module 4 tune + style review
- [ ] Gate 13

## Phase 14 — Module 5: Whammy

- [ ] 14.1 Whammy in playback
- [ ] 14.2 Pedal input: on-screen rocker + MIDI pedal
- [ ] 14.3 Killswitch stutter drill
- [ ] 14.4 Live input (desktop, optional)
- [ ] 14.5 Module 5 lessons
- [ ] 14.6 Module 5 tune + style review
- [ ] Gate 14

## Phase 15 — Cross-style, tone recipes, v1.1 release

- [ ] 15.1 Cross-style lesson
- [ ] 15.2 Tone recipes + "Your gear"
- [ ] 15.3 Curriculum integration
- [ ] 15.4 Docs, README, v1.1.0 release (USER ACTION: new GIF)
- [ ] Gate 15

---

# v1.2 — The app hears chords (PRD §17)

## Phase 16 — Chord detection

- [ ] 16.1 Audio capture worklet + pure DSP
- [ ] 16.2 Basic Pitch engine in a worker
- [ ] 16.3 Shape matching + engine choice
- [ ] 16.4 Evaluation harness + docs/detection.md
- [ ] Gate 16

## Phase 17 — Auto-advance, adaptive tempo, v1.2 release

- [ ] 17.1 Chord auto-advance
- [ ] 17.2 Onset + timing analysis
- [ ] 17.3 Mic-based adaptive tempo
- [ ] 17.4 Docs + v1.2.0 release
- [ ] Gate 17

---

# v2.0 — Sync, studio, style morph, jam mode (PRD §18)

## Phase 18 — Accounts and sync

- [ ] 18.1 Supabase project + schema (USER ACTION)
- [ ] 18.2 Auth UI
- [ ] 18.3 Offline-first sync engine
- [ ] 18.4 Data export, deletion, takes backup switch
- [ ] Gate 18

## Phase 19 — Desktop studio

- [ ] 19.1 Record takes
- [ ] 19.2 Compare view
- [ ] 19.3 Layer mixer
- [ ] 19.4 Arrangement editor
- [ ] 19.5 MIDI, MusicXML and Guitar Pro export
- [ ] Gate 19

## Phase 20 — Live style morph

- [ ] 20.1 Morph planner (pure)
- [ ] 20.2 Audio + visual morph
- [ ] Gate 20

## Phase 21 — Jam mode

- [ ] 21.1 Band pattern generators (pure)
- [ ] 21.2 Band voices
- [ ] 21.3 Follow tempo + follow sections
- [ ] 21.4 Jam screen
- [ ] Gate 21

## Phase 22 — v2.0 polish and release

- [ ] 22.1 Performance + accessibility pass
- [ ] 22.2 Docs, ADRs, demo (USER ACTION: new GIF)
- [ ] 22.3 Release v2.0.0
- [ ] Gate 22

---

# v2.x — Camera and app stores (PRD §19)

## Phase 23 — v2.1 Camera finger check

- [ ] 23.1 Geometry (pure)
- [ ] 23.2 Hand Landmarker in a worker
- [ ] 23.3 Finger check UI (USER ACTION: test with guitar)
- [ ] 23.4 Release v2.1.0
- [ ] Gate 23

## Phase 24 — v2.2 App-store builds and final release

- [ ] 24.1 Capacitor setup
- [ ] 24.2 Native plugins
- [ ] 24.3 CI native builds
- [ ] 24.4 Device testing (USER ACTION)
- [ ] 24.5 Store listings (USER ACTION, optional, paid)
- [ ] 24.6 Final docs + release v2.2.0 (USER ACTION: final GIF)
- [ ] Gate 24
