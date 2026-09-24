import { useParams } from 'react-router-dom';
import { PageHeader } from '../../app/layout/PageHeader';
import { copy } from '../../content/copy.en-GB';
import { useMetronome } from '../../audio/useMetronome';
import { usePlayback } from '../../audio/usePlayback';
import { usePlaybackStore } from '../../audio/playbackStore';
import { MetronomeControl } from '../../ui/MetronomeControl/MetronomeControl';
import { TabLane } from '../../ui/TabLane/TabLane';
import { Fretboard } from '../../ui/Fretboard/Fretboard';
import { Button } from '../../ui/Button';
import { getShapes } from '../../core/shapes/library';
import { renderTab } from '../../core/tab/renderTab';
import { standard } from '../../core/tuning';
import type { Shape } from '../../core/shapes/types';
import { RHYTHMS } from '../../data/rhythms';

const DEMO_LESSON_ID = 'demo';
const DEMO_CHORD_NAMES = ['C', 'G', 'Am', 'F'];
const DEMO_BARS = [2, 2, 2, 2];
const DEMO_BPM = 90;
const DRIVING_EIGHTHS = RHYTHMS.find((rhythm) => rhythm.id === 'driving-eighths');

function DemoLesson() {
  const metronome = useMetronome();
  const { isPlaying, step, chordIndex } = usePlayback();
  const startLesson = usePlaybackStore((s) => s.startLesson);
  const stopPlayback = usePlaybackStore((s) => s.stopPlayback);

  const shapes = DEMO_CHORD_NAMES.map((name) => getShapes(name)[0]).filter(
    (shape): shape is Shape => shape !== undefined,
  );
  const rhythm = DRIVING_EIGHTHS;
  if (!rhythm || shapes.length !== DEMO_CHORD_NAMES.length) return null;

  const columns = renderTab(shapes, rhythm, DEMO_BARS, standard);
  const activeShape = shapes[chordIndex] ?? shapes[0];

  return (
    <PageHeader title={copy.lesson.demoTitle}>
      <Button
        variant="primary"
        onClick={() => {
          if (isPlaying) {
            stopPlayback();
            return;
          }
          void startLesson({
            lessonId: DEMO_LESSON_ID,
            title: copy.lesson.demoTitle,
            chordNames: DEMO_CHORD_NAMES,
            source: { shapes, rhythm, bars: DEMO_BARS, tuning: standard },
            bpm: DEMO_BPM,
            loop: true,
          });
        }}
      >
        {isPlaying ? copy.lesson.stop : copy.lesson.play}
      </Button>

      {activeShape ? <Fretboard shape={activeShape} orientation="box" /> : null}

      <TabLane columns={columns} shapes={shapes} tuning={standard} playhead={step} />

      <MetronomeControl {...metronome} />
    </PageHeader>
  );
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const metronome = useMetronome();

  if (id === DEMO_LESSON_ID) return <DemoLesson />;

  return (
    <PageHeader title={id ?? copy.lesson.title}>
      <MetronomeControl {...metronome} />
    </PageHeader>
  );
}
