import { useMemo, useState } from 'react';
import { twoChordLattice } from '../../core/engine/lattice';
import { analyseTransition } from '../../core/engine/analyseTransition';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { Text } from '../../ui/Text';
import { TransitionCard } from '../../ui/TransitionCard/TransitionCard';
import { t } from '../../content/copy.en-GB';
import { copy } from '../../content/copy.en-GB';
import styles from './AboutPage.module.css';

const CHORDS = ['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Dm'];
const WIDTH = 320;
const ROW = 56;
const LEFT_X = 70;
const RIGHT_X = 250;

export function LatticeDemo() {
  const [fromChord, setFromChord] = useState('G');
  const [toChord, setToChord] = useState('C');
  const lattice = useMemo(() => twoChordLattice(fromChord, toChord), [fromChord, toChord]);
  const rows = Math.max(lattice.from.length, lattice.to.length, 1);
  const height = rows * ROW;
  const y = (i: number) => ROW / 2 + i * ROW;
  const chosen = lattice.edges.find((edge) => edge.chosen);
  const chosenFrom = chosen === undefined ? undefined : lattice.from[chosen.from]?.shape;
  const chosenTo = chosen === undefined ? undefined : lattice.to[chosen.to]?.shape;
  const segments = CHORDS.map((chord) => ({ value: chord, label: chord }));

  return (
    <div className={styles.demo}>
      <div className={styles.pickers}>
        <Text dim size="small">
          {copy.about.fromChord}
        </Text>
        <SegmentedControl
          label={copy.about.fromChord}
          segments={segments}
          value={fromChord}
          onChange={setFromChord}
        />
        <Text dim size="small">
          {copy.about.toChord}
        </Text>
        <SegmentedControl
          label={copy.about.toChord}
          segments={segments}
          value={toChord}
          onChange={setToChord}
        />
      </div>

      <svg
        className={styles.lattice}
        viewBox={`0 0 ${String(WIDTH)} ${String(height)}`}
        role="img"
        aria-label={t('about.latticeLabel', { from: fromChord, to: toChord })}
      >
        {lattice.edges.map((edge) => (
          <line
            key={`${String(edge.from)}-${String(edge.to)}`}
            x1={LEFT_X}
            y1={y(edge.from)}
            x2={RIGHT_X}
            y2={y(edge.to)}
            className={edge.chosen ? styles.edgeChosen : styles.edge}
          />
        ))}
        {lattice.from.map((node, i) => (
          <g key={node.shape.id}>
            <circle cx={LEFT_X} cy={y(i)} r={6} className={styles.node} />
            <text x={LEFT_X - 12} y={y(i) + 4} textAnchor="end" className={styles.nodeLabel}>
              {t('about.shapeCost', { cost: node.cost })}
            </text>
          </g>
        ))}
        {lattice.to.map((node, i) => (
          <g key={node.shape.id}>
            <circle cx={RIGHT_X} cy={y(i)} r={6} className={styles.node} />
            <text x={RIGHT_X + 12} y={y(i) + 4} className={styles.nodeLabel}>
              {t('about.shapeCost', { cost: node.cost })}
            </text>
          </g>
        ))}
      </svg>

      {chosen !== undefined && chosenFrom !== undefined && chosenTo !== undefined ? (
        <>
          <Text dim>
            {t('about.chosenPath', { from: fromChord, to: toChord, cost: chosen.cost })}
          </Text>
          <TransitionCard
            from={chosenFrom}
            to={chosenTo}
            transition={analyseTransition(chosenFrom, chosenTo)}
          />
        </>
      ) : null}
    </div>
  );
}
