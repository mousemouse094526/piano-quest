# Testing

**Owns:** proving behaviour — engine unit tests and e2e user flows.

**Must not:** test engine rules through the UI, or use real timers in unit
tests.

## Shape

```ts
test('count 10, all correct → finished, accuracy 100', () => {
  let s = reduce(init, { type: 'start', settings, seed: 1 });
  // answer 10 times with explicit `now`
  expect(results(s).accuracy).toBe(100);
});
```

## Rules

- Unit: Vitest, `*.test.ts` next to the engine file it tests — or next to any other pure
  function that takes its browser parts as arguments (`components/shareText.ts`,
  `src/lib/shareOrCopy.ts`).
- e2e: Playwright in `e2e/`, projects Chromium desktop and WebKit `iPhone`;
  `webServer` runs the production build with `vite preview`.
- Lint and format: Biome; CI runs `biome ci .`.
- CI order: `biome ci .` → typecheck → `vitest run` → Playwright → build.

## Good examples

- `src/features/note-name-quiz/engine/round.test.ts` — one `describe` per Mode, explicit `now` and `seed`, small helpers that pick the right or wrong `Choice`.
- `.github/workflows/ci.yml` — one `check` job (Biome, typecheck, Vitest, build) for pushes and PRs; `deploy` only on push to `main`.
- Biome checks code only; Markdown is excluded (D24).
- `src/no-player-data.test.ts` — app-wide guard for ADR-0001; app-wide rule tests sit at `src/` root.
- `e2e/play-round.spec.ts` — one test per Seam 2 bullet; keys only through `page.keyboard`; waits for the Prompt before the first key; reads the right Answer from the Prompt text and the engine's `NOTES`.
- `e2e/keymap.spec.ts` — the Keymap flow (URL and Keymap dialog) in its own file, one file per user flow; shared helpers (`readPrompt`, `answerButtons`, `expectNoSidewaysScroll`) live in `e2e/quiz.ts`.
- `e2e/copy-link.spec.ts`, `e2e/share-results.spec.ts` — `stubShare` (`e2e/quiz.ts`) replaces `navigator.clipboard` and `navigator.share` with `addInitScript` so both projects read what left the page (WebKit cannot grant clipboard permissions).
- `src/lib/shareOrCopy.test.ts` — browser parts passed in as `vi.fn` fakes that reject with named `DOMException`s, one test per path.
- `playwright.config.ts` — own port (4317), always a fresh build, never reuse a running server (D28).
- `src/features/note-name-quiz/sound/notePlayer.test.ts` — a fake `AudioContext` via a factory argument; failure paths must not throw.
