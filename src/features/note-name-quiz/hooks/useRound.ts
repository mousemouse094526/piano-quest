import { type RefObject, useEffect, useEffectEvent, useReducer, useState } from 'react';
import { answeredCount, answerOutcome, needsKeySetHint, reduce, startRound } from '../engine/round';
import type { AnswerOutcome, Choice, Note, Prompt, RoundState, Settings } from '../engine/types';
import { choiceFromCode, isIgnoredKey, type Keymap } from './keys';

const TICK_MS = 100;

function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
}

/** Where the game's keys may go: Mode bar, game area, or nowhere while the Keymap dialog is open. */
export type KeyRouting = {
  /** Keys pressed while focus is in here belong to its controls (D20). */
  modeBar: RefObject<HTMLElement | null>;
  /** Where `Esc` in the Mode bar sends focus back to. */
  gameArea: RefObject<HTMLElement | null>;
  /** True while the Keymap dialog is open: every key is the Dialog's (D35). */
  keymapOpen: RefObject<boolean>;
};

/**
 * The button the last counted answer pressed, and how it went, until the next counted
 * answer (D20, D29, D31): a miss shows `X`, a right answer flashes the accent. `answerNumber`
 * (answers so far in the Round) is used as a React key, so each answer replays its mark.
 */
export type LastAnswer = {
  note: Note;
  /** The Prompt this answer was for; after a miss it stays beside the next one (D44). */
  prompt: Prompt;
  outcome: Exclude<AnswerOutcome, 'ignored'>;
  answerNumber: number;
};

/**
 * D20, D44: a press from the other key set in `mixed`. `shown` holds until the Prompt is
 * answered; each press bumps `flashes`, used as a React key to replay the flash.
 */
export type KeySetHint = { shown: boolean; flashes: number };

const NO_KEY_SET_HINT: KeySetHint = { shown: false, flashes: 0 };

/** What the Round tells its caller about. */
export type RoundHandlers = {
  /** Fired after the engine counts a right answer, with the note answered (D5, D20). */
  onCorrect: (note: Note) => void;
  /** `S` on Results, as a press of "แชร์ผล" (share-results D7). */
  onShare: (finished: RoundState) => void;
};

/**
 * Runs one Round: engine state, the clock, and the single `window` key listener.
 * Settings and Keymap are read once; the caller remounts with a `key` to change them.
 */
export function useRound(
  settings: Settings,
  keymap: Keymap,
  { modeBar, gameArea, keymapOpen }: KeyRouting,
  { onCorrect, onShare }: RoundHandlers,
) {
  const [state, dispatch] = useReducer(reduce, settings, (s) => startRound(s, newSeed()));
  const [now, setNow] = useState(() => performance.now());
  const [keySetHint, setKeySetHint] = useState(NO_KEY_SET_HINT);
  const [lastAnswer, setLastAnswer] = useState<LastAnswer | null>(null);

  /** `flashes` keeps counting, so the next hint is a new React key and replays its flash. */
  function hideKeySetHint() {
    setKeySetHint((h) => ({ ...h, shown: false }));
  }

  function restart() {
    setLastAnswer(null);
    hideKeySetHint();
    dispatch({ type: 'start', settings: state.settings, seed: newSeed() });
  }

  /** The engine ends only a zen Round that has answers; elsewhere this is a no-op (D14, D15). */
  function end() {
    dispatch({ type: 'end', now: performance.now() });
  }

  function answer(choice: Choice) {
    if (needsKeySetHint(state, choice)) {
      setKeySetHint((h) => ({ shown: true, flashes: h.flashes + 1 }));
    }
    const t = performance.now();
    const event = { type: 'answer', choice, now: t } as const;
    // The reducer is pure, so running it here as well tells this press's outcome now,
    // inside the press itself (iOS plays audio only there), and still after the engine
    // has judged it (D20). React renders between discrete presses, so `state` is current.
    const next = reduce(state, event);
    setNow(t);
    dispatch(event);
    const outcome = answerOutcome(state, next);
    // A press from the other Key set is `ignored` (D20), so its hint stays up.
    if (outcome === 'ignored') return;
    hideKeySetHint();
    setLastAnswer({
      note: choice.note,
      prompt: state.current,
      outcome,
      answerNumber: answeredCount(next),
    });
    if (outcome === 'right') onCorrect(choice.note);
  }

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    // D35: a key the Keymap dialog handled — even the `Esc` that just closed it, when the
    // ref already reads closed — and any key while it is open is never the game's.
    if (e.defaultPrevented || keymapOpen.current || isIgnoredKey(e)) return;
    if (e.target instanceof Node && modeBar.current?.contains(e.target)) {
      // D20: inside the Mode bar only `Esc` is ours — it hands focus back to the game.
      if (e.code === 'Escape') {
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
    if (e.code === 'KeyS' && state.status === 'finished') {
      // share-results D7: Results buttons take no focus (ADR-0009), so `S` is the keyboard's way to share.
      e.preventDefault();
      onShare(state);
      return;
    }
    const choice = choiceFromCode(e.code, keymap);
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

  return { state, now, keySetHint, lastAnswer, restart, end, answer };
}
