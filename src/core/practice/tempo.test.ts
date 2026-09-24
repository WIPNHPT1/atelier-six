import { describe, expect, it } from 'vitest';
import { nextTempo, targetReached, tempoRange, type Attempt } from './tempo.ts';

const range = tempoRange(80, 120);
const at = (bpm: number, results: boolean[]): Attempt[] => results.map((clean) => ({ bpm, clean }));

describe('nextTempo', () => {
  it('starts at the lesson start tempo', () => {
    expect(nextTempo([], range)).toEqual({
      bpm: 80,
      change: 'hold',
      cleanRate: 0,
      simplify: false,
    });
    expect(nextTempo([], { min: 60, max: 100 }).bpm).toBe(60);
  });

  it('raises 4 bpm above 85 % clean', () => {
    expect(
      nextTempo(at(80, [true, true, true, true, true, true, true, true]), range),
    ).toMatchObject({
      bpm: 84,
      change: 'up',
      cleanRate: 1,
    });
  });

  it('holds between 80 and 85 % clean', () => {
    // 5 of 6 = 83 %
    expect(nextTempo(at(90, [true, true, false, true, true, true]), range)).toMatchObject({
      bpm: 90,
      change: 'hold',
    });
  });

  it('lowers 4 bpm below 80 % clean', () => {
    expect(nextTempo(at(90, [true, false, true, false]), range)).toMatchObject({
      bpm: 86,
      change: 'down',
    });
  });

  it('only counts the last 8 attempts', () => {
    const history = [
      ...at(90, [false, false, false, false]),
      ...at(90, Array<boolean>(8).fill(true)),
    ];
    expect(nextTempo(history, range).change).toBe('up');
  });

  it('follows a session up, holding and back down', () => {
    const tempos: number[] = [];
    const history: Attempt[] = [];
    let bpm = 80;
    for (const clean of [true, true, true, false, false, false, false]) {
      history.push({ bpm, clean });
      bpm = nextTempo(history, range).bpm;
      tempos.push(bpm);
    }
    // 100 %, 100 %, 100 %, 75 %, 60 %, 50 %, 43 %
    expect(tempos).toEqual([84, 88, 92, 88, 84, 80, 76]);
  });

  it('clamps to start − 10 and target + 20', () => {
    expect(nextTempo(at(140, Array<boolean>(8).fill(true)), range).bpm).toBe(140);
    expect(nextTempo(at(72, [false, false, false]), range).bpm).toBe(70);
    expect(nextTempo(at(200, [true, false, true, true, true]), range).bpm).toBe(140);
  });

  it('asks to simplify when still below 70 % at the minimum tempo', () => {
    expect(nextTempo(at(70, [false, true, false]), range)).toMatchObject({
      bpm: 70,
      simplify: true,
    });
    expect(nextTempo(at(74, [false, true, false]), range).simplify).toBe(false);
    expect(nextTempo(at(70, [true, true, true, false]), range).simplify).toBe(false);
  });
});

describe('targetReached', () => {
  it('is true at or above the target tempo', () => {
    expect(targetReached(119, 120)).toBe(false);
    expect(targetReached(120, 120)).toBe(true);
  });
});
