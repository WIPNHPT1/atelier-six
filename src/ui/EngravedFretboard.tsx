import { useId } from 'react';
import { motion } from 'motion/react';
import { describeShape } from '../core/shapes/describe';
import type { Shape } from '../core/shapes/types';
import { useMotionEnabled } from '../app/settingsStore';
import styles from './EngravedFretboard.module.css';

const STRING_COUNT = 6;

export type EngravedFretboardProps = {
  shape: Shape;
  size?: number;
  /** Play the stroke-draw-in once, for a shape newly mastered this visit. */
  animateIn?: boolean;
};

function lowestFrettedFret(shape: Shape): number | undefined {
  const frets = shape.notes.map((n) => n.fret).filter((f): f is number => f !== null && f > 0);
  if (shape.barre) frets.push(shape.barre.fret);
  return frets.length === 0 ? undefined : Math.min(...frets);
}

/** A fine-line "engraved" diagram — a collection-grid trophy, not the interactive Fretboard. */
export function EngravedFretboard({ shape, size = 96, animateIn = false }: EngravedFretboardProps) {
  const motionEnabled = useMotionEnabled();
  const patternId = useId();
  const draw = animateIn && motionEnabled;

  const fretsShown = 4;
  const lowest = lowestFrettedFret(shape);
  const startFret = lowest === undefined ? 0 : Math.max(0, lowest - 1);
  const pad = size * 0.16;
  const gridSpan = size - pad * 2;

  const stringLine = (index: number) => pad + (index * gridSpan) / (STRING_COUNT - 1);
  const fretLine = (offset: number) => pad + (offset * gridSpan) / fretsShown;
  const point = (index: number, offset: number): [number, number] => [
    stringLine(index),
    fretLine(offset),
  ];

  const dotRadius = gridSpan / (STRING_COUNT - 1) / 2.6;
  const fretted = shape.notes
    .map((note, index) => ({ index, fret: note.fret }))
    .filter((n): n is { index: number; fret: number } => n.fret !== null && n.fret > 0);

  return (
    <svg
      className={styles.board}
      width={size}
      height={size}
      viewBox={`0 0 ${String(size)} ${String(size)}`}
      role="img"
      aria-label={describeShape(shape)}
    >
      <defs>
        <pattern
          id={patternId}
          width={4}
          height={4}
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <line x1={0} y1={0} x2={0} y2={4} className={styles.hatchLine} />
        </pattern>
      </defs>

      {Array.from({ length: fretsShown + 1 }, (_, f) => f).map((f, i) => (
        <motion.line
          key={`fret-${String(f)}`}
          className={styles.line}
          x1={pad}
          y1={fretLine(f)}
          x2={pad + gridSpan}
          y2={fretLine(f)}
          {...(draw
            ? {
                initial: { pathLength: 0 },
                animate: { pathLength: 1 },
                transition: { duration: 0.25, delay: i * 0.03, ease: 'easeOut' },
              }
            : {})}
        />
      ))}
      {Array.from({ length: STRING_COUNT }, (_, i) => i).map((index, i) => (
        <motion.line
          key={`string-${String(index)}`}
          className={styles.line}
          x1={stringLine(index)}
          y1={pad}
          x2={stringLine(index)}
          y2={pad + gridSpan}
          {...(draw
            ? {
                initial: { pathLength: 0 },
                animate: { pathLength: 1 },
                transition: { duration: 0.25, delay: 0.15 + i * 0.03, ease: 'easeOut' },
              }
            : {})}
        />
      ))}

      {fretted.map(({ index, fret }, i) => {
        const [x, y] = point(index, fret - startFret - 0.5);
        return (
          <motion.circle
            key={`dot-${String(index)}`}
            cx={x}
            cy={y}
            className={styles.dot}
            style={{ fill: `url(#${patternId})` }}
            {...(draw
              ? {
                  initial: { r: 0, opacity: 0 },
                  animate: { r: dotRadius, opacity: 1 },
                  transition: { duration: 0.2, delay: 0.4 + i * 0.05, ease: 'easeOut' },
                }
              : { r: dotRadius })}
          />
        );
      })}
    </svg>
  );
}
