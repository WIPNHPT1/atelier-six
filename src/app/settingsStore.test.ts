import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useApplySettings, useMotionEnabled, useSettingsStore } from './settingsStore'

function resetStore() {
  useSettingsStore.setState({
    mode: 'dark',
    finish: 'nitro',
    motion: 'system',
    sound: true,
    leftHanded: false,
    tuning: 'standard',
    capo: 0,
    level: 'new',
    onboardingComplete: false,
  })
}

describe('settingsStore', () => {
  beforeEach(() => {
    resetStore()
    document.documentElement.removeAttribute('data-mode')
    document.documentElement.removeAttribute('data-finish')
    document.documentElement.removeAttribute('data-motion')
    document.documentElement.removeAttribute('data-hand')
  })

  afterEach(() => {
    resetStore()
  })

  it('starts with sensible defaults', () => {
    const state = useSettingsStore.getState()
    expect(state.mode).toBe('dark')
    expect(state.finish).toBe('nitro')
    expect(state.capo).toBe(0)
  })

  it('clamps capo between 0 and 7', () => {
    act(() => {
      useSettingsStore.getState().setCapo(12)
    })
    expect(useSettingsStore.getState().capo).toBe(7)

    act(() => {
      useSettingsStore.getState().setCapo(-3)
    })
    expect(useSettingsStore.getState().capo).toBe(0)
  })

  it('applies settings as data attributes on the html element', () => {
    renderHook(() => {
      useApplySettings()
    })

    act(() => {
      useSettingsStore.getState().setMode('light')
      useSettingsStore.getState().setFinish('xerox')
      useSettingsStore.getState().setMotion('off')
      useSettingsStore.getState().setLeftHanded(true)
    })

    expect(document.documentElement.getAttribute('data-mode')).toBe('light')
    expect(document.documentElement.getAttribute('data-finish')).toBe('xerox')
    expect(document.documentElement.getAttribute('data-motion')).toBe('off')
    expect(document.documentElement.getAttribute('data-hand')).toBe('left')
  })

  it('resolves motion to a boolean', () => {
    const { result, rerender } = renderHook(() => useMotionEnabled())
    expect(result.current).toBe(true)

    act(() => {
      useSettingsStore.getState().setMotion('off')
    })
    rerender()
    expect(result.current).toBe(false)
  })
})
