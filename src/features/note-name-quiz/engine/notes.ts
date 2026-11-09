import type { Note } from './types';

export type NoteInfo = {
  letter: string;
  th: string;
  en: string;
  hz: number;
};

/** C to B (โด to ที), the order of answer buttons and of a Keymap in the URL. */
export const NOTES_IN_ORDER: readonly Note[] = [1, 2, 3, 4, 5, 6, 7];

/** spec.md › Data. */
export const NOTES: Record<Note, NoteInfo> = {
  1: { letter: 'C', th: 'โด', en: 'Do', hz: 261.63 },
  2: { letter: 'D', th: 'เร', en: 'Re', hz: 293.66 },
  3: { letter: 'E', th: 'มี', en: 'Mi', hz: 329.63 },
  4: { letter: 'F', th: 'ฟา', en: 'Fa', hz: 349.23 },
  5: { letter: 'G', th: 'ซอล', en: 'Sol', hz: 392.0 },
  6: { letter: 'A', th: 'ลา', en: 'La', hz: 440.0 },
  7: { letter: 'B', th: 'ที', en: 'Ti', hz: 493.88 },
};
