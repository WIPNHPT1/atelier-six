import { useNavigate } from 'react-router-dom';
import { usePlaybackStore } from '../../audio/playbackStore';
import { copy, t } from '../../content/copy.en-GB';
import { IconButton } from '../IconButton';
import { PauseIcon } from '../icons';
import styles from './MiniPlayer.module.css';

export function MiniPlayer() {
  const navigate = useNavigate();
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const lessonId = usePlaybackStore((s) => s.lessonId);
  const title = usePlaybackStore((s) => s.title);
  const bpm = usePlaybackStore((s) => s.bpm);
  const chordNames = usePlaybackStore((s) => s.chordNames);
  const chordIndex = usePlaybackStore((s) => s.chordIndex);
  const stopPlayback = usePlaybackStore((s) => s.stopPlayback);

  if (!isPlaying || lessonId === null) return null;

  const currentChord = chordNames[chordIndex] ?? title;
  const nextChord = chordNames[chordIndex + 1];

  return (
    <button
      type="button"
      className={styles.player}
      data-focus-hide
      data-testid="mini-player"
      onClick={() => {
        void navigate(`/lesson/${lessonId}`);
      }}
    >
      <div className={styles.chords}>
        <span className={styles.current}>{currentChord}</span>
        <span className={styles.next}>
          {nextChord ? t('miniPlayer.next', { chord: nextChord }) : t('miniPlayer.bpm', { bpm })}
        </span>
      </div>
      <IconButton
        label={copy.miniPlayer.stop}
        onClick={(event) => {
          event.stopPropagation();
          stopPlayback();
        }}
      >
        <PauseIcon />
      </IconButton>
    </button>
  );
}
