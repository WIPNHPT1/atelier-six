import { useSettingsStore } from '../../app/settingsStore'

export type TokenName =
  | 'ebony'
  | 'rosewood'
  | 'rosewood-2'
  | 'bone'
  | 'bone-dim'
  | 'brass'
  | 'brass-hi'
  | 'f1'
  | 'f2'
  | 'f3'
  | 'f4'
  | 'fT'

const DARK_TOKENS: Record<TokenName, string> = {
  ebony: '#121110',
  rosewood: '#2b211d',
  'rosewood-2': '#3a2d27',
  bone: '#efeae1',
  'bone-dim': '#a69e92',
  brass: '#b8925a',
  'brass-hi': '#d9b77e',
  f1: '#8fa68a',
  f2: '#6f84a0',
  f3: '#c07a5a',
  f4: '#9a7aa0',
  fT: '#b8925a',
}

const LIGHT_TOKENS: Record<TokenName, string> = {
  ebony: '#efeae1',
  rosewood: '#e3dccf',
  'rosewood-2': '#d6cdbb',
  bone: '#121110',
  'bone-dim': '#5b5550',
  brass: '#7a5c37',
  'brass-hi': '#9b815b',
  f1: '#81957c',
  f2: '#647790',
  f3: '#ad6e51',
  f4: '#8b6e90',
  fT: '#7a5c37',
}

function resolveMode(mode: 'dark' | 'light' | 'system'): 'dark' | 'light' {
  if (mode !== 'system') return mode
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function useLiveTokens(): Record<TokenName, string> {
  const mode = useSettingsStore((s) => s.mode)
  return resolveMode(mode) === 'light' ? LIGHT_TOKENS : DARK_TOKENS
}
