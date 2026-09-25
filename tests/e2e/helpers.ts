import { expect, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import type { Result } from 'axe-core';

export async function completeOnboarding(page: Page) {
  await page.goto('/');
  await expect.poll(() => new URL(page.url()).pathname).toBe('/onboarding');
  // Welcome, hand, level, tuning, then the first groove.
  for (let step = 0; step < 4; step++) await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('button', { name: 'Play the groove' })).toBeVisible();
  await page.getByRole('button', { name: 'Start' }).click();
  // Onboarding ends on the recommended first lesson; tests carry on from Today.
  await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/lesson\//);
  // In-app navigation (no reload) so the shell's listeners are already attached.
  await page.evaluate(() => {
    history.pushState({}, '', '/');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect.poll(() => new URL(page.url()).pathname).toBe('/');
}

export async function seriousViolations(page: Page): Promise<Result[]> {
  const results = await new AxeBuilder({ page }).analyze();
  return results.violations.filter(
    (violation: Result) => violation.impact === 'serious' || violation.impact === 'critical',
  );
}
