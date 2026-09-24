import { SHORTCUT_ACTIONS, type ShortcutAction } from '../../core/input/keymap';
import { copy } from '../../content/copy.en-GB';
import { Mono } from '../Mono';
import { Sheet } from '../Sheet';
import { Text } from '../Text';
import styles from './ShortcutsOverlay.module.css';

const KEY_LABEL: Record<ShortcutAction, string> = {
  togglePlay: copy.shortcuts.keyTogglePlay,
  next: copy.shortcuts.keyNext,
  prev: copy.shortcuts.keyPrev,
  toggleLoop: copy.shortcuts.keyToggleLoop,
  slower: copy.shortcuts.keySlower,
  faster: copy.shortcuts.keyFaster,
  clean: copy.shortcuts.keyClean,
  missed: copy.shortcuts.keyMissed,
  tuner: copy.shortcuts.keyTuner,
  help: copy.shortcuts.keyHelp,
};

export type ShortcutsOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function ShortcutsOverlay({ open, onClose }: ShortcutsOverlayProps) {
  return (
    <Sheet title={copy.shortcuts.title} open={open} onClose={onClose}>
      <ul className={styles.list}>
        {SHORTCUT_ACTIONS.map((action) => (
          <li key={action} className={styles.row}>
            <Text>{copy.shortcuts[action]}</Text>
            <Mono>{KEY_LABEL[action]}</Mono>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
