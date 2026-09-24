import { describe, expect, it } from 'vitest';
import { buildHeatmap, missLevel, sparklinePath, worstFirst } from './heatmap.ts';
import {
  addMinuteScore,
  addPractice,
  bestMinute,
  chordOfShape,
  localDay,
  minuteSeries,
  minutesOn,
  minutesThisWeek,
  recordLessonAttempt,
  recordTransition,
  splitKey,
  transitionKey,
} from './record.ts';
import { VERSION, emptyProgress, migrate, type ProgressData } from './schema.ts';

const NOON = new Date(2026, 8, 24, 12).getTime();
const DAY = 86_400_000;

function withTransitions(entries: [string, number, number][]): ProgressData {
  return entries.reduce<ProgressData>((data, [key, attempts, misses]) => {
    let next = data;
    for (let i = 0; i < attempts; i++)
      next = recordTransition(next, { key, clean: i >= misses, now: i });
    return next;
  }, emptyProgress());
}

describe('migrate', () => {
  it('starts fresh from nothing or junk', () => {
    expect(migrate(undefined)).toEqual(emptyProgress());
    expect(migrate([1, 2])).toEqual(emptyProgress());
    expect(migrate({ version: 99 })).toEqual(emptyProgress());
    expect(migrate({ version: 1, lessons: 'x' })).toEqual(emptyProgress());
  });

  it('keeps current data and fills missing lists', () => {
    const data = recordLessonAttempt(emptyProgress(), {
      lessonId: 'a',
      bpm: 90,
      clean: true,
      now: 1,
    });
    expect(migrate(data)).toEqual(data);
    expect(migrate({ version: VERSION, lessons: {} }).sessions).toEqual([]);
  });

  it('upgrades v1 lesson lists and adds sessions', () => {
    const record = { lessonId: 'a', bestBpm: 100, cleanStreak: 2, lastPracticed: 5 };
    const v2 = migrate({ version: 1, lessons: [record], transitions: {}, minutes: [] });
    expect(v2).toEqual({ ...emptyProgress(), lessons: { a: record } });
  });
});

describe('records', () => {
  it('tracks best clean tempo and the clean streak', () => {
    let data = emptyProgress();
    data = recordLessonAttempt(data, { lessonId: 'a', bpm: 90, clean: true, now: 1 });
    data = recordLessonAttempt(data, { lessonId: 'a', bpm: 100, clean: false, now: 2 });
    expect(data.lessons.a).toEqual({
      lessonId: 'a',
      bestBpm: 90,
      cleanStreak: 0,
      lastPracticed: 2,
    });
    data = recordLessonAttempt(data, { lessonId: 'a', bpm: 94, clean: true, now: 3 });
    expect(data.lessons.a?.bestBpm).toBe(94);
    expect(data.lessons.a?.cleanStreak).toBe(1);
    expect(
      recordLessonAttempt(emptyProgress(), { lessonId: 'b', bpm: 80, clean: false, now: 1 }).lessons
        .b?.bestBpm,
    ).toBe(0);
  });

  it('counts transition attempts and misses', () => {
    const data = withTransitions([['G.open.b>C.open.a', 4, 1]]);
    expect(data.transitions['G.open.b>C.open.a']).toMatchObject({
      attempts: 4,
      misses: 1,
      lastMs: 3,
    });
  });

  it('keys and splits transitions by shape id', () => {
    expect(transitionKey('G.open.b', 'C.open.a')).toBe('G.open.b>C.open.a');
    expect(splitKey('G.open.b>C.open.a')).toEqual({ from: 'G.open.b', to: 'C.open.a' });
    expect(splitKey('')).toEqual({ from: '', to: '' });
    expect(chordOfShape('Am.open')).toBe('Am');
  });

  it('keeps one-minute scores with the best per key and a series', () => {
    let data = addMinuteScore(emptyProgress(), { key: 'k', date: 2, count: 30 });
    data = addMinuteScore(data, { key: 'k', date: 1, count: 25 });
    data = addMinuteScore(data, { key: 'j', date: 3, count: 10 });
    expect(bestMinute(data, 'k')).toBe(30);
    expect(bestMinute(data, 'nope')).toBeNull();
    expect(minuteSeries(data)).toEqual([
      { key: 'k', counts: [25, 30] },
      { key: 'j', counts: [10] },
    ]);
  });

  it('adds practice minutes per day and sums the week', () => {
    const today = localDay(NOON);
    let data = addPractice(emptyProgress(), { date: localDay(NOON - 2 * DAY), minutes: 10 });
    data = addPractice(data, { date: today, minutes: 5 });
    data = addPractice(data, { date: today, minutes: 3 });
    data = addPractice(data, { date: localDay(NOON - 9 * DAY), minutes: 50 });
    expect(minutesOn(data, today)).toBe(8);
    expect(minutesOn(data, '1999-01-01')).toBe(0);
    expect(minutesThisWeek(data, NOON)).toBe(18);
    expect(localDay(new Date(2026, 0, 5, 9).getTime())).toBe('2026-01-05');
  });
});

describe('heatmap', () => {
  it('steps miss rates into five levels', () => {
    expect([null, 0, 0.19, 0.2, 0.5, 0.99, 1].map(missLevel)).toEqual([0, 1, 1, 2, 3, 5, 5]);
  });

  it('builds a from × to grid with an empty diagonal and the worst cell', () => {
    const data = withTransitions([
      ['G.open.b>C.open.a', 10, 4],
      ['G.open.a>C.open.a', 10, 0],
      ['C.open.a>G.open.b', 5, 1],
      ['Am.open>C.open.a', 4, 0],
      ['Em.open>Em.open', 0, 0],
    ]);
    const map = buildHeatmap(data.transitions);
    expect(map.chords).toEqual(['G', 'C', 'Am']);
    const cell = (from: string, to: string) =>
      map.rows.flat().find((c) => c.from === from && c.to === to);
    expect(cell('G', 'G')).toMatchObject({ rate: null, level: 0, key: null });
    expect(cell('G', 'C')).toMatchObject({ rate: 0.2, level: 2, key: 'G.open.b>C.open.a' });
    expect(cell('C', 'Am')?.rate).toBeNull();
    expect(map.worst).toMatchObject({ from: 'G', to: 'C' });
    expect(
      buildHeatmap(withTransitions([['C.open.a>G.open.b', 3, 0]]).transitions).worst,
    ).toBeNull();
  });

  it('lists the worst changes first', () => {
    const data = withTransitions([
      ['G.open.b>C.open.a', 10, 4],
      ['Em.open>D.open', 10, 6],
      ['Am.open>C.open.a', 4, 0],
    ]);
    expect(worstFirst(data.transitions).map((entry) => `${entry.from}>${entry.to}`)).toEqual([
      'Em>D',
      'G>C',
    ]);
    expect(worstFirst(data.transitions, 1)).toHaveLength(1);
  });

  it('draws a sparkline path', () => {
    expect(sparklinePath([], 100, 20)).toBe('');
    expect(sparklinePath([5], 100, 20)).toBe('M50.0 0.0');
    expect(sparklinePath([0, 10], 100, 20)).toBe('M0.0 20.0 L100.0 0.0');
  });
});
