import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { renderTab } from '../../core/tab/renderTab';
import { parseShape } from '../../core/shapes/parseShape';
import { RHYTHMS } from '../../data/rhythms';
import { standard, dropD } from '../../core/tuning';
import { TabLane } from './TabLane';
import styles from './TabLane.module.css';

const C = parseShape('C.open.a', 'C', 'x32010', '-32-1-');
const drivingEighths = RHYTHMS.find((r) => r.id === 'driving-eighths');
if (!drivingEighths) throw new Error('missing driving-eighths fixture');

const stringLabelClass = styles.stringLabel ?? '';
const isActiveClass = styles.isActive ?? '';
const barNumberClass = styles.barNumber ?? '';
const sectionLabelClass = styles.sectionLabel ?? '';

describe('TabLane', () => {
  it('labels strings e B G D A E for standard tuning', () => {
    const columns = renderTab([C], drivingEighths, [1], standard);
    const { container } = render(<TabLane columns={columns} shapes={[C]} tuning={standard} />);
    const labels = [...container.querySelectorAll(`.${stringLabelClass}`)].map(
      (el) => el.textContent,
    );
    expect(labels).toEqual(['e', 'B', 'G', 'D', 'A', 'E']);
  });

  it('labels the low string D for drop D tuning', () => {
    const columns = renderTab([C], drivingEighths, [1], dropD);
    const { container } = render(<TabLane columns={columns} shapes={[C]} tuning={dropD} />);
    const labels = [...container.querySelectorAll(`.${stringLabelClass}`)].map(
      (el) => el.textContent,
    );
    expect(labels).toEqual(['e', 'B', 'G', 'D', 'A', 'D']);
  });

  it('moves the active column class as the playhead advances', () => {
    const columns = renderTab([C], drivingEighths, [1], standard);
    const { rerender, container } = render(
      <TabLane columns={columns} shapes={[C]} tuning={standard} playhead={0} />,
    );
    expect(container.querySelectorAll(`[data-step="0"].${isActiveClass}`)).toHaveLength(6);
    expect(container.querySelectorAll(`[data-step="1"].${isActiveClass}`)).toHaveLength(0);

    rerender(<TabLane columns={columns} shapes={[C]} tuning={standard} playhead={1} />);
    expect(container.querySelectorAll(`[data-step="0"].${isActiveClass}`)).toHaveLength(0);
    expect(container.querySelectorAll(`[data-step="1"].${isActiveClass}`)).toHaveLength(6);
    expect(container.querySelector('[data-playhead-step="1"]')).toBeInTheDocument();
  });

  it('renders 24 stems, 4 beams and 0 rests for C-G-Am-F in pop-strum', () => {
    const G = parseShape('G.open', 'G', '320003', '32---4');
    const AM = parseShape('Am.open', 'Am', 'x02210', '--231-');
    const F = parseShape('F.barre.e', 'F', '133211', '134211');
    const popStrum = RHYTHMS.find((r) => r.id === 'pop-strum');
    if (!popStrum) throw new Error('missing pop-strum fixture');

    const columns = renderTab([C, G, AM, F], popStrum, [1, 1, 1, 1], standard);
    const { container } = render(
      <TabLane columns={columns} shapes={[C, G, AM, F]} tuning={standard} />,
    );

    expect(container.querySelectorAll('[data-testid="stem"]')).toHaveLength(24);
    expect(container.querySelectorAll('[data-testid="beam"]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-testid="rest"]')).toHaveLength(0);
  });

  it('renders a rest glyph for a non-ghost muted step', () => {
    const restRhythm = {
      id: 'rest-test',
      subdivision: 8 as const,
      steps: [
        { t: 0, dir: 'D' as const },
        { t: 4, dir: 'mute' as const },
      ],
    };
    const columns = renderTab([C], restRhythm, [1], standard);
    const { container } = render(<TabLane columns={columns} shapes={[C]} tuning={standard} />);

    expect(container.querySelectorAll('[data-testid="rest"]')).toHaveLength(1);
  });

  it('shows bar numbers and a section label at the start of a bar', () => {
    const columns = renderTab([C], drivingEighths, [2], standard);
    const { container } = render(
      <TabLane columns={columns} shapes={[C]} tuning={standard} sectionLabels={{ 1: 'Chorus' }} />,
    );

    const barNumbers = [...container.querySelectorAll(`.${barNumberClass}`)].map(
      (el) => el.textContent,
    );
    expect(barNumbers[0]).toBe('1');
    expect(barNumbers[8]).toBe('2');
    const sectionLabels = [...container.querySelectorAll(`.${sectionLabelClass}`)].map(
      (el) => el.textContent,
    );
    expect(sectionLabels[0]).toBe('');
    expect(sectionLabels[8]).toBe('Chorus');
  });
});
