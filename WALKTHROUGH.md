# The whole build, start to finish

This is the **one page to follow**. It takes you from the zip file to the finished app in the right order, and tells you which other file to open at each moment. Tick each box as you go. Ticks are saved in this browser, so you can close the page and come back.

You never need Terminal. You'll use four places:

| Label | What it is |
|---|---|
| **🤖 Claude Code** | The **Code** tab of the Claude desktop app, with your project open. You type `/next` and plain English here. |
| **🌐 Browser** | Safari or Chrome, for websites like GitHub and Netlify. |
| **💬 Claude chat** | The normal Chat tab of the Claude app, for questions about the process. |
| **🎸 Guitar** | You, your guitar and headphones: listening and playing checks. |

> **How it fits together:** this page is the order of things. When a step says "see MAC-GUIDE Part 5" or "DRIVE-AND-AUTOPILOT B5", open that file for the click-by-click detail, then come back here and tick the box.

---

## Stage 1 — Get ready (one time, about an hour)

### 1.1 Check you have what you need
- [ ] A Mac on **macOS 13 (Ventura) or newer** (Apple menu  → About This Mac).
- [ ] A **Claude Pro or Max** plan (claude.ai → Settings → Billing). The free plan doesn't include Claude Code.
- [ ] About **10 GB** free on the Mac, or an **external SSD** if you want the project on a drive.
- [ ] Your guitar, a cable or microphone, and **wired headphones** for the listening checks later.

### 1.2 Unzip the kit
- [ ] 💬 Download **atelier-six-kit.zip** from the Claude chat. It goes to **Downloads**.
- [ ] In Finder → **Downloads**, double-click the zip. A folder called **atelier-six-kit** appears.
- [ ] Open the folder and double-click **WALKTHROUGH.html** (this page) so you're reading it from the kit from now on.

### 1.3 Decide where the project lives
Pick **one** of these and do only that one:
- [ ] **On your Mac (simplest):** follow **MAC-GUIDE Part 4.2–4.3**. You'll end up with **Projects → atelier-six** in your home folder.
- [ ] **On an external drive that stays plugged in:** follow **DRIVE-AND-AUTOPILOT Part A, A1 to A7** (format it as `Studio`, untick "Ignore ownership", copy the kit to **Studio → Projects → atelier-six**, allow the Claude app to use removable drives, stop it sleeping).

> From now on, "the project folder" means **atelier-six**, wherever you put it. Don't rename or move it once the build starts.

### 1.4 Get the Claude app ready (MAC-GUIDE Part 1)
- [ ] Install the Claude desktop app from **claude.com/download**, or update it (menu **Claude → Check for Updates…**).
- [ ] Sign in, then click **Code** at the top of the window.
- [ ] Claude app → **Settings → Desktop app → General** → turn on **Keep computer awake**.
- [ ] Allow notifications from Claude when asked. (If you missed it: System Settings → Notifications → Claude → on.)

### 1.5 Make your GitHub account (MAC-GUIDE Part 2)
- [ ] 🌐 **github.com → Sign up.** Choose a username you're happy to show people, and verify your email. You don't need to create a project: Claude does that.

### 1.6 Install two tools by clicking (MAC-GUIDE Part 3)
- [ ] 🌐 **nodejs.org → Download → LTS (24.x) → macOS Installer (.pkg)**, then open it and click through.
- [ ] 🌐 **github.com/cli/cli/releases/latest → Assets →** the file ending **macOS_universal.pkg**, then open it and click through.

### 1.7 Look at what you're building (optional, 10 minutes)
Double-click these in **atelier-six → docs → design** (they open in your browser):
- [ ] **mockup.html:** the five key screens.
- [ ] **screens.html:** every screen on desktop, tablet and mobile. Use the buttons at the top to filter.
- [ ] **logos.html:** the logo options, with the VI Monogram marked as chosen.

You don't need to do anything with these. Claude builds the app to match them.

---

## Stage 2 — Your first session (about 30 minutes)

### 2.1 Open the project in Claude Code (MAC-GUIDE Part 5.1)
- [ ] Claude app → **Code** → **+ New session** (⌘N).
- [ ] In the prompt box, set **Environment: Local**.
- [ ] **Project folder → Choose folder…** → **atelier-six** → **Open**.
- [ ] **Model: Sonnet** and **Mode: Auto**. (If Auto isn't offered, choose **Accept edits**.)
- [ ] If it asks whether to **trust** the folder, choose **Trust**.

### 2.2 Let Claude set up your Mac (MAC-GUIDE Part 5.2)
- [ ] 🤖 Type `/setup` and press Return.
- [ ] If a Mac window asks to install **command line developer tools**, click **Install → Agree**, wait 5–15 minutes, then type *done*.
- [ ] When Claude shows an 8-character code: your browser opens GitHub (or go to **github.com/login/device**). Enter the code → **Continue** → **Authorize GitHub CLI**. Type *done*.
- [ ] Claude says **"Setup done"** and gives you your GitHub repository address. Bookmark it.

### 2.3 Start building
- [ ] 🤖 Type `/next`. Claude starts Phase 0 and works on its own. You'll get a notification when it needs you or finishes.

---

## Stage 3 — How every session works (read once)

This loop repeats for the whole build. The Cheat sheet at the end of MAC-GUIDE has it on one card.

1. **Start:** Claude app → Code → **+ New session** (⌘N). Check it says **Local · atelier-six · Sonnet · Auto**.
2. 🤖 `/progress` shows where you are, cheaply.
3. 🤖 `/next` builds the next steps and stops at the end of the phase.
4. When Claude needs you, it stops and says **USER ACTION** or asks a question. Do what it says (Stage 5 lists every one in order), then reply, e.g. *done*.
5. When it says **"Phase steps done. Run /gate."** → 🤖 `/gate`. This tests everything and releases the phase.
6. Claude asks **how many usage windows** the phase took. Count the times you hit your limit during the phase, add one, and type the number. It uses this to predict your finish date.
7. **Start a new session (⌘N)** after every gate, then `/next` again. A fresh session uses far less of your allowance.

**When you hit your usage limit (you will, often):**
- Near the limit: 🤖 `/checkpoint` saves everything in seconds.
- After the reset time Claude shows you: **new session (⌘N)** → 🤖 `/pickup`. It carries on exactly where it stopped.

**Using the stronger model for the hard steps.** Stay on **Sonnet**, but switch the model menu to **Opus** for these steps, then back to Sonnet: **3.4, 5.4, 6.0, 11.2, 12.3, 16.2–16.4, 18.3, 21.3, 23.1, 24.2**, and any step marked **BLOCKED**. `/progress` tells you which step you're on.

**If something looks wrong:** 🤖 plain English always works, e.g. *"Explain the problem in plain English and give me my options."* For bugs you notice in the app: 🤖 `/fix the tuner needle jumps on my phone`.

---

## Stage 4 — Turn on autopilot (optional, after Phase 1)

Autopilot is a scheduled task in the Claude app that keeps building every hour, pauses itself when it needs you, and carries on after usage limits reset. Set it up **after Gate 1**, once you've approved the look, because Phases 0 and 1 need you a lot.

- [ ] Read **DRIVE-AND-AUTOPILOT Part B, B1 to B4** (what keeps you safe).
- [ ] Set up the routine: **DRIVE-AND-AUTOPILOT B5 → "Set it up once"** (Code tab → Routines → New routine → Local, paste the one line, choose Auto, Sonnet, the atelier-six folder, worktree off, Hourly).
- [ ] Click **Run now** once and allow any normal project permission with **always allow**.

**Rules while autopilot is on:**
- When a notification says **"Needs you"**: new session (⌘N) → 🤖 `/pickup` → do what it asks → set the routine back to **Active**.
- **Before you work with Claude yourself, pause the routine** (Routines → the routine → Status → Paused). Never run both at once.
- It's best for the coding-heavy phases (2–5, 8, 11, 16, 19–21). Pause it and sit with Claude for the phases with lots of 🎸 checks.

---

## Stage 5 — The build, phase by phase

Each phase lists what Claude builds, then the boxes for **your** part, in the order they come up. Phases with no boxes need nothing from you except `/gate` and a new session. Full click-by-click detail for each action is in **MAC-GUIDE Part 7**.

### Milestone v1.0 — the core app (about 3–6 weeks)

**Phase 0 — Project foundation.** Claude sets up the code project, tests and automatic checks.
- [ ] **Step 0.7:** after Claude's first push, 🌐 GitHub → your **atelier-six** repo → **Settings → Code security** → make sure **Secret scanning** and **Push protection** are on → 🤖 *done*.
- [ ] **Step 0.8 — put it online:** 🌐 **netlify.com → Sign up with GitHub → Add new project → Import an existing project → GitHub → atelier-six → Deploy**. When it says Published, copy the address (ends `.netlify.app`) → 🤖 paste it. Bookmark it: this is your live app.
- [ ] **Step 0.9 — name check:** open the links Claude gives you, search each for "Atelier Six", and 🤖 tell Claude what you found.
- [ ] **Gate 0:** 🤖 `/gate` → answer the usage-windows question → new session (⌘N) → `/next`.

**Phase 1 — Design system.** Colours, fonts, buttons, the VI logo and the navigation.
- [ ] **Step 1.5 — approve the look:** open your live address with **/design** on the end → 🤖 *"Looks great"* or what to change.
- [ ] **Gate 1** → new session → `/next`. *(Good moment to set up autopilot: Stage 4.)*

**Phase 2 — Music core** (notes, keys, chord shapes). Nothing needed from you.
- [ ] **Gate 2** → new session → `/next`.

**Phase 3 — Transition engine** (the brain that finds the easiest fingering between chords). Use **Opus** for step 3.4.
- [ ] **Gate 3** → new session → `/next`. After this gate Claude gives you an updated **finish date** based on your real pace.

**Phase 4 — Tab and fretboard drawing.** Nothing needed from you.
- [ ] **Gate 4** → new session → `/next`.

**Phase 5 — Sound.** Use **Opus** for step 5.4.
- [ ] **Step 5.2** 🎸 with headphones, listen to a few chords on your device and say if the tone needs changing.
- [ ] **Step 5.5** 🎸 open **/design**, play the strummed chord, palm-muted riff and drum groove, and say whether they sound like a real guitar and band.
- [ ] **Gate 5 — device checks:** Claude gives you a few rows from **docs/device-checklist.md** (e.g. "does sound play on iPhone with the silent switch on?"). Try each on your phone, tablet or Mac and 🤖 report back.
- [ ] Gate 5 → new session → `/next`.

**Phase 6 — Lessons, drills and the first modules.** Use **Opus** for step 6.0.
- [ ] **Gate 6 — your first review** 🎸: on your live site, play each module's **tune** and the two lessons Claude names, then 🤖 score each **playable / sounds like the style / fun** from 1 to 5 (MAC-GUIDE Part 7, "End of each module"). Anything under 4 gets reworked and you try again.
- [ ] Gate 6 → new session → `/next`.

**Phase 7 — Tuner and listening.**
- [ ] **Step 7.2** 🎸 test the tuner with your guitar (allow the microphone) and say if readings look off.
- [ ] **Gate 7 — device checks** (as Gate 5) → new session → `/next`.

**Phase 8 — Hands-free and settings.** Nothing needed from you.
- [ ] **Gate 8** → new session → `/next`.

**Phase 9 — Installable app, UI candy and speed.**
- [ ] **Gate 9 — device checks:** install the app on your phone from the live site (iPhone: Safari → Share → **Add to Home Screen**), turn on flight mode, and check it still opens. 🤖 Report back.
- [ ] Gate 9 → new session → `/next`.

**Phase 10 — Showcase and v1.0 release.**
- [ ] **Step 10.2 — demo GIF:** open your live address with **?demo=1** on the end, record it with **⌘ Shift 5**, turn it into a GIF at **ezgif.com**, and save it as **atelier-six → docs → demo.gif** (MAC-GUIDE Part 7 has every click). Or 🤖 *"the video is on my Desktop, please convert it to docs/demo.gif"*.
- [ ] **Step 10.3 — beta:** send Claude's ready-made message to 3–5 guitarist friends. Wait about **a week**, then 🤖 *"feedback is in"*. (Pause autopilot during the beta week.)
- [ ] **Gate 10:** **v1.0 is live.** 🎉 New session → `/next`.

### Milestone v1.1 — three more styles (Lead, Thumb-over, Whammy)

**Phase 11 — v1.1 foundation.** Use **Opus** for step 11.2.
- [ ] **Step 11.3** 🎸 listen to the six lead tones and say if any need changing.
- [ ] **Gate 11** → new session → `/next`.

**Phase 12 — Module 3: Lead (Nirvana style).** Use **Opus** for step 12.3.
- [ ] **Step 12.2** 🎸 try three bends on your guitar and say whether the bend trainer's verdicts feel right.
- [ ] **Gate 12 — module review** 🎸: play the tune and two lessons, score playable / style / fun.
- [ ] Gate 12 → new session → `/next`.

**Phase 13 — Module 4: Thumb-over (Frusciante style).**
- [ ] **Gate 13 — module review** 🎸 → new session → `/next`.

**Phase 14 — Module 5: Whammy (Morello style).**
- [ ] **Step 14.4 (optional)** 🎸 if you have an audio interface, try **Play through** with headphones and report the latency shown. Otherwise type *skip*.
- [ ] **Gate 14 — module review** 🎸 → new session → `/next`.

**Phase 15 — Cross-style lesson, tone recipes, v1.1 release.**
- [ ] **Step 15.4 — new demo GIF** (same as 10.2).
- [ ] **Gate 15:** **v1.1 is live.** New session → `/next`.

### Milestone v1.2 — the app hears your chords

**Phase 16 — Chord detection.** Use **Opus** for steps 16.2–16.4.
- [ ] **Step 16.4 (optional, recommended)** 🎸 record the 10 chords Claude lists in Voice Memos (about 2 seconds each), name each memo as Claude says, drag them into **atelier-six → eval → user**, and 🤖 *"done, they're m4a files"*.
- [ ] **Gate 16** → new session → `/next`.

**Phase 17 — Auto-advance, adaptive tempo, v1.2 release.**
- [ ] **Step 17.3** 🎸 try a lesson with **Listen** on and say whether the Clean/Missed calls feel fair.
- [ ] **Gate 17 — device checks** → **v1.2 is live.** New session → `/next`.

### Milestone v2.0 — sync, studio, style morph and jam mode

**Phase 18 — Accounts and sync.** Use **Opus** for step 18.3. Pause autopilot: this phase needs you.
- [ ] **Step 18.1 — Supabase:** 🌐 **supabase.com → Continue with GitHub → New project**, name it **atelier-six**, generate a database password (save it in Passwords), region **West EU (London)**. Wait a minute.
- [ ] Copy the **Project URL** and the **anon / public** key from Project Settings → API → 🤖 paste both. **Never** copy the service_role / secret key.
- [ ] 🌐 Netlify → your site → **Site configuration → Environment variables**: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` → **Deploys → Trigger deploy**.
- [ ] 🌐 Supabase → **Authentication → URL Configuration**: paste the Site URL and Redirect URLs Claude gives you → **Save**.
- [ ] If Claude runs a Supabase sign-in, click **Authorize** in the browser → 🤖 *done*.
- [ ] **Step 18.4** sign in on your phone and laptop with the same email, practise on one and check it appears on the other.
- [ ] **Gate 18** → new session → `/next`.

**Phase 19 — Desktop studio and exports.**
- [ ] **Step 19.5** install **MuseScore** (free, musescore.org), open the exported file Claude names, and say whether it looks right.
- [ ] **Gate 19** → new session → `/next`.

**Phase 20 — Live style morph.**
- [ ] **Step 20.2** 🎸 switch styles while playing and say whether the changes sound smooth.
- [ ] **Gate 20** → new session → `/next`.

**Phase 21 — Jam mode (a band that follows you).** Use **Opus** for step 21.3.
- [ ] **Step 21.2** 🎸 listen to the five band styles and say if any sound wrong.
- [ ] **Step 21.4** 🎸 jam for a few minutes and say whether the band follows you naturally.
- [ ] **Gate 21** → new session → `/next`.

**Phase 22 — v2.0 polish and release.**
- [ ] **Step 22.2 — new demo GIF** (same as 10.2).
- [ ] **Gate 22:** **v2.0 is live.** New session → `/next`.

### Milestone v2.x — camera and phone apps (the final release)

**Phase 23 — Camera finger check.** Use **Opus** for step 23.1.
- [ ] **Step 23.3** 🎸 with your phone or laptop camera: calibrate, play C, G and Am, and tell Claude how often it was right.
- [ ] **Gate 23 — device checks** → **v2.1 is live.** New session → `/next`.

**Phase 24 — iPhone and Android apps.** Use **Opus** for step 24.2.
- [ ] **Step 24.1** choose the app ID Claude suggests (like `com.yourname.ateliersix`). It can never change later, so pick carefully.
- [ ] **Step 24.4 — Android:** 🌐 GitHub → your repo → **Actions** → the latest **native** run → **Artifacts** → download the APK, send it to your phone, open it and allow "Install unknown apps".
- [ ] **Step 24.4 — iPhone (optional, needs Xcode, about 15 GB):** install Xcode from the App Store, add your Apple ID in Xcode → Settings → Accounts, turn on Developer Mode on the iPhone, plug it in, and 🤖 *"ready to install on my iPhone"*.
- [ ] **Step 24.5 (optional, costs money):** app-store accounts (Google Play $25 once, Apple $99 a year), or 🤖 *skip*.
- [ ] **Step 24.6 — final demo GIF** (same as 10.2).
- [ ] **Gate 24 — device checks:** **v2.2 is live. The build is complete.** 🎉

---

## Stage 6 — After it's finished

- [ ] If autopilot is on, it pauses itself with "Build complete". You can delete the routine (Routines → the routine → **Delete**).
- [ ] Share your live link, the GitHub repo (README with demo GIF) and the **/about** page, which tells the story of how it was built.
- [ ] **Keep it running for free:**
  - Netlify's free allowance resets monthly. If the site shows "Site not available", it comes back next month.
  - If you use sync, Supabase pauses a free project after a week without use: 🌐 supabase.com → your project → **Restore project**.
- [ ] Anything you want changed later: open a new session and describe it, or 🤖 `/fix <what's wrong>`.

---

## When something goes wrong

| What's happening | Where to look |
|---|---|
| Claude says BLOCKED, or you don't understand a message | 🤖 *"Explain the problem in plain English and give me my options."* |
| You hit your usage limit | Stage 3 above, or MAC-GUIDE Part 8. |
| A tool, GitHub sign-in or permission problem | 🤖 `/setup`, then MAC-GUIDE Part 9. |
| External drive problems (unplugged, slow, "dubious ownership") | DRIVE-AND-AUTOPILOT A8 and B9. |
| Autopilot skipping runs or stuck | DRIVE-AND-AUTOPILOT B9. |
| The live site looks broken | 🤖 `/fix` plus what you see. |
| You want to undo Claude's last step | 🤖 *"Undo your last step and explain what you undid."* |

## Which file is for what

| File | When you open it |
|---|---|
| **WALKTHROUGH.html** (this page) | Always: it's the order of everything. |
| **MAC-GUIDE.html** | For click-by-click detail on setup (Parts 1–5), the daily routine (Part 6), every action Claude asks of you (Part 7), usage limits (Part 8) and problems (Part 9). |
| **DRIVE-AND-AUTOPILOT.html** | Only if you use an external drive (Part A) or want autopilot (Part B). |
| **START-HERE.md** | A short overview: costs, how long the build takes, and which model to use when. |
| **docs/design/** (screens, mockup, logos) | To see what the finished app will look like. |
| **PROGRESS.md** | To see the checklist of every step with ticks: select it in Finder and press **Space**. |
| Everything else (**CLAUDE.md, PRD.md, LESSONS.md, RESUME.md, docs/build, .claude**) | For Claude. Leave them alone. |
