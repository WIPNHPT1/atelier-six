# Phase 10 — Showcase and release
Aim: make the repo and demo land well with technical people in the first 30 seconds. PRD refs: §13, §14, §15.

### 10.1 README + docs + ADRs
Do:
- `README.md` in this order: logo (SVG) + one-line pitch; badges (CI, Netlify, Lighthouse scores as static shields using the recorded `LH`, licence, TypeScript); **Live demo** link + GIF placeholder `docs/demo.gif`; "Why" (chords are easy, changes are hard — 3 sentences); Features (short bullets); **How the transition engine works** (5 lines + link to `docs/engine.md`); Architecture (Mermaid diagram: UI → features → core ← data; audio + mic side-boxes; PWA/SW); Tech stack table with one-line reasons; Quality (100% core coverage, e2e on 3 viewports, Lighthouse, a11y, size budgets — with the real recorded numbers); Getting started (`npm i`, `npm run dev`, scripts table); Project structure tree (2 levels); Roadmap (from PRD §14); Licence; Acknowledgements (Tone.js, pitchy, fonts) and a note that songs are named only as listening references.
- `docs/architecture.md`: data flow from lesson JSON → optimiser → schedule → audio/playhead → UI; why core is pure; state stores; offline strategy.
- ADRs in `docs/adr/` (Nygard format, ≤ 1 page each): 0002 PWA over native apps; 0003 Tone.js for audio; 0004 pure core + generated data; 0005 Viterbi fingering optimiser; 0006 Canvas vs PixiJS for living strings (from 9.3's measurement); 0007 no backend in v1 (privacy, cost).
- **Case-study page** at `/about` on the live site (same design system, editorial layout): the problem in one paragraph; a short looping demo; "How the fingering engine works" with a live mini-demo (pick two chords, see the lattice and the chosen path); the design (logo, finishes, a few screens from `docs/design/screens.html`); the quality numbers (coverage, e2e count, Lighthouse, entry KB, frame time); privacy; links to the repo, `docs/engine.md` and the ADRs; the "not affiliated or endorsed" line. Linked from the sidebar footer, Settings and the README.
- **Report a problem:** in Settings and the ⌘K palette. Opens a new GitHub issue in a new tab using the bug-report template, pre-filled with app version, browser, device type, screen size, current screen and the last 20 lines of a small local error log (errors only; no personal data, no progress data). The user sees and can edit everything before submitting. Nothing is sent automatically.
- GitHub repo "About": description, website = live URL, topics (`guitar`, `music-education`, `pwa`, `react`, `typescript`, `web-audio`, `tonejs`, `dynamic-programming`, `vite`) — via `gh repo edit` if available, else give the user the exact text.
Verify: `npx prettier --check "*.md" "docs/**/*.md" 2>&1 | tail -n 5`; every link in README resolves to an existing file (small script `scripts/check-links.ts`, `npm run check:links`).
Done when: passing.

### 10.2 Demo mode (USER ACTION: record GIF)
Do:
- `/?demo=1` runs a scripted, hands-off 20-second tour (a pure step list in `src/features/demo/script.ts`): Today → Library (G card opens, compare with C, gliding fingers play) → lesson (Play; living strings; chorus switch; ink-bloom tab) → finish switches Nitro → Xerox → Sunburst → tuner needle settles. Any key or tap exits.
- `tests/e2e/demo.spec.ts`: demo reaches its final step within 25 s.
- STOP and tell the user: "Open <LIVE_URL>/?demo=1 on desktop in a 1280×800 window. Record it (macOS: Cmd+Shift+5; Windows: Win+Alt+R), convert to GIF at ezgif.com (≤ 8 MB, 960 px wide), save as `docs/demo.gif`, then say done." When done, check the file exists and is < 8 MB, and commit it.
Verify: `npx playwright test demo 2>&1 | tail -n 10`
Done when: test passes and `docs/demo.gif` is committed.

### 10.3 Beta with guitarists (USER ACTION)
Do:
- `docs/beta.md`: a two-minute feedback form as a GitHub issue template (`.github/ISSUE_TEMPLATE/beta_feedback.yml`): device, level, which module, what felt great, what was confusing, what broke, scores out of 5 for playable / sounds like the style / fun, "would you keep using it?".
- STOP and give the user a ready-to-send message (copy-paste) inviting 3–5 guitarists to try the live site for a week, with the feedback link. Suggest mixing levels (one beginner, one experienced).
- When the user says feedback is in: read the issues, group them (bugs / confusing / musical), fix bugs via the normal loop, and turn the rest into a short list in `docs/beta.md` for the user to prioritise. Anything scoring under 4 on the three scores gets the same rework rule as the review gate.
Verify: `docs/beta.md` lists the feedback and what was done about each item.
Done when: the user agrees the v1.0 release can go ahead.

### 10.4 Release v1.0.0
Do:
- Move all `CHANGELOG.md` Unreleased lines under `## [1.0.0] - <today>`; add compare links.
- `npm version 1.0.0 -m "chore(release): v%s"` (creates the tag), `git push --follow-tags`.
- `gh release create v1.0.0 --title "Atelier Six 1.0" --notes-file <generated notes from the changelog section>` if `gh` is available; otherwise give the user the exact text to paste into GitHub → Releases.
- Final check of the live site: `/`, a lesson, tuner, install prompt.
Verify: `git tag --list v1.0.0` prints the tag; CI green on the tag.
Done when: release exists.

### Gate 10
Run: `npm run verify`, `npm run e2e`, `npm run build`, `npm run size`, `npm run check:links`. Tick Gate 10 in `PROGRESS.md` and set "Current:" to 11.1. Reply to the user with: live URL, repo URL, the recorded quality numbers (coverage, LH, JS_KB, FRAME_MS), and: "v1.0 is live. Start a new session (⌘N) and type /next to start v1.1 (Phases 11–15: lead, thumb-over and Whammy)."
