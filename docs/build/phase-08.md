# Phase 8 — Hands-free and settings
Aim: practise without touching the screen, and make every setting work everywhere. PRD refs: §4 (Hands-free), §9 items 9–10.

### 8.1 Keyboard/pedal shortcuts
Do:
- Pure `src/core/input/keymap.ts`: map `KeyboardEvent.key`/`code` → action: Space → togglePlay; ArrowRight/PageDown → next; ArrowLeft/PageUp → prev; `l` → toggleLoop; `-`/`_` → slower; `=`/`+` → faster; `c` → clean; `m` → missed; `t` → tuner; `?` → shortcuts help. Ignore when focus is in an input/textarea/contenteditable. Page-turner pedals send PageDown/PageUp or arrows, so these cover them.
- `useShortcuts()` hook dispatching to the active page's handlers; a `?` overlay listing shortcuts; a Settings row "Foot pedal test" that highlights which action was received.
- Tests: keymap table; ignored-in-input behaviour.
- `tests/e2e/shortcuts.spec.ts` (desktop project): on a lesson press Space → playing; PageDown → next chord shown; `?` → overlay visible.
Verify: `npx vitest run src/core/input 2>&1 | tail -n 10 && npx playwright test shortcuts 2>&1 | tail -n 15`
Done when: passing.

### 8.2 Voice commands
Do:
- Feature-detect `SpeechRecognition`/`webkitSpeechRecognition`; the toggle is hidden if unsupported. Opt-in only, off by default; clear "Listening for commands" indicator. Note: some browsers send speech to a cloud service — say so in the settings description.
- Pure `parseCommand(transcript) → Action | null` (tested): play/start, stop/pause, slower/"slow down", faster/"speed up", loop, next, back/previous, "tempo <n>". Case/whitespace tolerant; ignores unknown phrases.
- Voice and the tuner mic must not run at once: starting one stops the other.
Verify: `npx vitest run src/core/input 2>&1 | tail -n 10`
Done when: passing.

### 8.3 Left-handed, tunings, capo and finishes everywhere
Do:
- Left-handed: Fretboard and TransitionCard mirror; TabLane unchanged (tab is hand-independent); labels stay readable.
- Tuning + capo: flow into `buildSchedule`, tab string labels, tuner targets and chord naming (capo shows "shapes" vs "sounds as" names, e.g. "G shape — sounds A").
- Drop D: add derived one-finger power shapes at runtime (`dropDPower(root)` pure, tested: frets `r r r x x x` with finger 1 as barre on strings 0–2) and include them in Module 1 candidates when tuning is dropD.
- Finishes: lessons set the module finish automatically unless the user pinned one in Settings.
- `tests/e2e/settings.spec.ts`: toggle left-handed → Fretboard mirrored (check a dot's x position flips); set drop D → tab lowest label is `D`; set capo 2 on an open lesson → "sounds as" label appears.
Verify: `npx vitest run src/core 2>&1 | tail -n 10 && npx playwright test settings 2>&1 | tail -n 15`
Done when: passing.

### Gate 8
Run: `npm run verify`, `npm run e2e`, `npm run build`.
CHANGELOG line: `- Hands-free control (keys, foot pedals, voice), left-handed mode, tunings, capo and automatic finishes.`
