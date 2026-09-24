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

// The highlighted tab column is always on the chord being played (read together, in one frame).
async function expectTabFollowsChord(
  page: import('@playwright/test').Page,
  now: import('@playwright/test').Locator,
) {
  await expect(now).toBeVisible();
  let compared = 0;
  for (let check = 0; check < 12; check++) {
    const pair = await page.evaluate(() => {
      const active = document.querySelector('[data-active="true"]');
      const shown = document.querySelector('[data-now-bar]');
      return {
        tab: active?.getAttribute('data-chord-index') ?? null,
        now: shown?.getAttribute('data-now-bar') ?? null,
      };
    });
    if (pair.tab !== null) {
      expect(pair.tab).toBe(pair.now);
      compared++;
    }
    await page.waitForTimeout(250);
  }
  expect(compared).toBeGreaterThan(6);
}

test('while playing, the tab highlight stays on the chord being played', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'audio gesture policy is Chromium-only in CI');
  await page.goto('/lesson/power-vi-iv-i-v-d');
  await page.locator('#main').getByRole('button', { name: 'Play', exact: true }).click();
  await expectTabFollowsChord(page, page.locator('[data-now-bar]'));
});

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

test('the module tune plays in performance mode with the band', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'audio gesture policy is Chromium-only in CI');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/course/power');
  await page.locator('#main').getByRole('link', { name: 'Play the tune' }).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe('/lesson/tune-power');
  await expect(page.getByRole('radio', { name: 'Performance' })).toHaveAttribute(
    'aria-checked',
    'true',
  );

  const lane = page.locator('[data-playhead-step]');
  await page.locator('#main').getByRole('button', { name: 'Play', exact: true }).click();
  await expect(
    page.locator('#main').getByRole('button', { name: 'Stop', exact: true }),
  ).toBeVisible();
  const first = Number(await lane.getAttribute('data-playhead-step'));
  await expect
    .poll(async () => Number(await lane.getAttribute('data-playhead-step')))
    .toBeGreaterThan(first);
  // Let the band, fills and muted strums play for a few seconds without any audio errors.
  await page.waitForTimeout(4000);
  expect(errors).toEqual([]);
});

test('the Britpop tune plays its layered band without errors', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'audio gesture policy is Chromium-only in CI');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/lesson/tune-open');
  await page.locator('#main').getByRole('button', { name: 'Play', exact: true }).click();
  await expect(
    page.locator('#main').getByRole('button', { name: 'Stop', exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(4000);
  expect(errors).toEqual([]);
});

test('the Metronome toggle actually plays the click track', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'audio gesture policy is Chromium-only in CI');
  await page.goto('/lesson/power-vi-iv-i-v-d');
  const main = page.locator('#main');
  await main.getByRole('switch', { name: 'Metronome' }).click();
  await main.getByRole('button', { name: 'Play', exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __a6clicks?: number }).__a6clicks), {
      timeout: 5000,
    })
    .toBeGreaterThan(0);
});

test('Count-in plays clicks before the lesson starts', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'audio gesture policy is Chromium-only in CI');
  await page.goto('/lesson/power-vi-iv-i-v-d');
  const main = page.locator('#main');
  // Metronome off, Count-in on (the default): any clicks heard must be the count-in.
  await main.getByRole('button', { name: 'Play', exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __a6clicks?: number }).__a6clicks), {
      timeout: 5000,
    })
    .toBeGreaterThan(0);
});

test('after a tempo change the chord shown stays with the bar being played', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'audio gesture policy is Chromium-only in CI');
  await openFirstOpenLesson(page);
  const lane = page.locator('[data-playhead-step]');
  const now = page.locator('[data-now-bar]');
  const main = page.locator('#main');
  await main.getByRole('button', { name: 'Play', exact: true }).click();
  await expect
    .poll(async () => Number(await lane.getAttribute('data-playhead-step')), { timeout: 15_000 })
    .toBeGreaterThan(20);

  const before = Number(await lane.getAttribute('data-playhead-step'));
  await main.getByRole('button', { name: /^Clean/ }).click();
  await page.waitForTimeout(300);
  const after = Number(await lane.getAttribute('data-playhead-step'));
  // Carries on from the same place (it used to jump back to the start).
  expect(after).toBeGreaterThanOrEqual(before - 1);

  await expectTabFollowsChord(page, now);
});

test('marking a lesson complete shows up on its course module page', async ({ page }) => {
  await page.goto('/lesson/power-vi-iv-i-v-d');
  const main = page.locator('#main');
  const title = await main.getByRole('heading', { level: 1 }).textContent();

  await main.getByRole('switch', { name: 'Mark complete' }).click();
  await expect(main.getByRole('switch', { name: 'Completed' })).toHaveAttribute(
    'aria-checked',
    'true',
  );

  await page.evaluate(() => {
    history.pushState({}, '', '/course/power');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect.poll(() => new URL(page.url()).pathname).toBe('/course/power');

  const row = page.locator('li', { hasText: title ?? '' });
  await expect(row.getByText('Done', { exact: true })).toBeVisible();
});
