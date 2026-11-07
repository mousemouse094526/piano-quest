import { isLengthMode, MODE_LENGTHS, MODES } from './engine/modes';
import type { Direction, Length, LengthMode, Mode, Settings } from './engine/types';

// URL contract of the quiz (spec.md › Search params, ADR-0002). Param names and
// values are bookmarked by Players: renaming one needs a fallback from the old name.

export type Script = 'th' | 'en';
export type Sound = 'on' | 'off';

/** Every Mode bar value. Engine `Settings` plus what only the UI uses. */
export type QuizSearch = Settings & { script: Script; sound: Sound };

export const DIRECTIONS = [
  'solfege-to-letter',
  'letter-to-solfege',
  'mixed',
] as const satisfies readonly Direction[];
export const SCRIPTS = ['th', 'en'] as const satisfies readonly Script[];

const SOUNDS = ['on', 'off'] as const satisfies readonly Sound[];

export const DEFAULT_SEARCH: QuizSearch = {
  mode: 'time',
  len: MODE_LENGTHS.time.initial,
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
  const mode = oneOf(raw.mode, MODES, DEFAULT_SEARCH.mode);
  if (!isLengthMode(mode)) return { mode, ...common };
  const len = typeof raw.len === 'string' ? Number(raw.len) : raw.len;
  // TS can't tie `mode` to its own `len` across the union; parseLength keeps them paired.
  return { ...parseLength(mode, len), ...common } as QuizSearch;
}

/** `len` if `mode` offers it, else that Mode's starting length. */
function parseLength<M extends LengthMode>(mode: M, len: unknown): { mode: M; len: Length<M> } {
  const { options, initial } = MODE_LENGTHS[mode];
  return { mode, len: oneOf(len, options as readonly Length<M>[], initial as Length<M>) };
}

/** Switching Mode starts from that Mode's default length (D2). */
export function withMode(search: QuizSearch, mode: Mode): QuizSearch {
  // A missing `len` parses to the new Mode's starting length, as in a URL without one.
  return parseQuizSearch({ ...search, mode, len: undefined });
}

/** A new length for the current Mode; an unknown length falls back like a bad URL. */
export function withLength(search: QuizSearch, len: number): QuizSearch {
  return parseQuizSearch({ ...search, len });
}

export function withDirection(search: QuizSearch, dir: Direction): QuizSearch {
  return parseQuizSearch({ ...search, dir });
}

export function withScript(search: QuizSearch, script: Script): QuizSearch {
  return parseQuizSearch({ ...search, script });
}

/** The part of the search the engine plays by. */
export function settingsOf(search: QuizSearch): Settings {
  const { script: _script, sound: _sound, ...settings } = search;
  return settings;
}

function oneOf<T>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function isSoundOn(search: QuizSearch): boolean {
  return search.sound === 'on';
}

/** Turning sound on or off only replaces `sound`; the Round plays on (D20). */
export function withSound(search: QuizSearch, on: boolean): QuizSearch {
  return parseQuizSearch({ ...search, sound: on ? 'on' : 'off' });
}
