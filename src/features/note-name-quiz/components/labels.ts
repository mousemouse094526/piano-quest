import { hasLength } from '../engine/modes';
import { NOTES } from '../engine/notes';
import type { Direction, LengthMode, Mode, Note, Prompt, Settings, Side } from '../engine/types';
import { type Keymap, keyLabel } from '../hooks/keys';
import type { Script } from '../search';

/** How a note reads on one side: a solfège name in the chosen Script, or its letter. */
export function noteLabel(note: Note, side: Side, script: Script): string {
  const info = NOTES[note];
  return side === 'letter' ? info.letter : info[script];
}

export function promptLabel(prompt: Prompt, script: Script): string {
  return noteLabel(prompt.note, prompt.ask, script);
}

/** The key that answers `note` on `side` in the Player's Keymap, e.g. `C` or `1` (D38). */
export function shortcutLabel(note: Note, side: Side, keymap: Keymap): string {
  return keyLabel(keymap[side][note]);
}

/** Mode names stay in English on screen, as in the URL; the map lets a label change alone. */
export const MODE_LABELS: Record<Mode, string> = {
  time: 'time',
  count: 'count',
  zen: 'zen',
};

export const DIRECTION_LABELS: Record<Direction, string> = {
  'solfege-to-letter': 'โด→C',
  'letter-to-solfege': 'C→โด',
  mixed: 'สลับ',
};

export const SCRIPT_LABELS: Record<Script, string> = {
  th: 'ไทย',
  en: 'อังกฤษ',
};

/** What a length counts, per Mode that has one. */
export const LENGTH_UNITS: Record<LengthMode, string> = {
  time: 'วินาที',
  count: 'ข้อ',
};

/** One line naming the Round played, e.g. `count 25 ข้อ · โด→C · ไทย`. */
export function roundLabel(settings: Settings, script: Script): string {
  const mode = hasLength(settings)
    ? `${MODE_LABELS[settings.mode]} ${settings.len} ${LENGTH_UNITS[settings.mode]}`
    : MODE_LABELS[settings.mode];
  return [mode, DIRECTION_LABELS[settings.dir], SCRIPT_LABELS[script]].join(' · ');
}
