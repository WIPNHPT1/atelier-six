import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import lessonsData from '../data/lessons.json' with { type: 'json' };
import { getShapes } from '../core/shapes/library';
import type { BuiltLesson } from '../core/lessons/types';
import { EngravedFretboard } from './EngravedFretboard';

const LESSONS = lessonsData as BuiltLesson[];
const first = LESSONS[0] as BuiltLesson;
const chord = first.chords[first.chords.length - 1] as string;
const shape = getShapes(chord).find((s) => s.id === first.shapes[chord]);

if (shape === undefined) throw new Error('fixture shape missing');

describe('EngravedFretboard', () => {
  it('renders a labelled diagram', () => {
    render(<EngravedFretboard shape={shape} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders without crashing when animating in', () => {
    render(<EngravedFretboard shape={shape} animateIn />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
