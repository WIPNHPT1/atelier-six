import { describe, expect, it } from 'vitest';
import { recordLessonAttempt, recordTransition } from '../progress/record.ts';
import { emptyProgress, type ProgressData } from '../progress/schema.ts';
import { checkBars, checkHarmony, checkPlayable } from '../tab/playability.ts';
import { standard } from '../tuning.ts';
import { isDue, planSession } from './planner.ts';
import { PATTERNS, WARMUP_BPM, warmupAscii, warmupFor } from './warmup.ts';

const day = (d: number) => new Date(2026, 8, d, 9).getTime();
const LESSONS = [
  { id: 'a', targetBpm: 100 },
  { id: 'b', targetBpm: 100 },
];

function practise(data: ProgressData, key: string, results: boolean[], on: number): ProgressData {
  return results.reduce(
    (next, clean) => recordTransition(next, { key, clean, now: day(on) }),
    data,
  );
}

describe('review intervals', () => {
  it('doubles once per clean day, capped at 30, and resets on a miss', () => {
    let data = practise(emptyProgress(), 'G.open.b>C.open.a', [true, true], 1);
    expect(data.transitions['G.open.b>C.open.a']?.interval).toBe(2);
    let interval = 2;
    for (let d = 3; d < 12; d++) {
      data = practise(data, 'G.open.b>C.open.a', [true], d);
      interval = Math.min(30, interval * 2);
      expect(data.transitions['G.open.b>C.open.a']?.interval).toBe(interval);
    }
    expect(interval).toBe(30);
    data = practise(data, 'G.open.b>C.open.a', [false, true], 12);
    expect(data.transitions['G.open.b>C.open.a']?.interval).toBe(1);
  });

  it('is due once the interval has passed', () => {
    const data = practise(emptyProgress(), 'k>l', [true], 10);
    const record = data.transitions['k>l'];
    if (record === undefined) throw new Error('missing');
    expect(isDue(record, '2026-09-11')).toBe(false);
    expect(isDue(record, '2026-09-12')).toBe(true);
  });
});

describe('planSession', () => {
  it('picks the three due changes with the highest miss rate, deterministically', () => {
    let data = emptyProgress();
    data = practise(data, 'A.x>B.x', [false, false, true], 20);
    data = practise(data, 'C.x>D.x', [false, true, true, true], 20);
    data = practise(data, 'E.x>F.x', [false, true], 20);
    data = practise(data, 'B.y>C.y', [true, false], 20);
    data = practise(data, 'G.x>H.x', [true, true], 20);
    data = practise(data, 'I.x>J.x', [false], 23);
    data = recordTransition(data, { key: 'broken', clean: false, now: day(1) });
    const plan = planSession('2026-09-23', data, LESSONS);
    // Equal miss rates (B.y>C.y and E.x>F.x) fall back to key order.
    expect(plan.reviews).toEqual(['A.x>B.x', 'B.y>C.y', 'E.x>F.x']);
    expect(planSession('2026-09-23', data, LESSONS)).toEqual(plan);
    expect(planSession('2026-09-21', data, LESSONS).reviews).toEqual(plan.reviews);
    expect(planSession('2026-09-20', data, LESSONS).reviews).toEqual([]);
  });

  it('offers the first lesson not yet played at its target tempo', () => {
    let data = emptyProgress();
    expect(planSession('2026-09-24', data, LESSONS).newLesson).toBe('a');
    data = recordLessonAttempt(data, { lessonId: 'a', bpm: 100, clean: true, now: 1 });
    expect(planSession('2026-09-24', data, LESSONS).newLesson).toBe('b');
    data = recordLessonAttempt(data, { lessonId: 'b', bpm: 104, clean: true, now: 1 });
    expect(planSession('2026-09-24', data, LESSONS).newLesson).toBeNull();
  });
});

describe('tune scheduling', () => {
  const lessons = [
    { id: 'a', targetBpm: 100, module: 'power' },
    { id: 'b', targetBpm: 100, module: 'power' },
    { id: 'c', targetBpm: 100, module: 'power' },
    { id: 'd', targetBpm: 100, module: 'power' },
  ];
  const tunes = [
    { id: 'tune-lead', targetBpm: 100, module: 'lead' },
    { id: 'tune-power', targetBpm: 100, module: 'power' },
  ];
  const finish = (data: ProgressData, id: string) =>
    recordLessonAttempt(data, { lessonId: id, bpm: 100, clean: true, now: 1 });

  it('offers the tune once 75 % of its module is done, until the tune itself is done', () => {
    let data = finish(finish(emptyProgress(), 'a'), 'b');
    expect(planSession('2026-09-24', data, lessons, tunes).tune).toBeNull();
    data = finish(data, 'c');
    expect(planSession('2026-09-24', data, lessons, tunes).tune).toBe('tune-power');
    data = finish(data, 'tune-power');
    expect(planSession('2026-09-24', data, lessons, tunes).tune).toBeNull();
    expect(planSession('2026-09-24', data, lessons).tune).toBeNull();
  });
});

describe('warm-up', () => {
  it('walks the strings in one position and passes the tab checks', () => {
    const warmup = warmupFor('2026-09-24');
    expect(warmup.bpm).toBe(WARMUP_BPM);
    expect(warmup.events).toHaveLength(48);
    expect(checkPlayable(warmup.events, warmup.fingering, warmup.bpm)).toEqual([]);
    expect(checkBars(warmup.events, { top: 4, bottom: 4 })).toEqual([]);
    expect(checkHarmony(warmup.events, { root: 0, tones: [0] }, standard)).toEqual([]);
    const frets = warmup.events.map((event) => event.fret);
    expect(Math.max(...frets) - Math.min(...frets)).toBe(3);
  });

  it('changes pattern and position day by day but is the same all day', () => {
    expect(warmupFor('2026-09-24')).toEqual(warmupFor('2026-09-24'));
    const days = ['2026-09-24', '2026-09-25', '2026-09-26'].map(warmupFor);
    expect(new Set(days.map((w) => w.pattern.join(''))).size).toBe(PATTERNS.length);
    expect(new Set(days.map((w) => w.position)).size).toBe(3);
    expect(warmupFor('bad').events).toHaveLength(48);
  });

  it('renders as six lines of tab', () => {
    const lines = warmupAscii(warmupFor('2026-09-24')).split('\n');
    expect(lines).toHaveLength(6);
    expect(lines[0]?.startsWith('e|-')).toBe(true);
    expect(lines[5]?.startsWith('E|-')).toBe(true);
  });
});
