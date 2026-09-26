import { expect, test } from '@playwright/test';

test.describe('demo mode', () => {
  test('the scripted tour reaches its final step within 25 s', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Audio playback needs a real user gesture');
    test.setTimeout(45_000);
    await page.goto('/?demo=1');
    await page.getByTestId('demo-start').getByRole('button').click();
    await expect(page.locator('html')).toHaveAttribute('data-demo-step', 'done', {
      timeout: 25_000,
    });
    await expect(page).toHaveURL(/\/tuner$/);
    expect(await page.locator('html').getAttribute('data-demo-missed')).toBeNull();
  });
});
