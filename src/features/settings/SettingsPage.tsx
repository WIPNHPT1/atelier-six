import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../app/layout/PageHeader';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import { Mono } from '../../ui/Mono';
import { Toggle } from '../../ui/Toggle';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { Slider } from '../../ui/Slider';
import { Button } from '../../ui/Button';
import { copy } from '../../content/copy.en-GB';
import { useSettingsStore } from '../../app/settingsStore';
import { downloadSoundsForOffline } from '../../audio/sampleCache';
import styles from './SettingsPage.module.css';

type DownloadState = 'idle' | 'downloading' | 'done';

export default function SettingsPage() {
  const settings = useSettingsStore();
  const navigate = useNavigate();
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');

  return (
    <PageHeader title={copy.settings.title}>
      <Panel>
        <div className={styles.row}>
          <Text>{copy.settings.mode}</Text>
          <SegmentedControl
            label={copy.settings.mode}
            value={settings.mode}
            onChange={(value) => {
              settings.setMode(value as typeof settings.mode);
            }}
            segments={[
              { value: 'dark', label: copy.settings.modeDark },
              { value: 'light', label: copy.settings.modeLight },
              { value: 'system', label: copy.settings.modeSystem },
            ]}
          />
        </div>

        <div className={styles.row}>
          <Text>{copy.settings.motion}</Text>
          <SegmentedControl
            label={copy.settings.motion}
            value={settings.motion}
            onChange={(value) => {
              settings.setMotion(value as typeof settings.motion);
            }}
            segments={[
              { value: 'on', label: copy.settings.motionOn },
              { value: 'off', label: copy.settings.motionOff },
              { value: 'system', label: copy.settings.motionSystem },
            ]}
          />
        </div>

        <div className={styles.row}>
          <Text>{copy.settings.sound}</Text>
          <Toggle
            label={copy.settings.sound}
            checked={settings.sound}
            onChange={settings.setSound}
          />
        </div>

        <div className={styles.row}>
          <Text>{copy.settings.leftHanded}</Text>
          <Toggle
            label={copy.settings.leftHanded}
            checked={settings.leftHanded}
            onChange={settings.setLeftHanded}
          />
        </div>

        <div className={styles.row}>
          <Text>{copy.settings.tuning}</Text>
          <SegmentedControl
            label={copy.settings.tuning}
            value={settings.tuning}
            onChange={(value) => {
              settings.setTuning(value as typeof settings.tuning);
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
            <Text>{copy.settings.capo}</Text>
            <Mono>{settings.capo}</Mono>
          </div>
          <div className={styles.sliderRow}>
            <Slider
              label={copy.settings.capo}
              value={settings.capo}
              min={0}
              max={7}
              onChange={settings.setCapo}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <Text>{copy.settings.robotMode}</Text>
            <Mono>{copy.settings.robotModeHint}</Mono>
          </div>
          <Toggle
            label={copy.settings.robotMode}
            checked={settings.robotMode}
            onChange={settings.setRobotMode}
          />
        </div>

        <div className={styles.row}>
          <Text>{copy.settings.downloadSounds}</Text>
          <Button
            variant="quiet"
            disabled={downloadState === 'downloading'}
            onClick={() => {
              setDownloadState('downloading');
              void downloadSoundsForOffline().then(() => {
                setDownloadState('done');
              });
            }}
          >
            {downloadState === 'downloading'
              ? copy.settings.downloadingSounds
              : downloadState === 'done'
                ? copy.settings.soundsDownloaded
                : copy.settings.downloadSounds}
          </Button>
        </div>

        <div className={styles.row}>
          <Text>{copy.onboarding.restart}</Text>
          <Button
            variant="quiet"
            onClick={() => {
              void navigate('/onboarding');
            }}
          >
            {copy.onboarding.restart}
          </Button>
        </div>
      </Panel>
    </PageHeader>
  );
}
