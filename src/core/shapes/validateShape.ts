import type { Shape } from './types.ts';

const REAL_FINGERS = [1, 2, 3, 4, 'T'] as const;

export function validateShape(shape: Shape): string[] {
  const errors: string[] = [];
  const { notes, barre } = shape;

  notes.forEach((note, index) => {
    const { fret, finger } = note;
    const isRealFinger = finger !== null && finger !== 0;

    if ((fret === null || fret === 0) && isRealFinger) {
      errors.push(`String ${String(index)}: finger ${String(finger)} on an open/muted string`);
    }

    if (fret !== null && fret > 0 && finger === null) {
      const coveredByBarre =
        barre !== undefined && fret === barre.fret && index >= barre.from && index <= barre.to;
      if (!coveredByBarre) {
        errors.push(`String ${String(index)}: fretted note has no finger`);
      }
    }

    if (finger === 'T' && index !== 0 && index !== 1) {
      errors.push(`String ${String(index)}: thumb must be on string 0 or 1`);
    }
  });

  for (const finger of REAL_FINGERS) {
    const frets = new Set(notes.filter((note) => note.finger === finger).map((note) => note.fret));
    if (frets.size > 1) {
      errors.push(`Finger ${String(finger)} is used on more than one fret`);
    }
  }

  const frettedNotes = notes.filter((note) => note.fret !== null && note.fret > 0);
  if (frettedNotes.length > 0) {
    const frets = frettedNotes.map((note) => note.fret as number);
    const span = Math.max(...frets) - Math.min(...frets);
    if (span > 5) {
      errors.push(`Span of ${String(span)} frets exceeds 5`);
    }
  }

  if (barre !== undefined && (barre.finger as number) !== 1) {
    errors.push('Barre finger must be 1');
  }

  return errors;
}
