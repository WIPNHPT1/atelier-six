import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { usePlayback } from '../../audio/usePlayback';
import { usePlaybackStore } from '../../audio/playbackStore';
import type { Section } from '../../core/schedule/buildSchedule';
import { copy, t } from '../../content/copy.en-GB';
import { analyseTransition } from '../../core/engine/analyseTransition';
import { hardestTransition } from '../../core/drills/drills';
import { planSection, simplifyLesson } from '../../core/lessons/plan';
import { targetReached, tempoRange } from '../../core/practice/tempo';
import { CleanMissed } from '../practice/CleanMissed';
import { useAdaptiveTempo } from '../practice/useAdaptiveTempo';
import { isMicSupported, useAutoAdvance } from '../practice/useAutoAdvance';
import { recordLessonAttempt, recordTransition, transitionKey } from '../../core/progress/record';
import { useProgress } from '../progress/store';
import { usePracticeTimer } from '../progress/usePracticeTimer';
import { LessonComplete } from '../progress/LessonComplete';
import { HandWarmupOffer } from '../foundations/HandWarmupOffer';
import type { ArrangementSection, BuiltLesson, Layer } from '../../core/lessons/types';
import type { Shape } from '../../core/shapes/types';
import { TUNINGS } from '../../core/style/riffBuilder';
import type { StyleSheet } from '../../core/style/types';
import { renderTab, toAscii } from '../../core/tab/renderTab';
import { soundingChordName } from '../../core/theory/capo';
import { useSettingsStore } from '../../app/settingsStore';
import { STYLES } from '../../data/styles';
import { PageHeader } from '../../app/layout/PageHeader';
import { Button } from '../../ui/Button';
import { cx } from '../../ui/cx';
import { Fretboard } from '../../ui/Fretboard/Fretboard';
import { Heading } from '../../ui/Heading';
import { Mono } from '../../ui/Mono';
import { Panel } from '../../ui/Panel';
import { Pill } from '../../ui/Pill';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { Stepper } from '../../ui/Stepper';
import { TabLane } from '../../ui/TabLane/TabLane';
import { Text } from '../../ui/Text';
import { Toggle } from '../../ui/Toggle';
import { TransitionCard } from '../../ui/TransitionCard/TransitionCard';
import {
  difficultyLabel,
  firstLesson,
  getLesson,
  getModule,
  isTune,
  lessonNumber,
  nextStep,
  prevStep,
} from './lessonData';
import { planPerformance, preparePerformance } from './performance';
import styles from './LessonPage.module.css';
import { useFocusMode } from './useFocusMode';
import { usePageShortcuts } from '../../ui/shortcuts/usePageShortcuts';

const DEMO_LESSON_ID = 'demo';
// Sections at or above this dynamics level play at full (chorus) strength.
const LOUD_DYNAMICS = 0.9;

type Mix = {
  sectionIndex: number;
  bpm: number;
  loop: boolean;
  click: boolean;
  countIn: boolean;
  muted: Record<string, boolean>;
  solo: string | null;
};

function isLayerMuted(layer: Layer, mix: Mix): boolean {
  if (mix.solo !== null) return mix.solo !== layer.id;
  return mix.muted[layer.id] ?? layer.muted;
}

function nextChange(shapes: Shape[], index: number): Shape | undefined {
  const current = shapes[index];
  for (let offset = 1; offset < shapes.length; offset++) {
    const candidate = shapes[(index + offset) % shapes.length];
    if (candidate !== undefined && candidate.chord !== current?.chord) return candidate;
  }
  return undefined;
}

function LessonPlayer({ lesson }: { lesson: BuiltLesson }) {
  const style = STYLES[lesson.module] as StyleSheet;
  const module = getModule(lesson.module);
  const pinnedFinish = useSettingsStore((s) => s.pinnedFinish);
  const pinnedFinishValue = useSettingsStore((s) => s.finish);
  const sections = lesson.arrangement.sections;
  const tuning = TUNINGS[lesson.tuning];
  const [mix, setMix] = useState<Mix>(() => ({
    sectionIndex: Math.max(
      0,
      sections.findIndex((candidate) => candidate.name === 'verse'),
    ),
    bpm: lesson.startBpm,
    loop: true,
    click: false,
    countIn: true,
    muted: {},
    solo: null,
  }));
  const [easier, setEasier] = useState(false);
  const tune = isTune(lesson);
  const [mode, setMode] = useState<'perform' | 'practise'>(tune ? 'perform' : 'practise');
  const performing = tune && mode === 'perform';
  const active = useMemo(() => (easier ? simplifyLesson(lesson) : lesson), [easier, lesson]);
  const range = tempoRange(lesson.startBpm, lesson.targetBpm);

  const section = active.arrangement.sections[mix.sectionIndex] as ArrangementSection;
  const sectionName = copy.lesson.sectionNames[section.name];
  const plan = useMemo(() => planSection(active, style, section), [active, style, section]);
  const performance = useMemo(
    () =>
      tune
        ? planPerformance(lesson, style, tuning, (name) => copy.lesson.sectionNames[name])
        : null,
    [tune, lesson, style, tuning],
  );
  const sectionColumns = useMemo(
    () => renderTab(plan.shapes, plan.rhythm, plan.bars, tuning),
    [plan, tuning],
  );
  const view = useMemo(
    () =>
      performing && performance !== null
        ? {
            shapes: performance.shapes,
            columns: performance.columns,
            labels: performance.sectionLabels,
          }
        : { shapes: plan.shapes, columns: sectionColumns, labels: { 0: sectionName } },
    [performing, performance, plan.shapes, sectionColumns, sectionName],
  );
  const ascii = useMemo(() => toAscii(view.columns), [view]);
  const columns = view.columns;

  const playback = usePlayback();
  const playingLessonId = usePlaybackStore((s) => s.lessonId);
  const startLesson = usePlaybackStore((s) => s.startLesson);
  const stopPlayback = usePlaybackStore((s) => s.stopPlayback);
  const setTempo = usePlaybackStore((s) => s.setTempo);
  const playingThis = playback.isPlaying && playingLessonId === lesson.id;
  const finishedId = usePlaybackStore((s) => s.finishedId);
  const finished = performing && !playingThis && finishedId === lesson.id;
  useFocusMode(playingThis);
  usePracticeTimer(playingThis);
  const updateProgress = useProgress((s) => s.update);

  const [micSupported] = useState(isMicSupported);
  const [listening, setListening] = useState(false);
  const [selfPacedIndex, setSelfPacedIndex] = useState(0);

  useAutoAdvance({
    enabled: listening && !playingThis,
    shapes: view.shapes,
    index: selfPacedIndex,
    tuning,
    capo: lesson.capo,
    onAdvance: (from, to) => {
      const fromShape = view.shapes[from];
      const toShape = view.shapes[to];
      if (fromShape && toShape) {
        const now = Date.now();
        const key = transitionKey(fromShape.id, toShape.id);
        void updateProgress((data) => recordTransition(data, { key, clean: true, now }));
      }
      setSelfPacedIndex(to);
    },
  });

  const barIndex = playingThis
    ? Math.max(0, playback.chordIndex) % view.shapes.length
    : selfPacedIndex % view.shapes.length;
  const current = view.shapes[barIndex] as Shape;
  const upcoming = nextChange(view.shapes, barIndex);
  const hardest = hardestTransition(plan.shapes);
  const previousStep = prevStep(lesson);
  const followingStep = nextStep(lesson);

  function perform(next: Mix) {
    if (performance === null) return;
    void startLesson({
      lessonId: lesson.id,
      title: lesson.title,
      chordNames: performance.shapes.map((shape) => shape.chord),
      bpm: next.bpm,
      loop: false,
      prepared: preparePerformance(performance, lesson.module, {
        bpm: next.bpm,
        tuning,
        capo: lesson.capo,
        countIn: next.countIn,
        click: next.click,
      }),
    });
  }

  function play(next: Mix, playing: BuiltLesson = active) {
    if (performing) {
      perform(next);
      return;
    }
    const target = playing.arrangement.sections[next.sectionIndex] as ArrangementSection;
    const level: Section = target.dynamics >= LOUD_DYNAMICS ? 'chorus' : 'verse';
    const sourceFor = (register: Shape['register']) => {
      const layerPlan = planSection(playing, style, target, register);
      return {
        shapes: layerPlan.shapes,
        rhythm: layerPlan.rhythm,
        bars: layerPlan.bars,
        tuning,
        capo: lesson.capo,
        section: level,
      };
    };
    const active = target.layers.filter((layer) => !isLayerMuted(layer, next));
    const [primary, ...rest] = active;
    const main = sourceFor(primary?.voicing ?? target.register);
    void startLesson({
      lessonId: lesson.id,
      title: lesson.title,
      chordNames: main.shapes.map((shape) => shape.chord),
      source: { ...main, countIn: next.countIn, click: next.click },
      bpm: next.bpm,
      loop: next.loop,
      layers: rest.map((layer) => ({ source: sourceFor(layer.voicing), pan: layer.pan })),
    });
  }

  const tempo = useAdaptiveTempo({
    bpm: mix.bpm,
    range,
    onTempo: (bpm) => {
      setMix((current) => ({ ...current, bpm }));
      if (!playingThis) return;
      if (performing) perform({ ...mix, bpm });
      else setTempo(bpm);
    },
    onSimplify: () => {
      setEasier(true);
      if (playingThis) play(mix, simplifyLesson(lesson));
    },
    onRecord: (clean, bpm) => {
      const now = Date.now();
      void updateProgress((data) => {
        const withLesson = recordLessonAttempt(data, { lessonId: lesson.id, bpm, clean, now });
        if (hardest === null) return withLesson;
        const key = transitionKey(hardest.from.id, hardest.to.id);
        return recordTransition(withLesson, { key, clean, now });
      });
    },
  });

  function update(changes: Partial<Mix>) {
    const next = { ...mix, ...changes };
    setMix(next);
    if (playingThis) play(next);
  }

  function nudgeTempo(bpm: number) {
    setMix((current) => ({ ...current, bpm }));
    if (!playingThis) return;
    if (performing) perform({ ...mix, bpm });
    else setTempo(bpm);
  }

  usePageShortcuts(
    {
      togglePlay: () => {
        if (playingThis) stopPlayback();
        else play(mix);
      },
      play: () => {
        if (!playingThis) play(mix);
      },
      stop: () => {
        if (playingThis) stopPlayback();
      },
      next: () => {
        if (!playingThis) setSelfPacedIndex((index) => (index + 1) % view.shapes.length);
      },
      prev: () => {
        if (!playingThis) {
          setSelfPacedIndex((index) => (index - 1 + view.shapes.length) % view.shapes.length);
        }
      },
      ...(performing
        ? {}
        : {
            toggleLoop: () => {
              update({ loop: !mix.loop });
            },
          }),
      slower: () => {
        nudgeTempo(Math.max(range.min, mix.bpm - 1));
      },
      faster: () => {
        nudgeTempo(Math.min(range.max, mix.bpm + 1));
      },
      setTempo: (bpm) => {
        nudgeTempo(Math.min(range.max, Math.max(range.min, bpm)));
      },
    },
    [playingThis, mix, performing, view.shapes.length, range.min, range.max],
  );

  return (
    <div className={styles.page} data-finish={pinnedFinish ? pinnedFinishValue : module?.finish}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <Mono className={styles.crumb}>
            <Link className={styles.crumbLink} to="/course">
              {copy.nav.learn}
            </Link>
            {copy.nav.crumbSeparator}
            <Link className={styles.crumbLink} to={`/course/${lesson.module}`}>
              {copy.course.modules[lesson.module].title}
            </Link>
            {copy.nav.crumbSeparator}
            {tune ? copy.lesson.crumbTune : t('lesson.crumbLesson', { number: lessonNumber(lesson) })}
          </Mono>
          <Heading level={1} className={styles.title}>
            {lesson.title}
          </Heading>
          <Text dim>{lesson.goal}</Text>
        </div>
        <div className={styles.headerControls}>
          {tune ? (
            <SegmentedControl
              label={copy.lesson.mode}
              segments={[
                { value: 'perform', label: copy.lesson.modes.perform },
                { value: 'practise', label: copy.lesson.modes.practise },
              ]}
              value={mode}
              onChange={(value) => {
                if (playingThis) stopPlayback();
                setMode(value === 'perform' ? 'perform' : 'practise');
              }}
            />
          ) : null}
          <Pill>
            {t('lesson.difficulty', {
              label: copy.lesson.difficultyLabels[difficultyLabel(lesson)],
              score: lesson.difficulty.toFixed(2),
            })}
          </Pill>
          <SegmentedControl
            label={copy.lesson.section}
            segments={sections.map((candidate, index) => ({
              value: String(index),
              label: copy.lesson.sectionNames[candidate.name],
            }))}
            value={String(mix.sectionIndex)}
            onChange={(value) => {
              // Picking a section in a tune practises that section on a loop.
              if (performing) {
                setMode('practise');
                setMix({ ...mix, sectionIndex: Number(value), loop: true });
                if (playingThis) stopPlayback();
                return;
              }
              update({ sectionIndex: Number(value) });
            }}
          />
        </div>
      </header>

      <Panel className={styles.toolbar}>
        <div className={styles.toolbarRow}>
          <div className={styles.toolbarGroup}>
            <Button
              variant="primary"
              onClick={() => {
                if (playingThis) stopPlayback();
                else play(mix);
              }}
            >
              {playingThis ? copy.lesson.stop : copy.lesson.play}
            </Button>
            <Mono className={styles.bar}>
              {t('lesson.barOf', { bar: barIndex + 1, total: plan.shapes.length })}
            </Mono>
            <Stepper
              label={copy.lesson.tempo}
              decrementLabel={copy.lesson.tempoSlower}
              incrementLabel={copy.lesson.tempoFaster}
              value={mix.bpm}
              min={range.min}
              max={range.max}
              format={(bpm) => t('lesson.tempoValue', { bpm })}
              onChange={(bpm) => {
                setMix({ ...mix, bpm });
                if (!playingThis) return;
                if (performing) perform({ ...mix, bpm });
                else setTempo(bpm);
              }}
            />
          </div>
          <span className={styles.divider} aria-hidden="true" />
        </div>

        <div className={styles.toolbarRow}>
          <CleanMissed
            tempo={tempo}
            targetReached={targetReached(mix.bpm, lesson.targetBpm)}
            easier={easier}
          />
          <span className={styles.divider} aria-hidden="true" />
        </div>

        <div className={styles.toolbarRow}>
          <div className={styles.toolbarGroup}>
            {performing ? null : (
              <label className={styles.toggleGroup}>
                <Text size="small">{copy.lesson.loop}</Text>
                <Toggle
                  label={copy.lesson.loop}
                  checked={mix.loop}
                  onChange={(loop) => {
                    update({ loop });
                  }}
                />
              </label>
            )}
            <label className={styles.toggleGroup}>
              <Text size="small">{copy.lesson.metronome}</Text>
              <Toggle
                label={copy.lesson.metronome}
                checked={mix.click}
                onChange={(click) => {
                  update({ click });
                }}
              />
            </label>
            <label className={styles.toggleGroup}>
              <Text size="small">{copy.lesson.countIn}</Text>
              <Toggle
                label={copy.lesson.countIn}
                checked={mix.countIn}
                onChange={(countIn) => {
                  update({ countIn });
                }}
              />
            </label>
            {micSupported ? (
              <label className={styles.toggleGroup}>
                <Text size="small">{copy.lesson.listen}</Text>
                <Toggle
                  label={copy.lesson.listen}
                  checked={listening}
                  onChange={(next) => {
                    setListening(next);
                    if (next) setSelfPacedIndex(0);
                  }}
                  disabled={playingThis}
                />
              </label>
            ) : null}
          </div>
        </div>
      </Panel>

      <HandWarmupOffer lessonId={lesson.id} />

      {finished ? (
        <Panel className={styles.finish} role="status">
          <span className={styles.ripple} aria-hidden="true" />
          <Heading level={2} className={styles.title}>
            {copy.lesson.finishTitle}
          </Heading>
          <Text dim>{copy.lesson.finishBody}</Text>
          <div className={styles.finishActions}>
            <Button
              variant="primary"
              onClick={() => {
                perform(mix);
              }}
            >
              {copy.lesson.playAgain}
            </Button>
            <Link className={styles.drillLink} to={`/course/${lesson.module}`}>
              {copy.lesson.backToModule}
            </Link>
          </div>
        </Panel>
      ) : null}

      <div className={styles.grid}>
        <Panel className={styles.tab} data-tab-ascii={ascii}>
          <Mono className={styles.label}>{t('lesson.tabHeading', { section: sectionName })}</Mono>
          <Text dim size="small" className={styles.rotateHint}>
            {copy.lesson.rotateHint}
          </Text>
          <div className={styles.tabLane}>
            <TabLane
              columns={columns}
              shapes={plan.shapes}
              tuning={tuning}
              playhead={playingLessonId === lesson.id ? playback.step : 0}
              header={{
                tempo: mix.bpm,
                tuning: copy.lesson.tuningNames[lesson.tuning],
                capo: lesson.capo,
                key:
                  'key' in lesson.progression ? lesson.progression.key : (lesson.chords[0] ?? ''),
              }}
              sectionLabels={view.labels}
            />
          </div>
        </Panel>

        <Panel className={styles.now} data-now-bar={barIndex}>
          <div className={styles.boards}>
            <div className={styles.board}>
              <Mono className={styles.label}>{copy.lesson.now}</Mono>
              <Heading level={2}>{current.chord}</Heading>
              {lesson.capo > 0 ? (
                <Text dim size="small" data-testid="sounds-as">
                  {t('lesson.soundsAs', {
                    shape: current.chord,
                    sounding: soundingChordName(current.chord, lesson.capo),
                  })}
                </Text>
              ) : null}
              <Fretboard shape={current} size={200} {...(upcoming ? { ghost: upcoming } : {})} />
            </div>
            {upcoming ? (
              <div className={styles.board}>
                <Mono className={styles.label}>{copy.lesson.next}</Mono>
                <Heading level={3}>{upcoming.chord}</Heading>
                <Fretboard shape={upcoming} size={140} />
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel className={styles.change} data-focus-hide>
          <Mono className={styles.label}>{copy.lesson.theChange}</Mono>
          {upcoming ? (
            <TransitionCard
              from={current}
              to={upcoming}
              transition={analyseTransition(current, upcoming)}
            />
          ) : (
            <Text dim>{copy.lesson.sameChord}</Text>
          )}
          {hardest ? (
            <Link
              className={styles.drillLink}
              to={`/drills?kind=loop&from=${encodeURIComponent(hardest.from.id)}&to=${encodeURIComponent(hardest.to.id)}`}
            >
              {copy.drills.drillThis}
            </Link>
          ) : null}
        </Panel>

        <Panel className={styles.layers} data-focus-hide>
          <Mono className={styles.label}>{copy.lesson.layers}</Mono>
          <ul className={styles.list}>
            {section.layers.map((layer) => {
              const name = copy.lesson.layerRoles[layer.role];
              return (
                <li key={layer.id} className={styles.layer}>
                  <Text>{name}</Text>
                  <Toggle
                    label={t('lesson.mute', { layer: name })}
                    checked={isLayerMuted(layer, { ...mix, solo: null })}
                    onChange={(value) => {
                      update({ muted: { ...mix.muted, [layer.id]: value } });
                    }}
                  />
                  <Toggle
                    label={t('lesson.solo', { layer: name })}
                    checked={mix.solo === layer.id}
                    onChange={(value) => {
                      update({ solo: value ? layer.id : null });
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel className={styles.tips} data-focus-hide>
          <Mono className={styles.label}>{copy.lesson.tips}</Mono>
          <ul className={styles.list}>
            {lesson.tips.map((tip) => (
              <li key={tip}>
                <Text>{tip}</Text>
              </li>
            ))}
          </ul>
        </Panel>

        <LessonComplete id={lesson.id} className={styles.complete} />
      </div>

      <nav className={styles.pager} aria-label={copy.lesson.pager}>
        {previousStep ? (
          <Link
            className={styles.pagerLink}
            to={
              previousStep.kind === 'lesson'
                ? `/lesson/${previousStep.lesson.id}`
                : `/course/${previousStep.module.id}`
            }
          >
            {previousStep.kind === 'lesson'
              ? t('lesson.prevLesson', { title: previousStep.lesson.title })
              : t('lesson.prevModule', {
                  title: copy.course.modules[previousStep.module.id].title,
                })}
          </Link>
        ) : (
          <span />
        )}
        {followingStep ? (
          <Link
            className={cx(styles.pagerLink, styles.pagerNext)}
            to={
              followingStep.kind === 'lesson'
                ? `/lesson/${followingStep.lesson.id}`
                : `/course/${followingStep.module.id}`
            }
          >
            {followingStep.kind === 'lesson'
              ? t('lesson.nextLesson', { title: followingStep.lesson.title })
              : t('lesson.nextModule', {
                  title: copy.course.modules[followingStep.module.id].title,
                })}
          </Link>
        ) : null}
      </nav>
    </div>
  );
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  if (id === DEMO_LESSON_ID) return <Navigate to={`/lesson/${firstLesson().id}`} replace />;
  const lesson = getLesson(id);
  if (lesson === undefined) {
    return (
      <PageHeader title={copy.lesson.notFound}>
        <Link to="/course">{copy.course.backToCourse}</Link>
      </PageHeader>
    );
  }
  return <LessonPlayer key={lesson.id} lesson={lesson} />;
}
