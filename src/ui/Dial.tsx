import styles from './Dial.module.css';

export type DialProps = {
  label: string;
  value: number;
  displayValue?: string;
  size?: number;
};

export function Dial({ label, value, displayValue, size = 96 }: DialProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const strokeWidth = size * 0.08;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);

  return (
    <div className={styles.wrapper}>
      <div className={styles.ringBox} style={{ width: size, height: size }}>
        <div
          className={styles.track}
          data-testid="dial-track"
          style={{ ['--dial-stroke' as string]: `${String(strokeWidth)}px` }}
        />
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${String(size)} ${String(size)}`}
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(clamped * 100)}
        >
          <circle
            className={styles.fill}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${String(size / 2)} ${String(size / 2)})`}
          />
        </svg>
      </div>
      {displayValue ? <span className={styles.label}>{displayValue}</span> : null}
    </div>
  );
}
