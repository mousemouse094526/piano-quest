import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { hasLength, isEndedByPlayer } from '../engine/modes';
import { answeredCount, answerKind, timeLeft } from '../engine/round';
import type { Choice, RoundState } from '../engine/types';
import type { Keymap } from '../hooks/keys';
import type { KeySetHint, LastAnswer } from '../hooks/useRound';
import type { Script } from '../search';
import { AnswerRow } from './AnswerRow';
import { Kbd } from './Kbd';
import { keySetLabel, modeHowTo, promptLabel } from './labels';
import { noFocus } from './noFocus';

export function Game({
  state,
  now,
  script,
  keymap,
  keySetHint,
  lastAnswer,
  onAnswer,
  onRestart,
  onEnd,
}: {
  state: RoundState;
  now: number;
  script: Script;
  /** Labels the answer buttons with the keys that answer them. */
  keymap: Keymap;
  /** A press from the other key set in `mixed` (D20, D44). */
  keySetHint: KeySetHint;
  /** The button the last counted answer pressed and how it went. */
  lastAnswer: LastAnswer | null;
  onAnswer: (choice: Choice) => void;
  onRestart: () => void;
  onEnd: () => void;
}) {
  const missCount = state.misses.length;
  const endedByPlayer = isEndedByPlayer(state.settings);
  const side = answerKind(state.current);
  const ready = state.status === 'ready';
  const missedPrompt = lastAnswer?.outcome === 'miss' ? lastAnswer.prompt : undefined;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10">
      <div className="flex items-center gap-4 font-mono text-lg tabular-nums">
        <Progress state={state} now={now} />
        <span className="text-muted-foreground text-sm" data-testid="miss-count">
          ผิด {missCount}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label="เริ่มใหม่"
          {...noFocus}
          onClick={onRestart}
        >
          <RotateCcw aria-hidden="true" />
        </Button>
        {endedByPlayer && (
          <Button variant="outline" className="min-h-11" {...noFocus} onClick={onEnd}>
            จบรอบ
          </Button>
        )}
      </div>

      {/*
       * Keyed on the answers so far: each answer remounts the row, which slides the new
       * Prompt in (D31). After a miss, the missed Prompt (the last answer's) stays to its
       * left in red, shakes and fades, so the miss reads as the old Prompt's (D7, D44).
       */}
      <div
        key={answeredCount(state)}
        className="flex animate-prompt-in items-baseline gap-6 motion-reduce:animate-none"
      >
        <span className="relative">
          {missedPrompt && (
            <span
              aria-hidden="true"
              data-testid="missed-prompt"
              className="absolute right-full mr-6 font-bold text-5xl text-destructive animate-missed-prompt motion-reduce:animate-miss-fade"
            >
              {promptLabel(missedPrompt, script)}
            </span>
          )}
          <span data-testid="prompt" className="font-bold text-7xl">
            {promptLabel(state.current, script)}
          </span>
        </span>
        {state.upcoming.map((p, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: upcoming is a fixed 3-slot window
          <span key={i} className="text-3xl text-muted-foreground/50" aria-hidden="true">
            {promptLabel(p, script)}
          </span>
        ))}
      </div>

      <AnswerRow
        side={side}
        script={script}
        keymap={keymap}
        hintFlashKey={keySetHint.flashes}
        lastAnswer={lastAnswer}
        onChoice={onAnswer}
      />

      <div className="flex flex-col items-center gap-2 text-center">
        {keySetHint.shown ? (
          // D44: the other key set was pressed; say which keys answer this Prompt.
          <p
            key={keySetHint.flashes}
            role="status"
            className="h-6 animate-hint rounded px-2 font-medium motion-reduce:animate-none"
          >
            ข้อนี้ตอบด้วยปุ่ม {keySetLabel(side, keymap)}
          </p>
        ) : (
          <p className="h-6 text-muted-foreground">{ready ? 'กดปุ่มคำตอบเพื่อเริ่ม' : ''}</p>
        )}
        {/* D44: kept in the layout once the Round runs, so nothing above it moves. */}
        <div className={cn('text-muted-foreground text-sm', !ready && 'invisible')}>
          <p>{modeHowTo(state.settings)}</p>
          <p>กดปุ่มบนคีย์บอร์ดตามป้ายเล็กใต้ปุ่มคำตอบ หรือแตะปุ่ม</p>
        </div>
      </div>

      {/*
       * Keyboard hints, hidden on a touch screen (D44). While focus is in the Mode bar's
       * `<nav>` (both sit in NoteNameQuiz's `group/quiz`), only the way back in is listed
       * (D20, D44).
       */}
      <div className="text-muted-foreground text-xs pointer-coarse:hidden">
        <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 group-has-[nav:focus-within]/quiz:hidden">
          <Shortcut keys="Tab" action="เริ่มใหม่" />
          {/* Esc ends only a zen Round (D14), so it is listed only there. */}
          {endedByPlayer && <Shortcut keys="Esc" action="จบรอบ" />}
          <Shortcut keys="Shift+Tab" action="ไปที่การตั้งค่า" />
        </p>
        <p className="hidden justify-center group-has-[nav:focus-within]/quiz:flex">
          <Shortcut keys="Esc" action="กลับเข้าเกม" />
        </p>
      </div>
    </div>
  );
}

/** From here down to 1, the `time` clock beats each second (D31). */
const TICK_FROM_SECONDS = 5;

/** Time left (`time`), answered of total (`count`) or answered so far (`zen`) (D20). */
function Progress({ state, now }: { state: RoundState; now: number }) {
  const answered = answeredCount(state);
  const { settings } = state;
  if (settings.mode === 'time') {
    const secondsLeft = Math.ceil((timeLeft(state, now) ?? 0) / 1000);
    // D31: the last seconds beat once each; the key replays the beat every second.
    const endingSoon = state.status === 'running' && secondsLeft <= TICK_FROM_SECONDS;
    return (
      <span role="timer" aria-label="เวลาที่เหลือ" className="text-brand">
        <span
          key={endingSoon ? secondsLeft : 'steady'}
          className={cn('inline-block', endingSoon && 'animate-tick motion-reduce:animate-none')}
        >
          {secondsLeft}
        </span>
      </span>
    );
  }
  return (
    <span data-testid="answered" className="text-brand">
      <span className="sr-only">ตอบแล้ว </span>
      {hasLength(settings) ? `${answered}/${settings.len}` : answered}
    </span>
  );
}

function Shortcut({ keys, action }: { keys: string; action: string }) {
  return (
    <span>
      <Kbd>{keys}</Kbd> {action}
    </span>
  );
}
