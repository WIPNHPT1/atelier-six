import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { parseShape } from '../../core/shapes/parseShape';
import { analyseTransition } from '../../core/engine/analyseTransition';
import { TransitionCard } from './TransitionCard';

describe('TransitionCard', () => {
  it('renders one overlay element per ungrouped move for C open → Am open', () => {
    const c = parseShape('C.open', 'C', 'x32010', '-32-1-');
    const am = parseShape('Am.open', 'Am', 'x02210', '--231-');

    render(<TransitionCard from={c} to={am} transition={analyseTransition(c, am)} />);

    const items = screen.getAllByTestId('transition-overlay-item');
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item.getAttribute('aria-label')).toBeTruthy();
    }
  });

  it('renders one overlay element per move plus one per group for Em open → Am open', () => {
    const em = parseShape('Em.open', 'Em', '022000', '-23---');
    const am = parseShape('Am.open', 'Am', 'x02210', '--231-');

    render(<TransitionCard from={em} to={am} transition={analyseTransition(em, am)} />);

    expect(screen.getAllByTestId('transition-overlay-item')).toHaveLength(2);
  });

  it('renders a single group overlay element for the G5 → A5 slide', () => {
    const g5 = parseShape('G5', 'G5', '355xxx', '134---');
    const a5 = parseShape('A5', 'A5', '577xxx', '134---');

    render(<TransitionCard from={g5} to={a5} transition={analyseTransition(g5, a5)} />);

    const items = screen.getAllByTestId('transition-overlay-item');
    expect(items).toHaveLength(1);
    expect(items[0]?.getAttribute('aria-label')).toContain('Fingers 1, 3 and 4');
  });

  it('shows a difficulty pill and the plain-English steps', () => {
    const c = parseShape('C.open', 'C', 'x32010', '-32-1-');
    const am = parseShape('Am.open', 'Am', 'x02210', '--231-');

    render(<TransitionCard from={c} to={am} transition={analyseTransition(c, am)} />);

    expect(screen.getByText('Keep fingers 1 and 2 where they are.')).toBeInTheDocument();
    expect(screen.getByText(/Gentle|Moderate|Demanding/)).toBeInTheDocument();
  });
});
