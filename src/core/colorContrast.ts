function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.trim().replace('#', '')
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

export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexToRgb(hexA))
  const lumB = relativeLuminance(hexToRgb(hexB))
  const lighter = Math.max(lumA, lumB)
  const darker = Math.min(lumA, lumB)
  return (lighter + 0.05) / (darker + 0.05)
}
