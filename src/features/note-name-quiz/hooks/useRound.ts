import { useCallback, useEffect, useReducer, useState } from 'react';
import { reduce, startRound } from '../engine/round';
import type { Settings } from '../engine/types';
import { choiceFromCode, isIgnoredKey } from './keys';

const TICK_MS = 100;

function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
}

/** Runs one Round: engine state, the clock, and the window key listener. */
export function useRound(settings: Settings) {
  const [state, dispatch] = useReducer(reduce, settings, (s) => startRound(s, newSeed()));
  const [now, setNow] = useState(() => performance.now());

  const restart = useCallback(() => {
    dispatch({ type: 'start', settings, seed: newSeed() });
  }, [settings]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isIgnoredKey(e)) return;
      if (e.code === 'Tab' && !e.shiftKey) {
        // D14, D20: Tab restarts the Round and keeps focus where it is.
        e.preventDefault();
        restart();
        return;
      }
      const choice = choiceFromCode(e.code);
      if (!choice) return;
      e.preventDefault();
      const t = performance.now();
      setNow(t);
      dispatch({ type: 'answer', choice, now: t });
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [restart]);

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

  return { state, now, restart };
}
