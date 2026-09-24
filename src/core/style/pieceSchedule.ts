import { stepDurSeconds, type ScheduleEvent } from '../schedule/buildSchedule.ts';
import type { Tuning } from '../tuning.ts';
import type { Piece } from './types.ts';

const STEPS_PER_BAR = 16;
const STRING_COUNT = 6;
const VELOCITY = 0.7;
const ACCENT = 1.25;

// A single-note riff as playable events: one picked note per onset; muted scratches stay silent.
export function pieceToSchedule(piece: Piece, tuning: Tuning, bpm: number): ScheduleEvent[] {
  const stepDur = stepDurSeconds(bpm);
  return piece.sections.flatMap((section) =>
    section.events.map((event) => {
      const step = event.bar * STEPS_PER_BAR + event.t;
      const accent = event.articulations?.includes('accent') === true;
      const muted = event.dir === 'mute';
      return {
        t: step * stepDur,
        kind: muted ? ('ghost' as const) : ('pick' as const),
        step,
        bar: event.bar,
        chordIndex: event.bar,
        strings: muted
          ? []
          : [
              {
                string: event.string,
                midi: (tuning[STRING_COUNT - event.string] as number) + piece.capo + event.fret,
                offset: 0,
              },
            ],
        dir: event.dir ?? 'pick',
        velocity: VELOCITY * (accent ? ACCENT : 1),
        palmMute: event.articulations?.includes('palm-mute') === true,
        accent,
      };
    }),
  );
}

// Plain-text tab for a riff, high e on top.
export function pieceAscii(piece: Piece): string {
  const names = ['e', 'B', 'G', 'D', 'A', 'E'];
  const events = piece.sections.flatMap((section) => section.events);
  return names
    .map((name, row) => {
      const cells = events.map((event) => {
        if (event.string !== row + 1) return '--';
        return event.dir === 'mute' ? 'x-' : String(event.fret).padEnd(2, '-');
      });
      return `${name}|-${cells.join('-')}-|`;
    })
    .join('\n');
}
