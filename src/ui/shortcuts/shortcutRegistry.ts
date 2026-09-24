import { create } from 'zustand';
import type { ShortcutAction } from '../../core/input/keymap';

export type ShortcutHandlers = Partial<Record<ShortcutAction, () => void>>;

let activeHandlers: ShortcutHandlers = {};

// Only one page's handlers are active at a time: the most recently mounted wins,
// and unmounting clears it (unless a newer page already took over).
export function setActiveShortcuts(handlers: ShortcutHandlers): () => void {
  activeHandlers = handlers;
  return () => {
    if (activeHandlers === handlers) activeHandlers = {};
  };
}

export function dispatchToActivePage(action: ShortcutAction): boolean {
  const handler = activeHandlers[action];
  if (!handler) return false;
  handler();
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
