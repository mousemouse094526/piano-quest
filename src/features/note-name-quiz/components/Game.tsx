import { cn } from 'cn';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { answeredCount, answerKind, timeLeft } from '../engine/round';
import type { Choice, RoundState } from '../engine/types';
import type { MissMark } from '../hooks/useRound';
import type { Script } from '../search';
import { AnswerRow } from './AnswerRow';
import { Kbd } from './Kbd';
import { promptLabel } from './labels';
import { noFocus } from './noFocus';

export function Game({
  state,
  now,
  script,
  keySetHints,
  missMark,
  onAnswer,
  onRestart,
  onEnd,
}: {
  state: RoundState;
  now: number;
  script: Script;
  /** Bumped on each press from the other key set in `mixed`; replays the hint flash. */
  keySetHints: number;
  /** The button the last answer missed with, until the next counted answer. */
  missMark: MissMark | null;
  onAnswer: (choice: Choice) => void;
  onRestart: () => void;
  onEnd: () => void;
}) {
  const missCount = state.misses.length;
  const isZen = state.settings.mode === 'zen';
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
        {isZen && (
          <Button variant="outline" className="min-h-11" {...noFocus} onClick={onEnd}>
            จบรอบ
          </Button>
        )}
      </div>

      <div className="flex items-baseline gap-6">
        {/*
         * Keyed on the miss count: each miss remounts the Prompt, which replays the
         * shake once (D7, D20). Right answers keep the key, so nothing replays.
         * `data-missed` lets e2e tests see the wrong-answer state.
         */}
        <span
          key={missCount}
          data-testid="prompt"
          data-missed={missCount > 0 || undefined}
          className={cn(
            'font-bold text-7xl',
            missCount > 0 && 'animate-miss motion-reduce:animate-miss-still',
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
        hintFlashKey={keySetHints}
        missMark={missMark}
        onChoice={onAnswer}
      />

      <p className="h-6 text-muted-foreground">
        {state.status === 'ready' ? 'กดปุ่มคำตอบเพื่อเริ่ม' : ''}
      </p>

      <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
        <Shortcut keys="Tab" action="เริ่มใหม่" />
        {/* Esc ends only a zen Round (D14), so it is listed only there. */}
        {isZen && <Shortcut keys="Esc" action="จบรอบ" />}
        <Shortcut keys="Shift+Tab" action="ไปที่ Mode bar" />
      </p>
    </div>
  );
}

/** Time left (`time`), answered of total (`count`) or answered so far (`zen`) (D20). */
function Progress({ state, now }: { state: RoundState; now: number }) {
  const answered = answeredCount(state);
  const { settings } = state;
  if (settings.mode === 'time') {
    const msLeft = timeLeft(state, now) ?? 0;
    return (
      <span role="timer" aria-label="เวลาที่เหลือ">
        {Math.ceil(msLeft / 1000)}
      </span>
    );
  }
  return (
    <span data-testid="answered">
      <span className="sr-only">ตอบแล้ว </span>
      {settings.mode === 'count' ? `${answered}/${settings.len}` : answered}
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
