import { expect, type Page } from '@playwright/test';

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
