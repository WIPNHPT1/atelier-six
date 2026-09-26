import { expect, test } from '@playwright/test';

test('works fully offline after the service worker installs', async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'service workers are unreliable under Playwright elsewhere',
  );

  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);

  // Playback needs the sample audio too — the app shell precaches code, not
  // the (large, opt-in) sample set, so download it first via Settings.
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Download sounds for offline' }).click();
  await expect(page.getByText('Sounds are ready offline')).toBeVisible({ timeout: 30_000 });

  await context.setOffline(true);
  await page.reload();

  await page.goto('/lesson/demo');
  const lane = page.locator('[data-playhead-step]');
  const main = page.locator('#main');
  await main.getByRole('switch', { name: 'Count-in' }).click();
  await main.getByRole('button', { name: 'Play', exact: true }).click();

  const first = await lane.getAttribute('data-playhead-step');
  await page.waitForTimeout(1500);
  const second = await lane.getAttribute('data-playhead-step');
  expect(Number(second)).toBeGreaterThan(Number(first));
});
