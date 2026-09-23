import sharp from 'sharp'
import { mkdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const logoDir = path.join(root, 'docs/design/logo')
const iconsOut = path.join(root, 'public/icons')
const assetsOut = path.join(root, 'assets')

mkdirSync(iconsOut, { recursive: true })
mkdirSync(assetsOut, { recursive: true })

async function render(svgPath: string, outPath: string, size: number) {
  const svg = readFileSync(svgPath)
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(outPath)
  console.log('wrote', path.relative(root, outPath), `${String(size)}x${String(size)}`)
}

async function main() {
  const appIcon = path.join(logoDir, 'vi-app-icon-1024.svg')
  const maskableIcon = path.join(logoDir, 'vi-maskable-1024.svg')

  await render(appIcon, path.join(iconsOut, 'icon-192.png'), 192)
  await render(appIcon, path.join(iconsOut, 'icon-512.png'), 512)
  await render(appIcon, path.join(iconsOut, 'apple-touch-icon.png'), 180)
  await render(appIcon, path.join(assetsOut, 'icon.png'), 1024)
  await render(maskableIcon, path.join(iconsOut, 'maskable-512.png'), 512)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
