import { lastLines } from '../core/report/issueReport';

// A tiny local log of uncaught errors for "Report a problem". Errors only — no progress or
// personal data — and it never leaves the device unless the user submits the issue themselves.
const KEY = 'a6-error-log';

export function readErrorLog(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw === null ? [] : JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((l): l is string => typeof l === 'string') : [];
  } catch {
    return [];
  }
}

export function logError(message: string): void {
  try {
    const line = `${new Date().toISOString()} ${message}`.slice(0, 300);
    localStorage.setItem(KEY, JSON.stringify(lastLines([...readErrorLog(), line])));
  } catch {
    // Storage full or blocked: the log is best-effort.
  }
}

export function installErrorLog(): void {
  window.addEventListener('error', (event) => {
    logError(event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    const reason: unknown = event.reason;
    logError(reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason));
  });
}
