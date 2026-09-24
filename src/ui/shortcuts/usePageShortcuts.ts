import { useEffect } from 'react';
import { setActiveShortcuts, type ShortcutHandlers } from './shortcutRegistry';

// Registers the calling page's handlers as the active target for global shortcuts.
// Deps mirror the values the handlers close over, same as any other effect.
export function usePageShortcuts(handlers: ShortcutHandlers, deps: unknown[]): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setActiveShortcuts(handlers), deps);
}
