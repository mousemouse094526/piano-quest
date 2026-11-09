import { NOTES_IN_ORDER } from '../engine/notes';
import type { Choice, Note, Side } from '../engine/types';

/**
 * The physical key (`KeyboardEvent.code`) that answers each note in one key set. Any
 * string fits the type; `choiceFromCode` still answers only with keys from the table below.
 */
export type KeySet = Readonly<Record<Note, string>>;

/** Both key sets, 14 distinct keys (D32). */
export type Keymap = Readonly<Record<Side, KeySet>>;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';

/**
 * Every key a Keymap can bind (D33) and its US QWERTY label (D38). The labels are also
 * the Keymap's letters in the URL, so this table is part of the bookmark contract
 * (ADR-0007): add keys freely, but removing one or changing a label resets saved links.
 */
const KEY_LABELS: Readonly<Record<string, string>> = {
  ...Object.fromEntries([...LETTERS].map((c) => [`Key${c}`, c])),
  ...Object.fromEntries([...DIGITS].map((d) => [`Digit${d}`, d])),
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Minus: '-',
  Equal: '=',
  Backquote: '`',
};

const CODES_BY_LABEL = new Map(Object.entries(KEY_LABELS).map(([code, label]) => [label, code]));

/** spec.md › Data: `C`–`B` for letters, `1`–`7` for solfège. */
export const DEFAULT_KEYMAP: Keymap = {
  letter: { 1: 'KeyC', 2: 'KeyD', 3: 'KeyE', 4: 'KeyF', 5: 'KeyG', 6: 'KeyA', 7: 'KeyB' },
  solfege: {
    1: 'Digit1',
    2: 'Digit2',
    3: 'Digit3',
    4: 'Digit4',
    5: 'Digit5',
    6: 'Digit6',
    7: 'Digit7',
  },
};

/** `Numpad{n}` types the same digit as `Digit{n}`, so it is the same key (D32). */
function numpadAsDigit(code: string): string {
  return code.replace(/^Numpad(\d)$/, 'Digit$1');
}

/**
 * Maps a physical key to an answer through the Player's Keymap. `KeyboardEvent.code`
 * names the physical key whatever the keyboard layout, so a Thai layout answers too (D14).
 */
export function choiceFromCode(code: string, keymap: Keymap): Choice | null {
  const key = numpadAsDigit(code);
  if (!(key in KEY_LABELS)) return null;
  for (const kind of ['letter', 'solfege'] as const) {
    const note = NOTES_IN_ORDER.find((n) => keymap[kind][n] === key);
    if (note) return { kind, note };
  }
  return null;
}

/** The label a bound key shows on screen (D38). */
export function keyLabel(code: string): string {
  return KEY_LABELS[code] ?? code;
}

/** A key set in its URL form, e.g. `CDEFGAB` (D34). */
export function keySetLabels(keySet: KeySet): string {
  return NOTES_IN_ORDER.map((n) => keyLabel(keySet[n])).join('');
}

/** 7 distinct labels from the D38 table, Answer 1 to 7 → that key set; anything else → null. */
export function keySetOf(labels: string): KeySet | null {
  const chars = [...labels];
  if (chars.length !== NOTES_IN_ORDER.length || new Set(chars).size !== chars.length) return null;
  const codes = chars.map((c) => CODES_BY_LABEL.get(c));
  if (codes.some((code) => code === undefined)) return null;
  return Object.fromEntries(codes.map((code, i) => [i + 1, code])) as KeySet;
}

/** D20: key repeat, browser shortcuts and IME composition never answer. */
export function isIgnoredKey(e: KeyboardEvent): boolean {
  return e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.isComposing;
}
