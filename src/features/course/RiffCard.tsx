import { usePlayback } from '../../audio/usePlayback';
import { usePlaybackStore } from '../../audio/playbackStore';
import { copy, t } from '../../content/copy.en-GB';
import type { BuiltRiff } from '../../core/lessons/types';
import { totalSeconds } from '../../core/schedule/arrangement';
import { pieceAscii, pieceToSchedule } from '../../core/style/pieceSchedule';
import { TUNINGS } from '../../core/style/riffBuilder';
import { Button } from '../../ui/Button';
import { Mono } from '../../ui/Mono';
import { Panel } from '../../ui/Panel';
import { ScrollTab } from '../../ui/ScrollTab';
import { Text } from '../../ui/Text';
import styles from './CourseModulePage.module.css';

export function RiffCard({ riff, unlocked }: { riff: BuiltRiff; unlocked: boolean }) {
  const playback = usePlayback();
  const playingId = usePlaybackStore((s) => s.lessonId);
  const startLesson = usePlaybackStore((s) => s.startLesson);
  const stopPlayback = usePlaybackStore((s) => s.stopPlayback);
  const playing = playback.isPlaying && playingId === riff.id;
  const { piece } = riff;

  return (
    <Panel className={styles.riff} data-locked={unlocked ? undefined : 'true'}>
      <div className={styles.riffHead}>
        <Text>{riff.title}</Text>
        <Mono className={styles.label}>{t('course.riffBars', { bars: riff.bars })}</Mono>
      </div>
      {unlocked ? (
        <>
          <ScrollTab className={styles.riffTab} label={t('course.riffTab', { title: riff.title })}>
            {pieceAscii(piece)}
          </ScrollTab>
          <Button
            variant="quiet"
            aria-label={t(playing ? 'course.stopRiff' : 'course.playRiff', { title: riff.title })}
            onClick={() => {
              if (playing) {
                stopPlayback();
                return;
              }
              void startLesson({
                lessonId: riff.id,
                title: riff.title,
                chordNames: [],
                bpm: piece.bpm,
                loop: true,
                prepared: {
                  events: pieceToSchedule(piece, TUNINGS[piece.tuning], piece.bpm),
                  totalSeconds: totalSeconds(riff.bars, piece.bpm),
                },
              });
            }}
          >
            {playing ? copy.lesson.stop : copy.lesson.play}
          </Button>
        </>
      ) : (
        <Text dim size="small">
          {t('course.riffLocked', { number: riff.unlockAfter })}
        </Text>
      )}
    </Panel>
  );
}
