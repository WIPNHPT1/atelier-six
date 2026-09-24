import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { parseShape } from '../../core/shapes/parseShape';
import { describeShape } from '../../core/shapes/describe';
import { Fretboard } from './Fretboard';

const C = parseShape('C.open.a', 'C', 'x32010', '-32-1-');
const F_BARRE = parseShape('F.custom', 'F', 'x22422', '-11311', {
  barre: { fret: 2, from: 1, to: 5, finger: 1 },
});
const G5 = parseShape('G5', 'G5', '355xxx', '134---');

describe('Fretboard', () => {
  it('renders one dot per fretted string, plus opens and mutes, for C', () => {
    render(<Fretboard shape={C} />);
    expect(screen.getAllByTestId('fretboard-dot')).toHaveLength(3);
    expect(screen.getAllByTestId('fretboard-open')).toHaveLength(2);
    expect(screen.getAllByTestId('fretboard-muted')).toHaveLength(1);
    expect(screen.queryByTestId('fretboard-barre')).not.toBeInTheDocument();
  });

  it('renders a single barre bar instead of one dot per covered string for F', () => {
    render(<Fretboard shape={F_BARRE} />);
    expect(screen.getByTestId('fretboard-barre')).toBeInTheDocument();
    expect(screen.getAllByTestId('fretboard-dot')).toHaveLength(1);
    expect(screen.getAllByTestId('fretboard-muted')).toHaveLength(1);
    expect(screen.queryByTestId('fretboard-open')).not.toBeInTheDocument();
  });

  it('renders dots and mutes for the G5 power chord shape', () => {
    render(<Fretboard shape={G5} />);
    expect(screen.getAllByTestId('fretboard-dot')).toHaveLength(3);
    expect(screen.getAllByTestId('fretboard-muted')).toHaveLength(3);
    expect(screen.queryByTestId('fretboard-open')).not.toBeInTheDocument();
  });

  it('mirrors string x positions when left-handed', () => {
    const { container: right } = render(<Fretboard shape={C} size={140} leftHanded={false} />);
    const { container: left } = render(<Fretboard shape={C} size={140} leftHanded />);

    const rightX = Number(
      right.querySelector('[data-testid="fretboard-string-6"]')?.getAttribute('x1'),
    );
    const leftX = Number(
      left.querySelector('[data-testid="fretboard-string-6"]')?.getAttribute('x1'),
    );

    expect(rightX).toBeLessThan(70);
    expect(leftX).toBeGreaterThan(70);
  });

  it('sets an aria-label built from describeShape', () => {
    render(<Fretboard shape={C} />);
    expect(screen.getByRole('img', { name: describeShape(C) })).toBeInTheDocument();
  });
});
