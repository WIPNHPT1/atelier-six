import { expect, test } from '@playwright/test';

test.use({ launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } });

test('Play advances the playhead and Stop freezes it', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'audio gesture policy is Chromium-only in CI');

  await page.goto('/lesson/demo');

  const lane = page.locator('[data-playhead-step]');
  const main = page.locator('#main');
  // Count-in is on by default and now genuinely delays the first bar; this test is about the
  // playhead mechanics, not the count-in, so turn it off to keep the timing simple.
  await main.getByRole('switch', { name: 'Count-in' }).click();
  await main.getByRole('button', { name: 'Play', exact: true }).click();

  const first = await lane.getAttribute('data-playhead-step');
  await page.waitForTimeout(1500);
  const second = await lane.getAttribute('data-playhead-step');
  expect(Number(second)).toBeGreaterThan(Number(first));

  await main.getByRole('button', { name: 'Stop', exact: true }).click();
  const afterStop = await lane.getAttribute('data-playhead-step');
  await page.waitForTimeout(300);
  const afterWait = await lane.getAttribute('data-playhead-step');
  expect(afterWait).toBe(afterStop);
});
