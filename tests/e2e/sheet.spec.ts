import { expect, test, type Locator, type Page } from '@playwright/test';

async function isOnTop(page: Page, target: Locator): Promise<boolean> {
  const box = await target.boundingBox();
  if (box === null) return false;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const handle = await target.elementHandle();
  return page.evaluate(
    ([px, py, el]) => {
      const hit = document.elementFromPoint(px, py);
      return hit !== null && (el === hit || el.contains(hit));
    },
    [x, y, handle] as const,
  );
}

test('an open sheet sits above the floating search button and nav, and its close button works', async ({
  page,
}) => {
  await page.goto('/library');
  await page.getByRole('radio', { name: /Open/i }).click();
  await page.getByRole('button', { name: 'G', exact: true }).click();

  const dialog = page.getByRole('dialog', { name: 'G' });
  await expect(dialog).toBeVisible();

  const close = dialog.getByRole('button', { name: 'Close' });
  expect(await isOnTop(page, close)).toBe(true);

  // App chrome must be covered while the sheet is open, never drawn over it.
  const chrome = [page.getByRole('button', { name: 'Search' }), page.getByTestId('nav-dock')];
  for (const control of chrome) {
    if (await control.isVisible()) {
      expect(await isOnTop(page, control)).toBe(false);
    }
  }

  await close.click();
  await expect(dialog).toBeHidden();
});

test('the floating search button only shows on phone-width screens', async ({ page }) => {
  await page.goto('/library');
  const width = page.viewportSize()?.width ?? 1440;
  const floating = page.getByTestId('mobile-search');
  if (width < 640) {
    await expect(floating).toBeVisible();
  } else {
    await expect(floating).toBeHidden();
  }
});
