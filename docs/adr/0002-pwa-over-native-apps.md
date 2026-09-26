# 2. PWA over native apps

Date: 2026-09-26

## Status

Accepted

## Context

The app has to run on a phone propped on a music stand, a tablet and a laptop. Building
separate iOS and Android apps means two codebases, store reviews and developer fees before a
single user has tried it.

## Decision

Ship v1 as an installable Progressive Web App: one React + TypeScript codebase, deployed to
Netlify, installable from the browser and fully usable offline through a service worker.

## Consequences

- One codebase and instant deploys; anyone can try it from a link.
- Some platform gaps must be handled in the browser: iOS needs a user gesture to start audio,
  Web MIDI is missing in Safari, and device-tilt needs permission (see `LESSONS.md`).
- App-store builds stay possible later by wrapping the same web app (Capacitor, planned for
  v2.2).
