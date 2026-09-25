import { motion } from 'motion/react';
import { useMotionEnabled, useSettingsStore } from '../../app/settingsStore';
import type { Position, Transition } from '../../core/engine/types';
import styles from './FingerGlide.module.css';

const STRING_COUNT = 6;
const STEP_MS = 420;
const STAGGER_MS = 40;

export type FingerGlideProps = {
  transition: Transition;
  size?: number;
};

function fretsOf(positions: (Position | undefined)[]): number[] {
  return positions.filter((p): p is Position => p !== undefined).map((p) => p.fret);
}

/** A single board where each finger travels from its old position to its new one —
 * guides/slides glide, lifts arc, anchors pulse, releases fade out, new places fade in. */
export function FingerGlide({ transition, size = 220 }: FingerGlideProps) {
  const motionEnabled = useMotionEnabled();
  const mirrored = useSettingsStore((s) => s.leftHanded);

  const frets = fretsOf(transition.moves.flatMap((m) => [m.from, m.to]));
  const maxFret = frets.length === 0 ? 3 : Math.max(...frets);
  const minFret = frets.length === 0 ? 1 : Math.min(...frets.filter((f) => f > 0));
  const startFret = Math.max(0, (Number.isFinite(minFret) ? minFret : 1) - 1);
  const fretsShown = Math.max(4, maxFret - startFret + 1);

  const pad = size * 0.16;
  const gridSpan = size - pad * 2;
  const stringLine = (index: number) => {
    const order = mirrored ? STRING_COUNT - 1 - index : index;
    return pad + (order * gridSpan) / (STRING_COUNT - 1);
  };
  const fretLine = (offset: number) => pad + (offset * gridSpan) / fretsShown;
  const point = (index: number, fret: number): [number, number] => [
    stringLine(index),
    fretLine(fret - startFret - 0.5),
  ];

  const delaysByFinger = transition.moves.reduce<{
    seconds: Map<string, number>;
    groupSeconds: Map<number, number>;
    count: number;
  }>(
    (acc, move) => {
      const delayKey = move.groupIndex ?? -1;
      const existing = delayKey >= 0 ? acc.groupSeconds.get(delayKey) : undefined;
      const seconds = existing ?? (acc.count * STAGGER_MS) / 1000;
      const groupSeconds =
        delayKey >= 0 && existing === undefined
          ? new Map(acc.groupSeconds).set(delayKey, seconds)
          : acc.groupSeconds;
      return {
        seconds: new Map(acc.seconds).set(String(move.finger), seconds),
        groupSeconds,
        count: existing === undefined ? acc.count + 1 : acc.count,
      };
    },
    { seconds: new Map(), groupSeconds: new Map(), count: 0 },
  ).seconds;

  return (
    <svg
      className={styles.board}
      width={size}
      height={size}
      viewBox={`0 0 ${String(size)} ${String(size)}`}
      aria-hidden="true"
    >
      {Array.from({ length: fretsShown + 1 }, (_, f) => f).map((f) => (
        <line
          key={`fret-${String(f)}`}
          className={styles.fret}
          x1={pad}
          y1={fretLine(f)}
          x2={pad + gridSpan}
          y2={fretLine(f)}
        />
      ))}
      {Array.from({ length: STRING_COUNT }, (_, i) => i).map((index) => (
        <line
          key={`string-${String(index)}`}
          className={styles.string}
          x1={stringLine(index)}
          y1={pad}
          x2={stringLine(index)}
          y2={pad + gridSpan}
        />
      ))}

      {transition.moves.map((move) => {
        const delaySeconds = delaysByFinger.get(String(move.finger)) ?? 0;
        const duration = STEP_MS / 1000;

        if (!motionEnabled) {
          const rest = move.to ?? move.from;
          if (!rest) return null;
          const [x, y] = point(rest.string, rest.fret);
          return move.type === 'release' ? null : (
            <circle
              key={`dot-${String(move.finger)}`}
              cx={x}
              cy={y}
              r={gridSpan / (STRING_COUNT - 1) / 2.6}
              className={styles.dot}
            />
          );
        }

        const r = gridSpan / (STRING_COUNT - 1) / 2.6;

        if (move.type === 'anchor' && move.to) {
          const [x, y] = point(move.to.string, move.to.fret);
          return (
            <g key={`anchor-${String(move.finger)}`}>
              <circle cx={x} cy={y} r={r} className={styles.dot} />
              <motion.circle
                cx={x}
                cy={y}
                className={styles.pulse}
                initial={{ r, opacity: 0.6 }}
                animate={{ r: r * 1.8, opacity: 0 }}
                transition={{ duration, delay: delaySeconds, ease: 'easeOut' }}
              />
            </g>
          );
        }

        if (move.type === 'release' && move.from) {
          const [x, y] = point(move.from.string, move.from.fret);
          return (
            <motion.circle
              key={`release-${String(move.finger)}`}
              cx={x}
              cy={y}
              className={styles.dot}
              initial={{ r, opacity: 1 }}
              animate={{ r: 0, opacity: 0 }}
              transition={{ duration, delay: delaySeconds, ease: 'easeOut' }}
            />
          );
        }

        if (move.type === 'place' && move.to) {
          const [x, y] = point(move.to.string, move.to.fret);
          return (
            <motion.circle
              key={`place-${String(move.finger)}`}
              cx={x}
              cy={y}
              className={styles.dot}
              initial={{ r: 0, opacity: 0 }}
              animate={{ r, opacity: 1 }}
              transition={{ duration, delay: delaySeconds, ease: 'easeOut' }}
            />
          );
        }

        if (move.from && move.to) {
          const [fx, fy] = point(move.from.string, move.from.fret);
          const [tx, ty] = point(move.to.string, move.to.fret);
          const isLift = move.type === 'lift';
          const midY = isLift ? Math.min(fy, ty) - gridSpan * 0.18 : (fy + ty) / 2;
          return (
            <g key={`travel-${String(move.finger)}`}>
              <motion.line
                className={styles.trail}
                x1={fx}
                y1={fy}
                x2={tx}
                y2={ty}
                initial={{ pathLength: 0, opacity: 0.8 }}
                animate={{ pathLength: 1, opacity: [0.8, 0.8, 0] }}
                transition={{ duration, delay: delaySeconds, ease: 'easeOut' }}
              />
              <motion.circle
                cx={fx}
                cy={fy}
                r={r}
                className={styles.dot}
                animate={{ cx: [fx, (fx + tx) / 2, tx], cy: [fy, midY, ty] }}
                transition={{ duration, delay: delaySeconds, ease: 'easeOut' }}
              />
            </g>
          );
        }

        return null;
      })}
    </svg>
  );
}
