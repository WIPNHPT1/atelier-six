import type { ReactNode } from 'react';
import { useMotionEnabled } from '../app/settingsStore';
import { useTiltStore } from './brassSheen/tiltStore';
import styles from './BrassSheen.module.css';

export type BrassSheenProps = {
  /** Bump this to replay the sweep — e.g. on lesson complete or reaching target tempo. */
  triggerKey: number;
  children: ReactNode;
};

/** Wraps brass UI (logo dot, primary buttons, the practice ring) with a one-shot light
 * sweep for key moments. Follows device tilt where granted, otherwise a timed sweep. */
export function BrassSheen({ triggerKey, children }: BrassSheenProps) {
  const motionEnabled = useMotionEnabled();
  const tilt = useTiltStore((s) => (s.supported ? s.angleDeg : null));

  return (
    <span className={styles.wrap}>
      {children}
      {motionEnabled && triggerKey > 0 ? (
        <span
          key={triggerKey}
          aria-hidden="true"
          data-testid="brass-sheen"
          className={styles.sheen}
          style={tilt === null ? undefined : { ['--sheen-angle' as string]: `${String(tilt)}deg` }}
        />
      ) : null}
    </span>
  );
}
