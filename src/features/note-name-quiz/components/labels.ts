import { hasLength } from '../engine/modes';
import { NOTES, NOTES_IN_ORDER } from '../engine/notes';
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

/** The label of the key that answers `note` on `side` in the Keymap, e.g. `C` or `1` (D38). */
export function boundKeyLabel(note: Note, side: Side, keymap: Keymap): string {
  return keyLabel(keymap[side][note]);
}

/** Every key of one Key set, C to B, e.g. `1 2 3 4 5 6 7` (D44). */
export function keySetLabel(side: Side, keymap: Keymap): string {
  return NOTES_IN_ORDER.map((note) => boundKeyLabel(note, side, keymap)).join(' ');
}

/** Mode names stay in English on screen, as in the URL; the map lets a label change alone. */
export const MODE_LABELS: Record<Mode, string> = {
  time: 'time',
  count: 'count',
  zen: 'zen',
};

/**
 * Direction names read in the chosen Script, e.g. `โด→C` or `Do→C` (D44). Script names only
 * the solfège; the rest of the screen stays Thai, `สลับ` too.
 */
export function directionLabel(dir: Direction, script: Script): string {
  const doName = NOTES[1][script]; // note 1 is C, the solfège Do
  const labels: Record<Direction, string> = {
    'solfege-to-letter': `${doName}→C`,
    'letter-to-solfege': `C→${doName}`,
    mixed: 'สลับ',
  };
  return labels[dir];
}

export const SCRIPT_LABELS: Record<Script, string> = {
  th: 'ไทย',
  en: 'อังกฤษ',
};

/** What a length counts, per Mode that has one. */
export const LENGTH_UNITS: Record<LengthMode, string> = {
  time: 'วินาที',
  count: 'ข้อ',
};

/** A Round's length with its unit, e.g. `25 ข้อ`; `null` for `zen`. */
function lengthLabel(settings: Settings): string | null {
  return hasLength(settings) ? `${settings.len} ${LENGTH_UNITS[settings.mode]}` : null;
}

/** One line naming the Round played, e.g. `count 25 ข้อ · โด→C · ไทย`. */
export function roundLabel(settings: Settings, script: Script): string {
  const length = lengthLabel(settings);
  const mode = length ? `${MODE_LABELS[settings.mode]} ${length}` : MODE_LABELS[settings.mode];
  return [mode, directionLabel(settings.dir, script), SCRIPT_LABELS[script]].join(' · ');
}

const MODE_HOW_TO: Record<Mode, string> = {
  time: 'ตอบให้ได้มากที่สุดก่อนหมดเวลา',
  count: 'ตอบให้ครบทุกข้อ เร็วที่สุด',
  zen: 'ไม่จับเวลา เล่นไปจนกดจบรอบ',
};

/** D44: how a Round of this Mode ends, e.g. `ตอบให้ครบทุกข้อ เร็วที่สุด (25 ข้อ)`. */
export function modeHowTo(settings: Settings): string {
  const howTo = MODE_HOW_TO[settings.mode];
  return hasLength(settings) ? `${howTo} (${settings.len} ${LENGTH_UNITS[settings.mode]})` : howTo;
}
