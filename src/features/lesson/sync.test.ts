// The audio and the tab must agree: every strum the schedule plays is the chord the tab shows at
// that moment, and every note it sounds is written in that tab column.
import { describe, expect, it } from 'vitest';
import { planSection } from '../../core/lessons/plan';
import type { BuiltLesson } from '../../core/lessons/types';
import { buildSchedule, type ScheduleEvent } from '../../core/schedule/buildSchedule';
import { humanise } from '../../core/schedule/humanise';
import { TUNINGS } from '../../core/style/riffBuilder';
import type { StyleSheet } from '../../core/style/types';
import { renderTab, type TabColumn } from '../../core/tab/renderTab';
import type { Tuning } from '../../core/tuning';
import { STYLES } from '../../data/styles';
import { LESSONS, TUNES } from './lessonData';
import { planPerformance, preparePerformance } from './performance';

const STRING_COUNT = 6;

function mismatches(
  events: ScheduleEvent[],
  columns: TabColumn[],
  tuning: Tuning,
  capo: number,
): string[] {
  const byStep = new Map(columns.map((column) => [column.time, column]));
  const problems: string[] = [];
  for (const event of events) {
    if (event.kind === 'click' || event.bar < 0) continue;
    const column = byStep.get(event.step);
    if (column === undefined) {
      problems.push(`step ${String(event.step)}: sound with no tab column`);
      continue;
    }
    if (column.chordIndex !== event.chordIndex) {
      problems.push(
        `step ${String(event.step)}: tab chord ${String(column.chordIndex)}, audio ${String(event.chordIndex)}`,
      );
    }
    for (const hit of event.strings) {
      const cell = column.cells[STRING_COUNT - hit.string];
      const written = cell === null || cell === undefined || cell === 'x' ? null : Number(cell);
      const expected =
        written === null ? null : (tuning[STRING_COUNT - hit.string] as number) + capo + written;
      if (expected !== hit.midi) {
        problems.push(
          `step ${String(event.step)} string ${String(hit.string)}: tab ${String(cell)}, audio midi ${String(hit.midi)}`,
        );
      }
    }
  }
  return problems;
}

function sectionCheck(lesson: BuiltLesson): string[] {
  const style = STYLES[lesson.module] as StyleSheet;
  const tuning = TUNINGS[lesson.tuning];
  return lesson.arrangement.sections.flatMap((section, index) => {
    const plan = planSection(lesson, style, section);
    const columns = renderTab(plan.shapes, plan.rhythm, plan.bars, tuning);
    const events = humanise(
      buildSchedule({
        shapes: plan.shapes,
        rhythm: plan.rhythm,
        bars: plan.bars,
        bpm: lesson.targetBpm,
        tuning,
        capo: lesson.capo,
        countIn: true,
        click: true,
      }),
      { seed: 6 },
    );
    return mismatches(events, columns, tuning, lesson.capo).map(
      (p) => `${lesson.id} section ${String(index)}: ${p}`,
    );
  });
}

describe('audio matches the tab', () => {
  it('in every section of every lesson and tune (practise mode)', () => {
    expect([...LESSONS, ...TUNES].flatMap(sectionCheck)).toEqual([]);
  });

  for (const tune of TUNES) {
    it(`in ${tune.title}, played start to finish`, () => {
      const style = STYLES[tune.module] as StyleSheet;
      const tuning = TUNINGS[tune.tuning];
      const performance = planPerformance(tune, style, tuning, (n) => n);
      const prepared = preparePerformance(performance, tune.module, {
        bpm: tune.targetBpm,
        tuning,
        capo: tune.capo,
        countIn: true,
        click: false,
      });
      expect(mismatches(prepared.events, performance.columns, tuning, tune.capo)).toEqual([]);
    });
  }
});
