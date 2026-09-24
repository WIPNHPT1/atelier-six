import { t } from '../content/copy.en-GB.ts';

export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${String(n)}th`;
  const mod10 = n % 10;
  const suffix = mod10 === 1 ? 'st' : mod10 === 2 ? 'nd' : mod10 === 3 ? 'rd' : 'th';
  return `${String(n)}${suffix}`;
}

export function joinOrdinals(numbers: number[]): string {
  const words = numbers.map(ordinal);
  return joinWords(words);
}

export function joinWords(words: string[]): string {
  if (words.length === 1) return words[0] as string;
  const last = words[words.length - 1] as string;
  const rest = words.slice(0, -1);
  return `${rest.join(', ')} ${t('fretboard.and')} ${last}`;
}
