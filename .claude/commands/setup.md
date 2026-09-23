---
description: One-time Mac setup done for the user (Apple tools, Node, GitHub sign-in, Git, the GitHub repo)
---
The user doesn't use Terminal. Run every check yourself; only ask them for clicks (an installer, a browser page). Do the checks in order, fix what's missing, skip what's fine. Commands here that write outside the project (`~/.gitconfig`, `.git/config`, gh sign-in, the keychain) may be refused by the sandbox: rerun that one command outside the sandbox.

1. **Apple's developer tools (Git).** Run `git --version`. If it fails or macOS says the command line developer tools are needed, a pop-up appears on the Mac. Tell the user: "A window has appeared asking to install developer tools. Click **Install**, then **Agree**. It takes 5–15 minutes. Say *done* when it finishes." If no window appeared, run `xcode-select --install` to show it. Re-check.
2. **Node.js 24.** Run `node --version`. If it's missing or below v24, tell the user:
   1. In your browser, go to **nodejs.org** → **Download** → **LTS** → **macOS Installer (.pkg)**.
   2. Open the file from **Downloads** and click **Continue** through it (enter your Mac password when asked).
   3. Say *done*.
   Re-check. If it's still not found, ask them to quit the Claude app (⌘Q), reopen it, open this project in a new session and type `/setup` again.
3. **GitHub CLI.** Run `gh --version`. If missing, tell the user: browser → **github.com/cli/cli/releases/latest** → **Assets** → download the file ending **macOS_universal.pkg** → open it from Downloads → **Continue** through the installer → say *done*.
4. **GitHub sign-in.** Run `gh auth status`. If not signed in:
   - Outside the sandbox, run `gh auth login --hostname github.com --git-protocol https --web < /dev/null > .claude/state/gh-login.txt 2>&1 &` (create `.claude/state/` first), wait 3 seconds, and read that file for the one-time code.
   - Tell the user: "Your browser should open GitHub. If not, go to **github.com/login/device**. Enter the code **XXXX-XXXX**, click **Continue**, then **Authorize GitHub CLI**. Say *done*."
   - Re-check with `gh auth status`, then run `gh auth setup-git`. Delete `.claude/state/gh-login.txt`.
   - If that doesn't work after two tries: ask the user to open the terminal pane in the Claude app (**Control + `**, or the **Views** menu), paste `gh auth login`, and answer **GitHub.com → HTTPS → Yes → Login with a web browser**, then follow the browser steps.
5. **External drive check.** If the project path starts with `/Volumes/` and Git reports "dubious ownership", run `git config --global --add safe.directory "<project path>"`. Tell the user in one line that Part A3 of `DRIVE-AND-AUTOPILOT.html` prevents this.
6. **Git repository.** If this isn't a Git repo, run `git init -b main`. Set the identity for this repo only (not global), using their GitHub account and GitHub's private no-reply address:
   `git config user.name "$(gh api user --jq '.name // .login')"` and `git config user.email "$(gh api user --jq '"\(.id)+\(.login)@users.noreply.github.com"')"`.
7. **GitHub repo.** If there's no `origin` remote: get the username with `gh api user --jq .login`. If `gh repo view <login>/atelier-six` fails, create it with `gh repo create atelier-six --public --description "Guitar chord-transition trainer (PWA)"`. Then `git remote add origin https://github.com/<login>/atelier-six.git`. Don't push (Phase 0 does that). Tell the user: "I created your GitHub repository: github.com/<login>/atelier-six."
8. Reply in ≤5 lines: what was already fine, what you set up, and "Setup done. Type **/next** to start building." If `/next` sent you here, just carry on with `/next`.
