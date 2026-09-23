# Phase 18 — v2.0: Accounts and sync (Supabase free tier)
Aim: optional sign-in that syncs progress across devices, while staying offline-first and private. PRD refs: §18.1, §12 (network rules).
Rules: all network code lives in `src/net/`; the app must work exactly as before when signed out or offline. Never commit keys: only the public anon key goes to the client, via env vars; the service-role key is never used by the app.

### 18.1 Supabase project + schema (USER ACTION)
Do:
- STOP and tell the user: "Create a free project at supabase.com (region nearest you). In Project Settings → API, copy the Project URL and the anon public key and paste them here. Don't paste the service_role key." Then: "In Netlify → Site configuration → Environment variables, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with those values." Also add them to a local `.env.local` (git-ignored; add `.env*` to `.gitignore` if missing) and create `.env.example` with empty values.
- Install `@supabase/supabase-js` and the Supabase CLI as a dev dependency (`supabase`). `npx supabase init`.
- `supabase/migrations/0001_init.sql`: tables per PRD §18.1 (`profiles`, `settings`, `lesson_progress`, `transition_stats`, `sessions`, `takes`, `arrangements`), each with `user_id uuid references auth.users on delete cascade`, `device_id text`, `updated_at timestamptz`, and (for counters) per-device rows. Enable RLS on every table; policies: select/insert/update/delete only where `user_id = auth.uid()`. Storage bucket `takes` (private) with the same owner policy on `(storage.foldername(name))[1] = auth.uid()::text`.
- `delete_my_account()` SQL function (`security definer`, `set search_path = ''`) that deletes the caller's rows and their `auth.users` entry.
- `supabase/tests/rls.test.sql` (pgTAP): user A cannot read, update or delete user B's rows in every table; anon role sees nothing.
- STOP and tell the user: "In Supabase → Authentication → URL configuration, set Site URL to <LIVE_URL> and add redirect URLs `<LIVE_URL>/**` and `https://deploy-preview-*--<site-name>.netlify.app/**`. Then run `npx supabase link` and `npx supabase db push` (or paste the migration into the SQL editor) and say done."
Verify: CI job `db` (ubuntu, Docker available): `supabase/setup-cli` action → `npx supabase start` → `npx supabase test db`. Locally run it only if Docker is present; otherwise rely on CI: `gh run watch --exit-status 2>&1 | tail -n 15`.
Done when: RLS tests pass in CI; migration applied to the project.

### 18.2 Auth UI
Do (`src/net/supabase.ts`, `src/features/account/`):
- Client created lazily only when the user opens Account (keeps it out of the entry chunk). If env vars are missing, the Account page explains sync is not configured and the rest of the app is unaffected.
- Sign in with email magic link; optional "Continue with GitHub" (only if the user enables the GitHub provider in Supabase — ask once, default off). Signed-in header shows a small brass dot + initial; sign out.
- CSP: add `https://<project-ref>.supabase.co` to `connect-src` in `netlify.toml` (exact host, no wildcards).
- `docs/privacy.md` (plain English): what's stored, where, how to export and delete, that audio and camera never leave the device unless "Back up my takes" is on. Link from Settings and README.
- `tests/e2e/account.spec.ts`: with network requests to Supabase intercepted by Playwright route mocks, the magic-link form validates the email, shows "Check your inbox", and a mocked session renders the signed-in header.
Verify: `npx playwright test account 2>&1 | tail -n 15 && npm run size 2>&1 | tail -n 5`
Done when: passing; entry budget still met.

### 18.3 Offline-first sync engine
Do:
- Pure `src/core/sync/`: `Outbox` (append, coalesce by record key, ack), `mergeRecord(local, remote)` (last-write-wins by `updated_at`, tie-break by `device_id`), `mergeCounters(perDeviceRows) → totals` (grow-only counters summed across devices), `diffSince(lastSyncAt)`.
- `src/net/sync.ts`: on sign-in, first sync uploads local data (asks "Merge this device's progress into your account?" if the account already has data); then syncs on app start, every 5 min while open, on `online`, and after each session. Exponential backoff; never blocks the UI. Device id generated once and stored locally.
- Sync status in Settings: last synced time, pending changes, "Sync now".
- Tests: merge tables (both sides changed, clock skew, deletions as tombstones), counters from two devices never lose increments, outbox coalescing, backoff schedule.
- `tests/e2e/sync.spec.ts` with mocked Supabase routes: practise offline → go online → outbox empties → pending count 0.
Verify: `npx vitest run src/core/sync 2>&1 | tail -n 15 && npx playwright test sync 2>&1 | tail -n 15`
Done when: passing, 100% core coverage.

### 18.4 Data export, deletion, takes backup switch
Do:
- Settings → Account: "Download my data" (JSON of every synced table + local-only data), "Delete my account" (type DELETE to confirm → deletes storage files → calls `delete_my_account()` → signs out → local data kept unless "Also clear this device" is ticked).
- "Back up my takes" toggle (off by default); used by Phase 19.
- Tests: export shape snapshot; deletion flow calls in the right order (mocked).
- STOP and ask the user to try sign-in on two devices (e.g. phone and laptop), practise on one and confirm the other updates.
Verify: `npx vitest run src/features/account 2>&1 | tail -n 10`
Done when: passing and the user confirms two-device sync.

### Gate 18
Run: `npm run verify`, `npm run e2e`, `npm run build`, `npm run size`; CI `db` job green. Confirm the app still works fully signed-out and offline (`npx playwright test offline`).
CHANGELOG line: `- Optional accounts with offline-first sync (Supabase, row-level security, per-device counters), data export and account deletion.`
