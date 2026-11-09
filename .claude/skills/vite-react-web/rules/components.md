# Components

**Owns:** rendering and turning user input (keys, taps, clicks) into engine
events.

**Must not:** hold game rules or compute scores — call the engine; never
use browser storage.

## Shape

```tsx
export function AnswerPad({ onChoice }: { onChoice: (c: Choice) => void }) {
  return <div>{/* 7 Buttons with tabIndex={-1} */}</div>;
}
```

## Rules

- Build from `components/ui` (shadcn/ui); add primitives with the shadcn CLI.
- Keyboard handling for a game lives in one `window` listener inside a
  feature hook, reading `KeyboardEvent.code`.
- A Dialog that reads keys for itself (the Keymap dialog) handles them in
  `onKeyDown` on its Content and calls `preventDefault` on each key it takes;
  the game's `window` listener skips any key with `defaultPrevented` (D35,
  `docs/library-notes/radix-dialog.md`).
- Answer buttons never take focus.
- All visible text is our own wording (ADR-0006).

## Good examples

- `src/features/note-name-quiz/hooks/useRound.ts` — engine via `useReducer`, one `window` keydown listener, a ticker only while the Round runs.
- `src/features/note-name-quiz/hooks/keys.ts` — `KeyboardEvent.code` → `Choice` through the Player's Keymap, the one table of bindable keys and their labels (ADR-0007), and which keys never answer (D20).
- `src/features/note-name-quiz/components/ResultsScreen.tsx` — shadcn `Button` with a lucide icon marked `aria-hidden`.
- `src/features/note-name-quiz/components/KeymapDialog.tsx` — shadcn `Dialog` that reads keys on its Content, `Esc` through Radix's `onEscapeKeyDown`, focus back to the game area on close.
- `src/features/note-name-quiz/sound/notePlayer.ts` — Web Audio side effect: created inside a user gesture, every call wrapped so sound never breaks the game (D20, D29).
