import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { NOTES } from '../engine/notes';
import type { RoundState } from '../engine/types';
import { type KeyRouting, useRound } from '../hooks/useRound';
import { useShareResults } from '../hooks/useShareResults';
import { isSoundOn, keymapOf, type QuizSearch, roundKeyOf, settingsOf, withSound } from '../search';
import { notePlayer } from '../sound/notePlayer';
import { Game } from './Game';
import { ModeBar } from './ModeBar';
import { ResultsScreen } from './ResultsScreen';
import { buildShareText } from './shareText';

export function NoteNameQuiz() {
  const search = useSearch({ from: '/' });
  const navigate = useNavigate({ from: '/' });
  const modeBar = useRef<HTMLElement>(null);
  const gameArea = useRef<HTMLElement>(null);
  // Set inside the press that opens or closes the Keymap dialog, before React renders, so
  // the game's key listener ignores every key while it is open (D35).
  const keymapOpen = useRef(false);
  // Bumped when the Keymap dialog opens: the Round restarts even if no key changes (D40).
  const [keymapOpenings, setKeymapOpenings] = useState(0);

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

  function changeKeymapOpen(open: boolean) {
    keymapOpen.current = open;
    if (open) setKeymapOpenings((n) => n + 1);
  }

  // A new Round key remounts the Round. Script only changes how notes read, but a Round
  // keeps one Script from start to Results. Opening the Keymap dialog counts too, changed
  // keys or not: otherwise a `time` Round would run out while the Dialog is open (D40).
  const roundKey = `${roundKeyOf(search)}#${keymapOpenings}`;

  return (
    // `group/quiz`: Game's bottom bar reads whether focus is in the Mode bar (D44).
    <div className="group/quiz flex flex-1 flex-col gap-8">
      <ModeBar
        ref={modeBar}
        search={search}
        onChange={changeSettings}
        onSoundChange={changeSound}
        onKeymapOpenChange={changeKeymapOpen}
        gameArea={gameArea}
      />
      <section
        ref={gameArea}
        // -1: focus lands here by script only; Shift+Tab from here still reaches the Mode bar.
        tabIndex={-1}
        aria-label="พื้นที่เกม"
        className="flex flex-1 flex-col outline-none"
      >
        <Round key={roundKey} search={search} keyRouting={{ modeBar, gameArea, keymapOpen }} />
      </section>
    </div>
  );
}

/** One Round with fixed settings; it exists so the parent can remount it by `key`. */
function Round({ search, keyRouting }: { search: QuizSearch; keyRouting: KeyRouting }) {
  const keymap = keymapOf(search);
  const sharing = useShareResults();
  // share-results D4: the link is the page's address now, which holds every setting (D27).
  function shareRound(finished: RoundState) {
    sharing.share(finished, buildShareText(finished, search.script, window.location.href));
  }
  const { state, now, keySetHint, lastAnswer, restart, end, answer } = useRound(
    settingsOf(search),
    keymap,
    keyRouting,
    {
      onCorrect: (note) => {
        if (isSoundOn(search)) notePlayer.play(NOTES[note].hz);
      },
      onShare: shareRound,
    },
  );
  return state.status === 'finished' ? (
    <ResultsScreen
      state={state}
      script={search.script}
      share={sharing.viewFor(state)}
      onRestart={restart}
      onShare={() => shareRound(state)}
    />
  ) : (
    <Game
      state={state}
      now={now}
      script={search.script}
      keymap={keymap}
      keySetHint={keySetHint}
      lastAnswer={lastAnswer}
      onAnswer={answer}
      onRestart={restart}
      onEnd={end}
    />
  );
}
