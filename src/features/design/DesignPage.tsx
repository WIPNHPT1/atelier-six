import { useState } from 'react';
import { PageHeader } from '../../app/layout/PageHeader';
import { Panel } from '../../ui/Panel';
import { Heading } from '../../ui/Heading';
import { Text } from '../../ui/Text';
import { Mono } from '../../ui/Mono';
import { Divider } from '../../ui/Divider';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { Pill } from '../../ui/Pill';
import { Toggle } from '../../ui/Toggle';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { Slider } from '../../ui/Slider';
import { Dial } from '../../ui/Dial';
import { Sheet } from '../../ui/Sheet';
import { Logo } from '../../ui/Logo';
import { Fretboard } from '../../ui/Fretboard/Fretboard';
import { TransitionCard } from '../../ui/TransitionCard/TransitionCard';
import { TabLane } from '../../ui/TabLane/TabLane';
import { PlayIcon } from '../../ui/icons';
import { copy } from '../../content/copy.en-GB';
import { useSettingsStore } from '../../app/settingsStore';
import { contrastRatio } from '../../core/colorContrast';
import { analyseTransition } from '../../core/engine/analyseTransition';
import { getChord, getShapes } from '../../core/shapes/library';
import { renderTab } from '../../core/tab/renderTab';
import { RHYTHMS } from '../../data/rhythms';
import { standard } from '../../core/tuning';
import { playDrumGrooveDemo, playPalmMutedRiffDemo, playStrummedChordDemo } from '../../audio/demo';
import { useLiveTokens } from './useLiveTokens';
import styles from './DesignPage.module.css';

const FRETBOARD_C = getChord('C')?.shapes[0];
const FRETBOARD_F_BARRE = getShapes('F', { tags: ['barre'] })[0];
const FRETBOARD_G5 = getShapes('G5', { tags: ['power'] })[0];
const TRANSITION_AM = getChord('Am')?.shapes[0];

const TAB_LANE_G = getChord('G')?.shapes[0];
const STOPS = RHYTHMS.find((r) => r.id === 'stops');
const TAB_LANE_COLUMNS =
  FRETBOARD_C && TAB_LANE_G && STOPS
    ? renderTab([FRETBOARD_C, TAB_LANE_G], STOPS, [1, 1], standard)
    : [];

const SIXTEENTH_MOTION = RHYTHMS.find((r) => r.id === 'sixteenth-motion');
const GHOST_TAB_COLUMNS =
  FRETBOARD_C && SIXTEENTH_MOTION ? renderTab([FRETBOARD_C], SIXTEENTH_MOTION, [1], standard) : [];

const SWATCH_TOKENS = [
  'ebony',
  'rosewood',
  'rosewood-2',
  'bone',
  'bone-dim',
  'brass',
  'brass-hi',
  'f1',
  'f2',
  'f3',
  'f4',
  'fT',
] as const;

const CONTRAST_PAIRS = [
  ['bone', 'ebony'],
  ['bone', 'rosewood'],
  ['bone-dim', 'ebony'],
  ['ebony', 'brass'],
] as const;

const TYPE_STEPS = [12, 14, 16, 20, 28, 40, 56];
const SPACING_STEPS = [4, 8, 12, 16, 24, 32, 48, 64];

export default function DesignPage() {
  const tokens = useLiveTokens();
  const settings = useSettingsStore();
  const [sliderValue, setSliderValue] = useState(90);
  const [toggleOn, setToggleOn] = useState(true);
  const [segment, setSegment] = useState('a');
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <PageHeader title={copy.design.title}>
      <section className={styles.section}>
        <Heading level={2}>{copy.design.colours}</Heading>
        <div className={styles.swatchGrid}>
          {SWATCH_TOKENS.map((name) => {
            const varName = `--${name}`;
            return (
              <div className={styles.swatch} key={name}>
                <div
                  className={styles.swatchColor}
                  style={{ background: `var(${varName})` }}
                  data-testid={`swatch-${name}`}
                />
                <Mono>{varName}</Mono>
                <Text dim size="small">
                  {tokens[name]}
                </Text>
              </div>
            );
          })}
        </div>
        <Divider />
        <div className={styles.contrastList}>
          {CONTRAST_PAIRS.map(([a, b]) => {
            const ratio = contrastRatio(tokens[a], tokens[b]);
            const pairLabel = `--${a} / --${b}: `;
            const ratioLabel = `${ratio.toFixed(2)}:1`;
            return (
              <Text key={`${a}-${b}`}>
                {pairLabel}
                <Mono>{ratioLabel}</Mono>
              </Text>
            );
          })}
        </div>
      </section>

      <Divider />

      <section className={styles.section}>
        <Heading level={2}>{copy.design.typeScale}</Heading>
        <div className={styles.typeScale}>
          {TYPE_STEPS.map((step) => {
            const pxLabel = `${String(step)}px`;
            return (
              <div className={styles.typeRow} key={step}>
                <Mono>{pxLabel}</Mono>
                <span style={{ fontSize: pxLabel, fontFamily: 'var(--font-display)' }}>
                  {copy.design.typeSample}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <Divider />

      <section className={styles.section}>
        <Heading level={2}>{copy.design.spacing}</Heading>
        {SPACING_STEPS.map((step) => {
          const pxLabel = `${String(step)}px`;
          return (
            <div className={styles.spacingRow} key={step}>
              <Mono>{pxLabel}</Mono>
              <div className={styles.spacingBox} style={{ width: pxLabel }} />
            </div>
          );
        })}
      </section>

      <Divider />

      <section className={styles.section}>
        <Heading level={2}>{copy.design.components}</Heading>

        <Heading level={3}>{copy.design.buttons}</Heading>
        <div className={styles.componentRow}>
          <Button variant="primary">{copy.design.buttons}</Button>
          <Button variant="quiet">{copy.design.buttons}</Button>
          <Button variant="ghost">{copy.design.buttons}</Button>
          <Button variant="primary" loading>
            {copy.design.loading}
          </Button>
          <IconButton label={copy.nav.practise}>
            <PlayIcon />
          </IconButton>
        </div>

        <Heading level={3}>{copy.design.panels}</Heading>
        <div className={styles.componentRow}>
          <Panel>{copy.design.panels}</Panel>
          <Panel raised>{copy.design.panels}</Panel>
        </div>

        <Heading level={3}>{copy.design.dividers}</Heading>
        <Divider />

        <Heading level={3}>{copy.design.headings}</Heading>
        <Heading level={1}>{copy.design.headings}</Heading>
        <Heading level={2}>{copy.design.headings}</Heading>
        <Heading level={3}>{copy.design.headings}</Heading>
        <Heading level={4}>{copy.design.headings}</Heading>

        <Heading level={3}>{copy.design.text}</Heading>
        <Text>{copy.design.text}</Text>
        <Text dim>{copy.design.text}</Text>
        <Text size="small">{copy.design.text}</Text>
        <Text size="large">{copy.design.text}</Text>

        <Heading level={3}>{copy.design.pills}</Heading>
        <div className={styles.componentRow}>
          <Pill>{copy.design.pills}</Pill>
          <Pill accent>{copy.design.pills}</Pill>
        </div>

        <Heading level={3}>{copy.design.slider}</Heading>
        <Slider
          label={copy.design.slider}
          value={sliderValue}
          min={40}
          max={200}
          onChange={setSliderValue}
        />

        <Heading level={3}>{copy.design.toggle}</Heading>
        <Toggle label={copy.design.toggle} checked={toggleOn} onChange={setToggleOn} />

        <Heading level={3}>{copy.design.segmented}</Heading>
        <SegmentedControl
          label={copy.design.segmented}
          value={segment}
          onChange={setSegment}
          segments={[
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ]}
        />

        <Heading level={3}>{copy.design.dial}</Heading>
        <Dial label={copy.design.dial} value={0.65} displayValue="65%" />

        <Heading level={3}>{copy.design.sheet}</Heading>
        <Button
          variant="quiet"
          onClick={() => {
            setSheetOpen(true);
          }}
        >
          {copy.design.openSheet}
        </Button>
        <Sheet
          title={copy.design.sheetDemo}
          open={sheetOpen}
          onClose={() => {
            setSheetOpen(false);
          }}
        >
          <Text>{copy.design.sheetBody}</Text>
        </Sheet>

        <Heading level={3}>{copy.design.fretboard}</Heading>
        <div className={styles.componentRow}>
          {FRETBOARD_C ? <Fretboard shape={FRETBOARD_C} /> : null}
          {FRETBOARD_F_BARRE ? <Fretboard shape={FRETBOARD_F_BARRE} /> : null}
          {FRETBOARD_G5 ? <Fretboard shape={FRETBOARD_G5} orientation="neck" /> : null}
          {FRETBOARD_C ? <Fretboard shape={FRETBOARD_C} leftHanded /> : null}
        </div>

        <Heading level={3}>{copy.design.transitionCard}</Heading>
        {FRETBOARD_C && TRANSITION_AM ? (
          <TransitionCard
            from={FRETBOARD_C}
            to={TRANSITION_AM}
            transition={analyseTransition(FRETBOARD_C, TRANSITION_AM)}
          />
        ) : null}

        <Heading level={3}>{copy.design.tabLane}</Heading>
        {FRETBOARD_C && TAB_LANE_G ? (
          <TabLane
            columns={TAB_LANE_COLUMNS}
            shapes={[FRETBOARD_C, TAB_LANE_G]}
            tuning={standard}
            playhead={2}
            header={{ tempo: 96, tuning: 'Standard', capo: 0, key: 'C major' }}
            sectionLabels={{ 0: 'Verse', 1: 'Chorus' }}
            repeatEndBars={[0]}
            dynamics={{ 0: copy.tabLane.dynamicMezzoForte, 2: copy.tabLane.dynamicForte }}
          />
        ) : null}
        {FRETBOARD_C ? (
          <TabLane columns={GHOST_TAB_COLUMNS} shapes={[FRETBOARD_C]} tuning={standard} />
        ) : null}
      </section>

      <Divider />

      <section className={styles.section}>
        <Heading level={2}>{copy.design.audio}</Heading>
        <div className={styles.controlsRow}>
          <Button
            onClick={() => {
              void playStrummedChordDemo();
            }}
          >
            {copy.design.strummedChord}
          </Button>
          <Button
            onClick={() => {
              void playPalmMutedRiffDemo();
            }}
          >
            {copy.design.palmMutedRiff}
          </Button>
          <Button
            onClick={() => {
              void playDrumGrooveDemo();
            }}
          >
            {copy.design.drumGroove}
          </Button>
        </div>
      </section>

      <Divider />

      <section className={styles.section}>
        <Heading level={2}>{copy.design.logo}</Heading>
        <div className={styles.logoRow}>
          <Logo variant="mark" size={64} />
          <Logo variant="lockup" size={40} />
          <Logo variant="small" size={64} />
        </div>
      </section>

      <Divider />

      <section className={styles.section}>
        <div className={styles.controlsRow}>
          <div className={styles.controlGroup}>
            <Heading level={3}>{copy.design.finish}</Heading>
            <SegmentedControl
              label={copy.design.finish}
              value={settings.finish}
              onChange={(value) => {
                settings.setFinish(value as typeof settings.finish);
              }}
              segments={[
                { value: 'nitro', label: 'Nitro' },
                { value: 'xerox', label: 'Xerox' },
                { value: 'sunburst', label: 'Sunburst' },
                { value: 'faded', label: 'Faded' },
                { value: 'stencil', label: 'Stencil' },
              ]}
            />
          </div>

          <div className={styles.controlGroup}>
            <Heading level={3}>{copy.design.mode}</Heading>
            <SegmentedControl
              label={copy.design.mode}
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

          <div className={styles.controlGroup}>
            <Heading level={3}>{copy.design.motion}</Heading>
            <SegmentedControl
              label={copy.design.motion}
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
        </div>
      </section>
    </PageHeader>
  );
}
