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

- Unit: Vitest, `*.test.ts` next to the engine file it tests.
- e2e: Playwright in `e2e/`, projects Chromium desktop and WebKit `iPhone`;
  `webServer` runs the production build with `vite preview`.
- Lint and format: Biome; CI runs `biome ci .`.
- CI order: `biome ci .` → typecheck → `vitest run` → Playwright → build.

## Good examples

- None yet — the first ticket that touches this layer sets it.
