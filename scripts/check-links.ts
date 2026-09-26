import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Every relative link or image in README.md must point at a file in the repo.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const readme = readFileSync(resolve(root, 'README.md'), 'utf8');

const targets = [
  ...readme.matchAll(/\]\(([^)\s]+)\)/g),
  ...readme.matchAll(/\bsrc="([^"]+)"/g),
].map((match) => match[1]);

const missing = targets
  .filter((target) => target !== '' && !/^(https?:|mailto:|#)/.test(target))
  .map((target) => target.split('#')[0] ?? '')
  .filter((path) => !existsSync(resolve(root, path)));

if (missing.length > 0) {
  console.error(`README links to missing files:\n${missing.map((m) => `  ${m}`).join('\n')}`);
  process.exit(1);
}
console.log(`README links OK (${String(targets.length)} checked).`);
