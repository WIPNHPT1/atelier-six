import { expect, test } from '@playwright/test';

// Playwright requires the fixtures param to be destructured, even when nothing is used from it.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'measured on the desktop project only');
});

test('living strings keeps average frame time reasonably close to 60 fps during playback', async ({
  page,
}) => {
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
  // This runs alongside other parallel workers/browsers (fullyParallel), which itself adds
  // a couple of ms of noise — measured 16.61 ms in isolation (recorded in PROGRESS.md, 9.3),
  // the real 60 fps figure. This check just catches a real regression, not that exact number.
  expect(averageMs).toBeLessThan(20);
});
