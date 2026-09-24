import { useEffect, useRef, useState } from 'react';
import { PageHeader } from '../../app/layout/PageHeader';
import { copy } from '../../content/copy.en-GB';
import {
  useSettingsStore,
  useMotionEnabled,
  type Tuning as TuningName,
} from '../../app/settingsStore';
import { standard, halfDown, dropD, type Tuning } from '../../core/tuning';
import { detectPitch } from '../../core/pitch/detectPitch';
import { freqToNote, midiToNote } from '../../core/pitch/freqToNote';
import { nearestString } from '../../core/pitch/nearestString';
import { smooth } from '../../core/pitch/smooth';
import { MicPermissionDeniedError, MicUnsupportedError, startMic, stopMic } from '../../audio/mic';
import { ensureAudio, playReferenceTone } from '../../audio/engine';
import { Panel } from '../../ui/Panel';
import { Button } from '../../ui/Button';
import { Text } from '../../ui/Text';
import { Mono } from '../../ui/Mono';
import { Heading } from '../../ui/Heading';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { Slider } from '../../ui/Slider';
import { TunerDial } from './TunerDial';
import styles from './TunerPage.module.css';

const TUNINGS: Record<TuningName, Tuning> = { standard, halfDown, dropD };
const SMOOTH_ALPHA = 0.3;
const IN_TUNE_CENTS = 5;
const IN_TUNE_MS = 500;
const NEEDLE_TRANSITION_MS = 120;

type MicStatus = 'idle' | 'starting' | 'listening' | 'stopped' | 'denied' | 'unsupported';

type PitchInfo = {
  name: string;
  octave: number;
  string: number;
  cents: number;
};

export default function TunerPage() {
  const settings = useSettingsStore();
  const motionEnabled = useMotionEnabled();
  const [status, setStatus] = useState<MicStatus>('idle');
  const [pitchInfo, setPitchInfo] = useState<PitchInfo | null>(null);
  const [displayedCents, setDisplayedCents] = useState(0);
  const [inTune, setInTune] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);

  const tuningArray = TUNINGS[settings.tuning];
  const settingsRef = useRef(settings);
  const tuningRef = useRef(tuningArray);
  const motionRef = useRef(motionEnabled);
  const inTuneSinceRef = useRef<number | null>(null);

  useEffect(() => {
    settingsRef.current = settings;
    tuningRef.current = tuningArray;
    motionRef.current = motionEnabled;
  });

  useEffect(
    () => () => {
      stopMic();
    },
    [],
  );

  function handleFrame(buffer: Float32Array, sampleRate: number) {
    let peak = 0;
    for (const sample of buffer) peak = Math.max(peak, Math.abs(sample));
    setInputLevel(peak);

    const result = detectPitch(buffer, sampleRate);
    if (!result) {
      setPitchInfo(null);
      inTuneSinceRef.current = null;
      setInTune(false);
      return;
    }

    const note = freqToNote(result.freq, settingsRef.current.a4);
    const nearest = nearestString(result.freq, tuningRef.current, settingsRef.current.capo);
    setPitchInfo({
      name: note.name,
      octave: note.octave,
      string: nearest.string,
      cents: nearest.cents,
    });
    setDisplayedCents((prev) =>
      motionRef.current ? smooth(prev, nearest.cents, SMOOTH_ALPHA) : nearest.cents,
    );

    const now = performance.now();
    const within = Math.abs(nearest.cents) <= IN_TUNE_CENTS;
    if (within) {
      inTuneSinceRef.current ??= now;
    } else {
      inTuneSinceRef.current = null;
    }
    setInTune(within && now - (inTuneSinceRef.current ?? now) >= IN_TUNE_MS);
  }

  async function handleToggle() {
    if (status === 'listening' || status === 'starting') {
      stopMic();
      setStatus('stopped');
      setPitchInfo(null);
      setDisplayedCents(0);
      setInTune(false);
      setInputLevel(0);
      inTuneSinceRef.current = null;
      return;
    }

    setStatus('starting');
    try {
      await startMic(handleFrame);
      setStatus('listening');
    } catch (error) {
      if (error instanceof MicPermissionDeniedError) setStatus('denied');
      else if (error instanceof MicUnsupportedError) setStatus('unsupported');
      else setStatus('idle');
    }
  }

  async function handleReferenceTone(midi: number) {
    await ensureAudio();
    playReferenceTone(midi);
  }

  const statusCopy: Record<MicStatus, string> = {
    idle: copy.tunerScreen.statusIdle,
    starting: copy.tunerScreen.statusStarting,
    listening: copy.tunerScreen.statusListening,
    stopped: copy.tunerScreen.statusStopped,
    denied: copy.tunerScreen.statusDenied,
    unsupported: copy.tunerScreen.statusUnsupported,
  };

  const calm = status === 'denied' || status === 'unsupported';

  return (
    <PageHeader title={copy.tunerScreen.title}>
      <Panel className={styles.panel}>
        <div className={styles.controls}>
          <Button
            onClick={() => {
              void handleToggle();
            }}
            disabled={status === 'unsupported'}
          >
            {status === 'listening' || status === 'starting'
              ? copy.tunerScreen.stop
              : copy.tunerScreen.start}
          </Button>
          <Text dim={!calm} data-testid="tuner-status">
            {statusCopy[status]}
          </Text>
          {status === 'listening' ? (
            <Mono data-testid="tuner-level">
              {copy.tunerScreen.inputLevel.replace('{level}', inputLevel.toFixed(3))}
            </Mono>
          ) : null}
        </div>

        {!calm ? (
          <>
            <TunerDial
              cents={displayedCents}
              inTune={inTune}
              transitionMs={motionEnabled ? NEEDLE_TRANSITION_MS : 0}
            />

            <div className={styles.readout}>
              <Heading level={2} data-testid="tuner-note" className={styles.note}>
                {pitchInfo ? `${pitchInfo.name}${String(pitchInfo.octave)}` : '—'}
              </Heading>
              <Mono>
                {pitchInfo
                  ? `${pitchInfo.cents >= 0 ? '+' : ''}${String(Math.round(pitchInfo.cents))}¢`
                  : '—'}
              </Mono>
              {inTune ? <Text className={styles.inTune}>{copy.tunerScreen.inTune}</Text> : null}
              {!pitchInfo ? <Text dim>{copy.tunerScreen.listenForNote}</Text> : null}
            </div>
          </>
        ) : null}

        <div className={styles.strings}>
          {tuningArray.map((midi, index) => {
            const openMidi = midi + settings.capo;
            const { name, octave } = midiToNote(openMidi);
            const active = pitchInfo?.string === index;
            return (
              <Button
                key={index}
                variant={active ? 'primary' : 'quiet'}
                size="small"
                aria-label={copy.tunerScreen.referenceToneLabel.replace(
                  '{note}',
                  `${name}${String(octave)}`,
                )}
                onClick={() => {
                  void handleReferenceTone(openMidi);
                }}
              >
                {name}
              </Button>
            );
          })}
        </div>

        <div className={styles.row}>
          <Text>{copy.tunerScreen.tuning}</Text>
          <SegmentedControl
            label={copy.tunerScreen.tuning}
            value={settings.tuning}
            onChange={(value) => {
              settings.setTuning(value as TuningName);
            }}
            segments={[
              { value: 'standard', label: copy.settings.tuningStandard },
              { value: 'halfDown', label: copy.settings.tuningHalfDown },
              { value: 'dropD', label: copy.settings.tuningDropD },
            ]}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <Text>{copy.tunerScreen.a4Label}</Text>
            <Mono>{settings.a4}</Mono>
          </div>
          <Slider
            label={copy.tunerScreen.a4Label}
            value={settings.a4}
            min={430}
            max={450}
            onChange={settings.setA4}
          />
        </div>
      </Panel>
    </PageHeader>
  );
}
