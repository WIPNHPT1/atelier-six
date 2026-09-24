import styles from './TunerDial.module.css';

const CENTS_RANGE = 50;
const CENTS_RANGE_MIN = -50;
const MAX_ANGLE_DEG = 50;
const PIVOT_X = 100;
const PIVOT_Y = 108;
const NEEDLE_LENGTH = 84;
const TICK_COUNT = 11;
const TICK_RADIUS_OUTER = 92;
const TICK_RADIUS_INNER = 82;

export type TunerDialProps = {
  cents: number;
  inTune: boolean;
  transitionMs?: number;
};

function angleForCents(cents: number): number {
  const clamped = Math.min(CENTS_RANGE, Math.max(-CENTS_RANGE, cents));
  return (clamped / CENTS_RANGE) * MAX_ANGLE_DEG;
}

function needleEndpoint(angleDeg: number): { x: number; y: number } {
  const radians = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: PIVOT_X + NEEDLE_LENGTH * Math.cos(radians),
    y: PIVOT_Y + NEEDLE_LENGTH * Math.sin(radians),
  };
}

function tickPoints(index: number) {
  const t = index / (TICK_COUNT - 1);
  const cents = -CENTS_RANGE + t * (CENTS_RANGE * 2);
  const angleDeg = angleForCents(cents);
  const radians = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x1: PIVOT_X + TICK_RADIUS_INNER * Math.cos(radians),
    y1: PIVOT_Y + TICK_RADIUS_INNER * Math.sin(radians),
    x2: PIVOT_X + TICK_RADIUS_OUTER * Math.cos(radians),
    y2: PIVOT_Y + TICK_RADIUS_OUTER * Math.sin(radians),
    major: index === 0 || index === TICK_COUNT - 1 || index === (TICK_COUNT - 1) / 2,
  };
}

export function TunerDial({ cents, inTune, transitionMs = 0 }: TunerDialProps) {
  const angle = angleForCents(cents);
  const tip = needleEndpoint(angle);

  return (
    <svg
      className={styles.dial}
      viewBox="0 0 200 120"
      role="meter"
      aria-label="Tuning needle"
      aria-valuemin={CENTS_RANGE_MIN}
      aria-valuemax={CENTS_RANGE}
      aria-valuenow={Math.round(Math.min(CENTS_RANGE, Math.max(CENTS_RANGE_MIN, cents)))}
    >
      {Array.from({ length: TICK_COUNT }, (_, index) => tickPoints(index)).map((tick, index) => (
        <line
          key={index}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          className={tick.major ? styles.tickMajor : styles.tickMinor}
        />
      ))}
      <line
        x1={PIVOT_X}
        y1={PIVOT_Y}
        x2={tip.x}
        y2={tip.y}
        className={inTune ? styles.needleInTune : styles.needle}
        style={{ transitionDuration: `${String(transitionMs)}ms` }}
      />
      <circle cx={PIVOT_X} cy={PIVOT_Y} r={5} className={styles.pivot} />
    </svg>
  );
}
