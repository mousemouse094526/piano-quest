import { Keyboard } from 'lucide-react';
import { type KeyboardEvent, type RefObject, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { NOTES_IN_ORDER } from '../engine/notes';
import type { Choice, Side } from '../engine/types';
import {
  bindableCode,
  DEFAULT_KEYMAP,
  isIgnoredKey,
  isSameAnswer,
  type Keymap,
  rebind,
} from '../hooks/keys';
import { keymapOf, type QuizSearch, withKeymap } from '../search';
import { Kbd } from './Kbd';
import { noteLabel, shortcutLabel } from './labels';

/** What the line under the rows says after the last key pressed while waiting. */
type Notice = { kind: 'not-bindable' } | { kind: 'swapped'; with: Choice } | null;

const SIDES: readonly Side[] = ['letter', 'solfege'];

/**
 * The "ปุ่มลัด" button and its Dialog (D35): pick an Answer's row, press a key, and the
 * Keymap goes to `onChange` right away (D36, D37). `onOpenChange` fires inside the press
 * that opens or closes it, so the game can stop listening before the next key (D35, D40).
 */
export function KeymapDialog({
  search,
  onChange,
  onOpenChange,
  returnFocusTo,
}: {
  search: QuizSearch;
  onChange: (next: QuizSearch) => void;
  onOpenChange: (open: boolean) => void;
  /** Where focus goes when the Dialog closes, so answer keys work right away (D35). */
  returnFocusTo: RefObject<HTMLElement | null>;
}) {
  const [open, setOpen] = useState(false);
  const [waiting, setWaiting] = useState<Choice | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const keymap = keymapOf(search);

  function stopWaiting() {
    setWaiting(null);
    setNotice(null);
  }

  function changeOpen(next: boolean) {
    setOpen(next);
    // A tapped row with no keyboard to answer it stops waiting when the Dialog closes (D39).
    stopWaiting();
    onOpenChange(next);
  }

  function pickRow(row: Choice) {
    // Tapping the waiting row again stops waiting (D39).
    setWaiting(isSameAnswer(waiting, row) ? null : row);
    setNotice(null);
  }

  function change(next: Keymap) {
    onChange(withKeymap(search, next));
  }

  // On the content, not the rows, so the key counts wherever focus is in the Dialog (D35).
  // React handles it before the event bubbles to the game's `window` listener.
  function onKeyDown(e: KeyboardEvent) {
    if (!waiting || isIgnoredKey(e.nativeEvent)) return;
    // Tab moves focus as usual and stops waiting; Escape is handled by onEscapeKeyDown.
    if (e.code === 'Tab') {
      setWaiting(null);
      return;
    }
    if (e.code === 'Escape') return;
    e.preventDefault();
    const code = bindableCode(e.code);
    if (!code) {
      setNotice({ kind: 'not-bindable' });
      return;
    }
    const result = rebind(keymap, waiting, code);
    setWaiting(null);
    setNotice(result.swappedWith && { kind: 'swapped', with: result.swappedWith });
    if (result.keymap !== keymap) change(result.keymap);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          aria-label="ปุ่มลัด"
          className="size-11 text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
        >
          <Keyboard aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent
        onKeyDown={onKeyDown}
        // Radix catches Escape first, on `document`; while a row waits it only stops waiting.
        onEscapeKeyDown={(e) => {
          if (!waiting) return;
          e.preventDefault();
          setWaiting(null);
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          returnFocusTo.current?.focus();
        }}
        // React bubbles through the portal to the Mode bar, whose onMouseDown keeps focus
        // off its controls; the Dialog's rows need focus (D35).
        onMouseDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>ปุ่มลัด</DialogTitle>
          <DialogDescription>ต้องใช้คีย์บอร์ดจริง แตะปุ่มคำตอบได้เสมอ</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {SIDES.map((side) => (
            <fieldset key={side} className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-muted-foreground text-sm">
                {noteLabel(1, side, search.script)}–{noteLabel(7, side, search.script)}
              </legend>
              {NOTES_IN_ORDER.map((note) => {
                const row = { kind: side, note };
                const isWaiting = isSameAnswer(waiting, row);
                return (
                  <Button
                    key={note}
                    variant="outline"
                    aria-pressed={isWaiting}
                    className={cn('justify-between', isWaiting && 'border-brand')}
                    onClick={() => pickRow(row)}
                  >
                    <span>{noteLabel(note, side, search.script)}</span>
                    {isWaiting ? (
                      <span className="text-brand text-xs">กดปุ่มที่ต้องการ…</span>
                    ) : (
                      <Kbd>{shortcutLabel(note, side, keymap)}</Kbd>
                    )}
                  </Button>
                );
              })}
            </fieldset>
          ))}
        </div>
        <p role="status" className="min-h-5 text-sm">
          {notice?.kind === 'not-bindable' && 'ใช้ปุ่มนี้ไม่ได้'}
          {notice?.kind === 'swapped' &&
            `สลับกับ ${noteLabel(notice.with.note, notice.with.kind, search.script)}`}
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              stopWaiting();
              change(DEFAULT_KEYMAP);
            }}
          >
            คืนค่าเริ่มต้น
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
