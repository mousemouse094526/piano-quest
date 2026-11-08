import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Choice, Note, Side } from '../engine/types';
import type { LastAnswer } from '../hooks/useRound';
import type { Script } from '../search';
import { noteLabel, shortcutLabel } from './labels';
import { noFocus } from './noFocus';

const NOTES_IN_ORDER: Note[] = [1, 2, 3, 4, 5, 6, 7];

/**
 * The 7 answer buttons for the key set the current Prompt wants (D6). Each new value
 * of `hintFlashKey` (a counter, used as a React key) replays the shortcut flash once (D20).
 * The button of the last answer dips, flashes the accent when right, and shows `X` when
 * wrong (D20, D31). A 7-column grid keeps the row on one line down to a 375 px phone.
 */
export function AnswerRow({
  side,
  script,
  hintFlashKey,
  lastAnswer,
  onChoice,
}: {
  side: Side;
  script: Script;
  hintFlashKey: number;
  lastAnswer: LastAnswer | null;
  onChoice: (choice: Choice) => void;
}) {
  return (
    <div className="grid w-full max-w-md grid-cols-7 gap-1.5 sm:gap-2" data-testid="answer-row">
      {NOTES_IN_ORDER.map((note) => {
        const last = lastAnswer?.note === note ? lastAnswer : null;
        return (
          <Button
            // A new key per answer remounts the pressed button, which replays its animation.
            key={last ? `${note}-${last.answerNumber}` : note}
            variant="outline"
            className={cn(
              'relative h-auto min-h-11 min-w-0 flex-col gap-1 px-0 py-2',
              last?.outcome === 'right' && 'animate-hit motion-reduce:animate-hit-still',
              last?.outcome === 'miss' && 'animate-press motion-reduce:animate-none',
            )}
            {...noFocus}
            onClick={() => onChoice({ kind: side, note })}
          >
            <span className="text-base">{noteLabel(note, side, script)}</span>
            <kbd
              key={hintFlashKey}
              className={cn(
                'rounded px-1 font-mono text-muted-foreground text-xs',
                hintFlashKey > 0 && 'animate-hint',
              )}
            >
              {shortcutLabel(note, side)}
            </kbd>
            {last?.outcome === 'miss' && (
              // D20: the pressed button shows X for a moment; the animation ends hidden.
              <X
                aria-hidden="true"
                data-testid="miss-mark"
                className="absolute inset-0 m-auto size-8! animate-miss-mark text-destructive"
              />
            )}
          </Button>
        );
      })}
    </div>
  );
}
