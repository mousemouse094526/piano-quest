import { timeLeft } from '../engine/round';
import type { RoundState } from '../engine/types';
import { promptLabel } from './labels';

export function Game({ state, now }: { state: RoundState; now: number }) {
  const msLeft = timeLeft(state, now);
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-10">
      <div className="flex items-baseline gap-4 font-mono text-lg tabular-nums">
        {msLeft !== null && (
          <span role="timer" aria-label="เวลาที่เหลือ">
            {Math.ceil(msLeft / 1000)}
          </span>
        )}
        <span className="text-muted-foreground text-sm">ผิด {state.misses.length}</span>
      </div>

      <div className="flex items-baseline gap-6">
        <span className="font-bold text-7xl" data-testid="prompt">
          {promptLabel(state.current)}
        </span>
        {state.upcoming.map((p, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: upcoming is a fixed 3-slot window
          <span key={i} className="text-3xl text-muted-foreground/50" aria-hidden="true">
            {promptLabel(p)}
          </span>
        ))}
      </div>

      <p className="h-6 text-muted-foreground">
        {state.status === 'ready' ? 'กดปุ่มคำตอบเพื่อเริ่ม' : ''}
      </p>

      <p className="text-muted-foreground text-xs">
        <kbd className="rounded border px-1.5 py-0.5 font-mono">Tab</kbd> เริ่มใหม่
      </p>
    </section>
  );
}
