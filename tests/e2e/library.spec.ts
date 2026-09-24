import { expect, test } from '@playwright/test';

test('Open tab shows all 3 non-barre G shapes and compares a grouped move with C', async ({
  page,
}) => {
  await page.goto('/library');

  await page.getByRole('radio', { name: /Open/i }).click();
  await page.getByRole('button', { name: 'G', exact: true }).click();

  const dialog = page.getByRole('dialog', { name: 'G' });
  await expect(dialog.getByTestId('chord-shape')).toHaveCount(3);

  await dialog.getByRole('combobox').selectOption('C');

  await expect(dialog.getByText(/together/)).toBeVisible();
});
