// Public contract of the note-name-quiz engine (spec.md › Engine contract, D18, D20).

import type { MODE_LENGTHS, MODES } from './modes';

/** Index into the note table (spec.md › Data): 1 = C … 7 = B. */
export type Note = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Direction = 'solfege-to-letter' | 'letter-to-solfege' | 'mixed';

export type Mode = (typeof MODES)[number];

/** Modes that have a length (`time` in seconds, `count` in answers). */
export type LengthMode = keyof typeof MODE_LENGTHS;

/** The lengths `mode` offers, from `MODE_LENGTHS`. */
export type Length<M extends LengthMode> = (typeof MODE_LENGTHS)[M]['options'][number];

/** One `{ mode, len, dir }` per Mode that has a length. */
export type LengthSettings = {
  [M in LengthMode]: { mode: M; len: Length<M>; dir: Direction };
}[LengthMode];

export type Settings = LengthSettings | { mode: 'zen'; dir: Direction };

/** The two ways to name a note: solfège (โด / Do) or letter (C). */
export type Side = 'solfege' | 'letter';

/** `ask` is what is shown to the Player. */
export type Prompt = { note: Note; ask: Side };

/**
 * `kind` is the key set the Player used. It is the opposite side of the Prompt:
 * a solfège Prompt is answered with letter keys (C–B), a letter Prompt with
 * solfège keys (1–7). See `answerKind`.
 */
export type Choice = { kind: Side; note: Note };

export type Miss = { prompt: Prompt; answered: Note };

/** How one answer went: counted right, counted wrong, or not counted at all. */
export type AnswerOutcome = 'right' | 'miss' | 'ignored';

export type Event =
  | { type: 'start'; settings: Settings; seed: number }
  | { type: 'answer'; choice: Choice; now: number }
  | { type: 'tick'; now: number }
  | { type: 'end'; now: number };

export type RoundState = {
  status: 'ready' | 'running' | 'finished';
  settings: Settings;
  current: Prompt;
  upcoming: [Prompt, Prompt, Prompt];
  correct: number;
  misses: Miss[];
  /** Time of the first answer. */
  startedAt: number | null;
  lastAnswerAt: number | null;
  /** Finish time used for Results. */
  endedAt: number | null;
  rngState: number;
};

export type Results = {
  correct: number;
  wrong: number;
  /** Integer percent. */
  accuracy: number;
  /** `null` → show "—". */
  notesPerMinute: number | null;
  /** Seconds, 2 decimals; `null` → show "—". */
  secondsPerAnswer: number | null;
  misses: Miss[];
};
