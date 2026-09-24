import { describe, expect, it } from 'vitest';
import { STYLES } from '../../data/styles/index.ts';
import { lintAgainstStyle, type StyleIssue } from './lint.ts';
import type { AvoidRule, MustRule, Piece, PieceEvent, StyleSheet } from './types.ts';

const style = (id: string) => STYLES[id] as StyleSheet;
const E = { root: 4, quality: '5' as const };
const B = { root: 11, quality: '5' as const };

function ev(bar: number, t: number, extra: Partial<PieceEvent> = {}): PieceEvent {
  return { bar, t, duration: 2, string: 6, fret: 2, dir: 'D', ...extra };
}

function piece(sections: Piece['sections'], extra: Partial<Piece> = {}): Piece {
  return {
    id: 'p',
    kind: 'tune',
    bpm: 170,
    subdivision: 8,
    swing: 50,
    tuning: 'standard',
    capo: 0,
    sections,
    ...extra,
  };
}

const types = (issues: StyleIssue[]) => issues.map((issue) => issue.type);
const kinds = (issues: StyleIssue[], type: 'missing' | 'avoid') =>
  issues.flatMap((issue) => (issue.type === type ? [issue.rule.kind] : []));

function goodPopPunk(): Piece {
  const verse = [0, 2, 4, 6, 8, 10, 12].map((t) =>
    ev(0, t, { chord: E, articulations: ['palm-mute'] }),
  );
  const chorus = [ev(1, 0, { chord: E, articulations: ['octave'] }), ev(1, 14, { chord: B })];
  return piece([
    { name: 'verse', events: verse },
    { name: 'chorus', events: chorus },
    { name: 'breakdown', events: [ev(2, 0, { chord: E })] },
  ]);
}

describe('lintAgainstStyle', () => {
  it('passes a pop punk tune that has every idiom', () => {
    expect(lintAgainstStyle(goodPopPunk(), style('power'))).toEqual([]);
  });

  it('flags pop punk played in swing at 90 bpm', () => {
    const bad = piece(
      [{ name: 'verse', events: [ev(0, 0, { chord: E }), ev(0, 3, { chord: E, dir: 'U' })] }],
      { bpm: 90, swing: 66, subdivision: 16, tuning: 'dropD', capo: 3 },
    );
    const issues = lintAgainstStyle(bad, style('power'));
    expect(types(issues)).toEqual(
      expect.arrayContaining(['tempo', 'swing', 'subdivision', 'upstrokes', 'tuning', 'capo']),
    );
    expect(kinds(issues, 'missing')).toEqual([
      'push',
      'palmMuteContrast',
      'articulation',
      'section',
    ]);
    expect(issues).toContainEqual({ type: 'tempo', bpm: 90, min: 150, max: 200 });
  });

  it('allows swing up to the style limit', () => {
    const thumb = style('thumb');
    const base = { bpm: 90, subdivision: 16 as const, kind: 'riff' as const };
    const events = [ev(0, 0, { articulations: ['ghost', 'mute', 'hammer'], dir: 'pick' })];
    expect(lintAgainstStyle(piece([{ name: 'r', events }], { ...base, swing: 55 }), thumb)).toEqual(
      [],
    );
    expect(
      types(lintAgainstStyle(piece([{ name: 'r', events }], { ...base, swing: 60 }), thumb)),
    ).toEqual(['swing']);
  });

  it('skips piece-level idioms for a riff but not riff-level ones', () => {
    const riff = piece([{ name: 'riff', events: [ev(0, 0, { chord: E })] }], { kind: 'riff' });
    expect(kinds(lintAgainstStyle(riff, style('power')), 'missing')).toEqual(['push']);
  });

  it('only counts a push when the chord actually changes on the "and" of 4', () => {
    const power = style('power');
    const run = (events: PieceEvent[]) =>
      kinds(lintAgainstStyle(piece([{ name: 'r', events }], { kind: 'riff' }), power), 'missing');
    expect(run([ev(0, 0, { chord: E }), ev(0, 14, { chord: E })])).toEqual(['push']);
    expect(run([ev(0, 0, { chord: E }), ev(0, 14)])).toEqual(['push']);
    expect(run([ev(0, 14, { chord: B })])).toEqual(['push']);
    expect(run([ev(0, 0), ev(0, 14, { chord: B })])).toEqual([]);
  });

  it('checks accents, both strum directions and untypical marks', () => {
    const open = style('open');
    const events = [
      ev(0, 0, { string: 1, articulations: ['let-ring'] }),
      ev(0, 4, { string: 1, dir: 'U', articulations: ['accent'] }),
    ];
    const issues = lintAgainstStyle(
      piece([{ name: 'r', events }], { kind: 'riff', bpm: 90, subdivision: 16 }),
      open,
    );
    expect(issues).toContainEqual({
      type: 'missing',
      rule: { kind: 'accentOn', steps: [4, 12], scope: 'riff' },
    });
    const noUp = lintAgainstStyle(
      piece([{ name: 'r', events: [ev(0, 0, { articulations: ['sweep'] })] }], {
        kind: 'riff',
        bpm: 90,
        subdivision: 16,
      }),
      open,
    );
    expect(kinds(noUp, 'missing')).toContain('bothDirections');
    expect(noUp).toContainEqual({ type: 'untypical-articulation', value: 'sweep' });
  });

  it('checks the required phrase shape', () => {
    const whammy = style('whammy');
    const events = [ev(0, 0, { articulations: ['accent', 'pedal', 'killswitch'], dir: 'pick' })];
    const base = {
      kind: 'riff' as const,
      bpm: 100,
      subdivision: 16 as const,
      tuning: 'dropD' as const,
    };
    expect(
      lintAgainstStyle(
        piece([{ name: 'r', events }], { ...base, phraseShape: 'call-answer' }),
        whammy,
      ),
    ).toEqual([]);
    expect(
      kinds(lintAgainstStyle(piece([{ name: 'r', events }], base), whammy), 'missing'),
    ).toEqual(['phraseShape']);
  });

  it('needs one fully palm-muted section and one open section', () => {
    const power = style('power');
    const only = (sections: Piece['sections']) =>
      kinds(lintAgainstStyle(piece(sections), power), 'missing');
    const muted = { name: 'verse', events: [ev(0, 0, { articulations: ['palm-mute'] })] };
    const open = { name: 'chorus', events: [ev(1, 0)] };
    expect(only([muted])).toContain('palmMuteContrast');
    expect(only([open, { name: 'empty', events: [] }])).toContain('palmMuteContrast');
    expect(only([muted, open])).not.toContain('palmMuteContrast');
  });
});

describe('avoid rules', () => {
  const custom = (rule: AvoidRule): StyleSheet => ({
    ...style('power'),
    mustInclude: [] as MustRule[],
    avoid: [rule],
  });
  const avoided = (rule: AvoidRule, p: Piece) => kinds(lintAgainstStyle(p, custom(rule)), 'avoid');
  const one = (events: PieceEvent[], extra: Partial<Piece> = {}) =>
    piece([{ name: 'solo', events }], extra);

  it('articulation', () => {
    const rule: AvoidRule = { kind: 'articulation', value: 'palm-mute' };
    expect(avoided(rule, one([ev(0, 0, { articulations: ['palm-mute'] })]))).toEqual([
      'articulation',
    ]);
    expect(avoided(rule, one([ev(0, 0)]))).toEqual([]);
  });

  it('quality', () => {
    const rule: AvoidRule = { kind: 'quality', values: ['7'] };
    expect(avoided(rule, one([ev(0, 0, { chord: { root: 0, quality: '7' } })]))).toEqual([
      'quality',
    ]);
    expect(avoided(rule, one([ev(0, 0, { chord: E }), ev(0, 2)]))).toEqual([]);
  });

  it('longSection', () => {
    const rule: AvoidRule = { kind: 'longSection', section: 'solo', maxBars: 1 };
    expect(avoided(rule, one([ev(0, 0), ev(1, 0)]))).toEqual(['longSection']);
    expect(avoided(rule, one([ev(0, 0), ev(0, 2)]))).toEqual([]);
    expect(avoided(rule, piece([{ name: 'verse', events: [ev(0, 0), ev(1, 0)] }]))).toEqual([]);
  });

  it('drive', () => {
    expect(avoided({ kind: 'drive' }, one([ev(0, 0)], { drive: true }))).toEqual(['drive']);
    expect(avoided({ kind: 'drive' }, one([ev(0, 0)]))).toEqual([]);
  });

  it('openChord and maxSimultaneous', () => {
    const open = [
      ev(0, 0, { string: 1, fret: 0 }),
      ev(0, 0, { string: 2, fret: 0 }),
      ev(0, 0, { string: 3 }),
    ];
    const fretted = [
      ev(0, 0, { string: 1 }),
      ev(0, 0, { string: 2, fret: 0 }),
      ev(0, 0, { string: 3 }),
    ];
    expect(avoided({ kind: 'openChord' }, one(open))).toEqual(['openChord']);
    expect(avoided({ kind: 'openChord' }, one(fretted))).toEqual([]);
    expect(avoided({ kind: 'openChord' }, one(open.slice(0, 2)))).toEqual([]);
    expect(avoided({ kind: 'maxSimultaneous', max: 2 }, one(open))).toEqual(['maxSimultaneous']);
    expect(avoided({ kind: 'maxSimultaneous', max: 3 }, one(open))).toEqual([]);
  });

  it('downpickRun counts close downstrokes only', () => {
    const rule: AvoidRule = { kind: 'downpickRun', max: 3 };
    const downs = (times: number[]) => one(times.map((t) => ev(0, t)));
    expect(avoided(rule, downs([0, 2, 4, 6]))).toEqual(['downpickRun']);
    expect(avoided(rule, downs([0, 2, 4]))).toEqual([]);
    expect(avoided(rule, downs([0, 2, 8, 10]))).toEqual([]);
    expect(avoided(rule, one([ev(0, 0), ev(0, 1, { dir: 'U' }), ev(0, 2), ev(0, 3)]))).toEqual([]);
  });

  it('fastRun counts back-to-back sixteenths', () => {
    const rule: AvoidRule = { kind: 'fastRun', max: 3 };
    const notes = (times: number[]) => one(times.map((t) => ev(0, t, { dir: 'pick' })));
    expect(avoided(rule, notes([0, 1, 2, 3]))).toEqual(['fastRun']);
    expect(avoided(rule, notes([0, 1, 2, 4, 5, 6]))).toEqual([]);
    const chordal = one([
      ev(0, 0),
      ev(0, 0, { string: 5 }),
      ev(0, 1),
      ev(0, 2),
      ev(0, 3, { string: 4 }),
    ]);
    expect(avoided(rule, chordal)).toEqual(['fastRun']);
  });

  it('legatoRun counts hammer-ons and pull-offs in a row', () => {
    const rule: AvoidRule = { kind: 'legatoRun', max: 2 };
    const marks = ['hammer', 'pull', 'hammer'] as const;
    expect(avoided(rule, one(marks.map((m, i) => ev(0, i * 2, { articulations: [m] }))))).toEqual([
      'legatoRun',
    ]);
    expect(
      avoided(
        rule,
        one([
          ev(0, 0, { articulations: ['hammer'] }),
          ev(0, 2),
          ev(0, 4, { articulations: ['pull'] }),
        ]),
      ),
    ).toEqual([]);
  });
});
