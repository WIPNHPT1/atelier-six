import { expect, test } from '@playwright/test';

test.use({ launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } });

async function openFirstOpenLesson(page: import('@playwright/test').Page) {
  await page.goto('/course/open');
  await page
    .locator('#main')
    .getByRole('link', { name: /^Start / })
    .first()
    .click();
  await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/lesson\/open-/);
}

test('switching to Chorus changes the tab', async ({ page }) => {
  await openFirstOpenLesson(page);
  const tab = page.locator('[data-tab-ascii]');
  const verse = await tab.getAttribute('data-tab-ascii');
  expect(verse).toBeTruthy();

  await page.getByRole('radio', { name: 'Chorus', exact: true }).click();
  await expect.poll(() => tab.getAttribute('data-tab-ascii')).not.toBe(verse);
});

test('Play moves the playhead', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'audio gesture policy is Chromium-only in CI');
  await openFirstOpenLesson(page);
  await page.getByRole('radio', { name: 'Chorus', exact: true }).click();

  const lane = page.locator('[data-playhead-step]');
  await page.locator('#main').getByRole('button', { name: 'Play', exact: true }).click();
  await expect(
    page.locator('#main').getByRole('button', { name: 'Stop', exact: true }),
  ).toBeVisible();
  const first = Number(await lane.getAttribute('data-playhead-step'));
  await expect
    .poll(async () => Number(await lane.getAttribute('data-playhead-step')))
    .toBeGreaterThan(first);
});
