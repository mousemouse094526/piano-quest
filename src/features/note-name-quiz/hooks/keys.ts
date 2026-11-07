import type { Choice, Note } from '../engine/types';

const LETTER_CODES: Record<string, Note> = {
  KeyC: 1,
  KeyD: 2,
  KeyE: 3,
  KeyF: 4,
  KeyG: 5,
  KeyA: 6,
  KeyB: 7,
};

/**
 * Maps a physical key to an answer (spec.md › Data). `KeyboardEvent.code` names
 * the physical key whatever the keyboard layout, so a Thai layout answers too (D14).
 */
export function choiceFromCode(code: string): Choice | null {
  const letter = LETTER_CODES[code];
  if (letter) return { kind: 'letter', note: letter };
  const digit = /^(?:Digit|Numpad)([1-7])$/.exec(code)?.[1];
  if (digit) return { kind: 'solfege', note: Number(digit) as Note };
  return null;
}

/** D20: key repeat, browser shortcuts and IME composition never answer. */
export function isIgnoredKey(e: KeyboardEvent): boolean {
  return e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.isComposing;
}
