import { useMemo, useState } from 'react';
import { PageHeader } from '../../app/layout/PageHeader';
import { Heading } from '../../ui/Heading';
import { Text } from '../../ui/Text';
import { Mono } from '../../ui/Mono';
import { Pill } from '../../ui/Pill';
import { Sheet } from '../../ui/Sheet';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { Button } from '../../ui/Button';
import { Fretboard } from '../../ui/Fretboard/Fretboard';
import { TransitionCard } from '../../ui/TransitionCard/TransitionCard';
import { copy, t } from '../../content/copy.en-GB';
import { getShapes, listChordNames } from '../../core/shapes/library';
import type { Shape } from '../../core/shapes/types';
import { shapeDifficulty } from '../../core/engine/cost';
import { candidatesFor, optimise } from '../../core/engine/optimise';
import { dropDPower } from '../../core/shapes/dropDPower';
import { hearChord } from '../../audio/hearChord';
import { useSettingsStore, type Tuning as TuningName } from '../../app/settingsStore';
import styles from './LibraryPage.module.css';

type ModuleTag = 'power' | 'open';
type TagFilter = '' | 'barre' | 'anchored';
type RegisterFilter = '' | Shape['register'];

const MODULE_TAGS: Record<ModuleTag, string[]> = {
  power: ['power'],
  open: ['open', 'anchored'],
};

// One derived one-finger power shape per root, added to Module 1's candidates only
// when the user's guitar is actually in drop D.
const DROP_D_POWER_SHAPES = Array.from({ length: 12 }, (_, root) => dropDPower(root));

function shapesForModule(
  name: string,
  moduleTag: ModuleTag,
  tagFilter: TagFilter,
  registerFilter: RegisterFilter,
  tuning: TuningName,
): Shape[] {
  const tagSet = tagFilter === '' ? MODULE_TAGS[moduleTag] : [tagFilter];
  const extra =
    tuning === 'dropD' && moduleTag === 'power'
      ? DROP_D_POWER_SHAPES.filter((shape) => shape.chord === name)
      : [];
  return [...getShapes(name, {}), ...extra]
    .filter((shape) => registerFilter === '' || shape.register === registerFilter)
    .filter((shape) => shape.tags.some((tag) => tagSet.includes(tag)));
}

const MODULE_SEGMENTS = [
  { value: 'power' as ModuleTag, label: copy.library.modulePower },
  { value: 'open' as ModuleTag, label: copy.library.moduleOpen },
];

const DISABLED_MODULES = [
  copy.library.moduleThumb,
  copy.library.moduleLead,
  copy.library.moduleWhammy,
];

const REGISTER_SEGMENTS = [
  { value: '', label: copy.library.registerAll },
  { value: 'low', label: copy.library.registerLow },
  { value: 'mid', label: copy.library.registerMid },
  { value: 'high', label: copy.library.registerHigh },
];

const TAG_SEGMENTS = [
  { value: '', label: copy.library.tagAll },
  { value: 'barre', label: copy.library.tagBarre },
  { value: 'anchored', label: copy.library.tagAnchored },
];

export default function LibraryPage() {
  const tuning = useSettingsStore((s) => s.tuning);
  const [moduleTag, setModuleTag] = useState<ModuleTag>('power');
  const [registerFilter, setRegisterFilter] = useState<RegisterFilter>('');
  const [tagFilter, setTagFilter] = useState<TagFilter>('');
  const [search, setSearch] = useState('');
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [compareChord, setCompareChord] = useState('');

  const chordNames = useMemo(() => {
    const query = search.trim().toLowerCase();
    return listChordNames()
      .filter((name) => query === '' || name.toLowerCase().includes(query))
      .filter(
        (name) => shapesForModule(name, moduleTag, tagFilter, registerFilter, tuning).length > 0,
      );
  }, [moduleTag, registerFilter, tagFilter, search, tuning]);

  const selectedShapes = selectedChord
    ? shapesForModule(selectedChord, moduleTag, tagFilter, registerFilter, tuning)
    : [];
  const compareOptions = chordNames.filter((name) => name !== selectedChord);

  const comparison =
    selectedChord && compareChord
      ? optimise(candidatesFor([selectedChord, compareChord], { tags: [moduleTag] }))
      : null;
  const comparisonFrom = comparison?.shapes[0];
  const comparisonTo = comparison?.shapes[1];
  const comparisonTransition = comparison?.transitions[0];

  return (
    <PageHeader title={copy.library.title}>
      <div className={styles.tabs}>
        <SegmentedControl
          label={copy.library.title}
          value={moduleTag}
          onChange={(value) => {
            setModuleTag(value as ModuleTag);
            setSelectedChord(null);
          }}
          segments={MODULE_SEGMENTS}
        />
        {DISABLED_MODULES.map((label) => (
          <Pill key={label} className={styles.disabledModule}>
            {t('library.comingSoon', { label })}
          </Pill>
        ))}
      </div>

      <div className={styles.filters}>
        <label className={styles.searchField}>
          <span className={styles.searchLabel}>{copy.library.searchLabel}</span>
          <input
            className={styles.searchInput}
            type="text"
            value={search}
            placeholder={copy.library.searchPlaceholder}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
        </label>
        <SegmentedControl
          label={copy.library.registerLabel}
          value={registerFilter}
          onChange={(value) => {
            setRegisterFilter(value as RegisterFilter);
          }}
          segments={REGISTER_SEGMENTS}
        />
        <SegmentedControl
          label={copy.library.tagLabel}
          value={tagFilter}
          onChange={(value) => {
            setTagFilter(value as TagFilter);
          }}
          segments={TAG_SEGMENTS}
        />
      </div>

      {chordNames.length === 0 ? (
        <Text dim>{copy.library.noResults}</Text>
      ) : (
        <div className={styles.grid}>
          {chordNames.map((name) => {
            const shape = shapesForModule(name, moduleTag, tagFilter, registerFilter, tuning)[0];
            if (!shape) return null;
            return (
              <button
                key={name}
                type="button"
                className={styles.card}
                data-testid="chord-card"
                aria-label={name}
                onClick={() => {
                  setSelectedChord(name);
                  setCompareChord('');
                }}
              >
                <Fretboard shape={shape} orientation="box" size={100} />
                <Heading level={4}>{name}</Heading>
                <Pill>{shape.register}</Pill>
              </button>
            );
          })}
        </div>
      )}

      <Sheet
        title={selectedChord ?? ''}
        open={selectedChord !== null}
        onClose={() => {
          setSelectedChord(null);
        }}
      >
        {selectedChord ? (
          <div className={styles.sheetBody}>
            <Text dim size="small">
              {t('library.shapeCount', { count: selectedShapes.length })}
            </Text>
            <div className={styles.shapeGrid}>
              {selectedShapes.map((shape) => (
                <div key={shape.id} className={styles.shapeCard} data-testid="chord-shape">
                  <Fretboard shape={shape} orientation="box" size={100} />
                  <Mono>{shape.id}</Mono>
                  <Text size="small" dim>
                    {shapeDifficulty(shape)}
                  </Text>
                  <Pill>{shape.register}</Pill>
                  <Button
                    variant="quiet"
                    size="small"
                    onClick={() => {
                      void hearChord(shape);
                    }}
                  >
                    {copy.library.hearChord}
                  </Button>
                </div>
              ))}
            </div>

            <Heading level={4}>{copy.library.compareLabel}</Heading>
            <select
              className={styles.compareSelect}
              value={compareChord}
              onChange={(event) => {
                setCompareChord(event.target.value);
              }}
            >
              <option value="">{copy.library.comparePlaceholder}</option>
              {compareOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            {comparisonFrom && comparisonTo && comparisonTransition ? (
              <TransitionCard
                from={comparisonFrom}
                to={comparisonTo}
                transition={comparisonTransition}
              />
            ) : null}
          </div>
        ) : null}
      </Sheet>
    </PageHeader>
  );
}
