import { describe, expect, it } from 'vitest';
import { actionForKey, isEditableTarget } from './keymap';

describe('actionForKey', () => {
  const table: [string, ReturnType<typeof actionForKey>][] = [
    [' ', 'togglePlay'],
    ['ArrowRight', 'next'],
    ['PageDown', 'next'],
    ['ArrowLeft', 'prev'],
    ['PageUp', 'prev'],
    ['l', 'toggleLoop'],
    ['-', 'slower'],
    ['_', 'slower'],
    ['=', 'faster'],
    ['+', 'faster'],
    ['c', 'clean'],
    ['m', 'missed'],
    ['t', 'tuner'],
    ['?', 'help'],
    ['a', null],
  ];

  for (const [key, action] of table) {
    it(`maps "${key}" to ${String(action)}`, () => {
      expect(actionForKey({ key })).toBe(action);
    });
  }
});

describe('isEditableTarget', () => {
  it('ignores null targets', () => {
    expect(isEditableTarget(null)).toBe(false);
  });

  it('flags inputs and textareas', () => {
    expect(isEditableTarget(document.createElement('input'))).toBe(true);
    expect(isEditableTarget(document.createElement('textarea'))).toBe(true);
  });

  it('flags contenteditable elements', () => {
    const div = document.createElement('div');
    div.setAttribute('contenteditable', 'true');
    expect(isEditableTarget(div)).toBe(true);
  });

  it('does not flag a plain element', () => {
    expect(isEditableTarget(document.createElement('div'))).toBe(false);
  });
});
