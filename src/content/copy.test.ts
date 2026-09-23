import { describe, expect, it } from 'vitest'
import { t } from './copy.en-GB'

describe('t', () => {
  it('resolves a nested copy path', () => {
    expect(t('nav.today')).toBe('Today')
  })

  it('interpolates {name} placeholders', () => {
    expect(t('lesson.keepFingers', { fingers: 1 })).toBe('Keep finger 1 where it is.')
  })
})
