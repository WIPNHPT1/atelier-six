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

describe('TabLane', () => {
  it('labels strings e B G D A E for standard tuning', () => {
    const columns = renderTab([C], drivingEighths, [1], standard);
    const { container } = render(
      <TabLane columns={columns} shapes={[C]} tuning={standard} stepsPerBar={8} />,
    );
    const labels = [...container.querySelectorAll(`.${stringLabelClass}`)].map(
      (el) => el.textContent,
    );
    expect(labels).toEqual(['e', 'B', 'G', 'D', 'A', 'E']);
  });

  it('labels the low string D for drop D tuning', () => {
    const columns = renderTab([C], drivingEighths, [1], dropD);
    const { container } = render(
      <TabLane columns={columns} shapes={[C]} tuning={dropD} stepsPerBar={8} />,
    );
    const labels = [...container.querySelectorAll(`.${stringLabelClass}`)].map(
      (el) => el.textContent,
    );
    expect(labels).toEqual(['e', 'B', 'G', 'D', 'A', 'D']);
  });

  it('moves the active column class as the playhead advances', () => {
    const columns = renderTab([C], drivingEighths, [1], standard);
    const { rerender, container } = render(
      <TabLane columns={columns} shapes={[C]} tuning={standard} stepsPerBar={8} playhead={0} />,
    );
    expect(container.querySelectorAll(`[data-step="0"].${isActiveClass}`)).toHaveLength(6);
    expect(container.querySelectorAll(`[data-step="1"].${isActiveClass}`)).toHaveLength(0);

    rerender(
      <TabLane columns={columns} shapes={[C]} tuning={standard} stepsPerBar={8} playhead={1} />,
    );
    expect(container.querySelectorAll(`[data-step="0"].${isActiveClass}`)).toHaveLength(0);
    expect(container.querySelectorAll(`[data-step="1"].${isActiveClass}`)).toHaveLength(6);
    expect(container.querySelector('[data-playhead-step="1"]')).toBeInTheDocument();
  });
});
