import { expect, test } from '@playwright/test';

test.use({ launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } });

// Playwright requires the fixtures param to be destructured, even when nothing is used from it.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Keyboard shortcuts are a desktop input path');
});

test('keyboard shortcuts play, step through chords and open the help overlay', async ({
  page,
}) => {
  await page.goto('/lesson/demo');
  const main = page.locator('#main');
  await expect(main.getByRole('button', { name: 'Play', exact: true })).toBeVisible();

  await page.keyboard.press('Space');
  await expect(main.getByRole('button', { name: 'Stop', exact: true })).toBeVisible();
  await main.getByRole('button', { name: 'Stop', exact: true }).click();

  const now = page.locator('[data-now-bar]');
  const before = await now.getAttribute('data-now-bar');
  await page.keyboard.press('PageDown');
  await expect.poll(() => now.getAttribute('data-now-bar')).not.toBe(before);

  await page.keyboard.press('?');
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible();
});
