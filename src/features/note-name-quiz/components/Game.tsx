import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { hasLength, isEndedByPlayer } from '../engine/modes';
import { answeredCount, answerKind, timeLeft } from '../engine/round';
import type { Choice, RoundState } from '../engine/types';
import type { Keymap } from '../hooks/keys';
import type { LastAnswer } from '../hooks/useRound';
import type { Script } from '../search';
import { AnswerRow } from './AnswerRow';
import { Kbd } from './Kbd';
import { promptLabel } from './labels';
import { noFocus } from './noFocus';

export function Game({
  state,
  now,
  script,
  keymap,
  keySetHints,
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
  /** Bumped on each press from the other key set in `mixed`; replays the hint flash. */
  keySetHints: number;
  /** The button the last counted answer pressed and how it went. */
  lastAnswer: LastAnswer | null;
  onAnswer: (choice: Choice) => void;
  onRestart: () => void;
  onEnd: () => void;
}) {
  const missCount = state.misses.length;
  const endedByPlayer = isEndedByPlayer(state.settings);
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
       * Prompt in (D31) and, after a miss, shakes it once (D7, D20).
       */}
      <div
        key={answeredCount(state)}
        className="flex animate-prompt-in items-baseline gap-6 motion-reduce:animate-none"
      >
        <span
          data-testid="prompt"
          className={cn(
            'font-bold text-7xl',
            lastAnswer?.outcome === 'miss' && 'animate-miss motion-reduce:animate-miss-still',
          )}
        >
          {promptLabel(state.current, script)}
        </span>
        {state.upcoming.map((p, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: upcoming is a fixed 3-slot window
          <span key={i} className="text-3xl text-muted-foreground/50" aria-hidden="true">
            {promptLabel(p, script)}
          </span>
        ))}
      </div>

      <AnswerRow
        side={answerKind(state.current)}
        script={script}
        keymap={keymap}
        hintFlashKey={keySetHints}
        lastAnswer={lastAnswer}
        onChoice={onAnswer}
      />

      <p className="h-6 text-muted-foreground">
        {state.status === 'ready' ? 'กดปุ่มคำตอบเพื่อเริ่ม' : ''}
      </p>

      <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
        <Shortcut keys="Tab" action="เริ่มใหม่" />
        {/* Esc ends only a zen Round (D14), so it is listed only there. */}
        {endedByPlayer && <Shortcut keys="Esc" action="จบรอบ" />}
        <Shortcut keys="Shift+Tab" action="ไปที่ Mode bar" />
      </p>
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
