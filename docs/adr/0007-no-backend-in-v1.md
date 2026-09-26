# 7. No backend in v1

Date: 2026-09-26

## Status

Accepted

## Context

v1 needs to store settings and practice progress. A backend (accounts, database, API) would
add hosting cost, a privacy policy for personal data, sign-in friction and a service that must
stay up.

## Decision

v1 has no backend. Settings live in localStorage and progress in IndexedDB, on the device only.
Progress moves between devices by exporting and importing a file. The microphone is analysed in
the browser and never recorded or sent anywhere. The only network requests are for the app's
own files and samples.

## Consequences

- Zero running cost beyond static hosting; nothing personal ever leaves the device.
- Clearing browser data clears progress, so export is offered in Settings.
- Optional sync (Supabase, opt-in) is planned for v2.0 without changing this default.
