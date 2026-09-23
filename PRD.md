# Atelier Six — Product Requirements Document

Version 2.0 of this document · Status: approved for build · Scope: v1.0 → v2.2 (Phases 0–24) · Owner: you

## 1. Summary
Atelier Six teaches electric guitar chord progressions through tab, with the focus most apps miss: **the fingering, and how to move from one chord to the next**. It then teaches how to *arrange* those progressions the way records do, through five style modules based on well-known players. It is a free, offline-capable web app (PWA) for mobile, tablet and desktop, with a quiet-luxury design and crafted UI detail.

## 2. Goals and non-goals
**Goals (v1)**
- Teach Modules 1–2 (power chords, open chords) end to end.
- Show finger-by-finger fingerings and optimised chord transitions.
- Play progressions back with rhythm presets, metronome and tempo control.
- Tuner, drills, local progress, hands-free control, offline install.
- A portfolio-grade codebase: typed, tested, CI, documented.

**Goals (v1.1):** Modules 3–5 (lead, thumb-over, Whammy) end to end, lead-guitar tab notation, a pedal lane, a simulated Whammy, lead and effect tones, melody-to-tab, a cross-style lesson and tone recipes. Spec §16.

**Goals (v1.2):** the app hears whole chords (in-browser Basic Pitch), advances when you play the right chord, and adjusts tempo from what it hears. Spec §17.

**Goals (v2.0):** optional accounts with sync across devices, a desktop studio (record takes, layer mixer, MIDI / MusicXML / Guitar Pro export), live style morph, and a backing band jam mode that follows you. Spec §18.

**Goals (v2.x):** camera finger check (MediaPipe hands) and App Store / Google Play builds (Capacitor). Spec §19.

### Scope and milestones
The whole scope below is in this build plan. Each milestone is a tagged release with its own gate, and each keeps every earlier feature working.
| Milestone | Phases | Release tag | Headline |
|---|---|---|---|
| v1.0 | 0–10 | `v1.0.0` | Modules 1–2, transition engine, tuner, drills, PWA |
| v1.1 | 11–15 | `v1.1.0` | Modules 3–5, lead notation, Whammy, melody-to-tab |
| v1.2 | 16–17 | `v1.2.0` | Chord detection, chord auto-advance, mic adaptive tempo |
| v2.0 | 18–22 | `v2.0.0` | Sync, desktop studio, style morph, jam mode |
| v2.x | 23–24 | `v2.1.0`, `v2.2.0` | Camera finger check, app-store builds |

**Non-goals (whole plan):** full song tabs or lyrics; paid infrastructure (everything runs on free tiers — the only unavoidable costs are the app-store developer fees in Phase 24, which that phase lets you skip); AI or LLM features of any kind; social features.

**Always free to use, always usable signed-out and offline.** Accounts (v2.0) only add sync.

## 3. Users
- **Primary:** self-taught electric guitarist, beginner to intermediate, who knows some shapes but changes chords slowly.
- **Secondary:** returning players with high disposable income who value a premium, calm tool.
- **Tertiary audience:** engineers and hiring managers viewing the repo and live demo.

## 4. Devices and roles
One responsive codebase; each breakpoint gets a different job.
| Device | Width | Role | Priority views |
|---|---|---|---|
| Mobile | <640px | Practice companion | Tuner, one-transition drills, big diagrams; landscape = tab |
| Tablet | 640–1199px | Main screen on a music stand | Tab + fretboard + controls together, scrolling tab |
| Desktop | ≥1200px | Studio | All panels, arrangement layers, keyboard shortcuts |

**Hands-free (all devices):** keyboard shortcuts (Bluetooth page-turner pedals send arrow/space/page keys), optional voice commands (Web Speech API where supported), auto-advance when the tuner hears the target note (v1) / chord (v2).

## 5. Curriculum
Order: 1 → 2 → 3 → 4 → 5. Lead (Module 3) follows the chord modules because its pentatonic box is built on the power-chord shapes; Whammy comes last because it is the most gear-dependent. v1 ships Modules 1–2; v1.1 ships Modules 3–5.

### Module 1 — Pop punk power chords (reference styles: Blink-182, Machine Gun Kelly)
- Shapes: 2-finger (1,3), 3-finger with octave (1,3,4), octave shapes. 6th and 5th string roots.
- Transitions: locked shape *slides* along the neck; *shifts* across strings; release pressure between chords (auto-mute).
- Right hand: all-downstroke eighths; stamina drill with rising tempo.
- Arrangement preset: palm-muted verse, open chorus, octave riff intro, stops on drum hits.
- Progressions: I–V–vi–IV, vi–IV–I–V. Tuning option: standard, half-step down, drop D.

### Module 2 — Britpop open chords (reference style: Oasis)
- Anchored shapes (fingers 3 and 4 on fret 3 of B and high E): Em7 `022033`, G `320033`, Dsus4 `xx0233`, A7sus4 `x02033`, Cadd9 `x32033`.
- Standard opens: E, A, D, G, C, Am, Em, with alternative fingerings (e.g. G as 3-2-4).
- Right hand: continuous sixteenth-note strumming motion.
- Arrangement preset: capo option, strummed rhythm + layered electric, big chorus.

### Module 3 — Lead guitar (reference style: Nirvana) — v1.1, see §16.4
Vocal-melody-as-solo drill; minor pentatonic box 1 linked to power chord shapes; bends (mic-checked), slides, vibrato, noise textures; loud-quiet arrangement preset.

### Module 4 — Thumb-over-neck chords (reference style: John Frusciante) — v1.1, see §16.5
Thumb frets bass on low E, fingers play triads on top; embellishments (hammer-ons/pull-offs within the shape), double-stops, muting; "T" finger label; hand-comfort check first.

### Module 5 — Whammy and noise (reference style: Tom Morello) — v1.1, see §16.6
Octave-up whammy lines, rhythmic heel-toe rocking, toggle-switch killswitch stutter, drop D riffs; simulated whammy in playback; pedal lane under tab; no-pedal alternatives.

### Cross-style lesson (v1.1, see §16.7)
One I–V–vi–IV progression played in each style as separate sections. The *live* style morph (switching style mid-playback) stays in v2.0.

**Content rule:** teach techniques, shapes and generic progressions only. Real songs appear as listening references by name — never transcribed. Artists are named only as listening references and "in the style of" labels, never in the app's name, icon, store title or keywords, and the app states it is not affiliated with or endorsed by them.

## 6. Core concepts and data model
String order in all arrays: **index 0 = low E (6th string) → index 5 = high E**, matching chord-chart notation like `x32010`.

```ts
type Finger = 0 | 1 | 2 | 3 | 4 | 'T';   // 0 = open string
type StringNote = { fret: number | null; finger: Finger | null }; // fret null = muted
type Shape = {
  id: string;             // "C.open.a"
  chord: string;          // "C"
  notes: [StringNote, StringNote, StringNote, StringNote, StringNote, StringNote];
  register: 'low' | 'mid' | 'high';
  tags: string[];         // "open", "power", "anchored", "triad", "thumb"
  barre?: { fret: number; from: number; to: number; finger: 1 };
};
type Chord = { name: string; root: PitchClass; quality: string; shapes: Shape[] };
type Progression = { id: string; key: PitchClass; roman: string[]; beatsPerChord: number[]; loop: boolean };
type RhythmPreset = { id: string; steps: Array<{ t: number; dir: 'D' | 'U' | 'mute' | 'pick'; strings?: number[]; accent?: boolean; palmMute?: boolean }>; subdivision: 8 | 16 };
type Arrangement = { sections: Array<{ name: 'intro' | 'verse' | 'pre' | 'chorus' | 'bridge'; register: Shape['register']; rhythm: string; layers: Layer[]; dynamics: number }> };
type Layer = { id: string; role: 'rhythm' | 'double' | 'contrast' | 'riff'; pan: number; voicing: Shape['register']; muted: boolean };
```

## 7. The transition engine (centrepiece)
Location: `src/core/engine/`. Pure TypeScript, 100% unit-tested.

### 7.1 Move classification
For each finger 1–4 and T, compare its position in shape A and shape B:
| Move | Rule | Base cost |
|---|---|---|
| anchor | same string, same fret | 0 |
| guide | same string, different fret | 1 + 0.25·|Δfret| |
| place | absent in A, present in B | 2 |
| release | present in A, absent in B | 0 |
| lift | different string, not part of a group | 3 + 0.3·distance |

**Groups:** ≥2 fingers with the identical (Δstring, Δfret) vector form one unit:
- `slide` group (Δstring = 0): cost 1 + 0.2·|Δfret| for the whole group (power chord moves).
- `shift` group (Δstring ≠ 0): cost 1.5 + 0.25·|Δfret| for the whole group (Em→Am, G(3-2-4)→C).

Distance for a lift = √(Δstring² + Δfret²).

### 7.2 Shape difficulty
Stretch penalty: +2 per fret of span above 3 (span = max fret − min fretted fret). Barre +2. Thumb +1. +0.5 per interior muted string (muted with sounding strings on both sides). Exact weights live in `docs/build/phase-03.md` step 3.3.

### 7.3 Fingering optimiser
Given a progression and each chord's candidate shapes (filtered by module/register), choose one shape per chord minimising Σ(shape difficulty) + Σ(transition cost). Use dynamic programming (Viterbi). If `loop`, include the last→first transition: run the DP once per candidate shape of chord 1 and add the closing cost; take the minimum. Return the chosen shapes, per-transition move lists and a total score.

### 7.4 Difficulty score
Lesson difficulty = optimiser total. Lessons within a module sort ascending by it.

### 7.5 Required test cases
- C `x32010` (3,2,1) → Am `x02210` (2,3,1): fingers 1 and 2 = anchor; finger 3 = lift.
- Em `022000` (2,3) → Am: fingers 2 and 3 = one shift group; finger 1 = place.
- G → C: optimiser picks G as 3-2-4 (`320003`, fingers 3,2,·,·,·,4) over 2-1-3; fingers 3 and 2 form a shift group.
- Em7 `022033` (1,2,·,·,3,4) → G `320033` (2,1,·,·,3,4): at least three anchors.
- G5 `355xxx` (1,3,4) → A5 `577xxx`: one slide group, Δfret 2.
- G5 `355xxx` → C5 `x355xx`: one shift group.
- Optimiser on loop G–C–Em–D (I–IV–vi–V in G) returns identical output on 100 repeated runs (determinism: tie-break by shape id, ascending).
- A zero-vector move (anchor) never forms a group; groups need ≥2 fingers with the same non-zero vector.

## 8. Audio
Location: `src/audio/`. Tone.js.
- Guitar voice: six `PluckSynth` voices (or a sampler if samples are added later); strum = per-string offset 8–20 ms, direction-aware.
- Palm mute: shorter decay + lowpass. Accents: +4 dB.
- Metronome: scheduled on `Tone.Transport`, sample-accurate, accent on beat 1, count-in.
- Scheduling logic (event lists from progression + rhythm + tempo) is a **pure function** in `src/core/schedule/` and unit-tested; `src/audio/` only plays event lists.
- Audio starts only after a user gesture (browser rule).
- Tuner: mic via `getUserMedia`, pitch via the `pitchy` library (McLeod method), ±50 cent display, standard/half-step-down/drop D targets.

## 9. Features (v1)
1. **Library:** browse chords by module; each shows alternate fingerings.
2. **Lesson player:** chord diagrams, tab lane, transition card, play/loop, tempo, section switch (verse/chorus).
3. **Transition card:** per finger — anchor (pin + glow), guide/slide (arrow + brass trail), shift (grouped arrow), lift (arc), place.
4. **Drills:** two-chord loop; early change (switch on beat 4); freeze-and-check (pause on target chord); one-minute changes (counter + log).
5. **Adaptive tempo:** user taps "clean"/"missed" (v1) → tempo ±4 bpm within bounds; mic-based in v2.
6. **Tuner.**
7. **Progress:** per-lesson best tempo, one-minute scores, transition heatmap (worst changes first), practice ring. Stored in IndexedDB (via `idb-keyval`).
8. **Practice planner:** daily session = warm-up + new lesson + review of the 3 worst transitions (spaced repetition: interval doubles on success, resets on miss).
9. **Hands-free:** Space = play/pause, → / PageDown = next, ← / PageUp = previous, L = loop, −/+ = tempo. Voice (optional): "play", "stop", "slower", "faster", "loop", "next".
10. **Settings:** left-handed mirror, tuning, motion on/off, sound on/off, finish (theme).
11. **PWA:** installable, full offline (fonts self-hosted, no network calls).

## 10. Design system
**Feel:** quiet luxury — a luthier's workshop at night. Calm, editorial, precise. No mascots, badges or confetti.

### Tokens (`src/styles/tokens.css`)
| Token | Value | Use |
|---|---|---|
| `--ebony` | #121110 | background |
| `--rosewood` | #2B211D | panels |
| `--rosewood-2` | #3A2D27 | raised panels |
| `--bone` | #EFEAE1 | primary text |
| `--bone-dim` | #A69E92 | secondary text |
| `--hairline` | rgba(239,234,225,.12) | dividers |
| `--brass` | #B8925A | the single accent |
| `--brass-hi` | #D9B77E | sheen highlight |
| `--f1` sage | #8FA68A | finger 1 |
| `--f2` slate | #6F84A0 | finger 2 |
| `--f3` terracotta | #C07A5A | finger 3 |
| `--f4` mauve | #9A7AA0 | finger 4 |
| `--fT` brass | #B8925A | thumb |
Light mode: bone background, ebony text, same accents (darkened 10% for contrast).

**Type:** Instrument Serif (display), Geist or Inter (UI), Geist Mono (tab). Self-hosted via npm font packages. Scale: 12/14/16/20/28/40/56.
**Spacing:** 4px base; 4/8/12/16/24/32/48/64. **Radius:** 2px (hairline feel) and 999px (pills). **Motion:** 180ms UI, 420ms showcase, easing `cubic-bezier(.2,.7,.1,1)`.

### Finishes (per-module themes, same layout)
- **Nitro Ebony** (default).
- **Xerox** (Module 1): paper-grain overlay, snappier motion (0.8×).
- **Sunburst** (Module 2): warm radial gradient behind the fretboard.
- **Faded** (Module 4, v2): desaturated warm tones, looser easing.
- **Stencil** (Module 5, v2): red/black, stencil display type for headings.

### Navigation and interface quality (the "premium" bar)
The reference for how this should look and feel is `docs/design/screens.html`: every screen on desktop (1440×900), tablet in landscape (1180×820) and mobile (390×844), with a device filter. `docs/design/mockup.html` is the short five-screen version. Build to match them. Each course module has its own finish, as shown: Xerox (power chords), Sunburst (open chords), Undertow (lead), Faded (thumb-over) and Stencil (Whammy, with a stencil display face for headings).

**Information architecture.** Five destinations, the same on every device:
| Destination | Contains |
|---|---|
| **Today** (`/`) | Greeting, practice ring, today's plan (warm-up, new lesson, 3 reviews), "Continue" card |
| **Learn** (`/course`, `/library`) | Course: modules → lessons, each with progress and difficulty. Chords: the chord library. Switched with a segmented control. |
| **Practise** | Drills, Jam (v2.0), Studio (v2.0), plus "Continue last lesson" |
| **Tuner** (`/tuner`) | Tuner |
| **You** (`/progress`, `/settings`, account) | Progress, heatmap, engravings, settings, account |

**Navigation by device.**
- *Mobile:* a floating **dock** (frosted ebony glass, hairline border, 16px from the bottom edge and safe area). Today · Learn · **Practise** (a raised brass button in the centre, opening a sheet) · Tuner · You. Active item: brass icon and a 4px brass dot under it; others in bone-dim.
- *Tablet:* a 72px **rail** on the left with icons; labels appear as tooltips. The lesson uses two panes.
- *Desktop:* a 248px **sidebar**: wordmark, the five destinations, then the course's modules, each with a small progress ring, and "⌘K Search" at the bottom.
- **Command palette (⌘K / Ctrl+K, and a search icon on mobile):** jump to any lesson, chord, drill or setting, or run actions ("Start tuner", "Metronome 90"). Fuzzy search, grouped results, keyboard only.
- **Mini-player:** whenever something is playing, a slim transport bar sits above the dock/at the bottom of the content: current chord, next chord, tempo and play/pause. Tapping it opens the full lesson player. Playback survives navigation.
- **Focus mode (music-stand mode):** while playing, navigation and non-essential UI fade out after 3 s. Any tap, key or pedal brings them back.
- **Headers:** large serif page titles (40–56px) that collapse into a compact 56px bar on scroll. Breadcrumb only inside lessons ("Open chords · Lesson 3").
- **Page transitions:** View Transitions API. The chord card morphs into the lesson header, and tabs cross-fade. Falls back to instant on unsupported browsers or with motion off.

**Interface quality rules** (checked at every gate that touches UI):
- 8pt spacing grid; generous margins (24px mobile, 48px desktop); line length ≤ 70 characters.
- One accent only: brass, used for the active state, the primary action and progress. Nothing else is brass.
- Numbers use tabular figures (tempo, cents, scores) so they don't jiggle.
- Tap targets ≥ 44px; press state scales to 0.98 over 120ms; hover lifts by 1px with a hairline brightening (desktop only).
- No spinners: skeletons with a slow brass shimmer. No layout shift (CLS 0).
- Sheets and dialogs slide from the bottom on mobile and from the right on desktop, with a 24px radius on mobile.
- Safe areas respected (notch, home indicator). Landscape phone shows the tab lane full-width.
- Copy is calm, short, second person, British English ("Keep finger 1 where it is.").
- **Onboarding** (first launch, 4 screens, skippable): welcome ("Welcome to the atelier") → which hand you play with → your level (new / some chords / confident) → tuning and capo → straight into the right first lesson.

### Logo
**Chosen: the VI Monogram.** A Roman-numeral **VI** in a high-contrast serif (thick–thin V with bracketed serifs, stemmed I), a faint bone hairline above, and a **brass nut line with a brass dot** below, like the maker's stamp inside a handmade instrument. The master files are in `docs/design/logo/` (see its README): dark and light marks, a simplified favicon for ≤ 32 px (no hairline or dot, thicker brass line), a full-bleed 1024 px app-icon master and a maskable version. All letterforms are outlined paths, so the logo never depends on a font. Wordmark: "ATELIER SIX" in Geist 500, uppercase, letter-spacing 0.34em. Clear space: 3× the brass dot on every side; minimum size 16 px. Never recolour the brass or add effects. The other concepts are kept for reference in `docs/design/logos.html`.

### UI candy (all optional via motion toggle; 60fps on mid-range phones)
- **Living strings:** played strings vibrate (decaying sine) on the fretboard — PixiJS/Canvas.
- **Gliding fingers:** transition preview animates dots along their paths; anchors glow; guides leave brass trails; lifts arc.
- **Brass sheen:** slow light sweep on brass accents at key moments; follows device tilt where permitted (iOS needs a permission tap).
- **Resonance ripple:** fine ring from the diagram on a clean change.
- **Ink-bloom tab:** notes brighten as the playhead passes.
- **Analog tuner:** brass needle on a VU-style dial with damped motion.
- **Practice ring:** brushed-metal dial filling with brass.
- **Chord engravings:** mastered shapes shown as fine line engravings in a collection.
- **Sound:** soft UI taps; completion chime tuned to the lesson's key.
- **Haptics:** metronome tick and success tap where supported (Vibration API on Android; iOS in a later native wrapper).

## 11. Architecture
```
src/
  core/          pure TS: music theory, shapes, engine, schedule, planner (no DOM)
  audio/         Tone.js playback, metronome, tuner input
  ui/            design-system components (Button, Panel, Fretboard, TabLane, TransitionCard, Dial…)
  features/      library, lesson, drills, tuner, progress, settings
  data/          chord + progression + rhythm + lesson JSON (generated by scripts/)
  styles/        tokens.css, finishes.css, global.css
  app/           routes, providers, PWA registration
  workers/       detection, beat tracking, hand tracking (v1.2+)
  net/           the only code allowed to make network calls: sync, auth, model downloads (v2.0+)
scripts/         data generators, icon generator
tests/e2e/       Playwright specs
supabase/        SQL migrations, RLS policies, seed (v2.0)
android/ ios/    Capacitor native projects (v2.x)
public/models/   self-hosted ML models (Basic Pitch, hand landmarker)
docs/            architecture.md, engine.md, adr/, build/
```
State: React context + small stores (Zustand). Routing: React Router. No backend in v1.

## 12. Non-functional requirements
- Lighthouse (mobile): Performance ≥90, Accessibility ≥95, Best Practices ≥95, PWA installable.
- Initial JS ≤200 KB gzipped (Tone.js and Pixi lazy-loaded on first use).
- Audio: metronome drift <2 ms over 5 minutes (unit-tested schedule; manual listening check).
- Works offline after first load. No analytics, no tracking, no ads.
- Network rules: v1.x makes no network calls at all. From v2.0, network calls happen only from `src/net/`, and only after an explicit opt-in (sign in to sync, upload a take). The CSP `connect-src` lists exactly those hosts.
- ML runs on the device (Basic Pitch, MediaPipe). Audio and camera frames are never uploaded; takes are uploaded only when the user chooses to.
- Each ML model is lazy-loaded and cached; none is in the entry bundle.
- WCAG 2.1 AA.

## 13. Repo quality ("looks legit")
README with badges, live link, GIF, architecture diagram; LICENSE (MIT); CONTRIBUTING; CODE_OF_CONDUCT (short, links to Contributor Covenant 2.1); SECURITY; CHANGELOG (Keep a Changelog); `.github/` CI workflow, Dependabot, issue + PR templates, CODEOWNERS; `.editorconfig`, `.nvmrc`, `.gitattributes`, Prettier, ESLint (flat config), strict tsconfig, Husky + lint-staged + commitlint; `docs/adr/` decision records; `docs/engine.md` write-up of the optimiser; semantic version tags. From v1.2: `docs/detection.md` with measured accuracy. From v2.0: `supabase/migrations` with RLS policies and policy tests, `docs/privacy.md`. From v2.x: native project CI builds.

## 14. Roadmap
- **v1.0:** Modules 1–2, transition engine, tuner, drills, PWA. Phases 0–10.
- **v1.1:** Modules 3–5, lead notation (b r ~ / \ h p x K), pedal lane, simulated Whammy with MIDI expression-pedal support, lead and effect tones, melody-to-tab optimiser, cross-style lesson, tone recipes. Full spec in §16; build in Phases 11–15.
- **v1.2:** Chord detection in-browser (Spotify Basic Pitch), auto-advance on chords, mic-based adaptive tempo. Spec §17; Phases 16–17.
- **v2.0:** Supabase sync, desktop studio (record takes, layer mixer, MIDI/Guitar Pro export), style morph, backing band "jam mode". Spec §18; Phases 18–22.
- **v2.x:** Camera finger check (MediaPipe hands), Capacitor app-store builds. Spec §19; Phases 23–24. v2.2 is the final release of this plan.

## 15. Success metrics
Personal: faster clean changes (one-minute score trend). Showcase: live demo loads <2s on 4G, CI green, engine test coverage 100%, a clear engine write-up.

## 16. v1.1 — Lead, thumb-over and Whammy
Builds on v1 without changing its data. Build plan: `docs/build/phase-11.md` … `phase-15.md`.

### 16.1 Lead notation (tab symbols)
Single-note lines are stored as **phrases** in a compact source notation, parsed and validated by a script (like chord data). Strings use the same index as v1 (0 = low E … 5 = high E); durations are in sixteenth notes (default 2).

| Token | Meaning | Tab shows |
|---|---|---|
| `3:7` | string 3, fret 7 | `7` |
| `3:7@4` | …held for 4 sixteenths | `7` + spacing |
| `3:7b9` | bend from fret 7 up to the pitch of fret 9 | `7b9` |
| `3:7b9r7` | bend, then release | `7b9r7` |
| `3:7~` | vibrato | `7~` |
| `3:5/7` · `3:7\5` | slide up · slide down | `5/7` · `7\5` |
| `3:5h7` · `3:7p5` | hammer-on · pull-off (not re-picked) | `5h7` · `7p5` |
| `3:x` | muted (dead) note | `x` |
| `3:5PM` | palm-muted note | `5` under `P.M.` |
| `[2:7,3:7]` | double-stop (played together) | stacked |
| `-@2` | rest | blank |
| `K@1` | killswitch cut | `K` above the tab |
| `SCR@4` · `FB@8` | pick scrape · held feedback texture | `scr.` · `fb.` |

```ts
type Technique = { kind: 'bend'|'release'|'vibrato'|'slideUp'|'slideDown'|'hammer'|'pull'|'mute'|'palmMute'; toFret?: number };
type PhraseNote = { string: number; fret: number | 'x'; finger?: Finger; dur: number; tech: Technique[] };
type PhraseEvent = { kind: 'note'; notes: PhraseNote[] } | { kind: 'rest'|'kill'|'scrape'|'feedback'; dur: number };
type Phrase = { id: string; key: PitchClass; events: PhraseEvent[]; pedal?: PedalPoint[]; tone: TonePresetId };
type PedalPoint = { t: number /* sixteenths */; pos: number /* 0 heel … 1 toe */; curve: 'step'|'linear' };
```

### 16.2 Lead voice and tones
- Lead voice: a monophonic synth (sawtooth + filter envelope) whose pitch is automated for bends, releases, slides and vibrato, and which is not re-triggered on hammer-ons and pull-offs. The v1 plucked voice stays for chords.
- Tone presets (Tone.js chain: EQ3 → drive → cabinet filter → effects → limiter): `clean`, `chorus-clean`, `crunch`, `fuzz`, `octave-fuzz`, `whammy-lead`. A limiter on the master stops loud presets from jumping in volume.
- **Tone recipes** (content, per module): amp gain, EQ and pedal settings to get close to each style on real gear, a budget version, and adjustments for the user's pickups (single-coil or humbucker) and amp type (clean amp, modeller, valve amp) from a small "Your gear" profile in Settings.

### 16.3 Pedal lane and Whammy
- A **pedal lane** under the tab draws `PedalPoint`s as a line from heel (bottom) to toe (top).
- Whammy modes: `octave-up` (0 → +12 semitones), `two-octaves-up` (0 → +24), `dive` (0 → −24), `harmony-4th` (+5), `harmony-5th` (+7), `shallow-detune` (±0.2).
- **For the app's own playback**, Whammy pitch is applied directly to the lead voice's frequency, which gives zero latency and clean sound. **For live guitar input** (desktop, optional) a granular pitch shifter is used, with its latency measured and shown. Record this as an ADR.
- Pedal input: on-screen rocker (drag or arrow keys), and a **MIDI expression pedal** through the Web MIDI API with a "move the pedal to learn" mapping (CC 11 or CC 4). Web MIDI is feature-detected; Safari and iOS fall back to the on-screen rocker.
- **Killswitch stutter:** the sound is cut in rhythm (8ths, triplets, 16ths) by gain automation. The drill scores tap timing against the grid.
- A "no pedal" alternative is written for every Whammy lesson (bends or tremolo-arm dips).

### 16.4 Module 3 — Lead (reference style: Nirvana)
- Minor pentatonic box 1 generated for any key and shown over the matching power-chord shape, root notes highlighted, so lead links to rhythm.
- **Bend trainer:** the mic tracks your pitch while you bend; a live line rises toward the target line and the app reports reached/short/overshoot and time to target.
- **Melody-to-solo:** hum or sing a melody (or tap notes on the fretboard); the app segments the pitch trace into notes, snaps them to the key, and finds the easiest fingering on the neck with the same Viterbi idea as the chord engine (cost = fret distance, string skips, leaving the box). Only the user's own input is used; no real song melodies are stored.
- Loud-quiet arrangement: clean or chorus-clean verse, fuzz chorus, with a "step on the pedal now" marker in the tab.
- Noise textures: pick scrape, muted rakes, held feedback (synthesised).
- Finish: **Undertow** (washed teal-grey with a slow shimmer).
- Listening references: "Smells Like Teen Spirit", "Come As You Are", "Lithium".

### 16.5 Module 4 — Thumb-over (reference style: John Frusciante)
- Generated shapes: thumb (`T`) on the low E string for the bass note, with a small triad on the G, B and high E strings (major, minor, 7 and sus variants), plus matching double-stop shapes on adjacent strings.
- **Hand-comfort check first:** a short guided test (thumb-only bass notes, then add one finger), with a clear "skip thumb-over, use the 6th-string barre instead" option. Thumb moves cost more in the engine.
- **Embellishment generator:** from any thumb-over shape it builds hammer-on and pull-off decorations that start on a nearby scale note and resolve to a chord note within the hand's reach (sus4→3, add9, 6th), written in the new notation.
- Rhythm presets: `funk-16ths` (muted scratches with chord stabs), `sparse-embellished`. A simple generated bass line plays underneath so you hear the space the guitar leaves.
- Finish: **Faded**.
- Listening references: "Under the Bridge", "Scar Tissue", "Can't Stop"; influence reference: Jimi Hendrix "Little Wing".

### 16.6 Module 5 — Whammy and noise (reference style: Tom Morello)
- Gear lesson: what a pitch-shifting expression pedal (such as the DigiTech Whammy) does and the modes above.
- Octave-up lines with the pedal rocked in rhythm, dive-bombs, harmony mode, killswitch stutter drill, drop D riffs (original riffs written for the app, never transcriptions).
- Optional **live input** on desktop: guitar through an audio interface into the lead tones and Whammy, with a headphones warning and a measured latency figure.
- Finish: **Stencil**.
- Listening references: "Killing in the Name", "Bulls on Parade", "Know Your Enemy".

### 16.7 Cross-style lesson
I–V–vi–IV in G, played as five sections, one per style: pop punk power chords, Britpop anchored open chords, a Cobain-style melodic lead over it, Frusciante-style thumb-over with embellishments, and a Morello-style Whammy line. Each section shows its own finish, rhythm and transition card.

### 16.8 v1.1 UI candy
- **Bend trace:** a brass line rises toward the target and glows when it arrives.
- **Rocking pedal:** the on-screen Whammy rocker tilts in 3D with the pedal lane and follows a MIDI pedal live.
- **Stutter indicator:** a small brass bar pulses with each cut. It never flashes the full screen, and stays under 3 flashes per second (WCAG 2.3.1).
- **Vibrato shimmer** on tab notes marked `~`; **fuzz grain** texture in fuzz sections.
- All of it follows the motion setting.

### 16.9 v1.1 non-functional additions
- Lead, Whammy and effect code is lazy-loaded; the v1 entry-size budget (200 KB) must still pass.
- Playback master limiter at −1 dBFS; live input is off by default and needs headphones confirmed.
- Melody capture and bend checks process audio in memory only; nothing is recorded or stored.

## 17. v1.2 — The app hears chords
Build plan: `docs/build/phase-16.md`, `phase-17.md`.

### 17.1 Chord detection
- **Question asked:** "is the player sounding *this* shape?" (verification against a known target), not open-ended chord recognition. This is far more reliable and is what the lessons need.
- **Primary engine:** Spotify's open-source **Basic Pitch** model (`@spotify/basic-pitch`, Apache-2.0) running in a Web Worker on TensorFlow.js. Mic audio is resampled to 22,050 Hz mono in an AudioWorklet and analysed in overlapping ~1 s windows. The model's note activations are folded into a 12-bin pitch-class profile plus a per-string pitch presence check.
- **Fallback engine:** a lightweight FFT chromagram (pure TypeScript) for devices where the model is too slow. The app benchmarks the device once and picks the engine; users can override it.
- **Scoring:** `matchShape(profile, shape, tuning, capo) → { score 0–1, missingStrings, extraNotes, muffled }`. Expected pitches come from the shape itself, so the app can say *which string* is missing or muffled.
- **Evaluation harness:** a script renders every library shape as audio with a pure-JS plucked-string synth plus noise, runs both engines, and writes accuracy, a confusion table and latency to `docs/detection.md`. The user can add real recordings of their guitar to the same harness.
- Model files are self-hosted in `public/models/` and precached on first use of listening features only.

### 17.2 Auto-advance on chords
Extends v1 root-note auto-advance: in self-paced mode the lesson moves on when the target chord scores ≥ 0.8 for 300 ms. The time for each change is logged to the heatmap. Muffled or missing strings are named in the feedback ("5th string not sounding").

### 17.3 Mic-based adaptive tempo
- An onset detector (spectral flux, pure TypeScript) measures each strum against the beat grid.
- Each bar gets a result: chord match, timing error in ms, and the muffled strings. Clean = match ≥ 0.8, mean timing error ≤ 40 ms, no muffled strings.
- Adaptive tempo (v1 §9.5) takes these results automatically. The manual Clean/Missed buttons stay as a fallback and override.
- Headphones are recommended so playback doesn't bleed into the mic. Without them, the app ducks its own playback during listening bars.

## 18. v2.0 — Sync, studio, style morph, jam mode
Build plan: `docs/build/phase-18.md` … `phase-22.md`.

### 18.1 Accounts and sync (Supabase free tier)
- Optional sign-in by email magic link (plus optional GitHub OAuth). The app stays fully usable signed-out and offline.
- IndexedDB stays the source of truth. Changes queue in a local outbox and sync when online.
- Merge rules: settings and lesson records use last-write-wins by `updated_at`; counters (attempts, misses, minutes) use per-device counters that are summed, so two devices never overwrite each other's practice.
- Tables with row-level security (each row visible only to its owner): `profiles`, `settings`, `lesson_progress`, `transition_stats`, `sessions`, `takes` (metadata), `arrangements` (the user's own).
- Takes' audio is uploaded to Supabase Storage only if the user turns on "Back up my takes".
- Privacy page, full data export, and account deletion that removes all rows and files.

### 18.2 Desktop studio (≥ 1200 px; usable on tablet)
- **Record takes:** record over any lesson or arrangement with a count-in; stored locally as audio with timing metadata.
- **Compare:** waveform view of the take against the reference, onset alignment, and a timing-deviation chart per beat.
- **Layer mixer:** per layer volume, pan, mute and solo, level meters, and the user's take as its own layer.
- **Export:** Standard MIDI File (one track per layer), MusicXML (with tab staff), and Guitar Pro 7 (`.gp`) via alphaTab's exporter. Every export is re-imported in tests and compared note by note.
- **Arrangement editor:** build your own song from progressions, sections, rhythms, voicings and phrases; saved locally and synced.

### 18.3 Live style morph
While playing, switch between the five styles (keys 1–5 or on screen). The switch lands on the next bar, the audio crossfades over one beat, and the finish morphs visually. A **blend** mode layers two styles (for example a pop punk rhythm with a Britpop anchored-chord layer).

### 18.4 Jam mode
- A generated backing band (drums, bass, pad) for any progression in any style, built from pure pattern generators per style and synthesised drum and bass voices.
- **Follows your tempo:** a beat tracker on your strums nudges the band's tempo, limited to ±3 bpm per bar and within ±15 % of the start.
- **Follows your sections:** when you play harder or busier for 2 bars, the band moves to the chorus; when you drop back, it returns to the verse. There is also a manual section button and pedal key.
- Jam sessions can be recorded as takes.

## 19. v2.x — Camera and app stores
Build plan: `docs/build/phase-23.md`, `phase-24.md`. Each ships as its own minor release.

### 19.1 Camera finger check — v2.1
- MediaPipe **Hand Landmarker** (`@mediapipe/tasks-vision`, Apache-2.0), model self-hosted, running on the device. Video frames are never stored or uploaded.
- Calibration: the user touches four reference points (fret 1 and fret 5 on the low and high E strings). A homography maps camera coordinates onto the fretboard.
- Each fingertip is mapped to its nearest string and fret and compared with the target shape; the overlay shows each finger as correct, near or wrong, in the finger colours.
- Guidance for camera angle and lighting; left-handed and mirrored views handled.
- Clearly labelled "beta": it assists, it never blocks progress.

### 19.2 App-store builds — v2.2
- Capacitor wraps the same web build for iOS and Android. Native plugins: haptics (so iOS gets haptics), keep-awake during practice, status bar styling, and correct audio-session handling (plays with the silent switch on, mixes politely).
- Microphone and camera permission text, app icons and splash from the design system, deep links.
- GitHub Actions builds an Android App Bundle and an iOS build on each release tag.
- **Costs:** Google Play charges a one-off $25 and Apple $99 per year. Store submission is a user action; everything before it is free, and the PWA remains the free way to install.

## 20. Musical authenticity and fun
The app must *sound* like each style and be *fun to play*, not just teach correct shapes. This section is the standard for every lesson, tab and tune in every module. Build steps: 4.5, 5.5, 6.0, 6.7, 6.8, 12.5, 13.5, 14.6, and the listening review at each module gate.

### 20.1 Style sheets (targets for our original material)
Each module's material is generated and checked against its style sheet, stored as data in `src/data/styles/<module>.json`. The values are targets for original music in the style. They are not claims about any particular record.

| | Pop punk (power) | Britpop (open) | Grunge-melodic lead | Frusciante-style thumb-over | Rap-rock Whammy |
|---|---|---|---|---|---|
| Tempo | 150–200 bpm | 70–110 bpm | 90–130 bpm | 75–105 bpm | 85–110 bpm |
| Feel | Straight 8ths, all downstrokes | 16th strum, accents on 2 and 4 | Straight; half-time verses allowed | 16ths, swing ≤ 55 % | Straight 16ths, heavy on 1 |
| Tuning / capo | Standard or half-step down | Standard, capo 0–2 | Standard or half-step down | Standard | Drop D |
| Harmony | 5 chords; I–V–vi–IV, vi–IV–I–V, I–IV–V | Anchored shapes; sus4, add9, 7sus4, m7 colours | Power chords under minor-pentatonic lines | Thumb-over triads; sus4→3, add9, 6 decorations | Single-note riffs, one-finger power chords |
| Structure | Riff intro → palm-muted verse → build → open chorus → stop-time breakdown → double chorus | Long strummed intro → verse → pre-chorus → big layered chorus | Clean verse → fuzz chorus → melodic solo restating the tune | Sparse verse → funk chorus → double-stop bridge | Riff → verse with band hits → Whammy break → stutter outro |
| Must include | Changes pushed onto the "and" of 4; octave riff; palm-mute contrast | Top strings ringing through changes; continuous arm motion | Bends (½ and full), slides, a noise texture; a solo built from a melody | Ghost notes, muted scratches, hammer-ons inside the shape; room for bass | Pedal lane, killswitch rhythm, call-and-response riff |
| Avoid | Swing, extended chords, long solos | Palm-mute chugs, fast downpicking | Shred runs, sweeps, scale exercises | Distortion, big strummed chords | Open chords, long legato |

Every lesson, riff and tune is built from each style's **rhythm cells, progression families and phrase shapes** (lists in the style JSON). It is not free-composed from nothing.

### 20.2 Tab quality standard
- **Playable at tempo.** Every note gets a finger (the engine's assignment). Maximum span is 4 frets (5 only in lessons marked "stretch"). A position shift must be possible in the time available: at most 12 frets per second at the lesson's target tempo, with the limit kept in one tunable constant. String skips over 2 strings are flagged. Open strings are preferred where the style does it (e.g. the ringing top strings in Britpop).
- **Rhythm shown.** Stems, beams, rests, ties and dots under the tab; time signature; bar numbers; the count ("1 & 2 &") under beats; section labels and repeat signs; note spacing that matches the rhythm. A header gives tempo, tuning, capo and key.
- **Articulations.** Accents, palm-mute brackets, let ring, ghost notes, muted strums (x), pick direction, bends with amount (½, full), release, vibrato, slides, hammer-ons and pull-offs, dynamics (p, mf, f), pedal lane, killswitch.
- **Correct.** Every note is a chord or scale tone of the intended harmony in the chosen tuning and capo (passing tones allowed only where marked). Every bar adds up. Exports reopen identically in MuseScore / Guitar Pro.

### 20.3 How it sounds
- **Real instruments:** sampled electric guitar (clean and driven, with palm-muted and open articulations where the sample set has them), bass and drum samples, played through the tone presets and a cabinet impulse response. Samples must carry a licence that allows use in an open-source app (CC0 / CC-BY with attribution), recorded in `docs/licences.md`. Fallback: an improved plucked-string model with a body impulse response.
- **Humanised playback:** seeded timing variation (±8 ms), velocity variation (±10 %), strum speed following dynamics, accents where the style puts them, and optional swing. Playback is never perfectly quantised.

### 20.4 Music, not only drills
- **Module tune:** each module ends with an original 2–3 minute piece in its style (sections as in 20.1), played with the backing band and scored with the full tab standard. It is the module's payoff.
- **Riff of the week:** a short original riff in the module's style, unlocked mid-module.
- **Every session includes play time:** the daily plan gives at least 30 % of the time to tunes, riffs or jam, not only drills.
- **Music in the first minute:** onboarding ends with a two-chord groove played with the band.

### 20.5 Keeping it fun
- **Adaptive difficulty** aims for about 80–85 % clean attempts (a rolling window of the last 8). It adjusts tempo first, then simplifies the part (fewer notes, easier voicing) if tempo alone can't get there.
- **"Was that fun?"** A tap after each lesson (stored only on the device) shows which lessons fall flat. Consistently low-rated lessons are listed in Progress for review.
- **Play along with the record:** pick one of the module's listening references and the app sets the matching tuning and capo. You tap along with your own copy of the song to set the metronome to its tempo, and it loops the technique you're practising over it. No song content is stored or shown.
- **Quiet celebration:** resonance ripple and chime on clean runs and tune completions. No points or badges.

### 20.7 Also in scope
- **Foundations module** (first on the Course page): reading tab, holding the guitar and pick, first tune-up, fretting cleanly, and a hand-health warm-up that is offered before demanding lessons.
- **Beta** with 3–5 guitarists before v1.0 is tagged.
- **Case-study page** at `/about` and a privacy-respecting **Report a problem** button.
- **Testing on Safari, iPad and Firefox** as well as Chrome, visual regression tests, and a real-device checklist at audio, mic and install gates.

### 20.6 Review gate (people, not only tests)
At the end of each module's phase the user plays the module tune and two lessons on their guitar and rates three things from 1 to 5: **playable**, **sounds like the style**, **fun**. Any score under 4 is reworked before the gate passes, with the reason logged in `LESSONS.md`. A review by a guitarist friend is recommended for the module tunes.
