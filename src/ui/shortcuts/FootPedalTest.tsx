import { useMotionEnabled } from '../../app/settingsStore';
import { copy } from '../../content/copy.en-GB';
import { Pill } from '../Pill';
import { useShortcutLog } from './shortcutRegistry';
import styles from './FootPedalTest.module.css';

export function FootPedalTest() {
  const lastAction = useShortcutLog((s) => s.lastAction);
  const receivedAt = useShortcutLog((s) => s.receivedAt);
  const motionEnabled = useMotionEnabled();
  const label = lastAction ? copy.shortcuts[lastAction] : copy.settings.footPedalTestWaiting;

  return (
    <Pill
      key={receivedAt}
      className={lastAction && motionEnabled ? styles.flash : undefined}
      data-testid="foot-pedal-test-result"
    >
      {label}
    </Pill>
  );
}
