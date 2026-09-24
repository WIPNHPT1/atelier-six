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
import { isVoiceCommandsSupported } from '../voice/useVoiceCommands';
import { FootPedalTest } from '../../ui/shortcuts/FootPedalTest';
import styles from './SettingsPage.module.css';
import { ProgressTransfer } from './ProgressTransfer';

type DownloadState = 'idle' | 'downloading' | 'done';

export default function SettingsPage() {
  const settings = useSettingsStore();
  const navigate = useNavigate();
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [voiceSupported] = useState(isVoiceCommandsSupported);

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
          <Text>{copy.settings.finish}</Text>
          <SegmentedControl
            label={copy.settings.finish}
            value={settings.finish}
            onChange={(value) => {
              settings.setFinish(value as typeof settings.finish);
            }}
            segments={[
              { value: 'nitro', label: copy.settings.finishNitro },
              { value: 'xerox', label: copy.settings.finishXerox },
              { value: 'sunburst', label: copy.settings.finishSunburst },
              { value: 'faded', label: copy.settings.finishFaded },
              { value: 'stencil', label: copy.settings.finishStencil },
            ]}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <Text>{copy.settings.pinnedFinish}</Text>
            <Text dim size="small">
              {copy.settings.pinnedFinishHint}
            </Text>
          </div>
          <Toggle
            label={copy.settings.pinnedFinish}
            checked={settings.pinnedFinish}
            onChange={settings.setPinnedFinish}
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
            <Text dim size="small">
              {copy.settings.robotModeHint}
            </Text>
          </div>
          <Toggle
            label={copy.settings.robotMode}
            checked={settings.robotMode}
            onChange={settings.setRobotMode}
          />
        </div>

        {voiceSupported ? (
          <div className={styles.row}>
            <div className={styles.rowLabel}>
              <Text>{copy.settings.voiceCommands}</Text>
              <Text dim size="small">
                {copy.settings.voiceCommandsHint}
              </Text>
            </div>
            <Toggle
              label={copy.settings.voiceCommands}
              checked={settings.voiceCommands}
              onChange={settings.setVoiceCommands}
            />
          </div>
        ) : null}

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <Text>{copy.settings.footPedalTest}</Text>
            <Text dim size="small">
              {copy.settings.footPedalTestHint}
            </Text>
          </div>
          <FootPedalTest />
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
      <ProgressTransfer />
    </PageHeader>
  );
}
