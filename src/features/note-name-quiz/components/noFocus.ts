import type { MouseEvent } from 'react';

/** Keeps a click from moving focus, so focus stays on the game area (D20, D26). */
export function stopFocusOnMouseDown(e: MouseEvent) {
  e.preventDefault();
}

/**
 * Props for on-screen game buttons: they never take focus, by Tab or by click, so
 * focus stays on the game area and Enter or Space can't press them again (D20).
 */
export const noFocus = {
  tabIndex: -1,
  onMouseDown: stopFocusOnMouseDown,
} as const;
