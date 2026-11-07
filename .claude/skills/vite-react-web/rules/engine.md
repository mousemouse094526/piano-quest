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

## Good examples

- None yet — the first ticket that touches this layer sets it.
