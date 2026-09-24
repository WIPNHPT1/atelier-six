import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../app/layout/PageHeader';
import { usePlayback } from '../../audio/usePlayback';
import { usePlaybackStore } from '../../audio/playbackStore';
import { copy, t } from '../../content/copy.en-GB';
import {
  DEFAULT_FREEZE_SECONDS,
  activeFreeze,
  activeMark,
  applyFreezes,
  earlyChangeMarks,
  twoChordLoop,
  type DrillKind,
} from '../../core/drills/drills';
import {
  MINUTE_MS,
  isFinished,
  isRunning,
  newMinute,
  recordChange,
  remainingMs,
  startMinute,
} from '../../core/drills/minute';
import { candidatesFor, optimise } from '../../core/engine/optimise';
import { buildSchedule } from '../../core/schedule/buildSchedule';
import { getShapes, listChordNames } from '../../core/shapes/library';
import type { Shape } from '../../core/shapes/types';
import { standard } from '../../core/tuning';
import { RHYTHMS, type RhythmPreset } from '../../data/rhythms';
import { Button } from '../../ui/Button';
import { cx } from '../../ui/cx';
import { Dial } from '../../ui/Dial';
import { Fretboard } from '../../ui/Fretboard/Fretboard';
import { Heading } from '../../ui/Heading';
import { Mono } from '../../ui/Mono';
import { Panel } from '../../ui/Panel';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { Slider } from '../../ui/Slider';
import { Text } from '../../ui/Text';
import { bestMinute, useDrillResults } from './drillResults';
import styles from './DrillsPage.module.css';

const DRILL_ID = 'drill';
const KINDS: DrillKind[] = ['loop', 'early', 'freeze', 'minute'];
const DEFAULT_PAIR = ['C', 'G'];
const DEFAULT_BPM = 80;
const MIN_BPM = 40;
const MAX_BPM = 160;
const MIN_FREEZE = 1;
const MAX_FREEZE = 10;
// Sixteenths before the barline that the early-change drill plays the next chord.
const ANTICIPATE_STEPS = 2;
const TICK_MS = 200;
const MS_PER_SECOND = 1000;
function drillRhythm(): RhythmPreset {
  const rhythm = RHYTHMS.find((candidate) => candidate.id === 'pop-strum');
  if (rhythm === undefined) throw new Error('The pop-strum rhythm is missing');
  return rhythm;
}
const RHYTHM = drillRhythm();

function shapeFromId(id: string | null): Shape | undefined {
  if (id === null) return undefined;
  const chord = id.split('.')[0] ?? '';
  return getShapes(chord).find((shape) => shape.id === id);
}

function pairFor(from: string, to: string): [Shape, Shape] {
  const [a, b] = optimise(candidatesFor([from, to]), { loop: true }).shapes;
  return [a ?? (getShapes(from)[0] as Shape), b ?? (getShapes(to)[0] as Shape)];
}

function isKind(value: string | null): value is DrillKind {
  return KINDS.includes(value as DrillKind);
}

function OneMinute({ from, to }: { from: Shape; to: Shape }) {
  const [session, setSession] = useState(newMinute);
  const [now, setNow] = useState(() => Date.now());
  const minutes = useDrillResults((s) => s.minutes);
  const addMinute = useDrillResults((s) => s.addMinute);
  const running = isRunning(session, now);
  const finished = isFinished(session, now);
  const best = bestMinute(minutes, from.chord, to.chord);

  useEffect(() => {
    if (session.startedAt === null) return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (remainingMs(session, current) === 0) window.clearInterval(timer);
    }, TICK_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [session]);

  useEffect(() => {
    if (!finished || session.startedAt === null) return;
    addMinute({ from: from.chord, to: to.chord, changes: session.changes, at: session.startedAt });
  }, [finished, session, from.chord, to.chord, addMinute]);

  function change() {
    setSession((current) => recordChange(current, Date.now()));
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.code !== 'Space' || !running) return;
      event.preventDefault();
      setSession((current) => recordChange(current, Date.now()));
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [running]);

  const left = remainingMs(session, now);
  return (
    <Panel className={styles.minute}>
      <Dial
        label={copy.drills.timeLeft}
        value={left / MINUTE_MS}
        displayValue={t('drills.secondsLeft', { seconds: Math.ceil(left / MS_PER_SECOND) })}
        size={160}
      />
      <Heading level={2}>{t('drills.changes', { count: session.changes })}</Heading>
      {running ? (
        <Button variant="primary" size="large" className={styles.changeButton} onClick={change}>
          {copy.drills.change}
        </Button>
      ) : (
        <Button
          variant="primary"
          size="large"
          onClick={() => {
            const start = Date.now();
            setNow(start);
            setSession(startMinute(start));
          }}
        >
          {finished ? copy.drills.again : copy.drills.start}
        </Button>
      )}
      {finished ? <Text>{t('drills.finished', { count: session.changes })}</Text> : null}
      {best === null ? null : <Text dim>{t('drills.best', { count: best })}</Text>}
    </Panel>
  );
}

export default function DrillsPage() {
  const [params, setParams] = useSearchParams();
  const kind: DrillKind = isKind(params.get('kind')) ? (params.get('kind') as DrillKind) : 'loop';
  const [defaultFrom, defaultTo] = pairFor(DEFAULT_PAIR[0] as string, DEFAULT_PAIR[1] as string);
  const from = shapeFromId(params.get('from')) ?? defaultFrom;
  const to = shapeFromId(params.get('to')) ?? defaultTo;
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [freezeSeconds, setFreezeSeconds] = useState(DEFAULT_FREEZE_SECONDS);
  const chordNames = useMemo(() => listChordNames(), []);

  const playback = usePlayback();
  const playingId = usePlaybackStore((s) => s.lessonId);
  const startLesson = usePlaybackStore((s) => s.startLesson);
  const stopPlayback = usePlaybackStore((s) => s.stopPlayback);
  const playing = playback.isPlaying && playingId === DRILL_ID;

  const plan = twoChordLoop(from, to);
  const source = {
    shapes: plan.shapes,
    rhythm: RHYTHM,
    bars: plan.bars,
    tuning: standard,
    click: true,
    anticipate: kind === 'early' ? ANTICIPATE_STEPS : 0,
    ...(kind === 'freeze' ? { freezeSeconds } : {}),
  };
  const marks = earlyChangeMarks(plan.bars);
  const windows =
    kind === 'freeze'
      ? applyFreezes(buildSchedule({ ...source, bpm }), bpm, freezeSeconds).windows
      : [];

  const step = playing ? playback.step : -1;
  const mark = kind === 'early' ? activeMark(marks, step) : undefined;
  const freeze = kind === 'freeze' ? activeFreeze(windows, step) : undefined;
  const currentIndex = playing ? Math.max(0, playback.chordIndex) : 0;

  function setParam(changes: Record<string, string>) {
    if (playing) stopPlayback();
    setParams({ kind, from: from.id, to: to.id, ...changes }, { replace: true });
  }

  function choose(side: 'from' | 'to', chord: string) {
    const [a, b] = pairFor(side === 'from' ? chord : from.chord, side === 'to' ? chord : to.chord);
    setParam({ from: a.id, to: b.id });
  }

  function play(nextBpm = bpm, nextFreeze = freezeSeconds) {
    void startLesson({
      lessonId: DRILL_ID,
      title: t('drills.playerTitle', { from: from.chord, to: to.chord }),
      chordNames: [from.chord, to.chord],
      source: {
        ...source,
        ...(kind === 'freeze' ? { freezeSeconds: nextFreeze } : {}),
        countIn: true,
      },
      bpm: nextBpm,
      loop: true,
    });
  }

  return (
    <>
      <PageHeader title={copy.drills.title}>
        <Text dim>{copy.drills.intro}</Text>
      </PageHeader>
      <div className={styles.page}>
        <div className={styles.controls}>
          <label className={styles.picker}>
            <Mono className={styles.label}>{copy.drills.from}</Mono>
            <select
              value={from.chord}
              onChange={(event) => {
                choose('from', event.target.value);
              }}
            >
              {chordNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.picker}>
            <Mono className={styles.label}>{copy.drills.to}</Mono>
            <select
              value={to.chord}
              onChange={(event) => {
                choose('to', event.target.value);
              }}
            >
              {chordNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <SegmentedControl
            label={copy.drills.kind}
            segments={KINDS.map((value) => ({ value, label: copy.drills.kinds[value] }))}
            value={kind}
            onChange={(value) => {
              setParam({ kind: value });
            }}
          />
        </div>
        <Text dim>{copy.drills.hints[kind]}</Text>

        <div className={styles.boards}>
          {plan.shapes.map((shape, index) => {
            const target = mark?.target === index;
            const frozen = freeze?.chordIndex === index;
            return (
              <Panel
                key={`${shape.id}-${String(index)}`}
                className={cx(
                  styles.board,
                  playing && currentIndex === index && styles.current,
                  target && styles.flash,
                  frozen && styles.frozen,
                )}
                data-flash={target ? 'true' : undefined}
                data-frozen={frozen ? 'true' : undefined}
              >
                <Heading level={2}>{shape.chord}</Heading>
                <Fretboard shape={shape} size={frozen ? 260 : 180} />
                {target ? <Mono className={styles.cue}>{copy.drills.changeNow}</Mono> : null}
                {frozen ? <Mono className={styles.cue}>{copy.drills.frozen}</Mono> : null}
              </Panel>
            );
          })}
        </div>

        {kind === 'minute' ? (
          <OneMinute key={`${from.id}-${to.id}`} from={from} to={to} />
        ) : (
          <Panel className={styles.toolbar}>
            <Button
              variant="primary"
              onClick={() => {
                if (playing) stopPlayback();
                else play();
              }}
            >
              {playing ? copy.lesson.stop : copy.lesson.play}
            </Button>
            <div className={styles.slider}>
              <Slider
                label={copy.drills.tempo}
                value={bpm}
                min={MIN_BPM}
                max={MAX_BPM}
                onChange={(value) => {
                  setBpm(value);
                  if (playing) play(value);
                }}
              />
            </div>
            {kind === 'freeze' ? (
              <div className={styles.slider}>
                <Slider
                  label={copy.drills.freezeSeconds}
                  value={freezeSeconds}
                  min={MIN_FREEZE}
                  max={MAX_FREEZE}
                  bigStep={1}
                  onChange={(value) => {
                    setFreezeSeconds(value);
                    if (playing) play(bpm, value);
                  }}
                />
              </div>
            ) : null}
          </Panel>
        )}
      </div>
    </>
  );
}
