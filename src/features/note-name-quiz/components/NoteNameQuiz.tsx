import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { type FocusAreas, useRound } from '../hooks/useRound';
import { type QuizSearch, settingsOf } from '../search';
import { Game } from './Game';
import { ModeBar } from './ModeBar';
import { Results } from './Results';

export function NoteNameQuiz() {
  const search = useSearch({ from: '/' });
  const navigate = useNavigate({ from: '/' });
  const modeBar = useRef<HTMLElement>(null);
  const gameArea = useRef<HTMLElement>(null);

  // Keys work without focus, but starting in the game area makes Shift+Tab reach the Mode bar.
  useEffect(() => gameArea.current?.focus(), []);

  function changeSettings(next: QuizSearch) {
    // D14: replace, so Back leaves the page instead of stepping through old settings.
    navigate({ search: next, replace: true });
  }

  // Every Mode bar value except `sound` starts a new Round (D14, D20): a new key remounts it.
  const roundKey = [
    search.mode,
    search.mode === 'zen' ? '' : search.len,
    search.dir,
    search.script,
  ].join('|');

  return (
    <div className="flex flex-1 flex-col gap-8">
      <ModeBar ref={modeBar} search={search} onChange={changeSettings} />
      <section
        ref={gameArea}
        // -1: focus lands here by script only; Shift+Tab from here still reaches the Mode bar.
        tabIndex={-1}
        aria-label="พื้นที่เกม"
        className="flex flex-1 flex-col outline-none"
      >
        <Round key={roundKey} search={search} focus={{ modeBar, gameArea }} />
      </section>
    </div>
  );
}

/** One Round with fixed settings; it exists so the parent can remount it by `key`. */
function Round({ search, focus }: { search: QuizSearch; focus: FocusAreas }) {
  const { state, now, keySetHints, restart, end, answer } = useRound(settingsOf(search), focus);
  return state.status === 'finished' ? (
    <Results state={state} script={search.script} onRestart={restart} />
  ) : (
    <Game
      state={state}
      now={now}
      script={search.script}
      keySetHints={keySetHints}
      onAnswer={answer}
      onRestart={restart}
      onEnd={end}
    />
  );
}
