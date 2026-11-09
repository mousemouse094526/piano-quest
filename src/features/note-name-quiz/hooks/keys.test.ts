import { describe, expect, test } from 'vitest';
import {
  bindableCode,
  choiceFromCode,
  DEFAULT_KEYMAP,
  type Keymap,
  keyLabel,
  keySetLabels,
  keySetOf,
  rebind,
} from './keys';

// Written out by hand, not built with `keySetOf`, so a fault there can't hide here.
const HOME_ROW: Keymap = {
  ...DEFAULT_KEYMAP,
  letter: { 1: 'KeyA', 2: 'KeyS', 3: 'KeyD', 4: 'KeyF', 5: 'KeyG', 6: 'KeyH', 7: 'KeyJ' },
};

describe('choiceFromCode', () => {
  test('the default Keymap answers with spec.md › Data keys', () => {
    expect(choiceFromCode('KeyC', DEFAULT_KEYMAP)).toEqual({ kind: 'letter', note: 1 });
    expect(choiceFromCode('KeyB', DEFAULT_KEYMAP)).toEqual({ kind: 'letter', note: 7 });
    expect(choiceFromCode('Digit1', DEFAULT_KEYMAP)).toEqual({ kind: 'solfege', note: 1 });
    expect(choiceFromCode('Digit7', DEFAULT_KEYMAP)).toEqual({ kind: 'solfege', note: 7 });
    expect(choiceFromCode('KeyH', DEFAULT_KEYMAP)).toBeNull();
  });

  test('Numpad answers as the digit row (D32)', () => {
    expect(choiceFromCode('Numpad5', DEFAULT_KEYMAP)).toEqual({ kind: 'solfege', note: 5 });
    const numpadZero = {
      ...DEFAULT_KEYMAP,
      solfege: { ...DEFAULT_KEYMAP.solfege, 1: 'Digit0' },
    };
    expect(choiceFromCode('Numpad0', numpadZero)).toEqual({ kind: 'solfege', note: 1 });
  });

  test('a bound key answers; the key it replaced no longer does', () => {
    expect(choiceFromCode('KeyG', HOME_ROW)).toEqual({ kind: 'letter', note: 5 });
    expect(choiceFromCode('KeyA', HOME_ROW)).toEqual({ kind: 'letter', note: 1 });
    expect(choiceFromCode('KeyC', HOME_ROW)).toBeNull();
  });

  test('keys swapped across sets answer for the set they are bound in', () => {
    const swapped = {
      letter: DEFAULT_KEYMAP.solfege,
      solfege: DEFAULT_KEYMAP.letter,
    };
    expect(choiceFromCode('Digit5', swapped)).toEqual({ kind: 'letter', note: 5 });
    expect(choiceFromCode('Numpad5', swapped)).toEqual({ kind: 'letter', note: 5 });
    expect(choiceFromCode('KeyG', swapped)).toEqual({ kind: 'solfege', note: 5 });
  });

  // The URL parser never builds such a Keymap; the table guards answers on its own (D33).
  test('a key outside the D33 table never answers, even if a Keymap holds it', () => {
    const odd = { ...DEFAULT_KEYMAP, letter: { ...DEFAULT_KEYMAP.letter, 1: 'Space' } };
    expect(choiceFromCode('Space', odd)).toBeNull();
  });
});

describe('keySetOf', () => {
  test('7 distinct labels from the D38 table → their codes, C to B', () => {
    expect(keySetOf('CDEFGAB')).toEqual(DEFAULT_KEYMAP.letter);
    expect(keySetOf(";'[]\\-=")).toEqual({
      1: 'Semicolon',
      2: 'Quote',
      3: 'BracketLeft',
      4: 'BracketRight',
      5: 'Backslash',
      6: 'Minus',
      7: 'Equal',
    });
  });

  test('wrong length, a label outside the table, or a repeat → null', () => {
    expect(keySetOf('CDEFGA')).toBeNull();
    expect(keySetOf('CDEFGABH')).toBeNull();
    expect(keySetOf('CDEFGA ')).toBeNull();
    expect(keySetOf('CDEFGAC')).toBeNull();
  });

  test('labels are upper case only; the URL parser upper-cases first', () => {
    expect(keySetOf('cdefgab')).toBeNull();
  });
});

describe('labels', () => {
  test('US QWERTY labels (D38)', () => {
    expect(keyLabel('KeyC')).toBe('C');
    expect(keyLabel('Digit1')).toBe('1');
    expect(keyLabel('Backquote')).toBe('`');
    expect(keyLabel('Period')).toBe('.');
  });

  test('a key set reads back as its URL form', () => {
    expect(keySetLabels(DEFAULT_KEYMAP.letter)).toBe('CDEFGAB');
    expect(keySetLabels(DEFAULT_KEYMAP.solfege)).toBe('1234567');
  });
});

describe('bindableCode', () => {
  test('a key from the D33 table → its code; Numpad → the digit row (D32)', () => {
    expect(bindableCode('KeyQ')).toBe('KeyQ');
    expect(bindableCode('Semicolon')).toBe('Semicolon');
    expect(bindableCode('Numpad4')).toBe('Digit4');
  });

  test('any other key → null', () => {
    for (const code of ['Enter', 'Space', 'Tab', 'Escape', 'ArrowLeft', 'F1', 'ShiftLeft']) {
      expect(bindableCode(code)).toBeNull();
    }
  });
});

describe('rebind', () => {
  test('a free key replaces the Answer’s key', () => {
    const { keymap, swappedWith } = rebind(DEFAULT_KEYMAP, { kind: 'solfege', note: 1 }, 'KeyQ');
    expect(keySetLabels(keymap.solfege)).toBe('Q234567');
    expect(keymap.letter).toEqual(DEFAULT_KEYMAP.letter);
    expect(swappedWith).toBeNull();
  });

  test('a key another Answer in the same set uses → the two swap (D36)', () => {
    const { keymap, swappedWith } = rebind(DEFAULT_KEYMAP, { kind: 'letter', note: 1 }, 'KeyD');
    expect(keySetLabels(keymap.letter)).toBe('DCEFGAB');
    expect(swappedWith).toEqual({ kind: 'letter', note: 2 });
  });

  test('a key from the other set → the two swap across sets (D36)', () => {
    const { keymap, swappedWith } = rebind(DEFAULT_KEYMAP, { kind: 'letter', note: 1 }, 'Digit1');
    expect(keySetLabels(keymap.letter)).toBe('1DEFGAB');
    expect(keySetLabels(keymap.solfege)).toBe('C234567');
    expect(swappedWith).toEqual({ kind: 'solfege', note: 1 });
  });

  test('the Answer’s own key → nothing changes', () => {
    const { keymap, swappedWith } = rebind(DEFAULT_KEYMAP, { kind: 'letter', note: 5 }, 'KeyG');
    expect(keymap).toEqual(DEFAULT_KEYMAP);
    expect(swappedWith).toBeNull();
  });
});
