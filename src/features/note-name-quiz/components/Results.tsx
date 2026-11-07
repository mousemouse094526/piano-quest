import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { results } from '../engine/round';
import type { RoundState } from '../engine/types';

export function Results({ state, onRestart }: { state: RoundState; onRestart: () => void }) {
  const r = results(state);
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-8">
      <h1 className="font-semibold text-2xl">ผลรอบนี้</h1>
      <dl className="grid grid-cols-3 gap-8 text-center">
        <Stat label="ถูก" value={r.correct} />
        <Stat label="ผิด" value={r.wrong} />
        <Stat label="ความแม่น" value={`${r.accuracy}%`} />
      </dl>
      <Button variant="outline" size="lg" className="min-h-11" tabIndex={-1} onClick={onRestart}>
        <RotateCcw aria-hidden="true" />
        เล่นอีกรอบ
        <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs">Tab</kbd>
      </Button>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="font-bold font-mono text-4xl tabular-nums">{value}</dd>
    </div>
  );
}
