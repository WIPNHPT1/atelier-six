import { allSampleUrls } from './samples.ts';

const CACHE_NAME = 'a6-audio-v1';

function hasCacheStorage(): boolean {
  return typeof caches !== 'undefined';
}

/** Best-effort: cache a sample so a later offline visit can still play it. Never throws. */
export async function cacheSample(url: string): Promise<void> {
  if (!hasCacheStorage()) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    const existing = await cache.match(url);
    if (existing) return;
    const response = await fetch(url);
    if (response.ok) await cache.put(url, response);
  } catch {
    // offline, blocked storage, etc. — playback already works from the network/Sampler cache
  }
}

export type DownloadProgress = { done: number; total: number };

/** Eagerly caches every guitar, bass, drum and cabinet-IR sample for offline use. */
export async function downloadSoundsForOffline(
  onProgress?: (progress: DownloadProgress) => void,
): Promise<void> {
  const urls = allSampleUrls();
  let done = 0;
  onProgress?.({ done, total: urls.length });
  for (const url of urls) {
    await cacheSample(url);
    done++;
    onProgress?.({ done, total: urls.length });
  }
}

export async function areSoundsCachedForOffline(): Promise<boolean> {
  if (!hasCacheStorage()) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const urls = allSampleUrls();
    const matches = await Promise.all(urls.map((url) => cache.match(url)));
    return matches.every((match) => match !== undefined);
  } catch {
    return false;
  }
}
