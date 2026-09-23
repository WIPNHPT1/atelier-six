import { expect, test } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'
import type { Result } from 'axe-core'

const REFERENCE_PROJECTS = ['mobile', 'tablet', 'desktop']

test('design page has zero serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/design')
  const results = await new AxeBuilder({ page }).analyze()
  const seriousOrCritical = results.violations.filter(
    (violation: Result) => violation.impact === 'serious' || violation.impact === 'critical',
  )
  expect(seriousOrCritical).toEqual([])
})

test('screenshots the design page for visual reference', async ({ page }, testInfo) => {
  test.skip(
    !REFERENCE_PROJECTS.includes(testInfo.project.name),
    'reference screenshots only need one capture per viewport',
  )
  await page.goto('/design')
  await page.screenshot({
    path: `docs/screenshots/design-${testInfo.project.name}.png`,
    fullPage: true,
  })
})
