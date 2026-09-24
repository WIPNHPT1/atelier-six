import { expect, type Page } from '@playwright/test';

export async function completeOnboarding(page: Page) {
  await page.goto('/');
  await expect.poll(() => new URL(page.url()).pathname).toBe('/onboarding');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Start' }).click();
  // Onboarding ends on the recommended first lesson; tests carry on from Today.
  await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/lesson\//);
  await page.goto('/');
  await expect.poll(() => new URL(page.url()).pathname).toBe('/');
}
