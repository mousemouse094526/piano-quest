import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { answerKind, results } from '../engine/round';
import type { Miss, RoundState } from '../engine/types';
import { useCountUp } from '../hooks/useCountUp';
import type { Script } from '../search';
import { Kbd } from './Kbd';
import { noteLabel, promptLabel, roundLabel } from './labels';
import { noFocus } from './noFocus';

const NO_VALUE = '—';

export function ResultsScreen({
  state,
  script,
  onRestart,
}: {
  state: RoundState;
  script: Script;
  onRestart: () => void;
}) {
  const stats = results(state);
  return (
    // D31: Results rise in, and their numbers count up.
    <div className="flex flex-1 animate-in flex-col items-center justify-center gap-8 fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
      <div className="text-center">
        <h1 className="font-semibold text-2xl">ผลรอบนี้</h1>
        <p className="text-muted-foreground text-sm">{roundLabel(state.settings, script)}</p>
      </div>

      <dl className="grid grid-cols-3 gap-x-8 gap-y-6 text-center sm:grid-cols-5">
        <Stat label="ถูก" value={stats.correct} />
        <Stat label="ผิด" value={stats.wrong} />
        <Stat label="ความแม่น" value={stats.accuracy} format={asPercent} accent />
        <Stat label="โน้ตต่อนาที" value={stats.notesPerMinute} accent />
        <Stat label="เวลาเฉลี่ยต่อข้อ (วินาที)" value={stats.secondsPerAnswer} format={asSeconds} />
      </dl>

      <MissList misses={stats.misses} script={script} />

      <Button variant="outline" size="lg" className="min-h-11" {...noFocus} onClick={onRestart}>
        <RotateCcw aria-hidden="true" />
        เล่นอีกรอบ
        <Kbd>Tab</Kbd>
      </Button>
    </div>
  );
}

const asWhole = (n: number) => String(Math.round(n));
const asPercent = (n: number) => `${Math.round(n)}%`;
const asSeconds = (n: number) => n.toFixed(2);

/** One Results number; `null` shows "—". `accent` marks the headline numbers (D31). */
function Stat({
  label,
  value,
  format = asWhole,
  accent = false,
}: {
  label: string;
  value: number | null;
  format?: (n: number) => string;
  accent?: boolean;
}) {
  const shown = useCountUp(value);
  return (
    <div>
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className={cn('font-bold font-mono text-4xl tabular-nums', accent && 'text-brand')}>
        {shown === null ? NO_VALUE : format(shown)}
      </dd>
    </div>
  );
}

/** Every wrong Prompt with what was answered and the right Answer (D7). */
function MissList({ misses, script }: { misses: Miss[]; script: Script }) {
  if (misses.length === 0) return <p className="text-muted-foreground">ไม่ผิดสักข้อ</p>;
  return (
    <table className="text-center" data-testid="miss-list">
      <caption className="pb-2 text-muted-foreground text-sm">ข้อที่ผิด</caption>
      <thead className="text-muted-foreground text-sm">
        <tr>
          <th className="px-4 font-normal">โจทย์</th>
          <th className="px-4 font-normal">ตอบ</th>
          <th className="px-4 font-normal">ที่ถูก</th>
        </tr>
      </thead>
      <tbody className="text-lg">
        {misses.map((miss, i) => {
          const side = answerKind(miss.prompt);
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: misses never reorder within a Round
            <tr key={i}>
              <td className="px-4 py-1 font-semibold">{promptLabel(miss.prompt, script)}</td>
              <td className="px-4 py-1 text-muted-foreground line-through">
                {noteLabel(miss.answered, side, script)}
              </td>
              <td className="px-4 py-1">{noteLabel(miss.prompt.note, side, script)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
