# vitest

**Kind:** library

**Version:** 5.1.0

**Docs:** https://vitest.dev/llms.txt

## Best practices

- Vitest reads `vite.config.ts` by default, so plugins and `resolve.alias` apply to tests. Put test options under `test` and add `/// <reference types="vitest/config" />` at the top — [Configuring Vitest](https://vitest.dev/config/)
- A separate `vitest.config.ts` replaces `vite.config.ts` entirely; Vite options there are ignored. To reuse them, use `mergeConfig(viteConfig, defineConfig({ test }))` — [Configuring Vitest](https://vitest.dev/config/)
- Use `vitest run` in scripts and CI. Plain `vitest` is watch mode; it falls back to run mode only in CI or without a TTY — [CLI › vitest run](https://vitest.dev/guide/cli#vitest-run)
- `environment` defaults to `'node'`, which suits a pure engine. Switch one file with a `@vitest-environment jsdom` docblock — [environment](https://vitest.dev/config/environment)
- The default `include` is `**/*.{test,spec}.?(c|m)[jt]s?(x)` — [include](https://vitest.dev/config/include)
- Import `test`, `expect` and `vi` from `vitest`. `globals` is off by default — [Getting Started](https://vitest.dev/guide/)
- **Avoid:** importing from entry points removed in 5.0: `vitest/coverage`, `vitest/reporters`, `vitest/environments`, `vitest/snapshot`, `vitest/runners`, `vitest/suite`, `vitest/mocker` — [Migration › Removed Deprecated Entrypoints](https://vitest.dev/guide/migration#removed-deprecated-entrypoints)

## Pattern

```ts
// src/features/note-name-quiz/engine/reduce.test.ts
import { describe, expect, test } from 'vitest';
import { initialState, reduce, results } from './reduce';

describe('time mode', () => {
  test('answer after 30 s is ignored, round finishes', () => {
    let s = reduce(initialState, { type: 'start', settings: { mode: 'time', seconds: 30 }, seed: 1, now: 0 });
    s = reduce(s, { type: 'tick', now: 30_000 });
    expect(results(s).finished).toBe(true);
  });
});
```

Config lives in `vite.config.ts` under `test: { environment: 'node', include: ['src/**/*.test.ts'] }` (see [vite.md](vite.md)). Follows [Configuring Vitest](https://vitest.dev/config/).

## Traps

- Needs Node `^22.12.0 || ^24.0.0 || >=26.0.0` and Vite `>=6.4`. Node 20 is not supported, so CI must use Node 22.12+ — [Migration › Prerequisites](https://vitest.dev/guide/migration#vitest-5)
- The default `include` matches `*.spec.ts`, so Playwright files in `e2e/` get run by Vitest and fail on `@playwright/test`. Set `include: ['src/**/*.test.ts']` or add `e2e/**` to `exclude`. Checked locally with 5.1.0 — [include](https://vitest.dev/config/include)
- The default `exclude` is only `**/node_modules/**` and `**/.git/**`. `dist` is not excluded — [exclude](https://vitest.dev/config/exclude)
- `clearMocks` now defaults to `true`, so mock call history resets before each test — [Migration › clearMocks](https://vitest.dev/guide/migration#clearmocks-is-enabled-by-default)
- An async assertion that is not awaited (`expect(p).resolves...`) now fails the test instead of warning — [Migration › Unawaited Asynchronous Assertions](https://vitest.dev/guide/migration#unawaited-asynchronous-assertions-fail-the-test)
- `-t` now matches the full name joined by `' > '` (`-t 'time mode > answer'`) — [Migration › testNamePattern](https://vitest.dev/guide/migration#testnamepattern-matches-the-joined-full-name)
- Reports and artifacts go to `.vitest/`; add it to `.gitignore`. The `json` and `junit` reporters now write files instead of printing to stdout — [Migration › .vitest Directory](https://vitest.dev/guide/migration#generated-reports-and-artifacts-use-the-vitest-directory)
- Vitest no longer looks for config files in parent folders. Run it from the repo root — [Migration › Config Files](https://vitest.dev/guide/migration#config-files-are-not-looked-up-from-parent-directories)
- `test.sequential` and `describe.sequential` were removed — [Migration › Removed test.sequential](https://vitest.dev/guide/migration#removed-test-sequential-describe-sequential-and-sequential-options)

## Sources

- [Migrating to Vitest 5.0](https://vitest.dev/guide/migration) — prerequisites and breaking changes (accessed 2026-11-07)
- [Configuring Vitest](https://vitest.dev/config/) — sharing `vite.config.ts`, `vitest/config` types (accessed 2026-11-07)
- [CLI](https://vitest.dev/guide/cli) — `vitest run` vs watch (accessed 2026-11-07)
- [environment](https://vitest.dev/config/environment) — `node` default, per-file docblock (accessed 2026-11-07)
- [include](https://vitest.dev/config/include) and [exclude](https://vitest.dev/config/exclude) — default globs (accessed 2026-11-07)
- [Getting Started](https://vitest.dev/guide/) — install, imports (accessed 2026-11-07)
