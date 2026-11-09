import { RotateCcw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { answerKind, countedUp, results } from '../engine/round';
import type { Miss, RoundState } from '../engine/types';
import { useCountUpProgress } from '../hooks/useCountUpProgress';
import type { ShareView } from '../hooks/useShareResults';
import type { Script } from '../search';
import { asPercent, asSeconds, asWhole, NO_VALUE } from './format';
import { Kbd } from './Kbd';
import { noteLabel, promptLabel, roundLabel } from './labels';
import { noFocus } from './noFocus';

export function ResultsScreen({
  state,
  script,
  shareView,
  onRestart,
  onShare,
}: {
  state: RoundState;
  script: Script;
  shareView: ShareView;
  onRestart: () => void;
  onShare: () => void;
}) {
  const final = results(state);
  // D44: one count-up for every number, so no frame shows "ถูก 5" with 59% and no miss.
  const shown = countedUp(final, useCountUpProgress());
  return (
    // D31: Results rise in, and their numbers count up.
    <div className="flex flex-1 animate-in flex-col items-center justify-center gap-8 fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
      <div className="text-center">
        <h1 className="font-semibold text-2xl">ผลรอบนี้</h1>
        <p className="text-muted-foreground text-sm">{roundLabel(state.settings, script)}</p>
      </div>

      <dl className="grid grid-cols-3 gap-x-8 gap-y-6 text-center sm:grid-cols-5">
        <Stat label="ถูก" value={shown.correct} />
        <Stat label="ผิด" value={shown.wrong} />
        <Stat label="ความแม่น" value={shown.accuracy} format={asPercent} accent />
        <Stat label="โน้ตต่อนาที" value={shown.notesPerMinute} accent />
        <Stat label="เวลาเฉลี่ยต่อข้อ (วินาที)" value={shown.secondsPerAnswer} format={asSeconds} />
      </dl>

      <MissList misses={final.misses} script={script} />

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" size="lg" className="min-h-11" {...noFocus} onClick={onRestart}>
          <RotateCcw aria-hidden="true" />
          เล่นอีกรอบ
          {/* D44: no Tab hint on a touch screen. */}
          <Kbd className="pointer-coarse:hidden">Tab</Kbd>
        </Button>
        {/* share-results D2, D7: `S` presses it too; disabled while the share sheet is open. */}
        <Button
          variant="outline"
          size="lg"
          className="min-h-11"
          {...noFocus}
          disabled={shareView.busy}
          onClick={onShare}
        >
          <Share2 aria-hidden="true" />
          แชร์ผล
          <Kbd className="pointer-coarse:hidden">S</Kbd>
        </Button>
      </div>

      <ShareOutcomeView view={shareView} />
    </div>
  );
}

/**
 * share-results D3, D7: the live region stays on the page so each new outcome is read out;
 * a share or copy that failed leaves the Share text in a box to copy by hand.
 */
function ShareOutcomeView({ view }: { view: ShareView }) {
  return (
    <>
      <p role="status" aria-live="polite" className="min-h-5 text-muted-foreground text-sm">
        {view.outcome === 'copied' && 'คัดลอกผลแล้ว'}
        {view.outcome === 'failed' && 'แชร์ไม่ได้'}
      </p>
      {view.boxText !== null && (
        <label className="flex w-full max-w-md flex-col gap-2 text-sm">
          คัดลอกข้อความนี้ไปส่งเองได้
          <textarea
            readOnly
            value={view.boxText}
            rows={10}
            className="rounded-md border bg-transparent p-3 font-mono text-sm"
          />
        </label>
      )}
    </>
  );
}

/** One Results number as it counts up; `null` shows "—". `accent` marks the headline numbers (D31). */
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
  return (
    <div>
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className={cn('font-bold font-mono text-4xl tabular-nums', accent && 'text-brand')}>
        {value === null ? NO_VALUE : format(value)}
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
