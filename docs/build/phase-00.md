# Phase 0 — Repo foundation
Aim: a professional, empty-but-deployable repo with quality tooling and CI. PRD refs: §11, §13.

### 0.1 Scaffold Vite + React + TS (strict)
Do:
- `npm create vite@latest . -- --template react-ts` (keep the existing kit files), then `npm install`.
- `tsconfig`: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`, path alias `@/*` → `src/*` (also in `vite.config.ts`).
- The folder already contains the kit (`CLAUDE.md`, `PRD.md`, `START-HERE.md`, `WALKTHROUGH.*`, `MAC-GUIDE.*`, `DRIVE-AND-AUTOPILOT.*`, `docs/build/`, `.claude/`, `scripts/build-guide.py`, …). Scaffold into a temporary folder and move the Vite files in, so no kit file is overwritten. If `npm create` asks questions, pick React + TypeScript.
- Delete Vite demo assets/CSS. `src/main.tsx` renders `<App/>`, which shows "Atelier Six".
- Create empty folders with `.gitkeep`: `src/{core,audio,ui,features,data,styles,app}`, `scripts`, `tests/e2e`, `docs/adr`.
- `.gitignore`: keep Vite's entries and add `.claude/state/`, `.env*` (but not `.env.example`), `eval/tmp/`. Commit `.claude/` (commands, hooks, settings) and `RESUME.md`.
- `.nvmrc` = `24`. `package.json`: `"name": "atelier-six"`, `"version": "0.1.0"`, `"private": true`, `"engines": {"node": ">=24"}`, `"type": "module"`.
Verify: `npx tsc --noEmit 2>&1 | tail -n 20 && npm run build 2>&1 | tail -n 5`
Done when: both pass; first commit `chore: scaffold vite react ts`.

### 0.2 ESLint, Prettier, npm scripts
Do:
- ESLint flat config (`eslint.config.js`): `@eslint/js`, `typescript-eslint` (strictTypeChecked), `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-jsx-a11y`. Rule: forbid imports of `react`, `tone`, `pixi.js` inside `src/core/**` (`no-restricted-imports`). Rule: no raw text in JSX (`react/jsx-no-literals` with `noStrings: true`, allowing punctuation and symbols) so all wording lives in the copy file (1.3).
- Prettier: `.prettierrc` (`singleQuote`, `semi`, `printWidth: 100`, `trailingComma: "all"`), `.prettierignore`.
- `.editorconfig` (2 spaces, LF, UTF-8), `.gitattributes` (`* text=auto eol=lf`).
- Scripts: `dev`, `build` (`tsc -b && vite build`), `preview`, `lint` (`eslint . --max-warnings 0`), `format`, `typecheck` (`tsc --noEmit`), `test` (`vitest run --reporter=dot`), `verify` (`npm run lint --silent && npm run typecheck --silent && npm run test --silent`), `e2e` (`playwright test --reporter=line`).
Verify: `npm run lint 2>&1 | tail -n 20 && npm run typecheck 2>&1 | tail -n 20`
Done when: both pass with zero warnings.

### 0.3 Vitest + Testing Library
Do:
- Install `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`.
- `vitest.config.ts` (merges vite config): environment `jsdom`, setup file `src/test/setup.ts`, coverage thresholds for `src/core/**`: 100% lines/functions/branches/statements (applies once files exist).
- `src/app/App.test.tsx`: renders "Atelier Six".
Verify: `npm run verify 2>&1 | tail -n 20`
Done when: 1 test passes.

### 0.4 Playwright smoke test
Do:
- Install `@playwright/test`. Install browsers with `npx playwright install chromium webkit firefox` (skip any already provided).
- `playwright.config.ts`: `webServer` = `npm run build && npm run preview -- --port 4173`, baseURL `http://localhost:4173`, projects: `mobile` (Pixel 7, Chromium), `mobile-safari` (iPhone 15, WebKit), `tablet` (iPad Mini landscape, WebKit, since iPads only run Safari's engine), `desktop` (1440×900, Chromium), `desktop-safari` (1440×900, WebKit) and `desktop-firefox` (1440×900, Firefox). Tests that need a fake microphone or camera run only in Chromium (tag them `@chromium-only` and use `grep`/`grepInvert` in the config); everything else runs everywhere. Reporter `line`. Retries 1 on CI.
- `tests/e2e/smoke.spec.ts`: page loads, title contains "Atelier Six", no console errors.
Verify: `npm run e2e 2>&1 | tail -n 20`
- `docs/device-checklist.md`: a short manual test list for real devices (iPhone Safari, iPad Safari in landscape, Mac Safari, Mac Chrome; wired vs Bluetooth headphones): audio starts after one tap, sound with the iPhone silent switch on and off, mic permission prompt, tuner reads a real string, install to home screen, offline after install, rotation, text size at the largest system setting. Each gate that touches audio, mic or install (Gates 5, 7, 9, 17, 23, 24) asks the user to run the relevant rows and reports the result in `PROGRESS.md`.
Done when: smoke passes on all 6 projects.

### 0.5 Husky, lint-staged, commitlint
Do:
- Install `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`. `npx husky init`.
- `pre-commit`: `npx lint-staged` (eslint --fix + prettier --write on staged files). `commit-msg`: `npx --no -- commitlint --edit "$1"`.
- `commitlint.config.js` extends conventional and adds the type `wip` (local checkpoint commits, made with `--no-verify`, always squashed before pushing); add a `pre-push` hook that refuses to push if `git log @{u}..HEAD --format=%s` contains a line starting with `wip` (skip the check when there is no upstream yet). Allowed scopes: app, ui, core, engine, audio, data, lesson, drills, tuner, progress, pwa, lead, phrase, style, tune, foundations, about, legal, thumb, whammy, pedal, midi, dsp, detect, listen, sync, auth, net, db, studio, export, morph, band, jam, vision, camera, native, ci, deps, docs, release.
Verify: `git commit --allow-empty -m "bad message" 2>&1 | tail -n 5` must FAIL; then `git commit --allow-empty -m "chore(ci): verify commit hooks" 2>&1 | tail -n 3` must pass.
Also: `git commit --allow-empty --no-verify -m "wip(ci): hook test"` then `git push --dry-run` must be refused by the pre-push hook; then `git reset --soft HEAD~1`.
Done when: bad message rejected, good one accepted, wip push refused.

### 0.6 Repo community + config files
Do (keep each file short and real — no placeholder lorem):
- `LICENSE` (MIT, current year, author from `git config user.name`).
- `README.md` stub: title, one-line pitch, "Status: in development", badge placeholders for CI, Netlify, licence (filled in 0.7/0.8).
- `CONTRIBUTING.md` (setup, scripts, Conventional Commits, branch naming `feat/…`, PR checklist).
- `CODE_OF_CONDUCT.md` (3 lines + link to Contributor Covenant 2.1).
- `SECURITY.md` (report via GitHub private vulnerability reporting; no data collected).
- `CHANGELOG.md` (Keep a Changelog format, `## [Unreleased]`).
- `.github/ISSUE_TEMPLATE/bug_report.yml`, `feature_request.yml`, `config.yml`; `.github/pull_request_template.md`; `.github/CODEOWNERS` (`* @<github-username>` — ask the user if unknown); `.github/dependabot.yml` (npm weekly, grouped minor/patch; github-actions monthly).
- `docs/adr/0001-record-architecture-decisions.md` (Nygard format).
Verify: `npx prettier --check "**/*.{md,yml,json}" 2>&1 | tail -n 10`
Done when: all files exist and pass Prettier.

### 0.7 GitHub Actions CI
Do:
- `.github/workflows/ci.yml`: on push + PR to `main`. Node from `.nvmrc`, npm cache. Jobs: `verify` (`npm ci`, `npm run verify`, `npx vitest run --coverage` and upload coverage artifact), `e2e` (needs verify; install chromium, webkit and firefox with deps; `npm run e2e`; upload report on failure), `build` (`npm run build`, upload `dist` artifact). `concurrency` cancels in-progress runs on the same ref. Least-privilege `permissions: contents: read`.
- Security: `npm audit --audit-level=high` in the `verify` job (fails on high or critical); `.github/workflows/codeql.yml` (GitHub's free CodeQL analysis for JavaScript/TypeScript on push, PR and weekly). After the first push, STOP and ask the user to check GitHub → repo **Settings → Code security** and turn on **Secret scanning** and **Push protection** (usually on by default for public repos).
- Add CI and CodeQL badges to README.
- `git push -u origin main`.
Verify: `gh run watch --exit-status 2>&1 | tail -n 15` if `gh` is available; otherwise ask the user to confirm the Actions tab is green.
Done when: CI green on `main`.

### 0.8 Netlify config + first deploy (USER ACTION)
Do:
- `netlify.toml`: `[build] command = "npm run build"`, `publish = "dist"`, `[build.environment] NODE_VERSION = "24"`; SPA redirect `/* /index.html 200`; headers for `/*`: `Content-Security-Policy` (`default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; worker-src 'self' blob:; connect-src 'self'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: microphone=(self), camera=()`; long cache for `/assets/*` (`public, max-age=31536000, immutable`); `[build] ignore = "git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- src public index.html package.json package-lock.json vite.config.ts netlify.toml"` so pushes that only change docs, tests or kit files don't use a production deploy (Netlify's free plan has a monthly credit cap).
- Commit and push.
- STOP and tell the user: "In Netlify: Add new site → Import from Git → GitHub → atelier-six → Deploy. Paste the site URL here." Deploy previews for PRs are on by default.
- When the URL arrives: add the Netlify status badge + live link to README, add `LIVE_URL` line to `PROGRESS.md` header.
Verify: `curl -sI <url> | head -n 5` returns 200 (if curl is blocked, ask the user to confirm the page loads).
Done when: live URL shows "Atelier Six".

### 0.9 Name and artist-reference check (USER ACTION)
Do:
- Write `docs/legal-check.md` with the searches for the user to run, each as a clickable link with the exact search term "Atelier Six": UK IPO trade mark search, EUIPO/TMview, USPTO trademark search, App Store and Google Play searches, and a domain check (e.g. ateliersix.app / .com). Add a column for what they found.
- STOP and walk the user through it click by click (≈ 15 minutes). If anything close exists in music, education or software, tell them plainly and stop for a decision (keep, tweak, or rename). This isn't legal advice; for a commercial launch they should ask a trade mark adviser.
- Artist-reference rules (also add them to `CLAUDE.md` Code rules and PRD §5): artists and songs appear only as listening references and as "in the style of" labels; never in the app name, icon, logo, store title, subtitle or keywords; never in marketing images. Add a line to the About page, README and store listings: "Not affiliated with or endorsed by any artist or rights holder named in the course. Artists and songs are named as listening references only."
Verify: `docs/legal-check.md` exists with the user's results filled in.
Done when: the user has confirmed the name, or chosen a new one (then update PRD, logo wordmark and copy before continuing).

### Gate 0
Run: `npm run verify && npm run e2e && npm run build` (each trimmed). Confirm CI green and the live URL loads.
CHANGELOG line: `- Project scaffold, tooling, CI and Netlify deploy.`
