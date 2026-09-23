# Phase 23 — v2.1: Camera finger check (MediaPipe hands)
Aim: the camera checks which fingers are on which strings and frets, on the device. PRD refs: §19.1.
Frames are processed in memory and never stored or uploaded. The feature is labelled Beta and never blocks progress.

### 23.1 Geometry (pure)
Do (`src/core/vision/`):
- `homography(src4, dst4) → Matrix3` (DLT with normalisation), `applyH(H, point)`.
- Fretboard model: fret positions by the 12th-root-of-2 rule (`fretX(n) = scale · (1 − 2^(−n/12))`), string y positions evenly spaced; calibration points = fret 1 and fret 5 on the low and high E strings → maps image → fretboard coordinates.
- `fingertipsToPositions(landmarks, H, handedness, leftHanded) → { finger: 1|2|3|4|'T', string, fret, confidence }[]` using MediaPipe landmark indices (thumb 4, index 8, middle 12, ring 16, pinky 20); a fingertip counts as fretting when it lies between the fret wires and within half a string spacing of a string.
- `compareToShape(positions, shape) → per finger 'correct'|'near'|'wrong'|'missing'` (near = right string, one fret off, or right fret, adjacent string).
Tests: homography maps the 4 points exactly and an interior point within 1 %; synthetic landmark sets for C, G.open.b and a G5 produce the right results; mirrored and left-handed cases.
Verify: `npx vitest run src/core/vision 2>&1 | tail -n 15`
Done when: passing, 100% coverage.

### 23.2 Hand Landmarker in a worker
Do:
- Install `@mediapipe/tasks-vision`. `npm run models:copy` also copies the `hand_landmarker.task` model and the tasks-vision WASM files into `public/models/mediapipe/` (self-hosted; licence in `docs/licences.md`).
- `src/workers/hands.worker.ts` (or main-thread with GPU delegate if the worker path is unsupported — detect and choose): `VIDEO` running mode, 1 hand, ~15–20 fps, frames passed as `ImageBitmap`. Returns landmarks + handedness per frame.
- `netlify.toml`: `Permissions-Policy` camera=(self); add `'wasm-unsafe-eval'` to `script-src` (record the reason in ADR `0016-wasm-unsafe-eval-for-on-device-ml.md`).
- Runtime-cache the model on first use only.
Verify: `npm run build 2>&1 | tail -n 8 && npm run size 2>&1 | tail -n 5` (tasks-vision in a lazy chunk).
Done when: passing.

### 23.3 Finger check UI
Do (`src/features/camera/`):
- Entry: "Check my fingers (Beta)" button in lessons, drills and the Library sheet. First run: setup guide (camera beside the neck, fretboard fully in frame, good light), camera picker, then calibration: tap the 4 reference points on the live video (large targets; keyboard alternative using arrow keys to move a crosshair). Calibration saved per device + camera.
- Live view: video with the finger overlay (dots in finger colours; correct = solid with a soft brass ring, near = outline, wrong = dashed with an arrow to the right spot) and a short text summary ("Finger 3 is on the 4th string — move it to the 5th"). Freeze-frame button.
- Uses **gliding fingers** motion from 9.2 for the arrows; motion off = static arrows.
- Privacy line always visible: "Processed on this device. Nothing is recorded."
- `tests/e2e/camera.spec.ts` with `--use-fake-device-for-media-stream` and `--use-file-for-fake-video-capture=tests/fixtures/hand.y4m` (a short synthetic clip; if a realistic hand clip isn't available, test the UI flow only with the worker mocked to return fixture landmarks): calibration flow completes; overlay renders 4 finger markers; Stop releases the camera.
Verify: `npx playwright test camera 2>&1 | tail -n 15`
Done when: passing. STOP (USER ACTION): "Try the finger check with your guitar on a phone or laptop camera: calibrate, play C, G and Am, and tell me how often it was right." Record the result in `docs/detection.md` (Camera section) and tune thresholds if needed (log changes in `LESSONS.md`).

### 23.4 Release v2.1.0
Do: README "Camera finger check (Beta)" section with a short GIF or screenshot (user action if a GIF is wanted), privacy note, limitations; changelog (add the entry listed under Gate 23 to a `## [2.1.0]` section); `npm version 2.1.0`; push tags; GitHub release.
Verify: `git tag --list v2.1.0`
Done when: release exists.

### Gate 23
Run: `npm run verify`, `npx vitest run --coverage src/core 2>&1 | tail -n 20` (100%), `npm run e2e`, `npm run build`, `npm run size`, `npx lhci autorun`. Reply: "v2.1 is live. Start a new session (⌘N) and type /next to start Phase 24 (app-store builds)." Then ask the user to run the matching rows of `docs/device-checklist.md` on their own devices (USER ACTION, ≈ 10 minutes) and record the results in `PROGRESS.md`; fix any failure before closing the gate.
Changelog entry (added by the release step 23.4, not by /gate): `- Camera finger check (Beta): on-device hand tracking with fretboard calibration and per-finger feedback.`
