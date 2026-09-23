import { describe, expect, it } from 'vitest'
import { fuzzyMatch, fuzzySearch } from './fuzzy'

describe('fuzzyMatch', () => {
  it('matches a subsequence case-insensitively', () => {
    const match = fuzzyMatch('tun', 'Tuner')
    expect(match).not.toBeNull()
    expect(match?.indices).toEqual([0, 1, 2])
  })

  it('returns null when the query is not a subsequence', () => {
    expect(fuzzyMatch('tun', 'Settings')).toBeNull()
  })

  it('matches out-of-order-looking but valid subsequences', () => {
    const match = fuzzyMatch('crd', 'Chords')
    expect(match).not.toBeNull()
  })

  it('scores a match at a word boundary higher than mid-word', () => {
    const boundary = fuzzyMatch('se', 'Settings')
    const midWord = fuzzyMatch('et', 'Settings')
    expect(boundary).not.toBeNull()
    expect(midWord).not.toBeNull()
    expect(boundary?.score ?? 0).toBeGreaterThan(midWord?.score ?? 0)
  })

  it('returns a zero-score match for an empty query', () => {
    expect(fuzzyMatch('', 'Today')).toEqual({ score: 0, indices: [] })
  })
})

describe('fuzzySearch', () => {
  const items = ['Today', 'Tuner', 'Settings', 'Drills']

  it('finds and ranks matching items', () => {
    const results = fuzzySearch('tun', items, (item) => item)
    expect(results).toHaveLength(1)
    expect(results[0]?.item).toBe('Tuner')
  })

  it('returns every item unscored for an empty query', () => {
    const results = fuzzySearch('', items, (item) => item)
    expect(results).toHaveLength(items.length)
  })

  it('ranks a better match above a weaker one', () => {
    const results = fuzzySearch('t', items, (item) => item)
    const labels = results.map((r) => r.item)
    expect(labels).toContain('Today')
    expect(labels).toContain('Tuner')
    expect(labels).toContain('Settings')
  })
})
