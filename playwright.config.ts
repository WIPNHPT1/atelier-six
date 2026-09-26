import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

// A clean, sustained tone file: Chromium's synthetic fake audio device produces a hard-clipped
// click rather than a steady tone once echoCancellation/noiseSuppression/autoGainControl are
// disabled (as the tuner's mic constraints require), so pitch detection needs a real waveform.
const TONE_FIXTURE = fileURLToPath(new URL('./tests/e2e/fixtures/tone-a3.wav', import.meta.url));

// Chromium-only flags (audio-gesture and fake-mic-device automation). Kept here, not in
// per-spec test.use(), because Playwright launches the browser for the page fixture before a
// test's own test.skip(browserName !== 'chromium') runs — WebKit/Firefox reject the unknown
// arguments outright and the launch failure takes the rest of that worker's queue down with it.
const CHROMIUM_ONLY_ARGS = [
  '--autoplay-policy=no-user-gesture-required',
  '--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream',
  `--use-file-for-fake-audio-capture=${TONE_FIXTURE}`,
];

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: '**/._*',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  // GitHub-hosted runners have 2 CPUs — full parallelism across 6 projects (now heavier with
  // the visual and a11y suites) was crashing WebKit under resource pressure.
  workers: process.env.CI ? 2 : undefined,
  reporter: 'line',
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: 'http://localhost:4173',
  },
  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 7'],
        launchOptions: { args: CHROMIUM_ONLY_ARGS },
      },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 15'] },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Mini landscape'] },
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        launchOptions: { args: CHROMIUM_ONLY_ARGS },
      },
    },
    {
      name: 'desktop-safari',
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'desktop-firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
