import { useState } from 'react';
import { usePlayback } from '../../audio/usePlayback';
import { usePlaybackStore } from '../../audio/playbackStore';
import { useSettingsStore } from '../../app/settingsStore';
import { copy, t } from '../../content/copy.en-GB';
import { planSection } from '../../core/lessons/plan';
import type { BuiltLesson, ListenRef } from '../../core/lessons/types';
import { TUNINGS } from '../../core/style/riffBuilder';
import type { StyleSheet } from '../../core/style/types';
import { tapTempo } from '../../core/tapTempo';
import { STYLES } from '../../data/styles';
import { Button } from '../../ui/Button';
import { Mono } from '../../ui/Mono';
import { Text } from '../../ui/Text';
import styles from './CourseModulePage.module.css';

const MIN_BPM = 40;
const MAX_BPM = 220;

// Play along with your own copy of a listening reference: the app sets the module's tuning and
// capo, you tap the song's tempo, and it loops the current lesson with a click. Nothing about the
// song is stored beyond its name.
export function PlayAlong({ song, lesson }: { song: ListenRef; lesson: BuiltLesson }) {
  const style = STYLES[lesson.module] as StyleSheet;
  const tuningId = style.tunings[0] ?? 'standard';
  const capo = style.capo.min;
  const setTuning = useSettingsStore((s) => s.setTuning);
  const setCapo = useSettingsStore((s) => s.setCapo);
  const [open, setOpen] = useState(false);
  const [taps, setTaps] = useState<number[]>([]);
  const playback = usePlayback();
  const playingId = usePlaybackStore((s) => s.lessonId);
  const startLesson = usePlaybackStore((s) => s.startLesson);
  const stopPlayback = usePlaybackStore((s) => s.stopPlayback);
  const loopId = `play-along-${lesson.module}`;
  const playing = playback.isPlaying && playingId === loopId;
  const estimate = tapTempo(taps);
  const bpm = estimate === null ? null : Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(estimate)));

  if (!open) {
    return (
      <Button
        variant="quiet"
        size="small"
        aria-label={t('course.playAlongWith', { song: song.song })}
        onClick={() => {
          setTuning(tuningId);
          setCapo(capo);
          setOpen(true);
        }}
      >
        {copy.course.playAlong}
      </Button>
    );
  }

  const verse =
    lesson.arrangement.sections.find((section) => section.name === 'verse') ??
    lesson.arrangement.sections[0];

  return (
    <div className={styles.playAlong}>
      <Text dim size="small">
        {t('course.playAlongSet', { tuning: copy.lesson.tuningNames[tuningId], capo })}
      </Text>
      <Button
        variant="primary"
        size="large"
        className={styles.tap}
        onClick={() => {
          setTaps((current) => [...current, performance.now()]);
        }}
      >
        {copy.course.tap}
      </Button>
      <Mono aria-live="polite">
        {bpm === null ? copy.course.tapFirst : t('course.tapped', { bpm })}
      </Mono>
      {bpm !== null && verse !== undefined ? (
        <Button
          variant="quiet"
          onClick={() => {
            if (playing) {
              stopPlayback();
              return;
            }
            const plan = planSection(lesson, style, verse);
            void startLesson({
              lessonId: loopId,
              title: lesson.title,
              chordNames: plan.shapes.map((shape) => shape.chord),
              source: {
                shapes: plan.shapes,
                rhythm: plan.rhythm,
                bars: plan.bars,
                tuning: TUNINGS[tuningId],
                capo,
                click: true,
              },
              bpm,
              loop: true,
            });
          }}
        >
          {playing ? copy.course.stopLoop : t('course.loopTechnique', { title: lesson.title })}
        </Button>
      ) : null}
    </div>
  );
}
