#!/usr/bin/env node
// SessionStart hook: prints a compact build status so a fresh session knows where it stopped.
// Plain stdout from a SessionStart hook is added to Claude's context. Keep it short (token budget).
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const read = (f) => (existsSync(join(root, f)) ? readFileSync(join(root, f), 'utf8') : '');
const sh = (cmd) => {
  try {
    return execSync(cmd, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
};

const resume = read('RESUME.md')
  .split('\n')
  .filter((l) => l.trim() && !l.startsWith('<!--') && !l.startsWith('# '))
  .slice(0, 18)
  .join('\n');
const current = (read('PROGRESS.md').match(/^Current:.*$/m) || ['Current: (none)'])[0];
const dirty = sh('git status --short').split('\n').filter(Boolean);
const touched = read('.claude/state/touched.txt').split('\n').filter(Boolean).slice(-10);
const status = (resume.match(/^Status:\s*(\S+)/m) || [])[1] || 'idle';

const hasCommits = sh('git rev-parse --verify HEAD') !== '';

// Idle and nothing pending: two lines are enough (saves tokens every session).
if (status === 'idle' && (dirty.length === 0 || !hasCommits)) {
  process.stdout.write(
    `== Atelier Six build status ==\n${current} · nothing to recover. ` +
      (hasCommits ? 'The user will run /next or /gate.\n' : 'Fresh project: the user will run /next to start.\n'),
  );
  process.exit(0);
}

const out = [
  '== Atelier Six build status (from session-start hook) ==',
  current,
  resume,
  `Uncommitted files: ${dirty.length}${dirty.length ? ' (' + dirty.slice(0, 8).join(', ') + ')' : ''}`,
];
if (touched.length) out.push(`Recently edited: ${touched.join(', ')}`);
out.push(
  status === 'idle'
    ? 'No step is in progress but there are uncommitted changes. Before /next, run `git status` and ask the user whether to keep them.'
    : 'Work was interrupted. When the user asks to continue, follow /pickup (do not start a new step).',
);
process.stdout.write(out.join('\n') + '\n');
