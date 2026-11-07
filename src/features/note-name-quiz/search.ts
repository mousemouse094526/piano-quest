import type { Direction, Settings } from './engine/types';

// URL contract of the quiz (spec.md › Search params, ADR-0002). Param names and
// values are bookmarked by Players: renaming one needs a fallback from the old name.

export type Mode = Settings['mode'];
export type Script = 'th' | 'en';
export type Sound = 'on' | 'off';

/** Every Mode bar value. Engine `Settings` plus what only the UI uses. */
export type QuizSearch = Settings & { script: Script; sound: Sound };

export const MODES = ['time', 'count', 'zen'] as const satisfies readonly Mode[];

/** Modes that have a length, with the lengths they offer and the one they start with (D2). */
export const LENGTHS = {
  time: { options: [15, 30, 60, 120], initial: 30 },
  count: { options: [10, 25, 50, 100], initial: 25 },
} as const;

export const DIRECTIONS = [
  'solfege-to-letter',
  'letter-to-solfege',
  'mixed',
] as const satisfies readonly Direction[];
export const SCRIPTS = ['th', 'en'] as const satisfies readonly Script[];

const SOUNDS = ['on', 'off'] as const satisfies readonly Sound[];

export const DEFAULT_SEARCH: QuizSearch = {
  mode: 'time',
  len: LENGTHS.time.initial,
  dir: 'solfege-to-letter',
  script: 'th',
  sound: 'off',
};

/**
 * `validateSearch` for route `/`. Each bad or missing param falls back to its own
 * default and never throws (D16, ADR-0002). Router parses params as JSON first, so
 * `len` may arrive as a number or a string.
 */
export function parseQuizSearch(raw: Record<string, unknown>): QuizSearch {
  const common = {
    dir: oneOf(raw.dir, DIRECTIONS, DEFAULT_SEARCH.dir),
    script: oneOf(raw.script, SCRIPTS, DEFAULT_SEARCH.script),
    sound: oneOf(raw.sound, SOUNDS, DEFAULT_SEARCH.sound),
  };
  const len = typeof raw.len === 'string' ? Number(raw.len) : raw.len;
  switch (oneOf(raw.mode, MODES, DEFAULT_SEARCH.mode)) {
    case 'time':
      return {
        mode: 'time',
        len: oneOf(len, LENGTHS.time.options, LENGTHS.time.initial),
        ...common,
      };
    case 'count':
      return {
        mode: 'count',
        len: oneOf(len, LENGTHS.count.options, LENGTHS.count.initial),
        ...common,
      };
    case 'zen':
      return { mode: 'zen', ...common };
  }
}

/** Switching Mode starts from that Mode's default length (D2). */
export function withMode(search: QuizSearch, mode: Mode): QuizSearch {
  return parseQuizSearch({ ...search, mode, len: undefined });
}

/** A new length for the current Mode; an unknown length falls back like a bad URL. */
export function withLength(search: QuizSearch, len: number): QuizSearch {
  return parseQuizSearch({ ...search, len });
}

/** The part of the search the engine plays by. */
export function settingsOf(search: QuizSearch): Settings {
  switch (search.mode) {
    case 'time':
      return { mode: 'time', len: search.len, dir: search.dir };
    case 'count':
      return { mode: 'count', len: search.len, dir: search.dir };
    case 'zen':
      return { mode: 'zen', dir: search.dir };
  }
}

function oneOf<T>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function isSoundOn(search: QuizSearch): boolean {
  return search.sound === 'on';
}

/** Turning sound on or off only replaces `sound`; the Round plays on (D20). */
export function withSound(search: QuizSearch, on: boolean): QuizSearch {
  return { ...search, sound: on ? 'on' : 'off' };
}
