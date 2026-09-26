import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../app/layout/PageHeader';
import { copy, t } from '../../content/copy.en-GB';
import {
  buildHeatmap,
  sparklinePath,
  worstFirst,
  type HeatCell,
} from '../../core/progress/heatmap';
import { masteredShapes } from '../../core/progress/masteredShapes';
import {
  chordOfShape,
  localDay,
  minuteSeries,
  minutesOn,
  minutesThisWeek,
  splitKey,
} from '../../core/progress/record';
import { cx } from '../../ui/cx';
import { Dial } from '../../ui/Dial';
import { EngravedFretboard } from '../../ui/EngravedFretboard';
import { Mono } from '../../ui/Mono';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import { ProgressRing } from '../course/ProgressRing';
import { LESSONS, MODULES, lessonsFor } from '../lesson/lessonData';
import { getSeenMastered, markSeenMastered } from './masteredSeen';
import styles from './ProgressPage.module.css';
import { useProgressData } from './store';
import { bestBpm, moduleProgress } from './summary';

const DAILY_GOAL_MINUTES = 20;
const PERCENT = 100;
const SPARK_W = 120;
const SPARK_H = 28;

function drillHref(key: string): string {
  const { from, to } = splitKey(key);
  return `/drills?kind=loop&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
}

function pct(rate: number): number {
  return Math.round(rate * PERCENT);
}

function cellLabel(cell: HeatCell): string {
  if (cell.from === cell.to) return t('progressScreen.cellSame', { from: cell.from });
  if (cell.rate === null) return t('progressScreen.cellEmpty', { from: cell.from, to: cell.to });
  return t('progressScreen.cellLabel', { from: cell.from, to: cell.to, percent: pct(cell.rate) });
}

const LEVEL_CLASS = [
  styles.level0,
  styles.level1,
  styles.level2,
  styles.level3,
  styles.level4,
  styles.level5,
];

export default function ProgressPage() {
  const data = useProgressData();
  const [now] = useState(() => Date.now());
  const today = minutesOn(data, localDay(now));
  const heatmap = buildHeatmap(data.transitions);
  const worst = worstFirst(data.transitions);
  const series = minuteSeries(data);
  const available = MODULES.filter((module) => module.available);
  const doneTotal = available.reduce((sum, m) => sum + moduleProgress(m.id, data).done, 0);

  const mastered = useMemo(() => masteredShapes(LESSONS, data), [data]);
  const [seen] = useState(getSeenMastered);
  useEffect(() => {
    markSeenMastered(mastered.map((m) => m.shape.id));
  }, [mastered]);

  return (
    <>
      <PageHeader
        title={copy.progressScreen.title}
        breadcrumb={t('progressScreen.week', { minutes: Math.round(minutesThisWeek(data, now)) })}
      />
      <div className={styles.grid}>
        <Panel className={styles.modules}>
          <div className={styles.panelHead}>
            <Mono className={styles.label}>{copy.progressScreen.modules}</Mono>
            <Mono className={styles.label}>
              {t('progressScreen.lessonsDone', { done: doneTotal, total: LESSONS.length })}
            </Mono>
          </div>
          <ul className={styles.moduleRow}>
            {MODULES.map((module) => {
              const { done, total, started } = moduleProgress(module.id, data);
              return (
                <li key={module.id} className={styles.moduleCell}>
                  <ProgressRing
                    done={done}
                    total={total}
                    size={48}
                    showCount
                    label={t('course.progressRing', { done, total })}
                  />
                  <Text size="small" className={styles.moduleName}>
                    {copy.progressScreen.shortNames[module.id]}
                  </Text>
                  <Mono className={cx(styles.state, (done > 0 || started) && styles.stateActive)}>
                    {done > 0
                      ? t('progressScreen.moduleState', { done, total })
                      : started
                        ? copy.course.statusStarted
                        : copy.course.statusNotYet}
                  </Mono>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel className={styles.engravings}>
          <Mono className={styles.label}>{copy.progressScreen.engravings}</Mono>
          <Text dim size="small">
            {copy.progressScreen.engravingsCaption}
          </Text>
          {mastered.length === 0 ? (
            <Text dim>{copy.progressScreen.engravingsEmpty}</Text>
          ) : (
            <ul className={styles.engravingGrid}>
              {mastered.map((entry) => (
                <li key={entry.shape.id}>
                  <EngravedFretboard shape={entry.shape} animateIn={!seen.has(entry.shape.id)} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className={styles.today}>
          <Mono className={styles.label}>{copy.progressScreen.today}</Mono>
          <Dial
            label={t('progressScreen.todayLabel', {
              minutes: Math.round(today),
              goal: DAILY_GOAL_MINUTES,
            })}
            value={today / DAILY_GOAL_MINUTES}
            displayValue={t('progressScreen.todayValue', {
              minutes: Math.round(today),
              goal: DAILY_GOAL_MINUTES,
            })}
            size={120}
          />
        </Panel>

        <Panel className={styles.heat}>
          <Mono className={styles.label}>{copy.progressScreen.changes}</Mono>
          <Text dim size="small">
            {copy.progressScreen.changesCaption}
          </Text>
          {heatmap.chords.length === 0 ? (
            <Text dim>{copy.progressScreen.changesEmpty}</Text>
          ) : (
            <>
              <div
                className={styles.heatGrid}
                role="group"
                aria-label={copy.progressScreen.changes}
                style={{
                  gridTemplateColumns: `auto repeat(${String(heatmap.chords.length)}, minmax(0, 1fr))`,
                }}
              >
                <span aria-hidden="true" />
                {heatmap.chords.map((chord) => (
                  <Mono key={`col-${chord}`} className={styles.axis} aria-hidden="true">
                    {chord}
                  </Mono>
                ))}
                {heatmap.rows.map((row, r) => [
                  <Mono key={`row-${String(r)}`} className={styles.axis} aria-hidden="true">
                    {heatmap.chords[r]}
                  </Mono>,
                  ...row.map((cell) => {
                    const isWorst =
                      heatmap.worst !== null &&
                      heatmap.worst.from === cell.from &&
                      heatmap.worst.to === cell.to;
                    return (
                      <span
                        key={`${cell.from}-${cell.to}`}
                        role="img"
                        aria-label={cellLabel(cell)}
                        data-level={cell.level}
                        className={cx(
                          styles.cell,
                          cell.from === cell.to ? styles.same : LEVEL_CLASS[cell.level],
                          isWorst && styles.worst,
                        )}
                      >
                        {isWorst && cell.rate !== null
                          ? t('progressScreen.percent', { percent: pct(cell.rate) })
                          : null}
                      </span>
                    );
                  }),
                ])}
              </div>
              <div className={styles.heatFoot}>
                <div className={styles.legend} aria-hidden="true">
                  <Mono className={styles.label}>{copy.progressScreen.fewer}</Mono>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <span key={level} className={cx(styles.swatch, LEVEL_CLASS[level])} />
                  ))}
                  <Mono className={styles.label}>{copy.progressScreen.more}</Mono>
                </div>
                {heatmap.worst?.key ? (
                  <Link className={styles.drill} to={drillHref(heatmap.worst.key)}>
                    {t('progressScreen.drillWorst', {
                      from: heatmap.worst.from,
                      to: heatmap.worst.to,
                    })}
                  </Link>
                ) : null}
              </div>
            </>
          )}
        </Panel>

        {worst.length > 0 ? (
          <Panel className={styles.worstList}>
            <Mono className={styles.label}>{copy.progressScreen.worstFirst}</Mono>
            <ul className={styles.list}>
              {worst.map((entry) => (
                <li key={entry.key} className={styles.row}>
                  <Text>{t('progressScreen.worstEntry', { from: entry.from, to: entry.to })}</Text>
                  <Mono className={styles.label}>
                    {t('progressScreen.missed', { percent: pct(entry.rate) })}
                  </Mono>
                  <Link className={styles.drillSmall} to={drillHref(entry.key)}>
                    {copy.progressScreen.drillThis}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        <Panel className={styles.minutes}>
          <Mono className={styles.label}>{copy.progressScreen.minutes}</Mono>
          {series.length === 0 ? (
            <Text dim>{copy.progressScreen.minutesEmpty}</Text>
          ) : (
            <ul className={styles.list}>
              {series.map(({ key, counts }) => {
                const { from, to } = splitKey(key);
                return (
                  <li key={key} className={styles.row} data-testid="minute-score">
                    <Text>
                      {t('progressScreen.worstEntry', {
                        from: chordOfShape(from),
                        to: chordOfShape(to),
                      })}
                    </Text>
                    <svg
                      className={styles.spark}
                      viewBox={`0 0 ${String(SPARK_W)} ${String(SPARK_H)}`}
                      width={SPARK_W}
                      height={SPARK_H}
                      aria-hidden="true"
                    >
                      <path d={sparklinePath(counts, SPARK_W, SPARK_H)} />
                    </svg>
                    <Mono>{t('progressScreen.minuteBest', { count: Math.max(...counts) })}</Mono>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {available.map((module) => (
          <Panel key={module.id} className={styles.lessons}>
            <Mono className={styles.label}>
              {t('progressScreen.lessons', { module: copy.course.modules[module.id].title })}
            </Mono>
            <ul className={styles.list}>
              {lessonsFor(module.id).map((lesson) => {
                const best = bestBpm(lesson, data);
                return (
                  <li key={lesson.id} className={styles.row}>
                    <Link className={styles.lessonLink} to={`/lesson/${lesson.id}`}>
                      {lesson.title}
                    </Link>
                    <Mono className={styles.label}>
                      {best === null
                        ? copy.progressScreen.noTempo
                        : t('progressScreen.tempo', { bpm: best })}
                    </Mono>
                  </li>
                );
              })}
            </ul>
          </Panel>
        ))}
      </div>
    </>
  );
}
