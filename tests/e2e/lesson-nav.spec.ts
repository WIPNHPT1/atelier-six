import { expect, test } from '@playwright/test';

test('the module crumb on a lesson links back to its module', async ({ page }) => {
  await page.goto('/lesson/power-vi-iv-i-v-d');
  const main = page.locator('#main');
  await main.getByRole('link', { name: 'Power chords', exact: true }).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe('/course/power');
});

test('the Learn crumb segment links to the course page', async ({ page }) => {
  await page.goto('/lesson/power-vi-iv-i-v-d');
  const main = page.locator('#main');
  await main.getByRole('link', { name: 'Learn', exact: true }).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe('/course');
});

test('the lesson pager steps forward and back through the module', async ({ page }) => {
  await page.goto('/lesson/power-vi-iv-i-v-d');
  const main = page.locator('#main');
  const title = await main.getByRole('heading', { level: 1 }).textContent();

  const nextLink = main.getByRole('navigation', { name: 'Lesson navigation' }).getByRole('link', {
    name: /→$/,
  });
  await expect(nextLink).toBeVisible();
  const nextHref = await nextLink.getAttribute('href');
  await nextLink.click();
  await expect.poll(() => new URL(page.url()).pathname).toBe(nextHref);

  const prevLink = main.getByRole('navigation', { name: 'Lesson navigation' }).getByRole('link', {
    name: /^←/,
  });
  await expect(prevLink).toBeVisible();
  await prevLink.click();
  await expect(main.getByRole('heading', { level: 1 })).toHaveText(title ?? '');
});

test('the module page crumb links back to the course', async ({ page }) => {
  await page.goto('/course/power');
  const main = page.locator('#main');
  await main.getByRole('link', { name: 'Learn', exact: true }).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe('/course');
});

test('the course module page links to the next module', async ({ page }) => {
  await page.goto('/course/power');
  const main = page.locator('#main');
  const nav = main.getByRole('navigation', { name: 'Module navigation' });
  await expect(nav.getByRole('link', { name: /^←/ })).toHaveCount(0);
  await nav.getByRole('link', { name: /Open chords/ }).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe('/course/open');
  await expect(nav.getByRole('link', { name: /^←.*Power/ })).toBeVisible();
});
