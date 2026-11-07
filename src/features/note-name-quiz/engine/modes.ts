import type { LengthMode, LengthSettings, Mode, Settings } from './types';

// Per-Mode rules in one place (D2, D14, D15): adding a Mode or a length starts here.

export const MODES = ['time', 'count', 'zen'] as const;

/**
 * Modes that have a length, with the lengths they offer and the one they start with (D2).
 * `time` counts seconds, `count` counts answers. `Settings['len']` is derived from here.
 */
export const MODE_LENGTHS = {
  time: { options: [15, 30, 60, 120], initial: 30 },
  count: { options: [10, 25, 50, 100], initial: 25 },
} as const satisfies Record<string, { options: readonly number[]; initial: number }>;

/** `zen` has no length: it runs until the Player ends it. */
export function hasLength(settings: Settings): settings is LengthSettings {
  return isLengthMode(settings.mode);
}

export function isLengthMode(mode: Mode): mode is LengthMode {
  return mode !== 'zen';
}

/** Only a `zen` Round is ended by the Player (`Esc` or the end button, D14). */
export function isEndedByPlayer(settings: Settings): boolean {
  return settings.mode === 'zen';
}
