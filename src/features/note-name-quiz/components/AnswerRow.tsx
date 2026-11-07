import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import type { Choice, Note, Side } from '../engine/types';
import type { Script } from '../search';
import { noteLabel, shortcutLabel } from './labels';
import { noFocus } from './noFocus';

const NOTES_IN_ORDER: Note[] = [1, 2, 3, 4, 5, 6, 7];

/**
 * The 7 answer buttons for the key set the current Prompt wants (D6). Each new value
 * of `hintFlashKey` (a counter, used as a React key) replays the shortcut flash once (D20).
 */
export function AnswerRow({
  side,
  script,
  hintFlashKey,
  onChoice,
}: {
  side: Side;
  script: Script;
  hintFlashKey: number;
  onChoice: (choice: Choice) => void;
}) {
  return (
    <div className="flex gap-2">
      {NOTES_IN_ORDER.map((note) => (
        <Button
          key={note}
          variant="outline"
          className="h-auto min-h-11 min-w-12 flex-col gap-1 py-2"
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
        </Button>
      ))}
    </div>
  );
}
