import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const tokensPath = fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url))
const css = readFileSync(tokensPath, 'utf8')

function extractBlock(source: string, selector: string): string {
  const start = source.indexOf(selector)
  if (start === -1) throw new Error(`Selector not found: ${selector}`)
  const braceStart = source.indexOf('{', start)
  const braceEnd = source.indexOf('}', braceStart)
  return source.slice(braceStart + 1, braceEnd)
}

function parseVars(block: string): Record<string, string> {
  const vars: Record<string, string> = {}
  const re = /--([a-zA-Z0-9-]+):\s*([^;]+);/g
  let m: RegExpExecArray | null
  while ((m = re.exec(block))) {
    vars[m[1]] = m[2].trim()
  }
  return vars
}

const rootVars = parseVars(extractBlock(css, ':root'))
const lightVars = parseVars(extractBlock(css, "[data-mode='light']"))
const darkTokens = { ...rootVars }
const lightTokens = { ...rootVars, ...lightVars }

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return [r, g, b]
}

function channelToLinear(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rl, gl, bl] = [channelToLinear(r), channelToLinear(g), channelToLinear(b)]
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}

function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexToRgb(hexA))
  const lumB = relativeLuminance(hexToRgb(hexB))
  const lighter = Math.max(lumA, lumB)
  const darker = Math.min(lumA, lumB)
  return (lighter + 0.05) / (darker + 0.05)
}

const PAIRS: Array<[string, string]> = [
  ['bone', 'ebony'],
  ['bone', 'rosewood'],
  ['bone-dim', 'ebony'],
  ['ebony', 'brass'],
]

const MIN_RATIO = 4.5

let failed = false

for (const [modeName, tokens] of [
  ['dark', darkTokens],
  ['light', lightTokens],
] as const) {
  for (const [a, b] of PAIRS) {
    const hexA = tokens[a]
    const hexB = tokens[b]
    if (!hexA || !hexB) {
      console.error(`Missing token for pair ${a}/${b} in ${modeName} mode`)
      failed = true
      continue
    }
    const ratio = contrastRatio(hexA, hexB)
    const pass = ratio >= MIN_RATIO
    const label = `[${modeName}] --${a} (${hexA}) / --${b} (${hexB}) = ${ratio.toFixed(2)}:1`
    if (pass) {
      console.log(`PASS ${label}`)
    } else {
      console.error(`FAIL ${label} (needs >= ${MIN_RATIO.toFixed(1)}:1)`)
      failed = true
    }
  }
}

if (failed) {
  process.exit(1)
} else {
  console.log('All contrast pairs pass in both modes.')
}
