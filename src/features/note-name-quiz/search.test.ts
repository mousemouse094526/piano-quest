import { describe, expect, test } from 'vitest';
import { DEFAULT_KEYMAP, keySetOf } from './hooks/keys';
import {
  DEFAULT_SEARCH,
  keymapOf,
  parseQuizSearch,
  settingsOf,
  withDirection,
  withLength,
  withMode,
  withScript,
} from './search';

describe('parseQuizSearch', () => {
  test('no params → defaults', () => {
    expect(parseQuizSearch({})).toEqual({
      mode: 'time',
      len: 30,
      dir: 'solfege-to-letter',
      script: 'th',
      sound: 'off',
      'letter-keys': 'CDEFGAB',
      'solfege-keys': '1234567',
    });
  });

  test('valid params are kept', () => {
    const valid = {
      mode: 'count',
      len: 10,
      dir: 'mixed',
      script: 'en',
      sound: 'on',
      'letter-keys': 'ASDFGHJ',
      'solfege-keys': 'QWERTYU',
    } as const;
    expect(parseQuizSearch(valid)).toEqual(valid);
  });

  test('len given as a string still counts', () => {
    expect(parseQuizSearch({ mode: 'count', len: '50' })).toMatchObject({ len: 50 });
  });

  test('bad mode → default mode', () => {
    expect(parseQuizSearch({ mode: 'xyz' })).toEqual(DEFAULT_SEARCH);
  });

  test('bad len → that mode’s default length', () => {
    expect(parseQuizSearch({ mode: 'count', len: 7 })).toMatchObject({ mode: 'count', len: 25 });
  });

  test('the ticket’s broken URL `mode=xyz&len=7` → defaults, no throw', () => {
    expect(parseQuizSearch({ mode: 'xyz', len: 7 })).toEqual(DEFAULT_SEARCH);
  });

  test('len that belongs to another mode → that mode’s default', () => {
    expect(parseQuizSearch({ mode: 'count', len: 30 })).toMatchObject({ mode: 'count', len: 25 });
    expect(parseQuizSearch({ mode: 'time', len: 25 })).toMatchObject({ mode: 'time', len: 30 });
  });

  test('zen has no len', () => {
    expect('len' in parseQuizSearch({ mode: 'zen', len: 30 })).toBe(false);
  });

  test('bad dir, script, sound → each falls back alone', () => {
    expect(parseQuizSearch({ mode: 'count', len: 10, dir: 'up', script: 'jp', sound: 1 })).toEqual({
      mode: 'count',
      len: 10,
      dir: 'solfege-to-letter',
      script: 'th',
      sound: 'off',
      'letter-keys': 'CDEFGAB',
      'solfege-keys': '1234567',
    });
  });
});

describe('Keymap params (D34)', () => {
  /** `[letter-keys, solfege-keys]` after parsing. */
  const keys = (letter: unknown, solfege?: unknown) => {
    const search = parseQuizSearch({ 'letter-keys': letter, 'solfege-keys': solfege });
    return [search['letter-keys'], search['solfege-keys']];
  };

  test('missing → defaults', () => {
    expect(keys(undefined)).toEqual(['CDEFGAB', '1234567']);
  });

  test('lower case reads as upper case', () => {
    expect(keys('asdfghj')).toEqual(['ASDFGHJ', '1234567']);
  });

  test('a number, as the router reads `1234567` typed without quotes', () => {
    expect(keys('ASDFGHJ', 7654321)).toEqual(['ASDFGHJ', '7654321']);
  });

  test('wrong length, a key outside the table, or a repeat → that param’s default', () => {
    expect(keys('ASDFGH')).toEqual(['CDEFGAB', '1234567']);
    expect(keys('ASDFGHJK')).toEqual(['CDEFGAB', '1234567']);
    expect(keys('ASDFGH ', 'QWRTYUI')).toEqual(['CDEFGAB', 'QWRTYUI']);
    expect(keys('ASDFGHJ', '1123456')).toEqual(['ASDFGHJ', '1234567']);
  });

  test('a key in both sets → both defaults', () => {
    expect(keys('ASDFGHJ', 'A234567')).toEqual(['CDEFGAB', '1234567']);
  });

  test('a clash that appears only after a fallback → both defaults', () => {
    // AAAAAAA falls back to CDEFGAB, whose C, D, F, G and A clash with ASDFGHJ.
    expect(keys('AAAAAAA', 'ASDFGHJ')).toEqual(['CDEFGAB', '1234567']);
  });

  test('values JSON changed on the way in → defaults', () => {
    expect(keys('ASDFGHJ', 1234.5)).toEqual(['ASDFGHJ', '1234567']);
    expect(keys('ASDFGHJ', Number.POSITIVE_INFINITY)).toEqual(['ASDFGHJ', '1234567']);
    expect(keys('ASDFGHJ', [12345])).toEqual(['ASDFGHJ', '1234567']);
    // An array whose text would be 7 valid digits is still not a key set.
    expect(keys('ASDFGHJ', [1234567])).toEqual(['ASDFGHJ', '1234567']);
  });

  test('keymapOf turns the params into key codes', () => {
    const search = parseQuizSearch({ 'letter-keys': 'ASDFGHJ' });
    expect(keymapOf(search)).toEqual({
      letter: keySetOf('ASDFGHJ'),
      solfege: DEFAULT_KEYMAP.solfege,
    });
    expect(keymapOf(DEFAULT_SEARCH)).toEqual(DEFAULT_KEYMAP);
  });
});

describe('withMode', () => {
  test('switching mode resets len to the new mode’s default (D2)', () => {
    expect(withMode(DEFAULT_SEARCH, 'count')).toMatchObject({ mode: 'count', len: 25 });
    const count50 = parseQuizSearch({ mode: 'count', len: 50 });
    expect(withMode(count50, 'time')).toMatchObject({ mode: 'time', len: 30 });
  });

  test('zen drops len and keeps the rest', () => {
    const next = withMode({ ...DEFAULT_SEARCH, script: 'en', sound: 'on' }, 'zen');
    expect(next).toEqual({
      mode: 'zen',
      dir: 'solfege-to-letter',
      script: 'en',
      sound: 'on',
      'letter-keys': 'CDEFGAB',
      'solfege-keys': '1234567',
    });
  });
});

describe('withLength', () => {
  test('a length the Mode offers is kept; another falls back', () => {
    const count = parseQuizSearch({ mode: 'count' });
    expect(withLength(count, 100)).toMatchObject({ len: 100 });
    expect(withLength(count, 15)).toMatchObject({ len: 25 });
  });
});

describe('settingsOf', () => {
  test('keeps only what the engine needs', () => {
    const search = parseQuizSearch({ script: 'en', sound: 'on', 'letter-keys': 'ASDFGHJ' });
    expect(settingsOf(search)).toEqual({
      mode: 'time',
      len: 30,
      dir: 'solfege-to-letter',
    });
    expect(settingsOf(withMode(DEFAULT_SEARCH, 'zen'))).toEqual({
      mode: 'zen',
      dir: 'solfege-to-letter',
    });
  });
});

describe('withDirection and withScript', () => {
  test('change only their own value, keeping Mode and length', () => {
    const count50 = withLength(withMode(DEFAULT_SEARCH, 'count'), 50);
    expect(withDirection(count50, 'mixed')).toEqual({ ...count50, dir: 'mixed' });
    expect(withScript(count50, 'en')).toEqual({ ...count50, script: 'en' });
  });
});
