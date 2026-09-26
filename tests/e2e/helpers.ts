import { expect, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import type { Result } from 'axe-core';

export async function completeOnboarding(page: Page) {
  // The root ("Start") renders the wizard in place for a fresh profile — no redirect.
  await page.goto('/');
  // Welcome, hand, level, tuning, then the first groove.
  for (let step = 0; step < 4; step++) await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('button', { name: 'Play the groove' })).toBeVisible();
  await page.getByRole('button', { name: 'Start' }).click();
  // Onboarding ends on the recommended first lesson; tests carry on from Today. A full
  // goto reloads the page, so wait for the shell to be interactive (nav mounted and its
  // keyboard listeners attached) before handing back to the test — otherwise a test that
  // immediately sends a keyboard shortcut (e.g. Ctrl+K) can race the reload.
  await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/lesson\//);
  await page.goto('/today');
  // Only one of the dock/rail/sidebar nav variants is visible at a given viewport width
  // (the others exist in the DOM but are CSS-hidden), so match on visibility directly.
  await expect(page.locator('[data-testid^="nav-"]:visible').first()).toBeVisible();
}

export async function seriousViolations(page: Page): Promise<Result[]> {
  const results = await new AxeBuilder({ page }).analyze();
  return results.violations.filter(
    (violation: Result) => violation.impact === 'serious' || violation.impact === 'critical',
  );
}

// A fixed sample of progress so charts/rings/streaks render the same way every run — real
// shape/lesson ids from other e2e fixtures, values otherwise arbitrary but stable.
export const SAMPLE_PROGRESS = {
  version: 4,
  lessons: {
    'power-vi-iv-i-v-d': {
      lessonId: 'power-vi-iv-i-v-d',
      bestBpm: 120,
      cleanStreak: 4,
      lastPracticed: 1768478400000,
      completed: true,
    },
    'open-c-am': {
      lessonId: 'open-c-am',
      bestBpm: 88,
      cleanStreak: 2,
      lastPracticed: 1768478400000,
      completed: false,
    },
    'power-stamina': {
      lessonId: 'power-stamina',
      bestBpm: 96,
      cleanStreak: 1,
      lastPracticed: 1768392000000,
      completed: false,
    },
  },
  transitions: {
    'C.open.a>Am.open': {
      transitionKey: 'C.open.a>Am.open',
      attempts: 12,
      misses: 3,
      lastMs: 420,
      interval: 3,
      reviewedOn: '2026-01-14',
    },
    'G.open.b>C.open.a': {
      transitionKey: 'G.open.b>C.open.a',
      attempts: 8,
      misses: 5,
      lastMs: 610,
      interval: 1,
      reviewedOn: '2026-01-13',
    },
  },
  minutes: [{ key: 'C.open.a>Am.open', date: 1768478400000, count: 5 }],
  sessions: [
    { date: '2026-01-13', minutes: 8 },
    { date: '2026-01-14', minutes: 12 },
    { date: '2026-01-15', minutes: 6 },
  ],
};

/** Seeds deterministic settings (motion off, onboarding done) and progress data, then
 * navigates (back) to `path` so the app boots with them already in place. Call after an
 * initial `page.goto(path)` — that first visit may have redirected to /onboarding before
 * seeding could land, so this always re-navigates to the intended path afterwards. */
export async function seedForVisualSnapshot(page: Page, path: string): Promise<void> {
  await page.evaluate(
    ({ progress }) => {
      localStorage.setItem(
        'a6.settings',
        JSON.stringify({
          state: { motion: 'off', onboardingComplete: true, mode: 'dark', finish: 'nitro' },
          version: 0,
        }),
      );
      return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('keyval-store');
        request.onupgradeneeded = () => {
          request.result.createObjectStore('keyval');
        };
        request.onerror = () => {
          reject(new Error(request.error?.message ?? 'IndexedDB open failed'));
        };
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('keyval', 'readwrite');
          tx.objectStore('keyval').put(progress, 'a6.progress');
          tx.oncomplete = () => {
            resolve();
          };
          tx.onerror = () => {
            reject(new Error(tx.error?.message ?? 'IndexedDB write failed'));
          };
        };
      });
    },
    { progress: SAMPLE_PROGRESS },
  );
  await page.goto(path);
}
