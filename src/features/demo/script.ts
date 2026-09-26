import { copy } from '../../content/copy.en-GB';
import type { Finish } from '../../app/settingsStore';

// The hands-off tour behind `/?demo=1`: plain data, one step at a time. `ms` is how long the
// tour dwells after the step before running the next one.
export type DemoStep =
  | { kind: 'go'; path: string; ms: number }
  | { kind: 'click'; selector: string; text?: string; ms: number }
  | { kind: 'select'; selector: string; value: string; ms: number }
  | { kind: 'finish'; finish: Finish; ms: number };

export const DEMO_LESSON = '/lesson/power-vi-iv-i-v-d';

export const demoScript: DemoStep[] = [
  { kind: 'go', path: '/today', ms: 1500 },
  { kind: 'go', path: '/library', ms: 1000 },
  {
    kind: 'click',
    selector: `[role="radiogroup"][aria-label="${copy.library.title}"] button`,
    text: copy.library.moduleOpen,
    ms: 700,
  },
  { kind: 'click', selector: '[data-testid="chord-card"][aria-label="G"]', ms: 1300 },
  { kind: 'select', selector: '[role="dialog"] select', value: 'C', ms: 2500 },
  { kind: 'go', path: DEMO_LESSON, ms: 1200 },
  { kind: 'click', selector: 'button', text: copy.lesson.play, ms: 3000 },
  {
    kind: 'click',
    selector: `[role="radiogroup"][aria-label="${copy.lesson.section}"] button:nth-of-type(2)`,
    ms: 2500,
  },
  { kind: 'finish', finish: 'nitro', ms: 800 },
  { kind: 'finish', finish: 'xerox', ms: 800 },
  { kind: 'finish', finish: 'sunburst', ms: 800 },
  { kind: 'click', selector: 'button', text: copy.lesson.stop, ms: 200 },
  { kind: 'go', path: '/tuner', ms: 2500 },
];

export function totalMs(script: DemoStep[]): number {
  return script.reduce((sum, step) => sum + step.ms, 0);
}

// The tuner's demo needle: starts sharp and eases to dead centre, like a string being tuned.
export const SETTLE_MS = 1800;
export const SETTLE_START_CENTS = 28;

export function settleCents(elapsedMs: number): number {
  if (elapsedMs >= SETTLE_MS) return 0;
  const remaining = 1 - Math.max(0, elapsedMs) / SETTLE_MS;
  return Math.round(SETTLE_START_CENTS * remaining * remaining * 10) / 10;
}
