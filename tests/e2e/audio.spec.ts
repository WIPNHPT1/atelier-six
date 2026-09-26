import { expect, test } from '@playwright/test';

test('clicking Hear chord starts the audio engine', async ({ page, browserName }) => {
  // Only Chromium honours --autoplay-policy in automation; Firefox/WebKit never
  // resume a real AudioContext from a Playwright-dispatched click in headless CI.
  test.skip(browserName !== 'chromium', 'audio gesture policy is Chromium-only in CI');

  await page.goto('/library');

  await page.getByRole('button', { name: 'G5', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'G5' });
  await dialog.getByRole('button', { name: 'Hear chord' }).first().click();

  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { __a6audio?: { state: string } }).__a6audio?.state,
      ),
    )
    .toBe('running');
});
