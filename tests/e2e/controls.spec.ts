import { expect, test, type Page } from '@playwright/test';

async function goToOnboardingStep(page: Page, step: number) {
  await page.goto('/onboarding');
  for (let i = 1; i < step; i++) {
    await page.getByRole('button', { name: 'Next' }).click();
  }
}

async function expectLabelsFit(page: Page, groupName: string) {
  const radios = page.getByRole('radiogroup', { name: groupName }).getByRole('radio');
  await expect(radios.first()).toBeVisible();
  const overflow = await radios.evaluateAll((buttons) =>
    buttons
      .filter((b) => b.scrollHeight > b.clientHeight + 1 || b.scrollWidth > b.clientWidth + 1)
      .map((b) => b.textContent),
  );
  expect(overflow).toEqual([]);
}

test('onboarding choice labels fit inside their buttons', async ({ page }) => {
  await goToOnboardingStep(page, 3);
  await expectLabelsFit(page, 'Your level');
  await page.getByRole('button', { name: 'Next' }).click();
  await expectLabelsFit(page, 'Tuning');
});

test('a slider can be dragged by its handle', async ({ page }) => {
  await goToOnboardingStep(page, 4);
  const slider = page.getByRole('slider', { name: 'Capo' });
  await expect(slider).toHaveValue('0');

  const track = page.getByTestId('slider-track').first();
  const box = await track.boundingBox();
  if (box === null) throw new Error('slider track not rendered');
  const y = box.y + box.height / 2;

  // press on the visible handle (value 0 = left end), then drag right
  await page.mouse.move(box.x + 1, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.4, y, { steps: 6 });
  await page.mouse.move(box.x + box.width * 0.72, y, { steps: 6 });
  await page.mouse.up();

  await expect(slider).toHaveValue('5');
});
