// Progress data kept on the device (idb-keyval). Bump VERSION and extend `migrate` on change.
export const VERSION = 4;

export type LessonRecord = {
  lessonId: string;
  bestBpm: number;
  cleanStreak: number;
  lastPracticed: number;
  // Marked done directly, independent of hitting the target tempo (see lessonDone).
  completed: boolean;
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
  // The last day the hand-health warm-up was done or skipped ("YYYY-MM-DD"), so it's offered once.
  handWarmup: string;
};

type LessonRecordV3 = Omit<LessonRecord, 'completed'>;
export type FunVotes = { up: number; down: number };

// v3 tracked "was that fun?" votes instead of an explicit per-lesson complete flag.
type ProgressV3 = Omit<ProgressData, 'version' | 'lessons'> & {
  version: 3;
  lessons: Record<string, LessonRecordV3>;
  fun: Record<string, FunVotes>;
};

// v2 had no review intervals on transitions.
type ProgressV2 = Omit<ProgressV3, 'version' | 'transitions' | 'fun' | 'handWarmup'> & {
  version: 2;
  transitions: Record<string, TransitionV2>;
};

// v1 kept lessons as a list and had no practice sessions.
type ProgressV1 = {
  version: 1;
  lessons: LessonRecordV3[];
  transitions: Record<string, TransitionV2>;
  minutes: MinuteScore[];
};

function emptyV2(): ProgressV2 {
  return { version: 2, lessons: {}, transitions: {}, minutes: [], sessions: [] };
}

function emptyV3(): ProgressV3 {
  return {
    version: 3,
    lessons: {},
    transitions: {},
    minutes: [],
    sessions: [],
    fun: {},
    handWarmup: '',
  };
}

export function emptyProgress(): ProgressData {
  return {
    version: VERSION,
    lessons: {},
    transitions: {},
    minutes: [],
    sessions: [],
    handWarmup: '',
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fromV3(data: ProgressV3): ProgressData {
  const lessons: Record<string, LessonRecord> = {};
  for (const [key, record] of Object.entries(data.lessons)) {
    lessons[key] = { ...record, completed: false };
  }
  return {
    version: VERSION,
    lessons,
    transitions: data.transitions,
    minutes: data.minutes,
    sessions: data.sessions,
    handWarmup: data.handWarmup,
  };
}

function fromV2(data: ProgressV2): ProgressV3 {
  const transitions: Record<string, TransitionRecord> = {};
  for (const [key, record] of Object.entries(data.transitions)) {
    transitions[key] = { ...record, interval: 1, reviewedOn: '' };
  }
  return { ...data, version: 3, transitions, fun: {}, handWarmup: '' };
}

function fromV1(data: ProgressV1): ProgressV2 {
  const lessons: Record<string, LessonRecordV3> = {};
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
  if (raw.version === 3)
    return fromV3({ ...emptyV3(), ...(raw as Partial<ProgressV3>), version: 3 });
  if (raw.version === 2)
    return fromV3(fromV2({ ...emptyV2(), ...(raw as Partial<ProgressV2>), version: 2 }));
  if (raw.version === 1 && Array.isArray(raw.lessons))
    return fromV3(fromV2(fromV1(raw as unknown as ProgressV1)));
  return emptyProgress();
}
