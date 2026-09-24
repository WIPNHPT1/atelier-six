import { useEffect } from 'react';
import { actionForKey, isEditableTarget } from '../../core/input/keymap';
import { dispatchToActivePage, useShortcutLog } from './shortcutRegistry';

export type UseShortcutsOptions = {
  onHelp: () => void;
  onTuner: () => void;
};

// Mounted once by the app shell: maps every keydown to an action, logs it for the
// foot-pedal test, then either runs a global handler or hands it to the active page.
export function useShortcuts({ onHelp, onTuner }: UseShortcutsOptions): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || isEditableTarget(event.target)) {
        return;
      }
      const action = actionForKey(event);
      if (!action) return;
      useShortcutLog.getState().record(action);

      if (action === 'help') {
        event.preventDefault();
        onHelp();
        return;
      }
      if (action === 'tuner') {
        event.preventDefault();
        onTuner();
        return;
      }
      if (dispatchToActivePage(action)) event.preventDefault();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onHelp, onTuner]);
}
