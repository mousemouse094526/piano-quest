# react

**Kind:** library

**Version:** 19.3.1

**Docs:** https://react.dev/llms.txt

## Best practices

- Keep reducers pure. They take `(state, action)`, return the next state, and never mutate it — [useReducer › Parameters](https://react.dev/reference/react/useReducer#parameters)
- Put inputs that are impure — current time, a random seed — into the action from the event handler or hook. The reducer must never read them itself — [useReducer › Writing the reducer function](https://react.dev/reference/react/useReducer#writing-the-reducer-function)
- Pass an initializer function (`useReducer(reduce, arg, init)`) so that heavy initial state is built once, not on every render — [useReducer › Avoiding recreating the initial state](https://react.dev/reference/react/useReducer#avoiding-recreating-the-initial-state)
- `dispatch` does not change `state` in the running code. To use the next value right away, call the reducer yourself — [useReducer › Troubleshooting](https://react.dev/reference/react/useReducer#ive-dispatched-an-action-but-logging-gives-me-the-old-state-value)
- Use an Effect only to sync with an outside system, such as a `window` listener or a timer. Derived values are computed during render — [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- Every subscribing Effect returns a cleanup that undoes the setup exactly (`addEventListener` paired with `removeEventListener`) — [useEffect › Connecting to an external system](https://react.dev/reference/react/useEffect#connecting-to-an-external-system)
- Logic fired from an Effect that must read the latest state without re-subscribing goes in `useEffectEvent` — [useEffectEvent](https://react.dev/reference/react/useEffectEvent)
- Pass the updater form (`c => c + 1`) so an Effect doesn't need the state as a dependency — [useEffect › Updating state based on previous state](https://react.dev/reference/react/useEffect#updating-state-based-on-previous-state-from-an-effect)
- **Avoid:** mutating state objects or arrays inside a reducer. The screen will not update — [useReducer › Troubleshooting](https://react.dev/reference/react/useReducer#ive-dispatched-an-action-but-the-screen-doesnt-update)
- **Avoid:** using `useEffectEvent` just to dodge the dependency list. Do not put the function it returns in a dependency array either; its identity changes on every render — [useEffectEvent › Caveats](https://react.dev/reference/react/useEffectEvent#caveats)

## Pattern

```tsx
// src/features/note-name-quiz/hooks/use-answer-keys.ts
import { useEffect, useEffectEvent } from 'react';

export function useAnswerKeys(onKey: (code: string, now: number) => void) {
  const handle = useEffectEvent((e: KeyboardEvent) => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    onKey(e.code, performance.now());
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => handle(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
}
```

Follows [useEffect](https://react.dev/reference/react/useEffect) and [useEffectEvent](https://react.dev/reference/react/useEffectEvent).

## Traps

- In development, `<StrictMode>` calls reducers and initializers twice and keeps one result. A reducer that calls `Math.random()` or `Date.now()` then gives results that differ between the two runs — [useReducer › Caveats](https://react.dev/reference/react/useReducer#caveats), [StrictMode](https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-double-rendering-in-development)
- In development, StrictMode runs one extra setup and cleanup for each Effect, even with `[]` deps. A listener with no cleanup is attached twice, so one key press counts as two answers — [useEffect › Caveats](https://react.dev/reference/react/useEffect#caveats)
- StrictMode also runs ref callbacks twice in development — [StrictMode](https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-re-running-ref-callbacks-in-development)
- Every StrictMode check runs only in development. A bug that shows only in `npm run dev` is still a real bug — [StrictMode](https://react.dev/reference/react/StrictMode)
- The `useEffectEvent` call-site rules are enforced by `eslint-plugin-react-hooks`, which this project does not run. Biome must catch misuse, or review must — [useEffectEvent › Caveats](https://react.dev/reference/react/useEffectEvent#caveats)

## Sources

- [useReducer](https://react.dev/reference/react/useReducer) — pure reducers, initializer, StrictMode double call (accessed 2026-11-07)
- [useEffect](https://react.dev/reference/react/useEffect) — setup/cleanup, window listeners, dev double run (accessed 2026-11-07)
- [useEffectEvent](https://react.dev/reference/react/useEffectEvent) — reading latest values from an Effect, caveats (accessed 2026-11-07)
- [StrictMode](https://react.dev/reference/react/StrictMode) — development-only checks (accessed 2026-11-07)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) — when not to use Effects (accessed 2026-11-07)
