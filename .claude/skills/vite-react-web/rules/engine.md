# Engine

**Owns:** a game's rules — state shape, events, scoring, prompt generation,
seeded randomness, static data (note tables).

**Must not:** import React, touch the DOM or `window`, read the clock, call
`Math.random`, or play sound. Those belong to hooks and sound.

## Shape

```ts
export function reduce(state: RoundState, event: Event): RoundState {
  switch (event.type) {
    case 'answer':
      return onAnswer(state, event.choice, event.now);
    // ...
  }
}
```

## Rules

- One exported `reduce(state, event)` plus pure selectors (`results(state)`).
- Every time-dependent rule takes `now` from the event.
- Randomness comes from a seeded generator stored in state.
- Types for the public contract live in one `types.ts` per engine.
- Per-Mode rules (lengths, what ends a Round) live in one module; code outside asks its selectors instead of comparing `mode`.

## Good examples

- `src/features/note-name-quiz/engine/round.ts` — `startRound`, `reduce`, `results`; one small handler per event.
- `src/features/note-name-quiz/engine/rng.ts` — mulberry32; the generator state lives in `RoundState.rngState`.
- `src/features/note-name-quiz/engine/types.ts` — the whole public contract in one file.
- `src/features/note-name-quiz/engine/modes.ts` — `MODE_LENGTHS`, `hasLength`, `isEndedByPlayer`; `Settings['len']` is derived from it.
