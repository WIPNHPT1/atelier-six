import { gzipSync } from 'node:zlib';
import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { build } from 'vite';

const ENTRY_BUDGET_KB = 200;
// Vite pools any CSS module reused across 2+ lazy routes into the chunk linked from the entry
// HTML — in a component-heavy app that's most of the design system, not just shell chrome.
// Measured at 48.5 KB in 9.5; budget set with headroom above that, not the original 30 KB guess.
const ENTRY_CSS_BUDGET_KB = 55;
const SAMPLE_BUDGET_MB = 6;
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = 1024 * 1024;
const FORBIDDEN_ENTRY_DEPENDENCIES = ['tone'];

type OutputChunk = {
  type: 'chunk' | 'asset';
  fileName: string;
  isEntry?: boolean;
  code?: string;
  source?: string | Uint8Array;
  moduleIds?: string[];
  viteMetadata?: { importedCss?: Set<string> };
};

function totalAudioBytes(): number {
  const dir = fileURLToPath(new URL('../public/audio', import.meta.url));
  let total = 0;
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || entry.name.startsWith('._')) continue;
    total += statSync(join(entry.parentPath, entry.name)).size;
  }
  return total;
}

async function main(): Promise<void> {
  const result = await build({ logLevel: 'silent', build: { write: false } });
  const outputs = Array.isArray(result) ? result : [result];
  const chunks = outputs.flatMap((r) => ('output' in r ? (r.output as OutputChunk[]) : []));

  const entryChunk = chunks.find((c) => c.type === 'chunk' && c.isEntry === true);
  if (!entryChunk?.code) throw new Error('No entry chunk found in the build output.');
  const entryGzipKb = gzipSync(entryChunk.code).length / BYTES_PER_KB;

  const entryCssNames = entryChunk.viteMetadata?.importedCss ?? new Set<string>();
  const entryCssBytes = chunks
    .filter((c) => c.type === 'asset' && entryCssNames.has(c.fileName))
    .reduce((sum, c) => sum + gzipSync(Buffer.from(c.source ?? '')).length, 0);
  const entryCssGzipKb = entryCssBytes / BYTES_PER_KB;

  const failures: string[] = [];

  if (entryGzipKb > ENTRY_BUDGET_KB) {
    failures.push(
      `Entry JS is ${entryGzipKb.toFixed(1)} KB gzip, over the ${String(ENTRY_BUDGET_KB)} KB budget.`,
    );
  }

  if (entryCssGzipKb > ENTRY_CSS_BUDGET_KB) {
    failures.push(
      `Entry CSS is ${entryCssGzipKb.toFixed(1)} KB gzip, over the ${String(ENTRY_CSS_BUDGET_KB)} KB budget.`,
    );
  }

  for (const dep of FORBIDDEN_ENTRY_DEPENDENCIES) {
    if ((entryChunk.moduleIds ?? []).some((id) => id.includes(`/node_modules/${dep}/`))) {
      failures.push(`Entry chunk statically pulls in "${dep}" — it must stay lazy-loaded.`);
    }
  }

  const audioMb = totalAudioBytes() / BYTES_PER_MB;
  if (audioMb > SAMPLE_BUDGET_MB) {
    failures.push(
      `public/audio is ${audioMb.toFixed(2)} MB, over the ${String(SAMPLE_BUDGET_MB)} MB sample budget.`,
    );
  }

  console.log(`Entry JS: ${entryGzipKb.toFixed(1)} KB gzip (budget ${String(ENTRY_BUDGET_KB)} KB)`);
  console.log(
    `Entry CSS: ${entryCssGzipKb.toFixed(1)} KB gzip (budget ${String(ENTRY_CSS_BUDGET_KB)} KB)`,
  );
  console.log(`Samples: ${audioMb.toFixed(2)} MB (budget ${String(SAMPLE_BUDGET_MB)} MB)`);

  if (failures.length > 0) {
    failures.forEach((f) => {
      console.error(`FAIL: ${f}`);
    });
    process.exit(1);
  }
  console.log('OK: within budget.');
}

await main();
