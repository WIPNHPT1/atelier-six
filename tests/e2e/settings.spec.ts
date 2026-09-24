import { expect, test, type Page } from '@playwright/test';

async function goInApp(page: Page, path: string) {
  await page.evaluate((next) => {
    history.pushState({}, '', next);
    dispatchEvent(new PopStateEvent('popstate'));
  }, path);
  await expect.poll(() => new URL(page.url()).pathname).toBe(path);
}

test('toggling left-handed mirrors the fretboard', async ({ page }) => {
  await page.goto('/library');
  const main = page.locator('#main');
  await main.getByRole('radio', { name: 'Open (Britpop)' }).click();
  const card = main.getByRole('button', { name: 'C', exact: true });
  const dot = card.locator('[data-testid="fretboard-dot"] circle').first();
  await expect(dot).toBeVisible();
  const before = await dot.getAttribute('cx');

  await goInApp(page, '/settings');
  await main.getByRole('switch', { name: 'Left-handed' }).click();

  await goInApp(page, '/library');
  await main.getByRole('radio', { name: 'Open (Britpop)' }).click();
  const dotAfter = main
    .getByRole('button', { name: 'C', exact: true })
    .locator('[data-testid="fretboard-dot"] circle')
    .first();
  await expect(dotAfter).toBeVisible();
  const after = await dotAfter.getAttribute('cx');
  expect(after).not.toBe(before);
});

test('setting drop D tuning adds a one-finger power shape to the library', async ({ page }) => {
  await page.goto('/library');
  const main = page.locator('#main');
  // The chord detail Sheet is portalled to <body>, so it's queried on the page, not #main.
  const shapes = page.locator('[data-testid="chord-shape"]');

  await main.locator('input[type="text"]').fill('D5');
  await main.getByRole('button', { name: 'D5', exact: true }).click();
  const before = await shapes.count();
  await page.getByRole('button', { name: 'Close' }).click();

  await goInApp(page, '/settings');
  await main.getByRole('radio', { name: 'Drop D' }).click();

  await goInApp(page, '/library');
  await main.locator('input[type="text"]').fill('D5');
  await main.getByRole('button', { name: 'D5', exact: true }).click();
  await expect.poll(() => shapes.count()).toBe(before + 1);
});

test('a capo lesson shows what the shape sounds as', async ({ page }) => {
  await page.goto('/lesson/open-capo-2');
  const main = page.locator('#main');
  await expect(main.locator('[data-testid="sounds-as"]')).toBeVisible();
});
