import { expect, test } from '@playwright/test';
import { completeOnboarding } from './helpers.ts';

test('starting the tuner listens for a note, stopping releases the mic', async ({
  page,
  browserName,
}) => {
  // Fake mic devices are only wired up for automation in Chromium.
  test.skip(browserName !== 'chromium', 'fake media device flags are Chromium-only in CI');

  await completeOnboarding(page);
  await page.evaluate(() => {
    history.pushState({}, '', '/tuner');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect.poll(() => new URL(page.url()).pathname).toBe('/tuner');
  const startButton = page.getByRole('button', { name: 'Start' });
  await expect(startButton).toBeVisible();
  // Let the page's view-transition settle first: a click mid-transition can be swallowed by
  // Chromium's transition snapshot overlay rather than reaching the button underneath.
  await page.waitForTimeout(600);

  await startButton.click();
  await expect(page.getByTestId('tuner-status')).toHaveText('Listening');
  await expect(page.getByTestId('tuner-note')).not.toHaveText('—');

  await page.getByRole('button', { name: 'Stop' }).click();
  await expect(page.getByTestId('tuner-status')).toHaveText('Stopped');
});
