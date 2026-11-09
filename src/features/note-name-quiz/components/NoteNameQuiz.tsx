import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { NOTES } from '../engine/notes';
import { type FocusAreas, useRound } from '../hooks/useRound';
import { isSoundOn, keymapOf, type QuizSearch, roundKeyOf, settingsOf, withSound } from '../search';
import { notePlayer } from '../sound/notePlayer';
import { Game } from './Game';
import { ModeBar } from './ModeBar';
import { ResultsScreen } from './ResultsScreen';

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

  function changeSound(on: boolean) {
    // Inside the press that turns sound on, so the browser lets the audio start (D20).
    if (on) notePlayer.prepare();
    changeSettings(withSound(search, on));
  }

  // A new Round key remounts the Round. Script only changes how notes read, but a Round
  // keeps one Script from start to Results.
  const roundKey = roundKeyOf(search);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <ModeBar
        ref={modeBar}
        search={search}
        onChange={changeSettings}
        onSoundChange={changeSound}
      />
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
  const keymap = keymapOf(search);
  const { state, now, keySetHints, lastAnswer, restart, end, answer } = useRound(
    settingsOf(search),
    keymap,
    focus,
    (note) => {
      if (isSoundOn(search)) notePlayer.play(NOTES[note].hz);
    },
  );
  return state.status === 'finished' ? (
    <ResultsScreen state={state} script={search.script} onRestart={restart} />
  ) : (
    <Game
      state={state}
      now={now}
      script={search.script}
      keymap={keymap}
      keySetHints={keySetHints}
      lastAnswer={lastAnswer}
      onAnswer={answer}
      onRestart={restart}
      onEnd={end}
    />
  );
}
