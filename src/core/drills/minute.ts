export const MINUTE_MS = 60_000;

export type MinuteSession = { startedAt: number | null; changes: number };

export function newMinute(): MinuteSession {
  return { startedAt: null, changes: 0 };
}

export function startMinute(now: number): MinuteSession {
  return { startedAt: now, changes: 0 };
}

export function remainingMs(session: MinuteSession, now: number): number {
  if (session.startedAt === null) return MINUTE_MS;
  return Math.max(0, MINUTE_MS - (now - session.startedAt));
}

export function isRunning(session: MinuteSession, now: number): boolean {
  return session.startedAt !== null && remainingMs(session, now) > 0;
}

export function isFinished(session: MinuteSession, now: number): boolean {
  return session.startedAt !== null && remainingMs(session, now) === 0;
}

// Counts one clean change; taps before the start or after the minute are ignored.
export function recordChange(session: MinuteSession, now: number): MinuteSession {
  if (!isRunning(session, now)) return session;
  return { ...session, changes: session.changes + 1 };
}
