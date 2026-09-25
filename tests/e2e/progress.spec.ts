import { expect, test } from '@playwright/test';
import { seriousViolations } from './helpers.ts';

test('a one-minute drill score shows on Progress and survives a reload', async ({ page }) => {
  await page.clock.install();
  await page.goto('/drills?kind=minute&from=C.open.a&to=Am.open');
  await page.getByRole('button', { name: 'Start the minute' }).click();

  const change = page.getByRole('button', { name: 'Change', exact: true });
  for (let tap = 0; tap < 5; tap++) await change.click();
  await expect(page.getByText('5 changes')).toBeVisible();

  await page.clock.fastForward(61_000);
  await expect(page.getByText('Time! 5 clean changes.')).toBeVisible();

  await page.goto('/progress');
  await expect(page.getByTestId('minute-score')).toContainText('Best 5');
  await page.reload();
  await expect(page.getByTestId('minute-score')).toContainText('Best 5');
});

test('progress, course, lesson and drill pages have no serious accessibility violations', async ({
  page,
}) => {
  await page.goto('/drills?from=G.open.b&to=C.open.a');
  await page.getByRole('button', { name: /^Clean/ }).click();
  await page.getByRole('button', { name: /^Missed/ }).click();
  await expect(page.getByText('50 % clean')).toBeVisible();
  // In-app navigation keeps the just-recorded progress in memory.
  await page.evaluate(() => {
    history.pushState({}, '', '/progress');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByRole('link', { name: 'Drill G → C' })).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);

  for (const path of ['/course', '/course/power', '/lesson/open-c-am', '/drills']) {
    await page.goto(path);
    await expect(page.locator('#main h1').first()).toBeVisible();
    expect(await seriousViolations(page), path).toEqual([]);
  }
});
