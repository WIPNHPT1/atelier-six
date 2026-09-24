import { t } from '../../content/copy.en-GB.ts';
import type { Finger, Shape } from './types.ts';

const STRING_COUNT = 6;
const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

function ordinal(n: number): string {
  const word = ORDINALS[n - 1];
  if (word === undefined) throw new Error(`No ordinal for ${String(n)}`);
  return word;
}

function fingerLabel(finger: Finger): string {
  return finger === 'T' ? t('fretboard.thumb') : ordinal(finger);
}

function stringNumber(index: number): number {
  return STRING_COUNT - index;
}

function joinOrdinals(numbers: number[]): string {
  const words = numbers.map(ordinal);
  if (words.length === 1) return words[0] as string;
  const last = words[words.length - 1] as string;
  const rest = words.slice(0, -1);
  return `${rest.join(', ')} ${t('fretboard.and')} ${last}`;
}

export function describeShape(shape: Shape): string {
  const { barre } = shape;
  const parts: string[] = [];

  if (barre) {
    parts.push(
      t('fretboard.barre', {
        finger: fingerLabel(barre.finger),
        fromString: ordinal(stringNumber(barre.from)),
        toString: ordinal(stringNumber(barre.to)),
        fret: barre.fret,
      }),
    );
  }

  const open: number[] = [];
  const muted: number[] = [];

  shape.notes.forEach((note, index) => {
    const string = stringNumber(index);
    const coveredByBarre =
      barre !== undefined && note.fret === barre.fret && index >= barre.from && index <= barre.to;
    if (coveredByBarre) return;

    if (note.fret === null) {
      muted.push(string);
      return;
    }
    if (note.fret === 0) {
      open.push(string);
      return;
    }
    if (note.finger !== null) {
      parts.push(
        t('fretboard.fingerFret', {
          finger: fingerLabel(note.finger),
          string: ordinal(string),
          fret: note.fret,
        }),
      );
    }
  });

  if (open.length > 0) {
    const key = open.length === 1 ? 'fretboard.openOne' : 'fretboard.openMany';
    parts.push(t(key, { strings: joinOrdinals(open) }));
  }
  if (muted.length > 0) {
    const key = muted.length === 1 ? 'fretboard.mutedOne' : 'fretboard.mutedMany';
    parts.push(t(key, { strings: joinOrdinals(muted) }));
  }

  return `${shape.chord}: ${parts.join(', ')}`;
}
