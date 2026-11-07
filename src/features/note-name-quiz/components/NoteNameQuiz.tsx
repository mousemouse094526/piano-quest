import type { Settings } from '../engine/types';
import { useRound } from '../hooks/useRound';
import { Game } from './Game';
import { Results } from './Results';

// Ticket 01 plays the default Round only; the Mode bar arrives in ticket 02.
const DEFAULT_SETTINGS: Settings = { mode: 'time', len: 30, dir: 'solfege-to-letter' };

export function NoteNameQuiz() {
  const { state, now, restart } = useRound(DEFAULT_SETTINGS);
  return state.status === 'finished' ? (
    <Results state={state} onRestart={restart} />
  ) : (
    <Game state={state} now={now} />
  );
}
