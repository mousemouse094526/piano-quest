import { isEndedByPlayer } from './modes';
import { nextInt } from './rng';
import type {
  AnswerOutcome,
  Choice,
  Event,
  Note,
  Prompt,
  Results,
  RoundState,
  Settings,
  Side,
} from './types';

export function startRound(settings: Settings, seed: number): RoundState {
  let rngState = seed | 0;
  const prompts: Prompt[] = [];
  let previous: Note | null = null;
  for (let i = 0; i < 4; i++) {
    const [prompt, next] = nextPrompt(settings, previous, rngState);
    prompts.push(prompt);
    previous = prompt.note;
    rngState = next;
  }
  const [current, a, b, c] = prompts as [Prompt, Prompt, Prompt, Prompt];
  return {
    status: 'ready',
    settings,
    current,
    upcoming: [a, b, c],
    correct: 0,
    misses: [],
    startedAt: null,
    lastAnswerAt: null,
    endedAt: null,
    rngState,
  };
}

export function reduce(state: RoundState, event: Event): RoundState {
  if (event.type === 'start') return startRound(event.settings, event.seed);
  if (state.status === 'finished') return state;
  switch (event.type) {
    case 'answer':
      return onAnswer(state, event.choice, event.now);
    case 'tick':
      return onTick(state, event.now);
    case 'end':
      return onEnd(state, event.now);
    default: {
      const unhandled: never = event;
      return unhandled;
    }
  }
}

/**
 * D15, D20: elapsed time runs from the first answer to `endedAt`, so the first
 * answer counts as 0 s. Notes per minute counts right answers only; seconds per
 * answer divides by every answer. Fewer than 2 answers or zero elapsed time →
 * speeds are `null` (D25).
 */
export function results(state: RoundState): Results {
  const wrong = state.misses.length;
  const answered = answeredCount(state);
  const elapsed =
    state.startedAt !== null && state.endedAt !== null ? state.endedAt - state.startedAt : 0;
  // D25: one answer has no pace to measure, so speed needs 2+ answers.
  const hasPace = elapsed > 0 && answered >= 2;
  return {
    correct: state.correct,
    wrong,
    accuracy: accuracyOf(state.correct, wrong),
    notesPerMinute: hasPace ? Math.round(state.correct / (elapsed / 60_000)) : null,
    secondsPerAnswer: hasPace ? Math.round((elapsed / 1000 / answered) * 100) / 100 : null,
    misses: state.misses,
  };
}

/** Right answers as a whole percent of all answers; 0 before any answer. */
export function accuracyOf(correct: number, wrong: number): number {
  const answered = correct + wrong;
  return answered === 0 ? 0 : Math.round((correct / answered) * 100);
}

/**
 * D31, D44: Results as they read `progress` (0–1) of the way through counting up. Right
 * and wrong step in whole answers and every other number follows from them, so the
 * numbers on screen agree on every frame: accuracy from the counts shown, notes per minute
 * in step with the right answers shown. Seconds per answer has no count to follow, so it
 * shows its final value from the start.
 */
export function countedUp(final: Results, progress: number): Results {
  const correct = Math.round(final.correct * progress);
  const wrong = Math.round(final.wrong * progress);
  // No right answers means no notes per minute to count up; any share keeps it at 0.
  const share = final.correct === 0 ? 1 : correct / final.correct;
  return {
    ...final,
    correct,
    wrong,
    accuracy: accuracyOf(correct, wrong),
    notesPerMinute: final.notesPerMinute === null ? null : Math.round(final.notesPerMinute * share),
  };
}

/** `time` mode: milliseconds left in the Round; `null` in other Modes. Full length before the first answer. */
export function timeLeft(state: RoundState, now: number): number | null {
  const deadline = timeDeadline(state.settings, state.startedAt ?? now);
  return deadline === null ? null : Math.max(0, deadline - now);
}

/** Prompts answered so far, right or wrong. */
export function answeredCount(state: RoundState): number {
  return state.correct + state.misses.length;
}

/**
 * D20: in `mixed`, a press from the key set the current Prompt does not want is not
 * counted (the reducer ignores it) but the answer row flashes the right shortcuts.
 * In a fixed Direction such keys are simply ignored (D14).
 */
export function needsKeySetHint(state: RoundState, choice: Choice): boolean {
  return (
    state.status !== 'finished' &&
    state.settings.dir === 'mixed' &&
    choice.kind !== answerKind(state.current)
  );
}

/** How one answer went, judged from the state before and after it (used for sound and the `X`). */
export function answerOutcome(before: RoundState, after: RoundState): AnswerOutcome {
  if (after.correct > before.correct) return 'right';
  if (after.misses.length > before.misses.length) return 'miss';
  return 'ignored';
}

/** Which key set answers a prompt: a solfège prompt is answered with letters, and back. */
export function answerKind(prompt: Prompt): Side {
  return prompt.ask === 'solfege' ? 'letter' : 'solfege';
}

function onAnswer(state: RoundState, choice: Choice, now: number): RoundState {
  if (choice.kind !== answerKind(state.current)) return state;

  const startedAt = state.startedAt ?? now;
  const deadline = timeDeadline(state.settings, startedAt);
  // D20: an answer at or after the deadline ends the round and does not count.
  if (deadline !== null && now >= deadline) return finish(state, deadline);

  const isRight = choice.note === state.current.note;
  const [nextUpcoming, rngState] = nextPrompt(
    state.settings,
    state.upcoming[2].note,
    state.rngState,
  );
  const next: RoundState = {
    ...state,
    status: 'running',
    startedAt,
    lastAnswerAt: now,
    correct: isRight ? state.correct + 1 : state.correct,
    misses: isRight
      ? state.misses
      : [...state.misses, { prompt: state.current, answered: choice.note }],
    current: state.upcoming[0],
    upcoming: [state.upcoming[1], state.upcoming[2], nextUpcoming],
    rngState,
  };

  if (next.settings.mode === 'count' && next.correct + next.misses.length >= next.settings.len) {
    return finish(next, now);
  }
  return next;
}

function onTick(state: RoundState, now: number): RoundState {
  if (state.startedAt === null) return state;
  const deadline = timeDeadline(state.settings, state.startedAt);
  return deadline !== null && now >= deadline ? finish(state, deadline) : state;
}

function onEnd(state: RoundState, now: number): RoundState {
  // D15: ending before any answer leaves the round ready (no Results).
  if (state.startedAt === null) return state;
  return isEndedByPlayer(state.settings) ? finish(state, now) : state;
}

function finish(state: RoundState, endedAt: number): RoundState {
  return { ...state, status: 'finished', endedAt };
}

function timeDeadline(settings: Settings, startedAt: number): number | null {
  return settings.mode === 'time' ? startedAt + settings.len * 1000 : null;
}

/** D14: uniform over the 7 notes, never the same note as the one before, in any direction. */
function nextPrompt(settings: Settings, previous: Note | null, rngState: number): [Prompt, number] {
  const choices = previous === null ? 7 : 6;
  const [index, afterNote] = nextInt(rngState, choices);
  const raw = index + 1;
  const note = (previous !== null && raw >= previous ? raw + 1 : raw) as Note;

  if (settings.dir === 'mixed') {
    const [coin, afterAsk] = nextInt(afterNote, 2);
    return [{ note, ask: coin === 0 ? 'solfege' : 'letter' }, afterAsk];
  }
  return [{ note, ask: settings.dir === 'solfege-to-letter' ? 'solfege' : 'letter' }, afterNote];
}
