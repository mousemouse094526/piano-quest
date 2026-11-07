import { type RefObject, useEffect, useEffectEvent, useReducer, useState } from 'react';
import { answerOutcome, needsKeySetHint, reduce, startRound } from '../engine/round';
import type { Choice, Note, Settings } from '../engine/types';
import { choiceFromCode, isIgnoredKey } from './keys';

const TICK_MS = 100;

function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
}

export type FocusAreas = {
  /** Keys pressed while focus is in here belong to its controls (D20). */
  modeBar: RefObject<HTMLElement | null>;
  /** Where `Esc` in the Mode bar sends focus back to. */
  gameArea: RefObject<HTMLElement | null>;
};

/**
 * The button a wrong answer pressed, shown with `X` (D20, D29). `missNumber` (the Round's
 * miss count) is used as a React key, so each new miss replays the mark.
 */
export type MissMark = { note: Note; missNumber: number };

/**
 * Runs one Round: engine state, the clock, and the single `window` key listener.
 * Settings are read once; the caller remounts with a `key` to play other settings.
 */
export function useRound(
  settings: Settings,
  { modeBar, gameArea }: FocusAreas,
  /** Fired after the engine counts a right answer, with the note answered (D5, D20). */
  onCorrect: (note: Note) => void,
) {
  const [state, dispatch] = useReducer(reduce, settings, (s) => startRound(s, newSeed()));
  const [now, setNow] = useState(() => performance.now());
  // Counts presses that need the key-set hint; each bump replays the flash (D20).
  const [keySetHints, setKeySetHints] = useState(0);
  const [missMark, setMissMark] = useState<MissMark | null>(null);

  function restart() {
    setMissMark(null);
    dispatch({ type: 'start', settings: state.settings, seed: newSeed() });
  }

  /** The engine ends only a zen Round that has answers; elsewhere this is a no-op (D14, D15). */
  function end() {
    dispatch({ type: 'end', now: performance.now() });
  }

  function answer(choice: Choice) {
    if (needsKeySetHint(state, choice)) setKeySetHints((n) => n + 1);
    const t = performance.now();
    const event = { type: 'answer', choice, now: t } as const;
    // The reducer is pure, so running it here as well tells this press's outcome now,
    // inside the press itself (iOS plays audio only there), and still after the engine
    // has judged it (D20). React renders between discrete presses, so `state` is current.
    const next = reduce(state, event);
    setNow(t);
    dispatch(event);
    const outcome = answerOutcome(state, next);
    if (outcome === 'miss') {
      setMissMark({ note: choice.note, missNumber: next.misses.length });
    } else if (outcome === 'right') {
      setMissMark(null);
      onCorrect(choice.note);
    }
  }

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (isIgnoredKey(e)) return;
    if (e.target instanceof Node && modeBar.current?.contains(e.target)) {
      // D20: inside the Mode bar only `Esc` is ours — it hands focus back to the game.
      if (e.code === 'Escape' && !e.defaultPrevented) {
        e.preventDefault();
        gameArea.current?.focus();
      }
      return;
    }
    if (e.code === 'Tab' && !e.shiftKey) {
      // D14, D20: Tab restarts the Round and keeps focus where it is; Shift+Tab moves on.
      e.preventDefault();
      restart();
      return;
    }
    if (e.code === 'Escape') {
      end();
      return;
    }
    const choice = choiceFromCode(e.code);
    if (!choice) return;
    e.preventDefault();
    answer(choice);
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKeyDown(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  const running = state.status === 'running';
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const t = performance.now();
      setNow(t);
      dispatch({ type: 'tick', now: t });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [running]);

  return { state, now, keySetHints, missMark, restart, end, answer };
}
