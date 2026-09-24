import { t } from '../../content/copy.en-GB.ts';
import { joinWords, ordinal } from '../ordinal.ts';
import type { Group, Move, RealFinger, Transition } from './types.ts';

const STRING_COUNT = 6;

function stringNumber(index: number): number {
  return STRING_COUNT - index;
}

export function fingerWord(finger: RealFinger): string {
  return finger === 'T' ? t('fretboard.thumb') : String(finger);
}

export function fingerList(fingers: RealFinger[]): string {
  return joinWords(fingers.map(fingerWord));
}

function explainAnchors(fingers: RealFinger[]): string {
  const key = fingers.length === 1 ? 'transition.keepOne' : 'transition.keepMany';
  return t(key, { finger: fingerWord(fingers[0] as RealFinger), fingers: fingerList(fingers) });
}

function explainGroup(group: Group): string {
  const fingers = fingerList(group.fingers);
  if (group.kind === 'slide') {
    const frets = Math.abs(group.vector.dFret);
    const direction = group.vector.dFret > 0 ? t('transition.bridge') : t('transition.headstock');
    const key = frets === 1 ? 'transition.slideOne' : 'transition.slideMany';
    return t(key, { fingers, frets, direction });
  }
  const strings = Math.abs(group.vector.dString);
  const thickness = group.vector.dString > 0 ? t('transition.thinner') : t('transition.thicker');
  const key = strings === 1 ? 'transition.shiftOne' : 'transition.shiftMany';
  return t(key, { fingers, strings, thickness });
}

function explainLift(move: Move): string | null {
  if (!move.to) return null;
  return t('transition.lift', {
    finger: fingerWord(move.finger),
    string: ordinal(stringNumber(move.to.string)),
    fret: ordinal(move.to.fret),
  });
}

function explainPlace(move: Move): string | null {
  if (!move.to) return null;
  return t('transition.place', {
    finger: fingerWord(move.finger),
    string: ordinal(stringNumber(move.to.string)),
    fret: ordinal(move.to.fret),
  });
}

function explainRelease(move: Move): string | null {
  if (!move.from) return null;
  return t('transition.release', {
    finger: fingerWord(move.finger),
    string: ordinal(stringNumber(move.from.string)),
  });
}

export function explainTransition(transition: Transition): string[] {
  const sentences: string[] = [];

  const anchors = transition.moves
    .filter((move) => move.type === 'anchor')
    .map((move) => move.finger);
  if (anchors.length > 0) sentences.push(explainAnchors(anchors));

  for (const group of transition.groups) sentences.push(explainGroup(group));

  for (const move of transition.moves) {
    if (move.type !== 'lift') continue;
    const sentence = explainLift(move);
    if (sentence) sentences.push(sentence);
  }
  for (const move of transition.moves) {
    if (move.type !== 'place') continue;
    const sentence = explainPlace(move);
    if (sentence) sentences.push(sentence);
  }
  for (const move of transition.moves) {
    if (move.type !== 'release') continue;
    const sentence = explainRelease(move);
    if (sentence) sentences.push(sentence);
  }

  return sentences;
}
