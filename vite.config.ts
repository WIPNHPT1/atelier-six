import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// #121110 (--ebony/--bone in src/styles/tokens.css) is the one hex allowed outside
// tokens.css: the manifest can't read a CSS custom property.
const brandDark = '#121110';

const { version } = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf8'),
) as { version: string };

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Atelier Six',
        short_name: 'Atelier Six',
        description: 'Learn guitar with short, guided practice sessions.',
        display: 'standalone',
        orientation: 'any',
        background_color: brandDark,
        theme_color: brandDark,
        categories: ['music', 'education'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/screenshots/mobile.png',
            sizes: '1082x1930',
            type: 'image/png',
            form_factor: 'narrow',
          },
          {
            src: '/screenshots/desktop.png',
            sizes: '1440x900',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: '/screenshots/tablet.png',
            sizes: '2048x1536',
            type: 'image/png',
            form_factor: 'wide',
          },
        ],
      },
      workbox: {
        // Precache the whole build, including lazy chunks (Tone.js incl.), fonts
        // and icons, so audio works offline. Samples are cached separately and
        // on demand — see src/audio/sampleCache.ts.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
        // Serve the app shell for any offline deep link — this is a client-routed SPA.
        navigateFallback: '/index.html',
        // Samples are big and opt-in, so they're not precached — but once fetched
        // (on first play, or via "Download sounds for offline") this cache-first
        // rule serves them offline too. Same cache name as src/audio/sampleCache.ts
        // so its eager downloads and this runtime cache share one cache.
        runtimeCaching: [
          {
            urlPattern: /\/audio\/.*\.(mp3|wav)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'a6-audio-v1' },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    // Vite's default scoped name (`_button_u53f8_1`) keeps the component/class name —
    // nice in devtools, but it's dead weight in every build: short hashes only.
    modules: {
      generateScopedName: '[hash:base64:5]',
    },
  },
});
