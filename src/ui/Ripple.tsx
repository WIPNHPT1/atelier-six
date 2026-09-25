import { AnimatePresence, motion } from 'motion/react';
import { useMotionEnabled } from '../app/settingsStore';
import styles from './Ripple.module.css';

export type RippleProps = {
  /** Bump this to fire a new ring — e.g. `pulseKey={cleanCount}`. */
  pulseKey: number;
};

/** A thin brass ring that expands from the centre and fades. One per event. */
export function Ripple({ pulseKey }: RippleProps) {
  const motionEnabled = useMotionEnabled();
  if (pulseKey <= 0 || !motionEnabled) return null;

  return (
    <div className={styles.layer} aria-hidden="true">
      <AnimatePresence>
        <motion.span
          key={pulseKey}
          className={styles.ring}
          initial={{ scale: 0.3, opacity: 0.9 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </AnimatePresence>
    </div>
  );
}
