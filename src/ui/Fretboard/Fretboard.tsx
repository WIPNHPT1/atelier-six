import { useSettingsStore } from '../../app/settingsStore';
import { copy, t } from '../../content/copy.en-GB';
import { describeShape } from '../../core/shapes/describe';
import type { Finger, Shape } from '../../core/shapes/types';
import styles from './Fretboard.module.css';

const STRING_COUNT = 6;

export type FretboardOrientation = 'box' | 'neck';

export type FretboardProps = {
  shape: Shape;
  orientation?: FretboardOrientation;
  fretsShown?: number;
  showFingers?: boolean;
  ghost?: Shape;
  highlightStrings?: number[];
  leftHanded?: boolean;
  size?: number;
};

function fingerLabel(finger: Finger): string {
  return finger === 'T' ? 'T' : String(finger);
}

function lowestFrettedFret(shape: Shape): number | undefined {
  const frets = shape.notes
    .map((note) => note.fret)
    .filter((fret): fret is number => fret !== null && fret > 0);
  if (shape.barre) frets.push(shape.barre.fret);
  if (frets.length === 0) return undefined;
  return Math.min(...frets);
}

function isCoveredByBarre(shape: Shape, index: number, fret: number | null): boolean {
  const { barre } = shape;
  return barre !== undefined && fret === barre.fret && index >= barre.from && index <= barre.to;
}

export function Fretboard({
  shape,
  orientation = 'box',
  fretsShown = 5,
  showFingers = true,
  ghost,
  highlightStrings,
  leftHanded,
  size = 140,
}: FretboardProps) {
  const settingsLeftHanded = useSettingsStore((s) => s.leftHanded);
  const mirrored = leftHanded ?? settingsLeftHanded;
  const isBox = orientation === 'box';

  const lowest = lowestFrettedFret(shape);
  const startFret = lowest === undefined ? 0 : Math.max(0, lowest - 1);
  const hasNut = startFret === 0;

  const pad = size * 0.16;
  const gridSpan = size - pad * 2;

  const stringLine = (index: number): number => {
    const order = mirrored ? STRING_COUNT - 1 - index : index;
    return pad + (order * gridSpan) / (STRING_COUNT - 1);
  };

  const fretLine = (fretOffset: number): number => pad + (fretOffset * gridSpan) / fretsShown;

  const point = (index: number, fretOffset: number): [number, number] => {
    if (isBox) return [stringLine(index), fretLine(fretOffset)];
    const rowOrder = STRING_COUNT - 1 - index;
    const y = pad + (rowOrder * gridSpan) / (STRING_COUNT - 1);
    const axisOffset = mirrored ? fretsShown - fretOffset : fretOffset;
    const x = pad + (axisOffset * gridSpan) / fretsShown;
    return [x, y];
  };

  const stringWidth = (index: number): number =>
    1 + ((STRING_COUNT - 1 - index) / (STRING_COUNT - 1)) * 1.4;
  const dotRadius = gridSpan / (STRING_COUNT - 1) / 2.6;
  const highlighted = new Set((highlightStrings ?? []).map((n) => STRING_COUNT - n));

  const fretted: { index: number; fret: number; finger: Finger | null }[] = [];
  const open: number[] = [];
  const muted: number[] = [];

  shape.notes.forEach((note, index) => {
    if (isCoveredByBarre(shape, index, note.fret)) return;
    if (note.fret === null) {
      muted.push(index);
    } else if (note.fret === 0) {
      open.push(index);
    } else {
      fretted.push({ index, fret: note.fret, finger: note.finger });
    }
  });

  const ghostDots =
    ghost === undefined
      ? []
      : ghost.notes
          .map((note, index) => ({ index, fret: note.fret }))
          .filter(
            (n): n is { index: number; fret: number } =>
              n.fret !== null && n.fret > 0 && !isCoveredByBarre(ghost, n.index, n.fret),
          );

  const symbolOffset = -0.55;
  const label = describeShape(shape);

  return (
    <svg
      className={styles.fretboard}
      width={size}
      height={size}
      viewBox={`0 0 ${String(size)} ${String(size)}`}
      role="img"
      aria-label={label}
    >
      {isBox && hasNut ? (
        <line
          className={styles.nut}
          x1={pad}
          y1={fretLine(0)}
          x2={pad + gridSpan}
          y2={fretLine(0)}
        />
      ) : null}
      {!hasNut ? (
        <text
          className={styles.fretLabel}
          x={isBox ? pad - dotRadius : pad}
          y={isBox ? fretLine(0.5) : pad - dotRadius}
        >
          {t('fretboard.startFret', { fret: startFret + 1 })}
        </text>
      ) : null}

      {Array.from({ length: fretsShown + 1 }, (_, f) => f)
        .filter((f) => !(isBox && hasNut && f === 0))
        .map((f) => {
          const [x1, y1] = isBox ? [pad, fretLine(f)] : [fretLine(f), pad];
          const [x2, y2] = isBox ? [pad + gridSpan, fretLine(f)] : [fretLine(f), pad + gridSpan];
          return (
            <line
              key={`fret-${String(f)}`}
              className={styles.fret}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
            />
          );
        })}

      {Array.from({ length: STRING_COUNT }, (_, i) => i).map((index) => {
        const [x1, y1] = isBox ? [stringLine(index), pad] : [pad, point(index, 0)[1]];
        const [x2, y2] = isBox
          ? [stringLine(index), pad + gridSpan]
          : [pad + gridSpan, point(index, 0)[1]];
        return (
          <line
            key={`string-${String(index)}`}
            className={styles.string}
            data-testid={`fretboard-string-${String(STRING_COUNT - index)}`}
            data-highlighted={highlighted.has(index) || undefined}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            strokeWidth={stringWidth(index)}
          />
        );
      })}

      {shape.barre
        ? (() => {
            const barre = shape.barre;
            const offset = barre.fret - startFret - 0.5;
            const [x1, y1] = point(barre.from, offset);
            const [x2, y2] = point(barre.to, offset);
            return (
              <line
                className={styles.barre}
                data-testid="fretboard-barre"
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeWidth={dotRadius * 1.8}
              />
            );
          })()
        : null}

      {ghostDots.map(({ index, fret }) => {
        const [x, y] = point(index, fret - startFret - 0.5);
        return (
          <circle
            key={`ghost-${String(index)}`}
            className={styles.ghost}
            data-testid="fretboard-ghost"
            cx={x}
            cy={y}
            r={dotRadius}
          />
        );
      })}

      {fretted.map(({ index, fret, finger }) => {
        const [x, y] = point(index, fret - startFret - 0.5);
        const colourVar = finger === null ? '--f1' : `--f${String(finger)}`;
        return (
          <g key={`dot-${String(index)}`} data-testid="fretboard-dot">
            <circle
              className={styles.dot}
              cx={x}
              cy={y}
              r={dotRadius}
              style={{ fill: `var(${colourVar})` }}
            />
            {showFingers && finger !== null ? (
              <text className={styles.dotLabel} x={x} y={y}>
                {fingerLabel(finger)}
              </text>
            ) : null}
          </g>
        );
      })}

      {open.map((index) => {
        const [x, y] = point(index, symbolOffset);
        return (
          <text
            key={`open-${String(index)}`}
            className={styles.symbol}
            data-testid="fretboard-open"
            x={x}
            y={y}
          >
            {copy.fretboard.openSymbol}
          </text>
        );
      })}

      {muted.map((index) => {
        const [x, y] = point(index, symbolOffset);
        return (
          <text
            key={`muted-${String(index)}`}
            className={styles.symbol}
            data-testid="fretboard-muted"
            x={x}
            y={y}
          >
            {copy.fretboard.mutedSymbol}
          </text>
        );
      })}
    </svg>
  );
}
