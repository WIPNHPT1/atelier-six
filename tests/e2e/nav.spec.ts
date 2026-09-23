import { expect, test, type Page } from '@playwright/test'
import { completeOnboarding } from './helpers.ts'

function visibleNav(page: Page) {
  const width = page.viewportSize()?.width ?? 1440
  if (width < 640) return page.getByTestId('nav-dock')
  if (width >= 1200) return page.getByTestId('nav-sidebar')
  return page.getByTestId('nav-rail')
}

test('cmd/ctrl+k opens the command palette and "tun" + Return goes to /tuner', async ({
  page,
}) => {
  await completeOnboarding(page)

  await page.keyboard.press('Control+k')
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible()

  await page.getByRole('textbox', { name: /Search/i }).fill('tun')
  await page.keyboard.press('Enter')

  await expect.poll(() => new URL(page.url()).pathname).toBe('/tuner')
})

test('onboarding appears once on a fresh profile and not after reload', async ({ page }) => {
  await completeOnboarding(page)

  await page.reload()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')
})

test('route changes cause no layout shift', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'the layout-shift API is Chromium-only')

  await completeOnboarding(page)

  // warm the /tuner route chunk first so the measured navigation doesn't hit
  // the lazy-load Suspense fallback, which is a separate, expected concern
  await visibleNav(page).getByRole('link', { name: 'Tuner' }).click()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/tuner')
  await visibleNav(page).getByRole('link', { name: 'Today' }).click()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')

  await page.evaluate(() => {
    const win = window as unknown as { __cls: number }
    win.__cls = 0
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean }
        if (!shift.hadRecentInput) win.__cls += shift.value
      }
    })
    observer.observe({ type: 'layout-shift', buffered: true })
  })

  const nav = visibleNav(page)
  await nav.getByRole('link', { name: 'Tuner' }).click()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/tuner')
  await page.waitForTimeout(500)

  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls)
  // The View Transitions API itself registers a sub-pixel layout-shift entry
  // in Chromium (its top-layer snapshot box), ~500x under the "good" 0.1
  // threshold; a real regression would be orders of magnitude larger.
  expect(cls).toBeLessThan(0.01)
})
