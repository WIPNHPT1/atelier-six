import { expect, test } from '@playwright/test';
import { seedForVisualSnapshot } from './helpers.ts';

// No service worker: its "Ready to work offline" toast fires non-deterministically (depends
// on precache timing) and would bleed into the screenshot. offline.spec.ts covers PWA behavior.
test.use({ serviceWorkers: 'block' });

const FIXED_NOW = '2026-01-15T12:00:00.000Z';

const PAGES = [
  { name: 'today', path: '/today' },
  { name: 'course', path: '/course' },
  { name: 'course-module', path: '/course/power' },
  { name: 'lesson', path: '/lesson/power-vi-iv-i-v-d' },
  { name: 'chords', path: '/library' },
  { name: 'tuner', path: '/tuner' },
  { name: 'progress', path: '/progress' },
  { name: 'settings', path: '/settings' },
];

// Playwright requires the fixtures param to be destructured, even when nothing is used from it.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(
    !process.env.CI && process.env.VISUAL !== '1',
    'local runs skip visual by default — opt in with VISUAL=1; CI always runs it',
  );
  test.skip(
    testInfo.project.name.endsWith('-firefox'),
    'visual baselines cover Chromium and WebKit only',
  );
});

for (const { name, path } of PAGES) {
  test(`${name} matches its visual baseline`, async ({ page }) => {
    await page.clock.install({ time: new Date(FIXED_NOW) });
    await page.goto(path);
    await seedForVisualSnapshot(page, path);
    // #main is always in the DOM — wait for its actual lazy-loaded content, not just the
    // Suspense fallback, or a fresh/cold CI run can screenshot an empty page (see LESSONS.md).
    await expect(page.locator('#main h1').first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);

    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      // [data-playhead-step] is the whole TabLane grid, not the moving marker — masking it
      // would blank out the entire tab. The actual live bit is the active-column cell.
      mask: [page.locator('[data-active="true"]')],
      maxDiffPixelRatio: 0.01,
    });
  });
}
