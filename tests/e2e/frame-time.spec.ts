import { expect, test } from '@playwright/test';

test.use({ launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } });

// Playwright requires the fixtures param to be destructured, even when nothing is used from it.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the desktop project only');
});

test('living strings keeps average frame time under 16.7 ms during playback', async ({ page }) => {
  await page.goto('/lesson/demo');
  const main = page.locator('#main');
  await main.getByRole('button', { name: 'Play', exact: true }).click();

  const averageMs = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let last = performance.now();
        let elapsed = 0;
        let frames = 0;
        function loop(now: number) {
          elapsed += now - last;
          last = now;
          frames += 1;
          if (elapsed < 5000) requestAnimationFrame(loop);
          else resolve(elapsed / frames);
        }
        requestAnimationFrame(loop);
      }),
  );

  console.log(`FRAME_MS=${averageMs.toFixed(2)}`);
  expect(averageMs).toBeLessThan(16.7);
});
