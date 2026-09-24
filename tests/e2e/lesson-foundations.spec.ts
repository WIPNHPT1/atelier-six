import { expect, test, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import type { Result } from 'axe-core';
import { completeOnboarding } from './helpers.ts';

const LESSONS = ['read-tab', 'hold', 'tune-up', 'fretting', 'hand-health'];

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  return results.violations.filter(
    (violation: Result) => violation.impact === 'serious' || violation.impact === 'critical',
  );
}

test('Foundations appears first on the Course page for a new player', async ({ page }) => {
  await completeOnboarding(page);
  await page.goto('/course');
  const cards = page.locator('#main ul li a');
  await expect(cards.first()).toHaveAttribute('href', '/foundations');
  await cards.first().click();
  await expect(page.getByRole('link', { name: /^Start / })).toHaveCount(LESSONS.length);
});

test('each Foundations lesson works and is accessible', async ({ page }) => {
  for (const id of LESSONS) {
    await page.goto(`/foundations/${id}`);
    await expect(page.locator('#main h1')).toBeVisible();
    expect(await seriousViolations(page), id).toEqual([]);
  }

  await page.goto('/foundations/read-tab');
  await page.getByRole('button', { name: 'Note 1: A string, fret 3' }).click();
  await expect(page.getByTestId('lit-note')).toContainText('A string, fret 3');

  await page.goto('/foundations/fretting');
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'Rang clearly' }).click();
  await expect(page.getByRole('status')).toContainText('Every string rang clearly');

  await page.goto('/foundations/hand-health');
  await page.getByRole('button', { name: 'Start the warm-up' }).click();
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
});
