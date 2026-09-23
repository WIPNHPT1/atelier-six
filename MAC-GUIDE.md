# Building Atelier Six on a Mac: the baby-steps guide

This guide assumes you've never written code. **You won't need Terminal.** Everything happens in the **Claude app** you already use: its **Code** tab is where Claude builds the app, and Claude runs every command itself. **`WALKTHROUGH.html` is the order of everything**, with tick boxes; this guide has the click-by-click detail it points to. Follow this guide top to bottom the first time, then use the **Cheat sheet** at the end for every session after that.

You don't need to understand the code. Your job is to be the **project owner**: you start each session, answer Claude's questions, click through a few websites, and check the app looks and sounds right. Claude writes, tests and fixes the code.

---

## Part 0 — Before you start

### What you'll need
- A Mac running **macOS 13 (Ventura) or newer** (Apple menu  → About This Mac).
- **About 10 GB of free space** (40 GB if you later want to test on an iPhone, because Apple's Xcode is big).
- A **paid Claude plan (Pro or Max)**. The free plan doesn't include Claude Code.
- About **45 minutes** for the one-time setup in Parts 1–5.
- Your guitar and headphones for the listening checks later.

### The places you'll use
Every instruction in this guide says **where** to do it:

| Label in this guide | What it is |
|---|---|
| **🤖 Claude Code** | The **Code** tab of the Claude desktop app, with your project open. This is where you type `/next` and talk to Claude about the build. |
| **💬 Claude chat** | The normal **Chat** tab of the Claude app, for general questions about the process. |
| **🌐 Browser** | Safari or Chrome, for websites like GitHub and Netlify. |
| **Finder** | The Mac's file browser, for moving the kit and dropping in files. |

> **The golden rule:** in 🤖 Claude Code you can type plain English ("the buttons look too small") as well as the slash commands like `/next`. You never need to type commands in Terminal. If Claude ever needs a keyboard-only step, it will say so and give you one line to paste.

### How long it takes
On the Pro plan, using **Sonnet** as the main model, expect roughly **1–1½ months to v1.0** and **3–4 months to the finished app**, working most days. Using **Opus 5.5** for everything would take 3–5 times longer, so switch to it only when Claude or `START-HERE.md` suggests. The full breakdown is in `START-HERE.md` under "How long will this take?". To switch model, use the **model menu** next to the send button.

---

## Part 1 — Get the Claude app ready

1. If you don't have the desktop app yet: 🌐 **claude.com/download** → download for Mac → open the file → drag **Claude** into **Applications** → open it and sign in.
2. If you already have it: menu **Claude → Check for Updates…** Some features in this guide need a recent version.
3. At the top of the window, click **Code**. This is **🤖 Claude Code**.
4. Get to know the Code tab:
   - **Left sidebar:** your sessions (each one is a separate conversation), **+ New session** (or **⌘N**), and **Routines** (scheduled tasks, used later for autopilot).
   - **Prompt box** at the bottom, with some controls around it:
     - **Environment:** always choose **Local**, meaning "on this Mac".
     - **Project folder:** which folder Claude works in.
     - **Model menu:** choose **Sonnet**.
     - **Mode selector** (or **⌘ Shift M**): choose **Auto**.
   - **Usage ring** next to the model menu: click it to see how much of your plan's usage you've used.
5. **Keep your Mac awake while Claude works:** Claude app → **Settings** → **Desktop app → General** → turn on **Keep computer awake**. Keep a MacBook plugged in and its lid open.
6. **Notifications:** the first time Claude asks to send notifications, click **Allow**. The app then tells you when Claude has finished or needs you, so you don't have to watch.

---

## Part 2 — Create your accounts (in the browser)

All free except Claude.

1. **Claude (paid):** make sure your account is on **Pro** or **Max** (claude.ai → Settings → Billing).
2. **GitHub (free):** 🌐 **github.com** → **Sign up**. Pick a username you're happy to show people; it appears in your project's web address. Verify your email. (You don't need to create the project on GitHub: Claude does it for you in Part 5.)
3. **Netlify and Supabase:** don't sign up yet. Claude will tell you when (Steps 0.8 and 18.1), and you'll sign in with your GitHub account in one click.

---

## Part 3 — Install two tools by clicking (one time)

These are ordinary Mac installers, the same as installing any app.

### 3.1 Node.js (runs the app's building tools)
1. 🌐 **nodejs.org** → **Download** → choose the **LTS** version (24.x) → **macOS Installer (.pkg)**.
2. Open the downloaded file from **Downloads**, click **Continue** through the installer, and enter your Mac password when asked.

### 3.2 GitHub CLI (lets Claude save your work to GitHub)
1. 🌐 **github.com/cli/cli/releases/latest** → scroll to **Assets** → download the file ending in **`macOS_universal.pkg`**.
2. Open it from Downloads and click through the installer.

(Apple's developer tools, which include Git, are installed in Part 5: Claude makes the Mac show an **Install** button for you.)

**Optional:** **VS Code** (code.visualstudio.com) lets you browse the project's files in a friendlier way. It isn't required.

---

## Part 4 — Put the kit in the right place

### 4.1 Download the kit
1. 💬 In the Claude chat where you got this kit, click the **atelier-six-kit.zip** file card and download it. It goes to your **Downloads** folder.
2. Open **Finder** → **Downloads**, and **double-click** `atelier-six-kit.zip`. A folder called **atelier-six-kit** appears.

> **Using an external drive instead?** Follow Part A of `DRIVE-AND-AUTOPILOT.html` for this part, then come back to Part 5.

### 4.2 Make a Projects folder (not on the Desktop)
Your Desktop may be synced to iCloud, and iCloud struggles with the thousands of small files a code project creates. So keep the project in your home folder instead:

1. In Finder, press **⌘ Shift H** to open your home folder (the one with the house icon).
2. **File → New Folder**, and name it **Projects**.
3. Drag the **atelier-six-kit** folder from Downloads into **Projects**.
4. Click it once, press **Return**, and rename it to **atelier-six**.
5. **Optional:** drag **Projects** into the Finder sidebar under Favourites.

### 4.3 Check the hidden files came across
Inside the **atelier-six** folder, press **⌘ Shift .** (full stop). A greyed-out **.claude** folder appears. It holds Claude's instructions for this project. Press the same keys again to hide it. **Never delete it.**

---

## Part 5 — Your first session

### 5.1 Open the project in Claude Code
1. Open the Claude app → **Code** → **+ New session** (⌘N).
2. In the prompt box, set:
   - **Environment:** **Local**
   - **Project folder:** click it → **Choose folder…** → **Projects** → **atelier-six** → **Open**
   - **Model:** **Sonnet**
   - **Mode:** **Auto**
3. If it asks whether you **trust this folder** (and its settings and hooks), choose **Trust**: they come from this kit.

### 5.2 Let Claude set up your Mac
🤖 Claude Code
```
/setup
```
Claude checks everything and does the setup itself. You'll be asked for a few clicks:
- **"Install command line developer tools?"** A Mac window appears → **Install** → **Agree**. This takes 5–15 minutes. Then type *done*.
- **GitHub sign-in:** Claude shows an 8-character code, and your browser opens GitHub (if it doesn't, go to **github.com/login/device**). Enter the code → **Continue** → **Authorize GitHub CLI**. Then type *done*.
- It then creates your **atelier-six** repository on GitHub and tells you its address.

If a tool from Part 3 is missing, Claude tells you which installer to run.

### 5.3 Start building
🤖 Claude Code
```
/next
```
Claude reads the instructions and starts Phase 0. A short status line at the start of each session (such as `Current: 0.1 · nothing to recover`) is the kit telling Claude where the build is.

### 5.4 Permission questions
In **Auto** mode, Claude doesn't ask before normal building work. A built-in safety check blocks risky actions, and the kit fences commands into your project folder (details in `DRIVE-AND-AUTOPILOT.html`, Part B). Now and then a permission card still appears with buttons to allow or deny.
- For `npm`, `npx`, `git`, `node` or `gh` working in your project: **allow** (choose "always allow" if it's offered).
- For anything with **`sudo`**, anything deleting files **outside** your atelier-six folder, anything that asks for a password, or anything you're unsure about: **deny**, and type *"Why do you need this? Explain in plain English."*

### 5.5 While it works
- You don't need to watch. The Mac shows a notification when Claude finishes or needs you.
- **To interrupt Claude:** click the **Stop** button by the prompt box (or press **Esc**), then type what you want, e.g. *"stop and explain what you're doing"*.
- **Seeing what it changed** is optional: the **+12 −1** style counter opens the list of changed files.
- **Quitting the Claude app stops Claude.** That's safe: work is saved at checkpoints, and `/pickup` carries on (Part 8).

---

## Part 6 — The routine for every session

This is the loop you'll repeat for weeks. It's also on the Cheat sheet.

1. Open the Claude app → **Code** → **+ New session** (⌘N). Check the prompt box shows **Local**, **atelier-six**, **Sonnet** and **Auto**. (Claude remembers these after the first time.)
2. 🤖 `/progress` shows where you are (cheap).
3. 🤖 `/next` does the steps of the current phase and stops at the end of the phase.
4. When it says **"Phase steps done. Run /gate."** → 🤖 `/gate` runs all the tests for that phase and releases it.
5. When the gate passes → **start a new session (⌘N)**. A fresh session starts with a small memory, which **saves a lot of usage**. Then 🤖 `/next` again.
6. Stop whenever you like. Old sessions stay in the sidebar; you can archive them (hover → archive icon).

> **Want it to carry on without you?** Part B of `DRIVE-AND-AUTOPILOT.html` sets up **autopilot**: a scheduled task in the Claude app that keeps building every hour and pauses itself when it needs you.

### Reading what Claude tells you
- **"Step done … commit abc1234"** → all good.
- **"USER ACTION"** or a question → it needs you. Read Part 7 for that step, do it, then type your answer (e.g. *"done"*, or paste what it asked for).
- **"BLOCKED: …"** → it tried 3 times and couldn't fix something. Read the reason. If it's a question, answer it. If it's gibberish to you, type *"Explain the problem in plain English and tell me my options"*.

### Checking your progress without Claude
In Finder, open **atelier-six**, click **PROGRESS.md** once and press **Space**. You'll see the checklist with ticks. Press Space again to close.

### Seeing the app
- **Live site:** the Netlify address Claude gives you in Step 0.8 (it ends in `.netlify.app`). Bookmark it and open it on your phone too.
- **Preview inside the Claude app:** 🤖 type *"show me the app in the preview"*. Claude starts it in the **Browser** pane (**⌘ Shift B**), where you can click around the latest version before it goes live.

### Talking to Claude
You can always use plain English:
- *"What phase are we on and what's left?"*
- *"Explain what you just did in two sentences."*
- *"The tuner needle is jumpy on my phone"*, or better: 🤖 `/fix the tuner needle is jumpy on my phone`
- *"Make the buttons a bit bigger on mobile."*

---

## Part 7 — When Claude needs you (click by click)

Claude will stop and ask at these points. Each one tells you what to do. Here is the extra detail.

### Step 0.8 — Put the site online (Netlify)
1. 🌐 **netlify.com** → **Sign up** → **Sign up with GitHub** → **Authorize**.
2. **Add new project** (or **Add new site**) → **Import an existing project** → **GitHub** → authorize if asked → pick **atelier-six**.
3. Don't change any settings (the kit sets them) → **Deploy**.
4. Wait for "Published". Copy the address shown (like `https://something.netlify.app`).
5. 🤖 Paste it into Claude Code and press Return.
6. **Optional:** Site configuration → Change site name → e.g. `atelier-six-yourname`, then tell Claude the new address.

### Step 0.7 — Turn on GitHub's secret protection
🌐 github.com → your **atelier-six** repository → **Settings** → **Code security** (left menu). Make sure **Secret scanning** and **Push protection** are **Enabled**. 🤖 Type *"done"*.

### Step 0.9 — Check nobody else owns the name
Claude Code writes a file called `legal-check.md` with links. Click each one, search for **Atelier Six**, and 🤖 tell Claude what you found, e.g. *"UK: nothing. App Store: a furniture shop called Atelier Six."* If something similar exists in music or apps, Claude Code will stop and ask whether to keep or change the name. This isn't legal advice; for a paid launch, ask a trade mark adviser.

### Real-device checks (Gates 5, 7, 9, 17, 23 and 24)
Claude Code gives you a few rows from `device-checklist.md`, for example "On iPhone Safari, does sound play with the silent switch on?" Try each one on your own iPhone, iPad or Mac and 🤖 reply with what happened.

### Step 1.5 — Approve the look
Open your live address with **/design** added on the end (e.g. `https://…netlify.app/design`). Look at colours, fonts and buttons. 🤖 Tell Claude in plain words: *"Looks great"* or *"the gold is too yellow, text feels small"*.

### Listening checks (Steps 5.2, 11.3, 17.3, 20.2, 21.2, 21.4)
Put headphones on, open the page Claude names, press the buttons, and 🤖 tell Claude what you think in normal words. Wired headphones are best: Bluetooth adds a delay that confuses the timing features.

### Guitar checks (Steps 7.2, 12.2, 17.3, 23.3)
Open the page on the device you practise with. When the browser asks to use the **microphone** (or **camera**), click **Allow**. Play what Claude asks and 🤖 report back, e.g. *"it said my bends were short when they sounded right"*.

### Steps 10.2, 15.4, 22.2, 24.6 — Record the demo GIF
1. Open your live address with **?demo=1** on the end, e.g. `https://…netlify.app/?demo=1`, in a large browser window.
2. Press **⌘ Shift 5** → choose **Record Selected Portion** → drag the box around the browser window → **Record**.
3. When the tour finishes, click the **Stop** button (■) in the top menu bar. The video appears on your Desktop.
4. 🌐 Go to **ezgif.com** → **Video to GIF** → upload the video → set **Size** width to **960** → **Convert to GIF** → **Save**.
5. Rename the file to **demo.gif** and drag it into **atelier-six → docs** in Finder.
6. 🤖 Type *"done"*.

(Shortcut: you can instead 🤖 tell Claude *"the video is on my Desktop, please convert it to docs/demo.gif"*. It can usually do the conversion itself.)

### Step 16.4 — Record your chords (optional)
1. Open the **Voice Memos** app on your Mac (or iPhone, synced by iCloud).
2. Record each chord Claude lists for about 2 seconds, and rename each memo to the name Claude gives (e.g. `C.open.a`).
3. Drag the memos from Voice Memos into **atelier-six → eval → user** in Finder.
4. 🤖 Type *"done, they're m4a files"*. Claude converts them.

### Step 18.1 — Supabase (for syncing between devices)
1. 🌐 **supabase.com** → **Start your project** → **Continue with GitHub**.
2. **New project** → Name: **atelier-six** → **Database password**: click **Generate**, and save it in the **Passwords** app → Region: **West EU (London)** → **Create new project**. Wait a minute.
3. Go to **Project Settings → API** (may be called **API Keys**). Copy:
   - the **Project URL**,
   - the **anon / public** key (may be called **publishable**).
   
   **Never** copy or share the **service_role** / **secret** key.
4. 🤖 Paste both into Claude Code.
5. 🌐 Netlify → your site → **Site configuration → Environment variables → Add a variable**. Add `VITE_SUPABASE_URL` with the URL, then `VITE_SUPABASE_ANON_KEY` with the anon key. Then **Deploys → Trigger deploy → Deploy site**.
6. 🌐 Supabase → **Authentication → URL Configuration**: paste the addresses Claude gives you into **Site URL** and **Redirect URLs** → **Save**.
7. Claude may run `npx supabase login`. Your browser opens; click **Authorize**. 🤖 Type *"done"*.

### Step 18.4 — Try sync on two devices
Open your live site on your phone and laptop, sign in with the **same email** on both (click the link in the email each time), practise something on one, and check it appears on the other.

### Step 19.5 — Check an export
Install **MuseScore** (free, musescore.org). Claude tells you where it saved the exported file (usually **Downloads**). Double-click it to open in MuseScore and 🤖 say whether it looks right.

### End of each module — play it and score it (Gates 6, 12, 13 and 14)
This is how we make sure the music sounds right and is fun, not just technically correct.
1. Open your live site on the device you practise with, plug in your guitar, and put wired headphones on.
2. Open the module's **tune** (last card on the module page) and play it all the way through with the band. Then play the two lessons Claude Code names.
3. 🤖 Type your three scores from 1 to 5, and a sentence on each if you like:
   - **Playable:** could your hands do it at the target speed?
   - **Sounds like the style:** does it feel like pop punk, Britpop, grunge, Frusciante or Morello?
   - **Fun:** did you want to play it again?

   For example: *"playable 5, style 3 (chorus feels too slow and polite), fun 4"*.
4. Anything under 4 gets reworked, and Claude Code will ask you to try again. If you know another guitarist, ask them to try the tune too.

### Step 5.5 — Does it sound like a real guitar?
Open your live site with **/design** on the end, press play on the strummed chord, the palm-muted riff and the drum groove, and 🤖 say whether they sound like a real guitar and band.

### Step 10.3 — The beta
Claude Code gives you a message to send to 3–5 guitar-playing friends with your live link and a two-minute feedback form. Send it however you like (text, WhatsApp, email). After about a week, 🤖 type *"feedback is in"*.

### End of each phase — how long did it take?
Claude Code asks roughly how many usage windows the phase used. Count the times you hit the limit, add one, and 🤖 type the number. It uses these to give you a better finish date.

### Step 24.1 — Choose the app ID
Claude suggests something like `com.yourname.ateliersix`. It can **never change** once the app is in a store, so pick something you're happy with and 🤖 type it.

### Step 24.4 — Put the app on your phone
- **Android:** 🌐 your GitHub repo → **Actions** → the latest **native** run → **Artifacts** → download the APK. Send it to your phone (e.g. by email), open it, and allow "Install unknown apps" when asked.
- **iPhone (needs Xcode, ~15 GB):** install **Xcode** from the App Store and open it once. Xcode → Settings → **Accounts** → add your Apple ID. On the iPhone: Settings → Privacy & Security → **Developer Mode** → On (it restarts). Plug the iPhone in, then 🤖 tell Claude *"ready to install on my iPhone"*. It will guide you through the Xcode Run button. Free installs last 7 days.

### Step 24.5 — App stores (optional, costs money)
Google Play is **$25 once**. Apple is **$99 a year**. 🤖 Type *"skip"* if you don't want this. Your app still installs free from the website.

---

---

## Part 8 — When you run out of usage

You **will** hit your Claude usage limit. Nothing is lost.

**What you'll see:** Claude says you've reached your usage limit and when it resets. The **usage ring** by the model menu shows how close you are.

**If you notice you're close to the limit:**

🤖 Claude Code
```
/checkpoint
```
It saves everything in a few seconds.

**When your limit resets:**
1. **Start a new session (⌘N)**, not the old one. The old session carries its whole history, which uses up your allowance faster.
2. Type this:

🤖 Claude Code
```
/pickup
```
Claude re-checks where it stopped and carries on.

**If autopilot is on** (DRIVE-AND-AUTOPILOT, Part B), you don't need to do anything: its next hourly run after the reset picks up by itself.

**Other things that pause:**
- **Live site shows "Site not available":** Netlify's free monthly allowance ran out. Keep building. It comes back next month and Claude catches up automatically.
- **Sync stops working after a week off:** 🌐 supabase.com → your project → **Restore project**.

---

## Part 9 — If something goes wrong

| What you see | What to do |
|---|---|
| Claude says `node`, `gh` or `git` isn't found | 🤖 `/setup`. It tells you which installer to run. If you've just installed something, quit the Claude app (⌘Q), reopen it and start a new session. |
| Claude seems stuck | Wait: tests can take 5–10 minutes. If it's been over 15 minutes, click **Stop** and type *"what were you doing? carry on"*. |
| A permission card keeps coming back for normal project work | Choose **always allow**. |
| "BLOCKED" in Claude's reply | 🤖 *"Explain the problem in plain English and give me the options."* |
| "Operation not permitted" | Usually the project's safety fence. Claude normally reruns the command itself. If it doesn't, type 🤖 *"rerun that outside the sandbox if it's safe"*. |
| GitHub asks you to sign in again | 🤖 `/setup` and follow the GitHub sign-in steps. |
| The Mac asks whether Claude may access files in a folder | Click **Allow**. |
| The site looks broken after an update | 🤖 `/fix` followed by what you see, e.g. `/fix the library page is blank on my iPhone`. |
| You don't understand an error | Copy it and paste it into 💬 Claude chat with *"I'm building Atelier Six in Claude's Code tab on a Mac. What does this mean and what should I do?"* Or just ask 🤖 *"explain that error in plain English"*. |
| The Mac says the disk is full | 🤖 *"How much space is the project using, and what can safely be cleared?"* |
| You want to undo the last thing Claude did | 🤖 *"Undo your last step and explain what you undid."* It can roll back safely because every step is saved in Git. |

---

## Part 10 — Words you'll see

- **Claude Code:** Claude working on your project's files, here in the Code tab of the Claude app.
- **Session:** one conversation with Claude in the Code tab. A new session (⌘N) starts with a fresh memory.
- **Terminal:** the Mac's command window. You don't need it: Claude runs the commands.
- **Folder / directory:** the same thing.
- **Repository (repo):** your project folder, with its full history, also stored on GitHub.
- **Commit:** a saved snapshot of the project. **Push:** send commits to GitHub.
- **Deploy:** publish the latest version to your live website (Netlify does this after a push).
- **Phase / step / gate:** the build plan's chapters, their small tasks, and the end-of-chapter test.
- **Checkpoint:** an automatic save point inside a step.
- **Sandbox:** a safety fence that keeps Claude's commands inside your project folder and on approved websites.
- **Routine / scheduled task:** a job the Claude app starts by itself on a timetable (used for autopilot).
- **npm:** the tool that installs code libraries. **Node:** what runs them.
- **Environment variable:** a named setting (like a key) stored outside the code.

---

## Cheat sheet (every session)

```
Claude app → Code → + New session (⌘N)
Check: Local · atelier-six · Sonnet · Auto

/progress      where am I?
/next          build the next steps
/gate          when it says "Run /gate"
⌘N             new session after every gate
/checkpoint    near your usage limit
/pickup        first thing after a break or limit reset
/fix <what's wrong>
/setup         if a tool or the GitHub sign-in goes missing

Stop button (or Esc) = interrupt Claude   ·   ⌘ Shift B = preview the app
Plain English always works: "explain that", "what do you need from me?"
```
