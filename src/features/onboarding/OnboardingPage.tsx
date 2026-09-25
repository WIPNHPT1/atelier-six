import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../app/layout/PageHeader';
import { Text } from '../../ui/Text';
import { Mono } from '../../ui/Mono';
import { Button } from '../../ui/Button';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { Slider } from '../../ui/Slider';
import { Logo } from '../../ui/Logo';
import { copy, t } from '../../content/copy.en-GB';
import { useSettingsStore, type Level, type Tuning } from '../../app/settingsStore';
import styles from './OnboardingPage.module.css';
import { recommendedLesson } from '../lesson/lessonData';
import { Fretboard } from '../../ui/Fretboard/Fretboard';
import { usePlayback } from '../../audio/usePlayback';
import { usePlaybackStore } from '../../audio/playbackStore';
import { grooveFor } from './groove';

const GROOVE_ID = 'onboarding-groove';

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const [step, setStep] = useState(0);

  // Onboarding ends on the recommended first lesson for the chosen level.
  const playback = usePlayback();
  const playingId = usePlaybackStore((s) => s.lessonId);
  const startLesson = usePlaybackStore((s) => s.startLesson);
  const stopPlayback = usePlaybackStore((s) => s.stopPlayback);
  const grooving = playback.isPlaying && playingId === GROOVE_ID;
  const groove = step === TOTAL_STEPS - 1 ? grooveFor(settings.level) : null;

  function finish() {
    if (grooving) stopPlayback();
    settings.setOnboardingComplete(true);
    void navigate(`/lesson/${recommendedLesson(settings.level).id}`);
  }

  function skip() {
    finish();
  }

  function next() {
    if (step === TOTAL_STEPS - 1) {
      finish();
    } else {
      setStep((current) => current + 1);
    }
  }

  function back() {
    setStep((current) => Math.max(0, current - 1));
  }

  return (
    <PageHeader title={copy.onboarding.title} shortTitle={copy.onboarding.titleShort}>
      <div className={styles.page}>
        <Text dim size="small" className={styles.stepLabel}>
          {t('onboarding.stepLabel', { current: step + 1, total: TOTAL_STEPS })}
        </Text>

        {step === 0 ? (
          <div className={styles.step}>
            <Logo variant="mark" size={64} />
            <Text>{copy.onboarding.welcomeBody}</Text>
          </div>
        ) : null}

        {step === 1 ? (
          <div className={styles.step}>
            <Text>{copy.onboarding.handTitle}</Text>
            <SegmentedControl
              label={copy.onboarding.handTitle}
              value={settings.leftHanded ? 'left' : 'right'}
              onChange={(value) => {
                settings.setLeftHanded(value === 'left');
              }}
              segments={[
                { value: 'right', label: copy.onboarding.handRight },
                { value: 'left', label: copy.onboarding.handLeft },
              ]}
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className={styles.step}>
            <Text>{copy.onboarding.levelTitle}</Text>
            <SegmentedControl
              label={copy.onboarding.levelTitle}
              value={settings.level}
              onChange={(value) => {
                settings.setLevel(value as Level);
              }}
              segments={[
                { value: 'new', label: copy.onboarding.levelNew },
                { value: 'someChords', label: copy.onboarding.levelSomeChords },
                { value: 'confident', label: copy.onboarding.levelConfident },
              ]}
            />
          </div>
        ) : null}

        {step === 3 ? (
          <div className={styles.step}>
            <Text>{copy.onboarding.tuningTitle}</Text>
            <SegmentedControl
              label={copy.settings.tuning}
              value={settings.tuning}
              onChange={(value) => {
                settings.setTuning(value as Tuning);
              }}
              segments={[
                { value: 'standard', label: copy.settings.tuningStandard },
                { value: 'halfDown', label: copy.settings.tuningHalfDown },
                { value: 'dropD', label: copy.settings.tuningDropD },
              ]}
            />
            <div className={styles.sliderRow}>
              <Text dim size="small">
                {copy.settings.capo}
              </Text>
              <Mono>{settings.capo}</Mono>
              <Slider
                label={copy.settings.capo}
                value={settings.capo}
                min={0}
                max={7}
                onChange={settings.setCapo}
              />
            </div>
          </div>
        ) : null}

        {groove ? (
          <div className={styles.step}>
            <Text>{copy.onboarding.grooveTitle}</Text>
            <Text dim>
              {t('onboarding.grooveBody', { a: groove.shapes[0].chord, b: groove.shapes[1].chord })}
            </Text>
            <div className={styles.boards}>
              <Fretboard shape={groove.shapes[0]} size={140} />
              <Fretboard shape={groove.shapes[1]} size={140} />
            </div>
            <Button
              variant="quiet"
              onClick={() => {
                if (grooving) {
                  stopPlayback();
                  return;
                }
                void startLesson({
                  lessonId: GROOVE_ID,
                  title: copy.onboarding.grooveTitle,
                  chordNames: groove.shapes.map((shape) => shape.chord),
                  bpm: groove.bpm,
                  loop: true,
                  prepared: groove.prepared,
                });
              }}
            >
              {grooving ? copy.onboarding.stopGroove : copy.onboarding.playGroove}
            </Button>
          </div>
        ) : null}

        <div className={styles.actions}>
          <Button variant="ghost" onClick={skip}>
            {copy.onboarding.skip}
          </Button>
          <div className={styles.actionsRight}>
            {step > 0 ? (
              <Button variant="quiet" onClick={back}>
                {copy.onboarding.back}
              </Button>
            ) : null}
            <Button variant="primary" onClick={next}>
              {step === TOTAL_STEPS - 1 ? copy.onboarding.done : copy.onboarding.next}
            </Button>
          </div>
        </div>
      </div>
    </PageHeader>
  );
}
