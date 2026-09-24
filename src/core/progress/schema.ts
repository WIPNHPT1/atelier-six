// Progress data kept on the device (idb-keyval). Bump VERSION and extend `migrate` on change.
export const VERSION = 3;

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
  // Spaced repetition: days until the change is due again (1…30), and the day it last moved.
  interval: number;
  reviewedOn: string;
};

type TransitionV2 = Omit<TransitionRecord, 'interval' | 'reviewedOn'>;

export type MinuteScore = { key: string; date: number; count: number };

// date is a local calendar day, "YYYY-MM-DD".
export type SessionRecord = { date: string; minutes: number };

export type ProgressData = {
  version: typeof VERSION;
  lessons: Record<string, LessonRecord>;
  transitions: Record<string, TransitionRecord>;
  minutes: MinuteScore[];
  sessions: SessionRecord[];
  // "Was that fun?" taps per lesson or tune, kept only on this device.
  fun: Record<string, FunVotes>;
};

export type FunVotes = { up: number; down: number };

// v2 had no review intervals on transitions.
type ProgressV2 = Omit<ProgressData, 'version' | 'transitions' | 'fun'> & {
  version: 2;
  transitions: Record<string, TransitionV2>;
};

// v1 kept lessons as a list and had no practice sessions.
type ProgressV1 = {
  version: 1;
  lessons: LessonRecord[];
  transitions: Record<string, TransitionV2>;
  minutes: MinuteScore[];
};

function emptyV2(): ProgressV2 {
  return { version: 2, lessons: {}, transitions: {}, minutes: [], sessions: [] };
}

export function emptyProgress(): ProgressData {
  return { version: VERSION, lessons: {}, transitions: {}, minutes: [], sessions: [], fun: {} };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fromV2(data: ProgressV2): ProgressData {
  const transitions: Record<string, TransitionRecord> = {};
  for (const [key, record] of Object.entries(data.transitions)) {
    transitions[key] = { ...record, interval: 1, reviewedOn: '' };
  }
  return { ...data, version: VERSION, transitions, fun: {} };
}

function fromV1(data: ProgressV1): ProgressV2 {
  const lessons: Record<string, LessonRecord> = {};
  for (const record of data.lessons) lessons[record.lessonId] = record;
  return {
    version: 2,
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
  if (raw.version === 2)
    return fromV2({ ...emptyV2(), ...(raw as Partial<ProgressV2>), version: 2 });
  if (raw.version === 1 && Array.isArray(raw.lessons))
    return fromV2(fromV1(raw as unknown as ProgressV1));
  return emptyProgress();
}
