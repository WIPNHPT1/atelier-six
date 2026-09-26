import { expect, test, type Page } from '@playwright/test';
import { completeOnboarding } from './helpers.ts';

async function expectPath(page: Page, path: string) {
  await expect.poll(() => new URL(page.url()).pathname).toBe(path);
}

const destinations = [
  { name: 'Learn', path: '/course' },
  { name: 'Chords', path: '/library' },
  { name: 'Tuner', path: '/tuner' },
  { name: 'Settings', path: '/settings' },
];

test('navigates every destination via the visible nav and marks the active route', async ({
  page,
}, testInfo) => {
  await completeOnboarding(page);
  const width = page.viewportSize()?.width ?? 1440;

  const dock = page.getByTestId('nav-dock');
  const rail = page.getByTestId('nav-rail');
  const sidebar = page.getByTestId('nav-sidebar');

  if (width < 640) {
    await expect(dock).toBeVisible();
    await expect(sidebar).toBeHidden();
  } else if (width >= 1200) {
    await expect(sidebar).toBeVisible();
    await expect(dock).toBeHidden();
  } else {
    await expect(rail).toBeVisible();
    await expect(dock).toBeHidden();
    await expect(sidebar).toBeHidden();
  }

  const nav = width < 640 ? dock : width >= 1200 ? sidebar : rail;

  for (const dest of destinations) {
    await nav.getByRole('link', { name: dest.name }).click();
    await expectPath(page, dest.path);
    await expect(nav.getByRole('link', { name: dest.name })).toHaveAttribute(
      'aria-current',
      'page',
    );
  }

  // Start redirects an already-onboarded profile straight to /today, so it never shows as
  // the active route itself — just check the link works. On the mobile dock, Playwright's
  // actionability check reports the click point as covered by unrelated Settings content
  // even though it visibly isn't (getBoundingClientRect/elementFromPoint agree it's clear
  // right before the click) — most likely a hit-testing quirk with the dock's
  // backdrop-filter blur. force: true skips that check; the rail/sidebar don't use
  // backdrop-filter and don't need it.
  await nav
    .getByRole('link', { name: 'Start' })
    .click({ force: testInfo.project.name === 'mobile' });
  await expectPath(page, '/today');
});

test('toggling Motion off sets data-motion on the html element', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('radio', { name: 'Off' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
});
