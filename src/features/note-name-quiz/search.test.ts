import { describe, expect, test } from 'vitest';
import { DEFAULT_SEARCH, parseQuizSearch, settingsOf, withLength, withMode } from './search';

describe('parseQuizSearch', () => {
  test('no params → defaults', () => {
    expect(parseQuizSearch({})).toEqual({
      mode: 'time',
      len: 30,
      dir: 'solfege-to-letter',
      script: 'th',
      sound: 'off',
    });
  });

  test('valid params are kept', () => {
    expect(
      parseQuizSearch({ mode: 'count', len: 10, dir: 'mixed', script: 'en', sound: 'on' }),
    ).toEqual({ mode: 'count', len: 10, dir: 'mixed', script: 'en', sound: 'on' });
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
    });
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
    expect(next).toEqual({ mode: 'zen', dir: 'solfege-to-letter', script: 'en', sound: 'on' });
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
    expect(settingsOf({ ...DEFAULT_SEARCH, script: 'en', sound: 'on' })).toEqual({
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
