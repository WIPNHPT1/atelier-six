# Contributing

## Setup

1. Install Node.js 24 (see `.nvmrc`).
2. `npm install`.
3. `npm run dev` to start the app locally.

## Scripts

- `npm run dev` — start the dev server.
- `npm run build` — production build.
- `npm run preview` — preview the production build.
- `npm run lint` — ESLint, zero warnings.
- `npm run format` — Prettier, write mode.
- `npm run typecheck` — TypeScript, no emit.
- `npm run test` — unit tests (Vitest).
- `npm run verify` — lint + typecheck + test.
- `npm run e2e` — Playwright end-to-end tests.

## Commits

This repo uses [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint on every commit. Example: `feat(audio): add strum humanisation`.

## Branch naming

`feat/<short-description>`, `fix/<short-description>`, `chore/<short-description>`.

## Pull request checklist

- [ ] `npm run verify` passes
- [ ] `npm run e2e` passes (if the change touches UI, audio, or routing)
- [ ] `PROGRESS.md` updated if a build step was completed
- [ ] No raw hex colours, no raw JSX text, no song tabs or lyrics
