import { useSettingsStore } from '../../app/settingsStore';

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
  | 'fT';

// rosewood/rosewood-2 are translucent white glass tints in the real tokens (so they
// work as a border-color and gradient stop too); these are flattened, opaque
// approximations of that tint over the page background, just for this swatch page.
const DARK_TOKENS: Record<TokenName, string> = {
  ebony: '#121212',
  rosewood: '#1e1e1e',
  'rosewood-2': '#272727',
  bone: '#f2f2f0',
  'bone-dim': '#8a8a86',
  brass: '#f2f2f0',
  'brass-hi': '#ffffff',
  f1: '#8fa68a',
  f2: '#6f84a0',
  f3: '#c07a5a',
  f4: '#9a7aa0',
  fT: '#b8925a',
};

const LIGHT_TOKENS: Record<TokenName, string> = {
  ebony: '#f2f2f2',
  rosewood: '#e8e8e8',
  'rosewood-2': '#e0e0e0',
  bone: '#121110',
  'bone-dim': '#5b5550',
  brass: '#121110',
  'brass-hi': '#000000',
  f1: '#81957c',
  f2: '#647790',
  f3: '#ad6e51',
  f4: '#8b6e90',
  fT: '#7a5c37',
};

function resolveMode(mode: 'dark' | 'light' | 'system'): 'dark' | 'light' {
  if (mode !== 'system') return mode;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function useLiveTokens(): Record<TokenName, string> {
  const mode = useSettingsStore((s) => s.mode);
  return resolveMode(mode) === 'light' ? LIGHT_TOKENS : DARK_TOKENS;
}
