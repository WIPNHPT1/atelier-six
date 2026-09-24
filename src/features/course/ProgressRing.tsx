import styles from './ProgressRing.module.css';

const RADIUS = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export type ProgressRingProps = {
  done: number;
  total: number;
  label: string;
  size?: number;
  showCount?: boolean;
};

export function ProgressRing({
  done,
  total,
  label,
  size = 40,
  showCount = false,
}: ProgressRingProps) {
  const fraction = total > 0 ? Math.min(1, done / total) : 0;
  return (
    <span
      className={styles.ring}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
        <circle className={styles.track} cx="20" cy="20" r={RADIUS} />
        {fraction === 0 ? null : (
          <circle
            className={styles.fill}
            cx="20"
            cy="20"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          />
        )}
      </svg>
      {showCount ? <span className={styles.count}>{done}</span> : null}
    </span>
  );
}
