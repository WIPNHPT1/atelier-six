import { create } from 'zustand';
import type { ShortcutAction } from '../../core/input/keymap';

// Voice commands need distinct play/stop and a numeric tempo target, on top of the
// keyboard's own toggle-shaped actions, so a page's registered handlers cover both.
export type PageAction = ShortcutAction | 'play' | 'stop';

export type ShortcutHandlers = Partial<Record<PageAction, () => void>> & {
  setTempo?: (bpm: number) => void;
};

let activeHandlers: ShortcutHandlers = {};

// Only one page's handlers are active at a time: the most recently mounted wins,
// and unmounting clears it (unless a newer page already took over).
export function setActiveShortcuts(handlers: ShortcutHandlers): () => void {
  activeHandlers = handlers;
  return () => {
    if (activeHandlers === handlers) activeHandlers = {};
  };
}

export function dispatchToActivePage(action: PageAction): boolean {
  const handler = activeHandlers[action];
  if (!handler) return false;
  handler();
  return true;
}

export function dispatchSetTempo(bpm: number): boolean {
  const handler = activeHandlers.setTempo;
  if (!handler) return false;
  handler(bpm);
  return true;
}

export function clearActiveShortcuts(): void {
  activeHandlers = {};
}

type ShortcutLogState = {
  lastAction: ShortcutAction | null;
  receivedAt: number;
  record: (action: ShortcutAction) => void;
};

// Every recognised key press is logged here, even one with no page listening,
// so the Settings "foot pedal test" row can show what a pedal just sent.
export const useShortcutLog = create<ShortcutLogState>((set) => ({
  lastAction: null,
  receivedAt: 0,
  record: (action) => {
    set({ lastAction: action, receivedAt: Date.now() });
  },
}));
