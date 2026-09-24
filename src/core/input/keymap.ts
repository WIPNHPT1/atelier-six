export type ShortcutAction =
  | 'togglePlay'
  | 'next'
  | 'prev'
  | 'toggleLoop'
  | 'slower'
  | 'faster'
  | 'clean'
  | 'missed'
  | 'tuner'
  | 'help';

export const SHORTCUT_ACTIONS: ShortcutAction[] = [
  'togglePlay',
  'next',
  'prev',
  'toggleLoop',
  'slower',
  'faster',
  'clean',
  'missed',
  'tuner',
  'help',
];

type KeyLike = { key: string };

const KEY_TO_ACTION: Record<string, ShortcutAction> = {
  ' ': 'togglePlay',
  Spacebar: 'togglePlay',
  ArrowRight: 'next',
  PageDown: 'next',
  ArrowLeft: 'prev',
  PageUp: 'prev',
  l: 'toggleLoop',
  L: 'toggleLoop',
  '-': 'slower',
  _: 'slower',
  '=': 'faster',
  '+': 'faster',
  c: 'clean',
  C: 'clean',
  m: 'missed',
  M: 'missed',
  t: 'tuner',
  T: 'tuner',
  '?': 'help',
};

// Page-turner pedals send PageDown/PageUp or plain arrow keys, so this table covers them too.
export function actionForKey(event: KeyLike): ShortcutAction | null {
  return KEY_TO_ACTION[event.key] ?? null;
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return true;
  return target.isContentEditable || target.getAttribute('contenteditable') === 'true';
}
