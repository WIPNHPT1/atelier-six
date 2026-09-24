// Progress data kept on the device (idb-keyval). Bump VERSION and extend `migrate` on change.
export const VERSION = 2;

export type LessonRecord = {
  lessonId: string;
  bestBpm: number;
  cleanStreak: number;
  lastPracticed: number;
};

// transitionKey is "<from shape id>><to shape id>", e.g. "G.open.b>C.open.a".
export type TransitionRecord = {
  transitionKey: string;
  attempts: number;
  misses: number;
  lastMs: number;
};

export type MinuteScore = { key: string; date: number; count: number };

// date is a local calendar day, "YYYY-MM-DD".
export type SessionRecord = { date: string; minutes: number };

export type ProgressData = {
  version: typeof VERSION;
  lessons: Record<string, LessonRecord>;
  transitions: Record<string, TransitionRecord>;
  minutes: MinuteScore[];
  sessions: SessionRecord[];
};

// v1 kept lessons as a list and had no practice sessions.
type ProgressV1 = {
  version: 1;
  lessons: LessonRecord[];
  transitions: Record<string, TransitionRecord>;
  minutes: MinuteScore[];
};

export function emptyProgress(): ProgressData {
  return { version: VERSION, lessons: {}, transitions: {}, minutes: [], sessions: [] };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fromV1(data: ProgressV1): ProgressData {
  const lessons: Record<string, LessonRecord> = {};
  for (const record of data.lessons) lessons[record.lessonId] = record;
  return {
    version: VERSION,
    lessons,
    transitions: data.transitions,
    minutes: data.minutes,
    sessions: [],
  };
}

// Brings any stored shape up to the current version; anything unreadable starts fresh.
export function migrate(raw: unknown): ProgressData {
  if (!isObject(raw)) return emptyProgress();
  if (raw.version === VERSION)
    return { ...emptyProgress(), ...(raw as Partial<ProgressData>), version: VERSION };
  if (raw.version === 1 && Array.isArray(raw.lessons)) return fromV1(raw as unknown as ProgressV1);
  return emptyProgress();
}
