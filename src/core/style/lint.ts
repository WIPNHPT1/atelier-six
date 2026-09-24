import type { ChordSpec } from '../theory/chord.ts';
import type {
  Articulation,
  AvoidRule,
  MustRule,
  Piece,
  PieceEvent,
  PieceSection,
  StyleSheet,
  TuningId,
} from './types.ts';

const STEPS_PER_BAR = 16;
const PUSH_STEP = 14;
const STRAIGHT = 50;
const MAX_DOWNPICK_GAP = 2;

export type StyleIssue =
  | { type: 'tempo'; bpm: number; min: number; max: number }
  | { type: 'subdivision'; expected: number; actual: number }
  | { type: 'swing'; swing: number; max: number }
  | { type: 'upstrokes'; count: number }
  | { type: 'tuning'; tuning: TuningId }
  | { type: 'capo'; capo: number }
  | { type: 'untypical-articulation'; value: Articulation }
  | { type: 'missing'; rule: MustRule }
  | { type: 'avoid'; rule: AvoidRule };

function absTime(event: PieceEvent): number {
  return event.bar * STEPS_PER_BAR + event.t;
}

function has(event: PieceEvent, mark: Articulation): boolean {
  return (event.articulations ?? []).includes(mark);
}

function sameChord(a: ChordSpec, b: ChordSpec | undefined): boolean {
  return b !== undefined && a.root === b.root && a.quality === b.quality;
}

// One event per onset, in time order (the first event wins when notes sound together).
function onsets(events: PieceEvent[]): PieceEvent[] {
  const byTime = new Map<number, PieceEvent>();
  for (const event of events) if (!byTime.has(absTime(event))) byTime.set(absTime(event), event);
  return [...byTime.values()].sort((a, b) => absTime(a) - absTime(b));
}

function groupsByTime(events: PieceEvent[]): PieceEvent[][] {
  const byTime = new Map<number, PieceEvent[]>();
  for (const event of events)
    byTime.set(absTime(event), [...(byTime.get(absTime(event)) ?? []), event]);
  return [...byTime.values()];
}

// Longest run of onsets where each one continues the run according to `continues`.
function longestRun(
  events: PieceEvent[],
  continues: (prev: PieceEvent | undefined, curr: PieceEvent) => boolean,
): number {
  return onsets(events).reduce(
    (acc, curr) => {
      const run = continues(acc.prev, curr) ? acc.run + 1 : 0;
      return { prev: curr, run, longest: Math.max(acc.longest, run) };
    },
    { prev: undefined as PieceEvent | undefined, run: 0, longest: 0 },
  ).longest;
}

function allPalmMuted(section: PieceSection): boolean {
  return section.events.length > 0 && section.events.every((event) => has(event, 'palm-mute'));
}

function nonePalmMuted(section: PieceSection): boolean {
  return section.events.length > 0 && section.events.every((event) => !has(event, 'palm-mute'));
}

function pushed(events: PieceEvent[]): boolean {
  return onsets(events).some(
    (event, i, list) =>
      event.t === PUSH_STEP &&
      event.chord !== undefined &&
      i > 0 &&
      !sameChord(event.chord, list[i - 1]?.chord),
  );
}

function satisfies(rule: MustRule, piece: Piece, events: PieceEvent[]): boolean {
  switch (rule.kind) {
    case 'articulation':
      return events.some((event) => has(event, rule.value));
    case 'push':
      return pushed(events);
    case 'palmMuteContrast':
      return piece.sections.some(allPalmMuted) && piece.sections.some(nonePalmMuted);
    case 'accentOn':
      return rule.steps.every((step) =>
        events.some((event) => event.t === step && has(event, 'accent')),
      );
    case 'bothDirections':
      return events.some((event) => event.dir === 'D') && events.some((event) => event.dir === 'U');
    case 'phraseShape':
      return piece.phraseShape === rule.value;
    case 'section':
      return piece.sections.some((section) => section.name === rule.value);
  }
}

function violates(rule: AvoidRule, piece: Piece, events: PieceEvent[]): boolean {
  switch (rule.kind) {
    case 'articulation':
      return events.some((event) => has(event, rule.value));
    case 'quality':
      return events.some(
        (event) => event.chord !== undefined && rule.values.includes(event.chord.quality),
      );
    case 'longSection':
      return piece.sections.some(
        (section) =>
          section.name === rule.section &&
          new Set(section.events.map((e) => e.bar)).size > rule.maxBars,
      );
    case 'drive':
      return piece.drive === true;
    case 'openChord':
      return groupsByTime(events).some(
        (group) => group.length >= 3 && group.filter((event) => event.fret === 0).length >= 2,
      );
    case 'maxSimultaneous':
      return groupsByTime(events).some((group) => group.length > rule.max);
    case 'downpickRun':
      return (
        longestRun(
          events,
          (prev, curr) =>
            curr.dir === 'D' &&
            prev?.dir === 'D' &&
            absTime(curr) - absTime(prev) <= MAX_DOWNPICK_GAP,
        ) +
          1 >
        rule.max
      );
    case 'fastRun':
      return (
        longestRun(
          events,
          (prev, curr) => prev !== undefined && absTime(curr) - absTime(prev) === 1,
        ) +
          1 >
        rule.max
      );
    case 'legatoRun':
      return (
        longestRun(events, (_prev, curr) => has(curr, 'hammer') || has(curr, 'pull')) > rule.max
      );
  }
}

export function lintAgainstStyle(piece: Piece, style: StyleSheet): StyleIssue[] {
  const events = piece.sections.flatMap((section) => section.events);
  const issues: StyleIssue[] = [];

  if (piece.bpm < style.tempo.min || piece.bpm > style.tempo.max) {
    issues.push({ type: 'tempo', bpm: piece.bpm, ...style.tempo });
  }
  if (piece.subdivision !== style.feel.subdivision) {
    issues.push({
      type: 'subdivision',
      expected: style.feel.subdivision,
      actual: piece.subdivision,
    });
  }
  if (piece.swing > Math.max(style.feel.maxSwing, STRAIGHT)) {
    issues.push({ type: 'swing', swing: piece.swing, max: style.feel.maxSwing });
  }
  const upstrokes = events.filter((event) => event.dir === 'U').length;
  if (style.feel.downstrokesOnly && upstrokes > 0)
    issues.push({ type: 'upstrokes', count: upstrokes });
  if (!style.tunings.includes(piece.tuning)) issues.push({ type: 'tuning', tuning: piece.tuning });
  if (piece.capo < style.capo.min || piece.capo > style.capo.max) {
    issues.push({ type: 'capo', capo: piece.capo });
  }

  const used = new Set(events.flatMap((event) => event.articulations ?? []));
  for (const value of used) {
    if (!style.articulations.includes(value))
      issues.push({ type: 'untypical-articulation', value });
  }

  for (const rule of style.mustInclude) {
    if (piece.kind === 'riff' && rule.scope === 'piece') continue;
    if (!satisfies(rule, piece, events)) issues.push({ type: 'missing', rule });
  }
  for (const rule of style.avoid) {
    if (violates(rule, piece, events)) issues.push({ type: 'avoid', rule });
  }
  return issues;
}
