import type { Finger, Shape, StringNote } from './types.ts';

const STRING_COUNT = 6;

function parseFrets(frets: string): Array<number | null> {
  const result: Array<number | null> = [];
  let i = 0;
  while (i < frets.length) {
    const ch = frets[i] as string;
    if (ch === 'x') {
      result.push(null);
      i++;
      continue;
    }
    if (ch === '(') {
      const close = frets.indexOf(')', i);
      if (close === -1) {
        throw new Error(`Unterminated fret group in "${frets}"`);
      }
      result.push(Number(frets.slice(i + 1, close)));
      i = close + 1;
      continue;
    }
    if (!/^[0-9]$/.test(ch)) {
      throw new Error(`Invalid fret character "${ch}" in "${frets}"`);
    }
    result.push(Number(ch));
    i++;
  }
  if (result.length !== STRING_COUNT) {
    throw new Error(
      `Expected ${String(STRING_COUNT)} strings in frets "${frets}", got ${String(result.length)}`,
    );
  }
  return result;
}

function decodeFinger(ch: string, fret: number | null): Finger | null {
  if (ch === '-') return fret === 0 ? 0 : null;
  if (ch === 'T') return 'T';
  if (/^[1-4]$/.test(ch)) return Number(ch) as Finger;
  throw new Error(`Invalid finger character "${ch}"`);
}

export type ParseShapeOptions = {
  tags?: string[];
  register?: Shape['register'];
  barre?: Shape['barre'];
};

export function parseShape(
  id: string,
  chord: string,
  frets: string,
  fingers: string,
  opts: ParseShapeOptions = {},
): Shape {
  const parsedFrets = parseFrets(frets);
  if (fingers.length !== STRING_COUNT) {
    throw new Error(`Expected ${String(STRING_COUNT)} finger characters, got "${fingers}"`);
  }

  const notes = parsedFrets.map((fret, index): StringNote => {
    const finger = decodeFinger(fingers[index] as string, fret);
    return { fret, finger };
  }) as Shape['notes'];

  return {
    id,
    chord,
    notes,
    register: opts.register ?? 'low',
    tags: opts.tags ?? [],
    ...(opts.barre ? { barre: opts.barre } : {}),
  };
}
