import { type ComponentType } from 'react';
import { copy, t } from '../../content/copy.en-GB';
import { transitionCost } from '../../core/engine/cost';
import { explainTransition, fingerList, fingerWord } from '../../core/engine/explain';
import { labelForAverageCost } from '../../core/engine/score';
import type { Move, Transition } from '../../core/engine/types';
import { ordinal } from '../../core/ordinal';
import type { Shape } from '../../core/shapes/types';
import { Fretboard } from '../Fretboard/Fretboard';
import { Pill } from '../Pill';
import { Text } from '../Text';
import { useIsWide } from '../useIsWide';
import { FingerGlide } from './FingerGlide';
import {
  ArcIcon,
  ArrowIcon,
  BracketIcon,
  PinIcon,
  PlusIcon,
  RingIcon,
  type IconProps,
} from '../icons';
import styles from './TransitionCard.module.css';

const STRING_COUNT = 6;

function stringNumber(index: number): number {
  return STRING_COUNT - index;
}

function difficultyLabel(label: ReturnType<typeof labelForAverageCost>): string {
  if (label === 'gentle') return copy.transition.difficultyGentle;
  if (label === 'moderate') return copy.transition.difficultyModerate;
  return copy.transition.difficultyDemanding;
}

type OverlayItem = { key: string; Icon: ComponentType<IconProps>; label: string };

function overlayForMove(move: Move): OverlayItem | null {
  switch (move.type) {
    case 'anchor':
      return {
        key: `anchor-${String(move.finger)}`,
        Icon: PinIcon,
        label: t('transition.overlayAnchor', { finger: fingerWord(move.finger) }),
      };
    case 'guide':
      if (!move.to) return null;
      return {
        key: `guide-${String(move.finger)}`,
        Icon: ArrowIcon,
        label: t('transition.overlayGuide', {
          finger: fingerWord(move.finger),
          string: ordinal(stringNumber(move.to.string)),
          fret: ordinal(move.to.fret),
        }),
      };
    case 'lift':
      if (!move.to) return null;
      return {
        key: `lift-${String(move.finger)}`,
        Icon: ArcIcon,
        label: t('transition.overlayLift', {
          finger: fingerWord(move.finger),
          string: ordinal(stringNumber(move.to.string)),
          fret: ordinal(move.to.fret),
        }),
      };
    case 'place':
      if (!move.to) return null;
      return {
        key: `place-${String(move.finger)}`,
        Icon: PlusIcon,
        label: t('transition.overlayPlace', {
          finger: fingerWord(move.finger),
          string: ordinal(stringNumber(move.to.string)),
          fret: ordinal(move.to.fret),
        }),
      };
    case 'release':
      return {
        key: `release-${String(move.finger)}`,
        Icon: RingIcon,
        label: t('transition.overlayRelease', { finger: fingerWord(move.finger) }),
      };
    case 'group':
      return null;
  }
}

function overlayItems(transition: Transition): OverlayItem[] {
  const items: OverlayItem[] = [];
  for (const move of transition.moves) {
    const item = overlayForMove(move);
    if (item) items.push(item);
  }
  transition.groups.forEach((group, index) => {
    items.push({
      key: `group-${String(index)}`,
      Icon: group.kind === 'slide' ? ArrowIcon : BracketIcon,
      label: t(
        group.kind === 'slide' ? 'transition.overlaySlideGroup' : 'transition.overlayShiftGroup',
        { fingers: fingerList(group.fingers) },
      ),
    });
  });
  return items;
}

export type TransitionCardProps = {
  from: Shape;
  to: Shape;
  transition: Transition;
};

export function TransitionCard({ from, to, transition }: TransitionCardProps) {
  const isWide = useIsWide();
  const orientation = isWide ? 'neck' : 'box';
  const label = difficultyLabel(labelForAverageCost(transitionCost(transition)));
  const items = overlayItems(transition);
  const steps = explainTransition(transition);

  return (
    <div className={styles.card}>
      <div className={styles.glide}>
        <FingerGlide transition={transition} />
      </div>

      <div className={styles.boards}>
        <Fretboard shape={from} orientation={orientation} />
        <Fretboard shape={to} orientation={orientation} />
      </div>

      <div className={styles.overlay}>
        {items.map(({ key, Icon, label: itemLabel }) => (
          <span
            key={key}
            role="img"
            aria-label={itemLabel}
            className={styles.overlayItem}
            data-testid="transition-overlay-item"
          >
            <Icon />
          </span>
        ))}
      </div>

      <Pill>{label}</Pill>

      <ol className={styles.steps}>
        {steps.map((step) => (
          <li key={step}>
            <Text>{step}</Text>
          </li>
        ))}
      </ol>
    </div>
  );
}
