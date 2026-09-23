# Lessons (read before every step)

Format — one line each: `- [area] symptom → cause → fix (step)`
Rules: max 60 lines. When full, merge similar lines. Never delete a lesson that is still true.
Areas: build, ts, lint, test, e2e, audio, pwa, ui, data, engine, ci, netlify, detect, db, native.

## Seeded (known pitfalls)
- [audio] AudioContext silent/suspended → no user gesture → call `Tone.start()` inside a click handler (5.2)
- [test] Tone.js import crashes in jsdom → Web Audio missing → keep scheduling pure in `src/core/schedule`, mock `src/audio` in UI tests (5.x)
- [e2e] Playwright can't use the mic → no device → launch with `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream` (7.x)
- [netlify] deep links 404 → SPA routing → `/* /index.html 200` redirect in netlify.toml (0.8)
- [ci] `npm ci` fails → lockfile out of sync → run `npm install` locally and commit the lockfile (0.7)
- [pwa] stale app after deploy → old service worker → `registerType: 'autoUpdate'` + prompt to reload (9.1)
- [ui] iOS tilt sheen does nothing → DeviceOrientation needs permission → request on a tap, fall back to time-based sheen (9.2)
- [audio] clicks on bends/whammy → setValueAtTime jumps → use `linearRampTo`/`rampTo` and 5 ms gain ramps (11.3, 14.1)
- [audio] live Whammy sounds late → granular PitchShift adds window latency → playback uses detune directly; PitchShift only for live input (14.4)
- [audio] mic pitch wrong/unstable → browser echo cancellation/AGC on → request audio with processing flags off (12.2)
- [ui] MIDI pedal button missing on iPhone → Web MIDI unsupported in Safari → feature-detect, show on-screen rocker (14.2)
- [data] phrase build fails on bar length → durations must sum to 16 per `|` bar (11.1)
- [detect] mic analysis wrong pitch → AudioContext runs at 44.1/48 kHz but Basic Pitch needs 22,050 Hz → resample in the worklet (16.1)
- [detect] tfjs in the entry chunk → static import → dynamic `import()` inside the worker only (16.2)
- [netlify] VITE_ env var undefined in prod → added after the last deploy → trigger a redeploy after changing env vars (18.1)
- [db] query returns empty for the signed-in user → RLS policy missing or wrong → every table needs select/insert/update/delete policies on `user_id = auth.uid()` (18.1)
- [pwa] ML model or WASM blocked → CSP → self-host under /models and add `'wasm-unsafe-eval'` to script-src (23.2)
- [native] no sound on iPhone with silent switch on → AVAudioSession category → AudioSession plugin sets `.playback` (24.2)
- [build] session stopped by a usage limit mid-step → work not saved → checkpoint commits + RESUME.md; start a new session and type /pickup (all)
- [netlify] live site paused → monthly free credits used up → keep building, mark DEPLOY_PENDING, deploy after reset (all)
- [audio] sample licence unclear → can't ship it → read the licence file first; record source and attribution in docs/licences.md; fall back to the plucked-string model (5.5)
- [pwa] install too big → samples in the precache → runtime-cache samples on first use, offer "Download sounds for offline" (5.5)
- [data] lesson fails style lint → built from scratch instead of style cells → rebuild it with riffBuilder from the style JSON (6.0)
- [build] "Operation not permitted" on git config/remote, husky install, gh login or git push → sandbox protects .git/config, ~/.gitconfig and the keychain → rerun that one command outside the sandbox; don't widen the sandbox (all)
- [build] npm or Playwright can't reach a site → host not in sandbox allowedDomains → name the host on the command so auto mode can review it; add it to settings only if it's needed every session (all)

## Learned during build
