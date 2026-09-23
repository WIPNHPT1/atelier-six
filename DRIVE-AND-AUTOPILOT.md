# Running the build from an external drive, hands-off

This guide covers two things, and neither needs Terminal:

1. **Part A:** keeping the whole project on a removable drive that stays plugged into your Mac.
2. **Part B:** letting Claude work through the build with as little checking from you as possible, while staying safe.

It follows on from `MAC-GUIDE.html`: do Parts 1–3 there first (the Claude app, accounts, two installers). Where this guide and the Mac guide differ, follow this guide for the drive and the autopilot settings. Labels mean the same as in the Mac guide: 🤖 Claude Code (the Code tab of the Claude app), 🌐 Browser.

---

## Part A — The external drive

### A1. Pick the right drive
- An **SSD** (solid-state drive) is best: installs and tests run much faster than on a spinning hard drive.
- **At least 64 GB free**, or 128 GB if you'll do the iPhone step later.
- Plug it **straight into the Mac**, not through a cheap hub, and use a cable that stays put. If it disconnects mid-build nothing is lost (see A8), but it's a nuisance.

### A2. Format it for a Mac, encrypted (this ERASES the drive)
The project needs a Mac-format drive. Drives sold "for Windows and Mac" (exFAT) break some developer tools, such as file permissions, Git hooks and links between files. Encryption matters because your Supabase keys will live on this drive.

> **Warning:** formatting wipes everything on the drive. Copy anything you need off it first.

1. Open **Disk Utility** (⌘ Space → type *Disk Utility* → Return).
2. Menu **View → Show All Devices**. In the left sidebar, select the **drive itself** (the top line for it, not the indented volume under it).
3. Click **Erase** and set:
   - **Name:** `Studio`
   - **Format:** **APFS (Encrypted)**
   - **Scheme:** **GUID Partition Map**
4. Choose a password and store it in the **Passwords** app. Click **Erase**, then **Done**.
5. When you next plug it in and macOS asks for the password, tick **Remember this password in my keychain**. The drive then unlocks by itself when you log in, so autopilot can carry on after a restart. It's still encrypted if the drive is lost away from your Mac.

### A3. Let the drive respect file ownership
1. In Finder, click the **Studio** drive in the sidebar, then **File → Get Info** (⌘ I).
2. At the bottom, click the padlock and enter your Mac password.
3. **Untick "Ignore ownership on this volume".** Otherwise Git may refuse to work, with the message "detected dubious ownership".

### A4. Put the kit on the drive
1. In Finder, open **Studio**, make a folder called **Projects**, drag the unzipped **atelier-six-kit** folder into it, and rename it **atelier-six**.
2. Press **⌘ Shift .** to check the hidden **.claude** folder came across, then press it again to hide it.
3. In the Claude app → **Code** → **+ New session** → **Project folder** → **Choose folder…** → pick **Studio** under **Locations** in the sidebar → **Projects** → **atelier-six** → **Open**. Set **Local**, **Sonnet** and **Auto** as in Mac guide Part 5.
4. 🤖 `/setup`. Claude connects the folder to GitHub, exactly as in Mac guide Part 5.2. If Git complains about "dubious ownership", Claude fixes it itself.

### A5. Let the Claude app use the drive
The first time Claude touches the drive, macOS asks **"Claude" would like to access files on a removable volume**. Click **Allow**.
If you missed it: **System Settings → Privacy & Security → Files & Folders → Claude → turn on Removable Volumes**.

### A6. Keep the Mac and the drive awake
If the Mac sleeps, Claude pauses and autopilot runs are skipped. If the drive spins down, things slow down or stall.
1. Claude app → **Settings** → **Desktop app → General** → turn on **Keep computer awake**.
2. **System Settings → Energy** (on a laptop: **Battery → Options**) → turn **off** "Put hard disks to sleep when possible".
3. Keep a MacBook **plugged in** and **open**. Closing the lid sleeps it, unless an external screen, keyboard and power are connected.

### A7. Stop the Mac wasting effort on the project, and back it up
- **Spotlight:** System Settings → **Spotlight** → **Search Privacy…** → **+** → add **Studio/Projects**. This stops macOS indexing thousands of temporary files.
- **Time Machine** (optional, recommended): Time Machine skips external drives by default. System Settings → General → **Time Machine** → **Options…** → remove **Studio** from the excluded list.
- **GitHub is your main backup.** Every finished phase is pushed there. Save points within a phase stay on the drive until the phase ends, so Time Machine protects that in-between work.

### A8. If the drive gets unplugged mid-build
1. Plug it back in and wait for **Studio** to appear in Finder.
2. In the Claude app → **Code** → **+ New session** (check the project folder is still **atelier-six** on Studio).
3. 🤖 `/pickup`. Claude re-checks what's on disk and carries on from the last save point.
4. If it mentions a file called `index.lock`, type 🤖 *"remove the stale git lock and continue"*.
5. **Always eject before unplugging:** in Finder, click ⏏ next to Studio. First pause autopilot (B5) and make sure no session is working.

### A9. Using the drive on another Mac
This works if that Mac has the Claude app and the two installers from Mac guide Parts 1 and 3. Open the folder in the Code tab and type 🤖 `/setup`: Claude signs GitHub in on that Mac and fixes any ownership warning. You'll enter the drive's password when you plug it in.

---

## Part B — Less babysitting, still safe

### B1. The safety net you already have
Before loosening anything, it helps to know what already protects you:
- **Small steps with tests.** Every step must pass its checks before it's committed, and every phase has a full test run.
- **Save points.** Work is committed on your drive every few minutes, so nothing is lost.
- **GitHub history.** Every finished phase is on GitHub, so any change can be undone.
- **Blocked commands.** The kit's settings refuse force-pushing, `sudo`, deleting the drive or home folder, reading your SSH or AWS keys, and editing your shell or Claude settings files.
- **Claude Code's own protections.** Changes to the project's `.git` and `.claude` folders are never waved through automatically, and bypass mode is switched off for this project.

### B2. Level 1: Auto mode (the kit sets it)
Pick **Auto** in the mode selector next to the send button (**⌘ Shift M**). The kit makes Auto the default for this project. Instead of asking you before each command, a second AI model checks each risky action and blocks things like:
- downloading and running scripts;
- force-pushing or wiping work (`git reset --hard`);
- deleting files that existed before the session;
- sending secrets anywhere.

Ordinary building work (editing files, installing packages, running tests, committing, pushing at the end of a phase) goes ahead without asking.
- If the checker blocks something several times in a row, Claude stops and asks you. That's the safety working as intended.
- **You can set limits in plain English**, and the checker respects them. For example: 🤖 *"Don't push anything today."*
- If **Auto** isn't in the menu, choose **Accept edits**. You'll then be asked before commands; allow the normal project ones as in Mac guide Part 5.4.

### B3. Level 2: the sandbox (already on)
The sandbox is a macOS feature that fences in every command Claude runs. Commands can only write inside your project folder (plus the code-library and test-browser caches) and can only reach these websites:
- `registry.npmjs.org` (code libraries)
- GitHub (`github.com`, `api.github.com` and GitHub's download sites)
- Playwright's download sites (test browsers)

Inside that fence, commands run without prompts. **The kit switches this on for the project, so there's nothing to set.**

What you might notice:
- A few commands must step outside the fence: signing in to GitHub, pushing, and saving Git settings. Claude reruns them outside the sandbox, and Auto mode's checker reviews each one. If you're asked, allow it when it's clearly the project's own Git or GitHub work, and deny anything else.
- In Phase 18 Claude will need your Supabase address (`…supabase.co`); allow it when asked.
- If a step keeps failing with "operation not permitted", type 🤖 *"This looks like the sandbox blocking a tool. Explain what it needs and suggest the smallest change."*

### B4. Level 3: notifications, so you don't have to watch
- The Claude app shows a Mac notification when a session finishes while you're looking at something else, and when an autopilot run starts. If you don't see them: **System Settings → Notifications → Claude** → turn on **Allow notifications**.
- The kit adds a chime when Claude is waiting for your permission or answer. That one comes from macOS's scripting helper: if it doesn't appear, go to **System Settings → Notifications → Script Editor** and turn it on.
- Turn off **Focus / Do Not Disturb** while building, or add Claude to its allowed apps.

### B5. Level 4: autopilot (a scheduled task that keeps building)
Autopilot is a **Routine** in the Claude app. Every hour it starts a fresh session on your Mac and runs the kit's `/autopilot` instructions:
- **Unfinished step** → it picks up where the last one stopped.
- **Next step or gate** → it does the work, then stops after the phase's gate passes. The next run starts the next phase in a fresh session, which keeps usage low.
- **Needs you** (a USER ACTION, a review on your guitar, a question) → it writes exactly what to do, **pauses itself** and notifies you.
- **Usage limit reached** → that run stops. The hourly runs after the reset carry on by themselves.
- **Previous run still going** → that hour is skipped, so runs never overlap.

**Set it up once (5 minutes).** You'll paste this line into the routine's instructions:

```
Follow .claude/commands/autopilot.md in this project exactly.
```

1. Claude app → **Code** → **Routines** in the sidebar (or in its **More** menu) → **New routine** → **Local**.
2. **Name:** `atelier-six-autopilot`
3. **Description:** `Builds Atelier Six step by step`
4. **Instructions:** paste the line above.
5. Under the instructions:
   - **Permission mode:** **Auto**
   - **Model:** **Sonnet**
   - **Folder:** **atelier-six** (on Studio if you use the drive)
   - **Worktree:** **off**
6. **Schedule:** **Hourly**. Then save.
7. Open the routine and click **Run now**. Watch the first run for a few minutes. If a permission card appears for normal project work, choose **always allow**; later runs then won't ask.

**Using it:**
- **Pause and restart:** open the routine → **Status** → **Paused** or **Active**.
- **See what it did:** each run appears under **Scheduled** in the sidebar. Open one to read it or answer a question.
- **When it says "Needs you":** open a new session (⌘N) → 🤖 `/pickup` → do what it asks → when that step is done, set the routine back to **Active**.
- **To work with Claude yourself:** pause the routine first, and set it back to **Active** when you finish. Never have both working on the project at once.
- **Hard steps:** the routine uses Sonnet. If it stops with **BLOCKED** on one of the Opus steps listed in `START-HERE.md`, open a session with **Opus**, type 🤖 `/pickup`, then go back to Sonnet and the routine.

**When to use autopilot vs sitting with it:**
- **Autopilot:** coding-heavy phases where you aren't needed (most of Phases 2–5, 11, 16 and 19–21).
- **Sit with it:** phases with a lot for you to do (0, 1, 18 and 24), and anything where Claude recently got stuck.

### B6. Never do these (they remove the safety net)
- **Don't use bypass mode** ("Bypass permissions"). It's for throwaway virtual machines, not your own Mac. The kit switches it off for this project; don't enable it in Settings.
- **Don't choose "always allow"** for `sudo`, `rm -rf`, `git push --force`, or anything touching folders outside the project.
- **Don't paste passwords, the Supabase `service_role` key or signing keys into Claude.** The only Supabase values Claude needs are the Project URL and the public anon key.
- **Don't turn the sandbox off** to fix one error. Ask Claude for the smallest change instead.
- **Don't run two sessions on the project at once**, including autopilot plus a session of your own. Pause the routine first.
- **Don't use the Cloud environment or a worktree for this project.** Its save points and progress notes live in your folder, so always choose **Local** with worktree off.

### B7. What will still need you
Autopilot can't do these, by design:
- **Accounts and sign-ins:** GitHub sign-in (`/setup`), Netlify (0.8), GitHub settings (0.7), Supabase (18.1), app-store accounts (24.5, optional).
- **Decisions:** the name check (0.9), approving the look (1.5), the app ID (24.1).
- **Your ears and hands:** the sound checks, the review at the end of each module, the real-device checks, and the beta (10.3).
- **Demo GIFs:** 10.2, 15.4, 22.2, 24.6.

Each takes minutes, and autopilot tells you exactly what to do.

### B8. A low-effort weekly rhythm
- **Morning:** check the routine is **Active** and the Mac is plugged in, then get on with your day.
- **When a notification says "Needs you":** spend 5–15 minutes on it, then set the routine back to **Active**.
- **Once a week:** open your live site on your phone and look around, and glance at `PROGRESS.md` (select it in Finder and press Space).

### B9. Troubleshooting
| What you see | What to do |
|---|---|
| Routine history says **Skipped: computer was asleep** | Turn on **Keep computer awake** (A6) and keep the lid open. |
| Routine history says **Skipped: previous run still in progress** | Normal: a long run is still going. |
| A run stopped with a usage-limit message | Nothing to do: the first run after your limit resets carries on. |
| The same step fails run after run | Pause the routine, open a new session, type 🤖 `/pickup` and read what's stuck. |
| "Can't find PROGRESS.md" or the project is missing | Check **Studio** is in Finder's sidebar. If you renamed or moved the folder, edit the routine's **Folder**. |
| Notifications never appear | See B4. |
| Everything is very slow | Check the drive is plugged straight into the Mac, and that Spotlight is excluded (A7). |
| "dubious ownership" | 🤖 `/setup` fixes it. A3 stops it happening again. |
| "Operation not permitted" | Usually the sandbox (B3) or the removable-drive permission (A5). |
