import { expect, test } from '@playwright/test';
import { completeOnboarding, seriousViolations } from './helpers.ts';

const ROUTES = [
  '/',
  '/course',
  '/course/power',
  '/library',
  '/library/C',
  '/lesson/power-vi-iv-i-v-d',
  '/foundations',
  '/foundations/read-tab',
  '/practise',
  '/drills?kind=minute&from=C.open.a&to=Am.open',
  '/tuner',
  '/progress',
  '/settings',
  '/design',
  '/onboarding',
];

test('every route has zero serious or critical accessibility violations', async ({ page }) => {
  await completeOnboarding(page);

  for (const route of ROUTES) {
    await page.goto(route);
    await page.locator('#main').waitFor({ state: 'visible' });
    await page.waitForLoadState('networkidle');
    expect(await seriousViolations(page), route).toEqual([]);
  }
});
