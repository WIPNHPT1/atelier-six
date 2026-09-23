# Phase 24 — v2.2: App Store and Google Play builds (Capacitor) and final release
Aim: the same app as native iOS and Android apps, built by CI, then the final release of the plan. PRD refs: §19.2.
**Costs:** building is free. Publishing needs a Google Play developer account ($25 one-off) and an Apple Developer Program membership ($99/year). Steps 24.4–24.5 are user actions and can be skipped (24.6 still releases); the PWA remains the free install route. iOS builds need macOS: CI uses GitHub's macOS runners (free for public repos); local iOS work needs a Mac with Xcode.

### 24.1 Capacitor setup
Do:
- Install `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`. `npx cap init "Atelier Six" com.<github-username>.ateliersix --web-dir dist` (ask the user to confirm the bundle id — it can't be changed after publishing).
- `npx cap add android` and `npx cap add ios`; commit the native projects (ignore build outputs per Capacitor's gitignores).
- `src/app/platform.ts`: `isNative()` and feature switches (native: no service worker registration, no install prompt, native haptics).
- npm scripts: `native:sync` (`npm run build && npx cap sync`), `native:android`, `native:ios`.
- Icons and splash from the VI Monogram with `@capacitor/assets` (`npx capacitor-assets generate` from `assets/icon.png` and `assets/splash.png`; extend `scripts/icons.ts` to render the splash: `vi-mark-dark.svg` centred at 30 % width on an ebony 2732 × 2732 canvas).
Verify: `npm run native:sync 2>&1 | tail -n 10`
Done when: sync succeeds for both platforms.

### 24.2 Native plugins
Do:
- `@capacitor/haptics` (replaces the Vibration API path on native — iOS finally gets haptics), `@capacitor/status-bar` (ebony, light content), `@capacitor/splash-screen`, `@capacitor-community/keep-awake` (while playing or listening), `@capacitor/app` (back button on Android: close sheets first, then navigate back).
- **Audio session (iOS):** a tiny local Capacitor plugin `AudioSession` (Swift, in `ios/App/App/Plugins/`) that sets `AVAudioSession` category `.playAndRecord` with options `.defaultToSpeaker, .allowBluetoothA2DP, .mixWithOthers` when listening and `.playback` otherwise, so audio plays with the silent switch on. TypeScript wrapper `src/native/audioSession.ts`; no-op on web/Android.
- Permissions: iOS `Info.plist` `NSMicrophoneUsageDescription` ("Atelier Six listens to your guitar to check your chords and tuning. Audio never leaves your device.") and `NSCameraUsageDescription` (finger check); Android `RECORD_AUDIO`, `CAMERA`, `MODIFY_AUDIO_SETTINGS`; confirm WebView getUserMedia prompts work on both.
- Deep links: `ateliersix://` scheme and associated domains/app links for the live URL (magic-link sign-in returns to the app).
Verify: `npm run verify 2>&1 | tail -n 10 && npm run native:sync 2>&1 | tail -n 5`
Done when: passing.

### 24.3 CI native builds
Do:
- `.github/workflows/native.yml` on tags `v*` and manual dispatch: job `android` (ubuntu, Java 17, `npm ci`, `native:sync`, `./gradlew bundleRelease` if signing secrets exist else `assembleDebug`; upload AAB/APK artifact); job `ios` (macos-latest, `npm ci`, `native:sync`, `xcodebuild -workspace ios/App/App.xcworkspace -scheme App -sdk iphonesimulator -configuration Debug build`; archive/export only when signing secrets exist).
- Signing is read only from GitHub secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`; iOS via App Store Connect API key secrets). Never commit keystores or certificates; add patterns to `.gitignore`.
- `docs/native.md`: how to run locally, how CI builds, how to add signing secrets.
Verify: push a branch and dispatch the workflow: `gh workflow run native.yml && gh run watch --exit-status 2>&1 | tail -n 20` (or ask the user to check the Actions tab).
Done when: both jobs green (debug builds).

### 24.4 Device testing (USER ACTION)
Do: STOP and give the user exact steps: "Android: download the APK artifact from the Actions run, enable 'Install unknown apps', install and try a lesson, the tuner, Listen and the finger check. iPhone (needs a Mac): `npm run native:ios`, pick your phone in Xcode, press Run (a free Apple ID works for 7-day test installs)." Collect issues and fix each via the normal loop, logging lessons.
Verify: the user confirms audio (silent switch on), mic, camera, haptics and offline work on at least one device.
Done when: confirmed.

### 24.5 Store listings (USER ACTION, optional, paid)
Do:
- Generate store assets: screenshots from Playwright at store sizes (6.7" and 5.5" iPhone, 12.9" iPad, Android phone and 10" tablet) into `store/screenshots/`; `store/listing.md` with name, subtitle, short and full description, keywords, privacy answers (no data collected when signed out; email + practice data when signed in; nothing shared or sold), content rating answers, support URL = GitHub issues, privacy policy URL = `<LIVE_URL>/privacy`.
- STOP and tell the user: "If you want the apps in the stores: create the developer accounts (Google $25 one-off, Apple $99/year), add signing secrets listed in `docs/native.md` to GitHub, and say done — or say skip." If done: re-run `native.yml` on the tag and walk the user through uploading the AAB to Play Console (internal testing first) and the iOS build to TestFlight.
Verify: `ls store/screenshots | head` shows the generated screenshots.
Done when: listing assets committed; store submission done or skipped by the user.

### 24.6 Final docs + release v2.2.0 (USER ACTION: final GIF)
Do:
- README: "Native apps" section (install from the stores if published, or the APK from the GitHub release); final architecture diagram; full quality table (core coverage, e2e test count, Lighthouse, entry KB, frame ms, detection accuracy, camera accuracy); roadmap section renamed "Future ideas".
- `docs/architecture.md`: native layer (Capacitor plugins, audio session, deep links).
- ADR `0017-capacitor-over-react-native.md`.
- Demo mode: final tour ≤ 40 s covering every milestone; update `demo.spec.ts`. STOP (USER ACTION): record the final GIF as in 10.2 and say done.
- Release `v2.2.0`: changelog section with the entry listed under Gate 24, `npm version 2.2.0`, push tags, GitHub release with the APK attached and notes summarising the whole journey v1.0 → v2.2.
Verify: `npm run check:links 2>&1 | tail -n 5 && git tag --list v2.2.0`
Done when: release exists; CI green on the tag.

### Gate 24 (final)
Run: `npm run verify`, `npx vitest run --coverage src/core 2>&1 | tail -n 20` (100%), `npm run e2e`, `npm run build`, `npm run size`, `npx lhci autorun`; `native.yml` and `db` jobs green on the tag. Web behaviour unchanged (`npx playwright test offline smoke`). Tick Gate 24. Reply to the user with the live URL, repo URL, the full quality table, and "Atelier Six v2.2 is complete." Then ask the user to run the matching rows of `docs/device-checklist.md` on their own devices (USER ACTION, ≈ 10 minutes) and record the results in `PROGRESS.md`; fix any failure before closing the gate.
Changelog entry (added by the release step 24.6, not by /gate): `- Native iOS and Android apps via Capacitor: native haptics, audio session handling, CI builds; store listings ready.`
