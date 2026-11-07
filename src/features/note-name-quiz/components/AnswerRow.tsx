import { cn } from 'cn';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Choice, Note, Side } from '../engine/types';
import type { MissMark } from '../hooks/useRound';
import type { Script } from '../search';
import { noteLabel, shortcutLabel } from './labels';
import { noFocus } from './noFocus';

const NOTES_IN_ORDER: Note[] = [1, 2, 3, 4, 5, 6, 7];

/**
 * The 7 answer buttons for the key set the current Prompt wants (D6). Each new value
 * of `hintFlashKey` (a counter, used as a React key) replays the shortcut flash once (D20).
 * A 7-column grid keeps the row on one line down to a 375 px phone.
 */
export function AnswerRow({
  side,
  script,
  hintFlashKey,
  missMark,
  onChoice,
}: {
  side: Side;
  script: Script;
  hintFlashKey: number;
  missMark: MissMark | null;
  onChoice: (choice: Choice) => void;
}) {
  return (
    <div className="grid w-full max-w-md grid-cols-7 gap-1.5 sm:gap-2" data-testid="answer-row">
      {NOTES_IN_ORDER.map((note) => (
        <Button
          key={note}
          variant="outline"
          className="relative h-auto min-h-11 min-w-0 flex-col gap-1 px-0 py-2"
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
          {missMark?.note === note && (
            // D20: the pressed button shows X for a moment; the animation ends hidden.
            <X
              key={missMark.missNumber}
              aria-hidden="true"
              data-testid="miss-mark"
              className="absolute inset-0 m-auto size-8! animate-miss-mark text-destructive"
            />
          )}
        </Button>
      ))}
    </div>
  );
}
