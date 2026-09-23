# Start here (for you, not Claude Code)

> **New to coding? Open `WALKTHROUGH.html` first** (double-click it). It's the whole build in order, with tick boxes, and tells you when to open each other file. `MAC-GUIDE.html` has the click-by-click detail.
>
> **Or open `MAC-GUIDE.html`** (double-click it; it opens in your browser). It walks through everything on a Mac click by click. This page is the short overview.

**You won't need Terminal.** You run the whole build from the **Code** tab of the Claude desktop app, and Claude runs every command itself.

This kit makes Claude Code build Atelier Six one tested step at a time, remember what it fixed, and use as few tokens as possible.

## What's in the kit
| File | Who reads it | Purpose |
|---|---|---|
| `WALKTHROUGH.html` / `.md` | You | **Start here.** The whole build from unzipping to the final release, in order, with tick boxes that remember your progress. |
| `DRIVE-AND-AUTOPILOT.html` / `.md` | You | Keeping the project on an external drive, and running the build with less supervision (Auto mode, sandbox, notifications, and an autopilot scheduled task in the Claude app) while staying safe. |
| `MAC-GUIDE.html` / `.md` | You | Baby-steps guide for doing all of this on a Mac, with copy buttons for every command. |
| `docs/design/logo/` | Claude Code | The chosen VI Monogram logo as ready-made files (mark, favicon, app icon), with usage rules. |
| `docs/device-checklist.md`, `docs/legal-check.md`, `docs/beta.md` | You | Created during the build: real-device tests, the name check, and beta feedback. |
| `docs/design/screens.html` | You and Claude Code | Every screen on desktop, tablet and mobile (21 screens, 63 mockups), with a device filter. The full visual reference. |
| `docs/design/mockup.html` | You and Claude Code | What the app should look like: five key screens. Double-click to open. Claude Code builds the navigation and screens to match it. |
| `CLAUDE.md` | Claude Code, automatically, every session | The rules and the build loop. Kept short on purpose. |
| `PRD.md` | Claude Code, one section at a time | The full product spec. |
| `PROGRESS.md` | Claude Code, every step | Checklist and "Current:" pointer. This is its memory between sessions. |
| `LESSONS.md` | Claude Code, every step | One-line record of every error it fixed, so it never repeats one. |
| `RESUME.md` | Claude Code, every step | Save point for the step in progress, so the build can pick up after you run out of usage. |
| `docs/build/phase-00…24.md` | Claude Code, one step at a time | Exact instructions, verify commands and "done when" for each step. See the milestone table below. |
| `.claude/commands/` | You, as slash commands | `/setup`, `/next`, `/gate`, `/pickup`, `/checkpoint`, `/fix`, `/progress`, and `/autopilot` (used by the scheduled task). |
| `.claude/hooks/` | Claude Code, automatically | Shows the build status at the start of every session, and tracks which files a step changed. |
| `.claude/settings.json` | Claude Code | Auto mode, the sandbox (commands stay in the project and on approved sites), pre-approved npm/git commands, and blocked risky ones. |
| `.claude/launch.json` | The Claude app | Lets you preview the app in the Code tab's Browser pane (⌘ Shift B). |

## The full build
| Milestone | Phases | What you get |
|---|---|---|
| v1.0 | 0–10 | Power and open chord modules, transition engine, tuner, drills, installable offline app |
| v1.1 | 11–15 | Lead (Nirvana style), thumb-over (Frusciante style), Whammy (Morello style), hum-to-tab, tone recipes |
| v1.2 | 16–17 | The app hears whole chords, moves on when you play them, and sets tempo from how you played |
| v2.0 | 18–22 | Optional sync across devices, desktop studio with exports, live style switching, a backing band that follows you |
| v2.x | 23–24 | Camera finger check, iPhone and Android apps (final release) |

Each milestone ends with a tagged release, and each gate reruns every earlier test, so the live app keeps working the whole way through. You can stop after any milestone and still have a finished product.

## How long will this take? (Claude Pro plan)
**The short answer:** with **Sonnet at medium effort** (switching to Opus 5.5 only for the dozen hardest steps), expect **v1.0 in about 1–1½ months** and **the whole plan (v2.2) in about 3–4 months**, working most days. Using **Opus 5.5 at medium for everything** on Pro would take roughly **3–5 times longer**, so it isn't recommended as the default.

**How that's worked out.** Anthropic doesn't publish exact Pro numbers, only that usage resets on a rolling 5-hour window, there's also a weekly cap, and Opus uses several times more per turn than Sonnet ([Claude pricing](https://claude.com/pricing), [Claude Code usage](https://support.claude.com/en/articles/14552983-models-usage-and-limits-in-claude-code)). So these are estimates, based on the size of the build: 122 steps (38 of them heavy) and 25 phase checks.

| | Sonnet, medium | Sonnet + Opus for the hardest steps | Opus 5.5, medium, everything |
|---|---|---|---|
| 5-hour usage windows for v1.0 (Phases 0–10) | ≈ 25–45 | ≈ 30–55 | ≈ 75–225 |
| 5-hour usage windows for everything (to v2.2) | ≈ 50–100 | ≈ 60–120 | ≈ 150–375 |
| Calendar time to v1.0 * | ≈ 3–5 weeks | ≈ 3–6 weeks | ≈ 2–5 months |
| Calendar time to v2.2 * | ≈ 2½–3½ months | ≈ 3–4 months | ≈ 6–12 months |

\* Assumes about two usage windows a day on most days (for example one in the morning and one in the evening), and includes the week-long beta and your review sessions. If the weekly cap stops you before that pace, it will take longer; on the Max plan (5× or 20× Pro's usage) it would be several times faster.

**Your own time:** about 10–20 minutes per window to start it, answer questions and check results, plus roughly 10–15 hours in total for the things only you can do (accounts, reviews on your guitar, the beta, demo GIFs).

**Which model when.** Use the model menu next to the send button in the Code tab (choose medium effort if it asks).
- **Sonnet, medium (default):** almost everything.
- **Opus 5.5, medium:** only for these steps, or whenever a step is BLOCKED: 3.4 (fingering optimiser), 5.4 (playback timing), 6.0 (style sheets and riff builder), 11.2 (lead scheduling), 12.3 (hum-to-tab), 16.2–16.4 (chord detection), 18.3 (sync), 21.3 (band that follows you), 23.1 (camera geometry) and 24.2 (native audio). Switch back to Sonnet straight after.

**Checking the estimate as you go.** At the end of each phase Claude Code asks roughly how many usage windows it took and writes it in the pace log in `PROGRESS.md`. After Phase 3 it uses those numbers to give you an updated finish date. That will be much more accurate than this table.

## Costs
You need a paid Claude plan (Pro or Max) for Claude Code; the free Claude plan doesn't include it. Everything else is free (GitHub, Netlify, Supabase free tiers, open-source libraries, on-device ML) except publishing to the app stores in Phase 24: Google Play $25 one-off, Apple $99 per year. That step is optional, and the web app installs on phones for free.

## One-time setup (about 45 minutes; full detail in MAC-GUIDE.html, Parts 1–5)
1. Install or update the **Claude desktop app** and open its **Code** tab. Turn on **Settings → Desktop app → General → Keep computer awake**.
2. Install **Node.js 24 LTS** (nodejs.org, macOS installer) and the **GitHub CLI** (the `macOS_universal.pkg` from github.com/cli/cli/releases/latest). Both are click-through installers.
3. Unzip the kit, move the folder to **~/Projects** (your home folder, not the Desktop, which may be synced to iCloud) and rename it **atelier-six**. It must keep the hidden `.claude` folder. (External drive: see `DRIVE-AND-AUTOPILOT.html`, Part A.)
4. In the Code tab: **+ New session** → Environment **Local** → Project folder **atelier-six** → Model **Sonnet** → Mode **Auto**. Trust the folder when asked.
5. Type `/setup`. Claude installs Apple's developer tools (you click **Install**), signs in to GitHub (you enter a code in the browser), and creates your public `atelier-six` repository.

## Running the build
Type `/next`. Claude works through the current phase and stops at the end of it.
Then type `/gate` to test the whole phase, then **start a new session (⌘N)** so the next phase starts with a small context (the biggest usage saver), then `/next` again.

```
/next → /gate → ⌘N → /next → /gate → ⌘N …
```

- `/progress` shows where you are without spending much usage.
- `/pickup` continues after an interruption; `/checkpoint` saves immediately.
- `/fix the tuner needle jitters` fixes a bug you've found and records the lesson.
- If a step says **BLOCKED** in `PROGRESS.md`, Claude stopped after 3 failed attempts. Read the reason, answer its question, then `/next`.
- **Hands-off:** set up the autopilot routine (`DRIVE-AND-AUTOPILOT.html`, B5). It builds every hour, pauses itself when it needs you, and carries on after usage limits reset.

## When you run out of usage
You will hit your Claude usage limit several times during this build. Nothing is lost:

- **While it works**, Claude Code saves a checkpoint after every piece that runs: a local save-point commit plus a short note in `RESUME.md` saying exactly what's done and what's next.
- **If you see the usage warning**, type `/checkpoint` to save straight away (it costs almost nothing).
- **When your limit resets**, start a new session (⌘N) in the Code tab and type **`/pickup`**. The session starts by showing the build status automatically, then Claude re-runs the last test to see where things really stand and carries on from there. It keeps its count of attempts, so it won't loop on the same error.
- **Use a fresh session with `/pickup`** rather than carrying on in the old one. The old session carries its whole history, which costs far more usage. (With autopilot on, this happens by itself.)
- **Resume on the same computer.** Save points are only pushed to GitHub at the end of each phase.
- **If `/next` notices unfinished work**, it switches to `/pickup` by itself, so you can't accidentally skip half a step.

Other limits:
- **Netlify credits used up for the month:** the live site pauses until the next month. Building carries on; Claude Code checks the app locally and marks `DEPLOY_PENDING`, and the next push after the reset deploys everything. Docs-only changes don't use a deploy.
- **Supabase paused after a week without use:** open the Supabase dashboard and press Restore. The app keeps working offline meanwhile.

## When you're needed
### v1.0
0. **Steps 0.7 and 0.9:** turn on GitHub's secret protection (one setting), and search whether the name "Atelier Six" is taken (links provided).
1. **Step 0.8 — Netlify:** sign in to Netlify with GitHub → Add new site → Import from Git → pick `atelier-six`. Build settings come from `netlify.toml`, so just press Deploy. Paste the site URL back to Claude Code.
2. **Step 1.5 — design check:** open the `/design` page on your live link and say whether the look is right before any screens get built.
- **Real-device checks** at Gates 5, 7, 9, 17, 23 and 24: a few quick tries on your iPhone, iPad or Mac.
- **Step 10.3 — beta:** send the ready-made message to 3–5 guitarist friends and collect a week of feedback.
3. **Step 10.2 — demo GIF:** record a 20-second screen capture of demo mode (instructions are in the step).

**Listening reviews:** at the end of each course module (Gates 6, 12, 13 and 14) you play the module's tune and two lessons on your guitar and score them for *playable*, *sounds like the style* and *fun*. Anything under 4 out of 5 gets reworked. Step 5.5 also asks you to check the new guitar sound.

### v1.1
4. **Steps 11.3 and 12.2 — ears and hands:** listen to the six lead tones, and try three bends on your guitar to check the bend trainer's verdicts.
5. **Step 14.4 — optional:** if you have an audio interface, try "Play through" with headphones on and report the latency shown.
6. **Step 15.4 — new demo GIF**, same as before.

### v1.2
7. **Step 16.4 — optional:** record 10 chords on your phone (2 seconds each) so detection accuracy is measured on your real guitar.
8. **Step 17.3:** try a lesson with Listen on and say whether the Clean/Missed calls feel fair.

### v2.0
9. **Step 18.1 — Supabase:** create a free project, paste the URL and the public anon key, add them to Netlify, set the sign-in redirect URLs. Claude Code gives exact clicks.
10. **Step 18.4:** sign in on two devices and confirm progress syncs.
11. **Steps 19.5, 20.2, 21.2, 21.4:** open an export in MuseScore (free), and listen to the style switching and backing band.
12. **Step 22.2 — new demo GIF.**

### v2.x
13. **Step 23.3:** try the camera finger check with your guitar.
14. **Step 24.1:** confirm the app ID (e.g. `com.yourname.ateliersix`). It can't change after publishing.
15. **Step 24.4:** install the test app on your phone (Android is easiest; iPhone needs a Mac).
16. **Step 24.5 — optional, paid:** create store developer accounts, or say "skip".
17. **Step 24.6 — final demo GIF.**

Each milestone follows straight on from the last: after its final gate, a new session (⌘N) and `/next` starts the next phase.

## Saving tokens further
- Start a new session (⌘N) after every gate. Never let one session run across phases.
- Use `/next one` if you want to watch a single step.
- Use Sonnet at medium effort by default and Opus 5.5 only for the steps listed under "How long will this take?" (or when a step is BLOCKED).
- Don't paste big logs into chat; say "run the failing test" instead.

## Expected result
**v1.0:** a live, installable app on Netlify, a repo with green CI, a 100% tested transition engine, a README with a demo GIF, and a `v1.0.0` release.
**v1.1:** all five style modules, lead tab notation, a simulated Whammy with MIDI pedal support, hum-to-tab, a cross-style lesson and tone recipes, released as `v1.1.0`.
**v1.2:** on-device chord detection with a published accuracy report, chord auto-advance and mic-based adaptive tempo, released as `v1.2.0`.
**v2.0:** optional sync with row-level security, a desktop studio with MIDI / MusicXML / Guitar Pro export, live style morph and jam mode, released as `v2.0.0`.
**v2.x:** camera finger check (`v2.1.0`) and iOS and Android builds from CI (`v2.2.0`, the final release).
