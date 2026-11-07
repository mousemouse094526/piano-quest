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
- Answer buttons never take focus.
- All visible text is our own wording (ADR-0006).

## Good examples

- None yet — the first ticket that touches this layer sets it.
