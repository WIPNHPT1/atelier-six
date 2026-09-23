# Phase 1 — Design system
Aim: the Atelier Six look, as tokens and components, before any feature screens. PRD refs: §10 (read it once at 1.1; afterwards only the sub-section you need).

### 1.1 Tokens, finishes, global styles, fonts
Do:
- Install `@fontsource/instrument-serif`, `geist` (or `@fontsource-variable/inter` if geist fails), and Geist Mono. Import only the weights used (serif 400; sans 400/500/600; mono 400/500). No Google Fonts CDN.
- `src/styles/tokens.css`: every colour in PRD §10 as a CSS variable; plus `--font-display/ui/mono`, type scale `--t-12…--t-56`, spacing `--s-1…--s-16` (4px base), `--r-hair: 2px`, `--r-pill: 999px`, `--dur-ui: 180ms`, `--dur-show: 420ms`, `--ease: cubic-bezier(.2,.7,.1,1)`, `--motion-scale: 1`.
- Light mode: `[data-mode="light"]` override (bone background, ebony text, accents darkened ~10%).
- `src/styles/finishes.css`: `[data-finish="nitro|xerox|sunburst|faded|stencil"]` overriding only a handful of variables (`--surface-texture`, `--glow`, `--motion-scale`, accent tweaks). Xerox uses an inline SVG noise data-URI at low opacity; Sunburst a radial gradient.
- `src/styles/global.css`: reset, body on `--ebony`, `--bone` text, focus ring = 2px `--brass` outline with 2px offset, `@media (prefers-reduced-motion: reduce)` and `[data-motion="off"]` set `--motion-scale: 0` and kill transitions.
- `scripts/check-contrast.ts` (run with `npx tsx`): parses tokens.css, asserts text pairs (bone/ebony, bone/rosewood, bone-dim/ebony, ebony/brass) ≥ 4.5:1 in both modes. Add `npm run check:contrast`.
Verify: `npm run check:contrast 2>&1 | tail -n 10 && npm run verify 2>&1 | tail -n 10`
Done when: contrast passes; `Grep "#[0-9a-fA-F]{3,6}" src --glob "!src/styles/**"` finds nothing.

### 1.2 Base components
Do, in `src/ui/` (each with a `.test.tsx` covering render, a11y role/label, keyboard):
- `Button` (variants: primary brass, quiet, ghost; sizes; loading), `IconButton` (required `label`), `Panel` (hairline border, optional raised), `Divider`, `Heading` (display serif, levels), `Text`, `Mono`, `Pill`, `Slider` (tempo; arrows ±1, shift+arrows ±5), `Toggle`, `SegmentedControl` (for section switch verse/chorus), `Dial` (SVG arc 0–1 with label — used by practice ring and tuner later), `Sheet` (bottom sheet on mobile, side panel ≥640px).
- `src/ui/icons.tsx`: ~16 hand-drawn 1.5px-stroke SVG icons (play, pause, loop, next, prev, metronome, tuner, settings, pin, arrow, arc, plus, minus, mic, check, close).
- CSS Modules per component, tokens only. Motion via CSS transitions using `calc(var(--dur-ui) * var(--motion-scale))`.
Verify: `npx vitest run src/ui 2>&1 | tail -n 15 && npm run lint 2>&1 | tail -n 10`
Done when: all component tests pass.

### 1.3 App shell + settings store
Do:
- Install `react-router-dom`, `zustand`.
- Read PRD §10 "Navigation and interface quality" once. Open `docs/design/screens.html` in Playwright and save a screenshot of each screen and device (`section.scr` → `.fr[data-dev]`) to `docs/screenshots/reference/<screen>-<device>.png` for comparison. Don't read the HTML itself (it is large); read only a single screen's CSS if you need exact values.
- `src/app/routes.tsx`: `/` (Today), `/onboarding`, `/course`, `/course/:module`, `/library`, `/library/:chord`, `/lesson/:id`, `/practise`, `/drills`, `/tuner`, `/progress`, `/settings`, `/design`. Lazy-load each feature route. Placeholder pages with a Heading for now.
- Layout per PRD §10: mobile **dock** (Today · Learn · Practise centre button · Tuner · You) with safe-area padding; tablet 72px **rail**; desktop 248px **sidebar** (wordmark, destinations, modules with progress rings, ⌘K hint), content max-width 1280. Learn = segmented Course | Chords. You = Progress + Settings. Skip-to-content link. `<main>` landmark. Collapsing large serif page header component (`PageHeader`).
- **Wording in one place:** `src/content/copy.en-GB.ts` holds every user-facing string (nested by screen), with a typed `t('lesson.keepFingers', {fingers})` helper and simple `{name}` interpolation. Tone of voice per PRD §10 (calm, short, second person, British English). Adding another language later means adding one file.
- `src/app/settingsStore.ts` (zustand + `persist` to localStorage key `a6.settings`): `mode` (dark/light/system), `finish`, `motion` (on/off/system), `sound`, `leftHanded`, `tuning` (standard/halfDown/dropD), `capo` (0–7). A `useApplySettings` hook writes `data-mode`, `data-finish`, `data-motion`, `data-hand` on `<html>`.
- Settings page wired to the store with real controls.
Verify: `npm run verify 2>&1 | tail -n 15`; add `tests/e2e/shell.spec.ts` (navigate every route on 3 viewports via the dock/rail/sidebar; the dock is visible only < 640px, the sidebar only ≥ 1200px; the active item has `aria-current="page"`; toggling Motion off sets `data-motion="off"`) and run `npx playwright test shell 2>&1 | tail -n 15`.
Done when: both pass.

### 1.4 Logo + icons
Do:
- The logo is the **VI Monogram**; the finished master SVGs are in `docs/design/logo/` (read its README; don't redraw the letters). 
- `src/ui/Logo.tsx`: inline the paths from `vi-mark-dark.svg`, with colours from tokens (`--bone` for the letters, `--brass` for the line and dot, hairline `--bone` at 35 % opacity), so light mode swaps automatically. Props: `variant="mark"|"lockup"|"small"` — `lockup` adds the wordmark "ATELIER SIX" (Geist 500, uppercase, letter-spacing 0.34em) to the right; `small` uses the favicon drawing (no hairline or dot, thicker brass line) and is used automatically below 32 px. `title` for a11y.
- `public/logo.svg` (copy of `vi-mark-dark.svg`), `public/favicon.svg` (copy of `vi-favicon.svg`).
- `scripts/icons.ts`: with `sharp`, render `docs/design/logo/vi-app-icon-1024.svg` to `public/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180) and `assets/icon.png` (1024, reused by Capacitor in Phase 24); render `vi-maskable-1024.svg` to `maskable-512.png`. `npm run icons`.
- Put `<Logo variant="lockup"/>` at the top of the desktop sidebar, `<Logo variant="mark"/>` at the top of the tablet rail, and use the mark on the onboarding welcome screen. Add a unit test that the component renders exactly two letter paths plus the brass line, and switches to the small drawing below 32 px.
Verify: `npm run icons 2>&1 | tail -n 5 && ls public/icons && npx vitest run src/ui/Logo 2>&1 | tail -n 5`
Done when: 4 PNGs exist; Logo test passes.

### 1.5 /design gallery + screenshots (USER ACTION)
Do:
- `/design` page: sections for colour swatches (with token names and contrast ratios), type scale, spacing, every component in every variant/state, logo variants, finish switcher (live), mode switcher, motion toggle.
- `tests/e2e/design.spec.ts`: screenshot `/design` on the 3 viewports to `docs/screenshots/design-{mobile,tablet,desktop}.png` (not a visual regression test yet — just saved images) and run axe (`@axe-core/playwright`) with zero serious/critical violations.
- Push, wait for deploy.
- STOP and ask the user: "Open <LIVE_URL>/design. Is the look right? Tell me anything to change." Apply requested changes as tokens edits only, then continue.
Verify: `npx playwright test design 2>&1 | tail -n 15`
Done when: axe clean, screenshots saved, user approved.

### 1.6 Premium navigation layer
Do:
- **Command palette** (`src/ui/CommandPalette/`): ⌘K / Ctrl+K and a search icon on mobile; dialog with fuzzy search (small pure scorer in `src/core/search/fuzzy.ts`, tested), grouped results (Lessons, Chords, Drills, Settings, Actions), ↑/↓/Return/Esc, recent items. For now it indexes routes and settings; later phases register lessons, chords and actions through a `registerCommands()` API.
- **Page transitions:** View Transitions API for route changes (`document.startViewTransition` wrapper with feature detection); shared `view-transition-name` on page titles; no-op when motion is off.
- **Skeleton** component with a slow brass shimmer (motion off: static), used for every lazy route instead of spinners.
- **Onboarding** (`src/features/onboarding/`): 4 screens per PRD §10 on first launch (flag in settings), writes hand, level, tuning and capo to the settings store, skippable, re-runnable from Settings. Until lessons exist (Phase 6) it ends on Today.
- **Press/hover states** and tabular numerals applied in the base components per the interface quality rules.
- `tests/e2e/nav.spec.ts`: ⌘K opens the palette, typing "tun" + Return goes to /tuner; onboarding appears once on a fresh profile and not after reload; no layout shift on route change (`PerformanceObserver` for `layout-shift` reports 0 in Chromium).
Verify: `npx vitest run src/core/search 2>&1 | tail -n 10 && npx playwright test nav 2>&1 | tail -n 15`
Done when: passing on all 3 viewports; compare screenshots with `docs/screenshots/reference/` and fix obvious differences in spacing, type and colour.

### Gate 1
Run: `npm run verify`, `npm run check:contrast`, `npm run e2e`, `npm run build` (trimmed). Initial JS gzip size noted in `PROGRESS.md` header as `JS_KB=<n>` (from build output).
CHANGELOG line: `- Design system: tokens, finishes, components, logo, app shell.`
