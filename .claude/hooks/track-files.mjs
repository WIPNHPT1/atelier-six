#!/usr/bin/env node
// PostToolUse hook (Edit|Write|MultiEdit): records which files were changed during the current step,
// so /pickup knows where to look without re-reading the project. Costs no tokens; prints nothing.
import { readFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    const file = data?.tool_input?.file_path;
    if (!file) return;
    const rel = relative(root, file);
    if (rel.startsWith('..') || rel.startsWith('.claude/state')) return;
    const dir = join(root, '.claude', 'state');
    const log = join(dir, 'touched.txt');
    mkdirSync(dir, { recursive: true });
    const seen = existsSync(log) ? readFileSync(log, 'utf8').split('\n') : [];
    if (!seen.includes(rel)) appendFileSync(log, rel + '\n');
  } catch {
    // never block the tool call
  }
});
