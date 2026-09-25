import { describe, expect, it } from 'vitest';
import { MODULES, lessonsFor, nextStep, prevStep, tuneFor } from './lessonData';

describe('nextStep/prevStep', () => {
  const power = lessonsFor('power');
  const powerTune = tuneFor('power');
  const first = power[0];
  const last = power[power.length - 1];

  it('steps to the next lesson within a module', () => {
    const second = power[1];
    if (!first || !second) throw new Error('need at least 2 power lessons');
    expect(nextStep(first)).toEqual({ kind: 'lesson', lesson: second });
    expect(prevStep(second)).toEqual({ kind: 'lesson', lesson: first });
  });

  it('steps from the last lesson to the module tune, and back', () => {
    if (!last || !powerTune) throw new Error('need a last lesson and a tune');
    expect(nextStep(last)).toEqual({ kind: 'lesson', lesson: powerTune });
    expect(prevStep(powerTune)).toEqual({ kind: 'lesson', lesson: last });
  });

  it('steps from the tune of one module into the next available module', () => {
    if (!powerTune) throw new Error('need a tune');
    const step = nextStep(powerTune);
    expect(step?.kind).toBe('module');
    if (step?.kind === 'module') {
      const laterAvailable = MODULES.slice(MODULES.findIndex((m) => m.id === 'power') + 1).filter(
        (m) => m.available,
      );
      expect(step.module.id).toBe(laterAvailable[0]?.id);
    }
  });

  it('steps back across a module boundary to the previous module tune', () => {
    const open = lessonsFor('open');
    const openFirst = open[0];
    if (!openFirst) throw new Error('need an open lesson');
    const step = prevStep(openFirst);
    expect(step).toEqual({ kind: 'lesson', lesson: powerTune ?? last });
  });

  it('has no previous step before the first available module', () => {
    if (!first) throw new Error('need a first power lesson');
    expect(prevStep(first)).toBeNull();
  });

  it('has no next step after the last available module', () => {
    const lastAvailable = [...MODULES].reverse().find((m) => m.available);
    if (!lastAvailable) throw new Error('need an available module');
    const finalStep = tuneFor(lastAvailable.id) ?? lessonsFor(lastAvailable.id).at(-1);
    if (!finalStep) throw new Error('need a final lesson or tune');
    expect(nextStep(finalStep)).toBeNull();
  });
});
