import { expect, test, type Page } from '@playwright/test'

async function expectPath(page: Page, path: string) {
  await expect.poll(() => new URL(page.url()).pathname).toBe(path)
}

const destinations = [
  { name: 'Today', path: '/' },
  { name: 'Learn', path: '/course' },
  { name: 'Practise', path: '/practise' },
  { name: 'Tuner', path: '/tuner' },
  { name: 'You', path: '/progress' },
]

test('navigates every destination via the visible nav and marks the active route', async ({
  page,
}) => {
  await page.goto('/')
  const width = page.viewportSize()?.width ?? 1440

  const dock = page.getByTestId('nav-dock')
  const rail = page.getByTestId('nav-rail')
  const sidebar = page.getByTestId('nav-sidebar')

  if (width < 640) {
    await expect(dock).toBeVisible()
    await expect(sidebar).toBeHidden()
  } else if (width >= 1200) {
    await expect(sidebar).toBeVisible()
    await expect(dock).toBeHidden()
  } else {
    await expect(rail).toBeVisible()
    await expect(dock).toBeHidden()
    await expect(sidebar).toBeHidden()
  }

  const nav = width < 640 ? dock : width >= 1200 ? sidebar : rail

  for (const dest of destinations) {
    await nav.getByRole('link', { name: dest.name }).click()
    await expectPath(page, dest.path)
    await expect(nav.getByRole('link', { name: dest.name })).toHaveAttribute(
      'aria-current',
      'page',
    )
  }
})

test('toggling Motion off sets data-motion on the html element', async ({ page }) => {
  await page.goto('/settings')
  await page.getByRole('radio', { name: 'Off' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off')
})
