import { Fragment, useEffect, useRef } from 'react';
import { copy, t } from '../../content/copy.en-GB';
import { noteName } from '../../core/theory/pitch';
import type { TabColumn } from '../../core/tab/renderTab';
import type { TimeSignature } from '../../core/tab/playability';
import type { Shape } from '../../core/shapes/types';
import type { Tuning } from '../../core/tuning';
import { useMotionEnabled } from '../../app/settingsStore';
import { cx } from '../cx';
import styles from './TabLane.module.css';

const STRING_COUNT = 6;
const DEFAULT_TIME_SIG: TimeSignature = { top: 4, bottom: 4 };
const DOTTED_BASE: Record<number, number> = { 3: 2, 6: 4, 12: 8 };
const STAFF_H = 28;
const STEM_TOP = 4;
const BEAM_Y = STEM_TOP;
const BEAM2_Y = STEM_TOP + 4;

export type TabLaneHeader = { tempo: number; tuning: string; capo: number; key: string };

export type TabLaneProps = {
  columns: TabColumn[];
  shapes: Shape[];
  tuning: Tuning;
  playhead?: number;
  timeSig?: TimeSignature;
  showCount?: boolean;
  showPickDirection?: boolean;
  header?: TabLaneHeader;
  sectionLabels?: Record<number, string>;
  repeatEndBars?: number[];
  dynamics?: Record<number, string>;
};

function stringLabel(tuning: Tuning, index: number): string {
  const name = noteName(tuning[index] ?? 0);
  return index === STRING_COUNT - 1 ? name.toLowerCase() : name;
}

function chordLabelAt(columns: TabColumn[], shapes: Shape[], columnIndex: number): string | null {
  const column = columns[columnIndex];
  if (!column) return null;
  const previous = columns[columnIndex - 1];
  if (previous !== undefined && previous.chordIndex === column.chordIndex) return null;
  return shapes[column.chordIndex]?.chord ?? null;
}

function strumSymbol(dir: TabColumn['dir']): string | null {
  if (dir === 'D') return copy.tabLane.down;
  if (dir === 'U') return copy.tabLane.up;
  return null;
}

function isPalmMuteStart(columns: TabColumn[], index: number): boolean {
  const column = columns[index];
  if (column?.palmMute !== true) return false;
  const previous = columns[index - 1];
  return previous?.palmMute !== true;
}

function isBarStart(columns: TabColumn[], index: number): boolean {
  const column = columns[index];
  const previous = columns[index - 1];
  return previous === undefined || previous.bar !== column?.bar;
}

function countSyllable(offset: number): string {
  const pos = offset % 16;
  const sub = pos % 4;
  if (sub === 1) return 'e';
  if (sub === 2) return '&';
  if (sub === 3) return 'a';
  return String(Math.floor(pos / 4) + 1);
}

function isRest(column: TabColumn): boolean {
  return column.dir === 'mute' && !column.ghost;
}

type BeamGroup = { columns: TabColumn[] };

function beamGroups(columns: TabColumn[]): BeamGroup[] {
  const groups: BeamGroup[] = [];
  let current: TabColumn[] = [];

  const isBeamable = (column: TabColumn) => !isRest(column) && column.duration <= 2;

  columns.forEach((column) => {
    const last = current[current.length - 1];
    const canJoin =
      isBeamable(column) && last !== undefined && last.bar === column.bar && isBeamable(last);
    if (canJoin) {
      current.push(column);
      return;
    }
    if (current.length > 0) groups.push({ columns: current });
    current = [column];
  });
  if (current.length > 0) groups.push({ columns: current });

  return groups;
}

function RestGlyph() {
  return (
    <svg viewBox={`0 0 24 ${String(STAFF_H)}`} className={styles.notationSvg} data-testid="rest">
      <path className={styles.notationStroke} d="M8 6 L16 6 L9 14 L16 22 L8 22" fill="none" />
    </svg>
  );
}

function NotationGroup({ group }: { group: BeamGroup }) {
  const { columns: notes } = group;

  if (notes.length === 1 && isRest(notes[0] as TabColumn)) {
    return <RestGlyph />;
  }

  const totalWidth = notes.reduce((sum, note) => sum + note.duration, 0);
  const unit = 100 / totalWidth;
  const stems = notes.reduce<{ list: { x: number; note: TabColumn }[]; cursor: number }>(
    (acc, note) => ({
      list: [...acc.list, { x: (acc.cursor + note.duration / 2) * unit, note }],
      cursor: acc.cursor + note.duration,
    }),
    { list: [], cursor: 0 },
  ).list;

  const beamed = notes.length >= 2;
  const sixteenthXs = stems.filter(({ note }) => note.duration === 1).map(({ x }) => x);

  return (
    <svg
      viewBox={`0 0 100 ${String(STAFF_H)}`}
      preserveAspectRatio="none"
      className={styles.notationSvg}
    >
      {stems.map(({ x, note }) => (
        <line
          key={`stem-${String(note.step)}`}
          data-testid="stem"
          className={styles.notationStroke}
          x1={x}
          y1={STEM_TOP}
          x2={x}
          y2={STAFF_H - 2}
        />
      ))}
      {beamed ? (
        <line
          data-testid="beam"
          className={styles.notationBeam}
          x1={stems[0]?.x}
          y1={BEAM_Y}
          x2={stems[stems.length - 1]?.x}
          y2={BEAM_Y}
        />
      ) : null}
      {beamed && sixteenthXs.length >= 2 ? (
        <line
          data-testid="beam"
          className={styles.notationBeam}
          x1={sixteenthXs[0]}
          y1={BEAM2_Y}
          x2={sixteenthXs[sixteenthXs.length - 1]}
          y2={BEAM2_Y}
        />
      ) : null}
      {stems.map(({ x, note }) =>
        DOTTED_BASE[note.duration] !== undefined ? (
          <circle
            key={`dot-${String(note.step)}`}
            data-testid="dot"
            className={styles.notationDot}
            cx={x + 4}
            cy={STAFF_H - 4}
            r={1.4}
          />
        ) : null,
      )}
    </svg>
  );
}

export function TabLane({
  columns,
  shapes,
  tuning,
  playhead,
  timeSig = DEFAULT_TIME_SIG,
  showCount = true,
  showPickDirection = true,
  header,
  sectionLabels,
  repeatEndBars,
  dynamics,
}: TabLaneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const motionEnabled = useMotionEnabled();

  useEffect(() => {
    const el = activeRef.current;
    if (!el || typeof el.scrollIntoView !== 'function') return;
    el.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: motionEnabled ? 'smooth' : 'auto',
    });
  }, [playhead, motionEnabled]);

  const groups = beamGroups(columns);

  return (
    <div className={styles.wrapper}>
      {header ? (
        <p className={styles.header}>
          {t('tabLane.header', {
            tempo: header.tempo,
            tuning: header.tuning,
            capo: header.capo,
            key: header.key,
          })}
        </p>
      ) : null}

      <div
        ref={rootRef}
        className={styles.lane}
        data-playhead-step={playhead ?? undefined}
        style={{
          gridTemplateColumns: `auto repeat(${String(columns.length)}, minmax(1.2em, 1fr))`,
        }}
      >
        <div className={styles.corner}>
          <span className={styles.timeSig}>
            <span>{timeSig.top}</span>
            <span>{timeSig.bottom}</span>
          </span>
        </div>
        {columns.map((column, index) => (
          <div key={`bar-${String(index)}`} className={styles.barNumber}>
            {isBarStart(columns, index) ? column.bar + 1 : ''}
            {repeatEndBars?.includes(column.bar) &&
            (columns[index + 1] === undefined || columns[index + 1]?.bar !== column.bar)
              ? ` ${copy.tabLane.repeatEnd}`
              : ''}
          </div>
        ))}

        <div className={styles.corner} />
        {columns.map((column, index) => (
          <div key={`section-${String(index)}`} className={styles.sectionLabel}>
            {isBarStart(columns, index) ? (sectionLabels?.[column.bar] ?? '') : ''}
          </div>
        ))}

        <div className={styles.corner} />
        {columns.map((_, index) => (
          <div key={`chord-${String(index)}`} className={styles.chordName}>
            {chordLabelAt(columns, shapes, index)}
          </div>
        ))}

        {showCount ? (
          <>
            <div className={styles.corner} />
            {columns.map((column) => (
              <div key={`count-${String(column.step)}`} className={styles.count}>
                {countSyllable(column.offset)}
              </div>
            ))}
          </>
        ) : null}

        {Array.from({ length: STRING_COUNT }, (_, row) => STRING_COUNT - 1 - row).map(
          (stringIndex, row) => (
            <Fragment key={`row-${String(row)}`}>
              <div className={styles.stringLabel}>{stringLabel(tuning, stringIndex)}</div>
              {columns.map((column, index) => {
                const isActive = column.step === playhead;
                const cell = column.cells[stringIndex] ?? '';
                const text = column.ghost && cell ? t('tabLane.ghostWrap', { value: cell }) : cell;
                return (
                  <div
                    key={`cell-${String(row)}-${String(index)}`}
                    ref={isActive && row === 0 ? activeRef : undefined}
                    className={cx(
                      styles.cell,
                      isBarStart(columns, index) && styles.barStart,
                      isActive && styles.isActive,
                    )}
                    data-testid="tab-column"
                    data-step={column.step}
                  >
                    {text}
                  </div>
                );
              })}
            </Fragment>
          ),
        )}

        <div className={styles.corner} />
        {columns.map((column, index) => (
          <div key={`accent-${String(index)}`} className={styles.accent}>
            {column.accent ? copy.tabLane.accent : ''}
          </div>
        ))}

        <div className={styles.corner} />
        {groups.map((group, groupIndex) => (
          <div
            key={`notation-${String(groupIndex)}`}
            className={styles.notationCell}
            style={{ gridColumn: `span ${String(group.columns.length)}` }}
          >
            <NotationGroup group={group} />
          </div>
        ))}

        {showPickDirection ? (
          <>
            <div className={styles.corner} />
            {columns.map((column, index) => (
              <div key={`arrow-${String(index)}`} className={styles.strum}>
                {strumSymbol(column.dir)}
              </div>
            ))}
          </>
        ) : null}

        <div className={styles.corner} />
        {columns.map((column, index) => (
          <div
            key={`pm-${String(index)}`}
            className={cx(styles.palmMute, column.palmMute && styles.palmMuteActive)}
          >
            {isPalmMuteStart(columns, index) ? copy.tabLane.palmMute : ''}
          </div>
        ))}

        {dynamics ? (
          <>
            <div className={styles.corner} />
            {columns.map((column) => (
              <div key={`dyn-${String(column.step)}`} className={styles.dynamic}>
                {dynamics[column.step] ?? ''}
              </div>
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}
