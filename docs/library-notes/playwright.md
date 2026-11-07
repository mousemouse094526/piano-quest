# @playwright/test

**Kind:** library

**Version:** 1.65.0 (Chromium 158.0.8127.18, WebKit 27.2)

**Docs:** https://playwright.dev/docs/intro (no `llms.txt`; https://playwright.dev/llms.txt returns 404)

## Best practices

- Put one `projects` entry per browser and spread a device descriptor into `use`: `devices['Desktop Chrome']` (chromium, 1280×720, no touch) and `devices['iPhone 15']` (webkit, 393×659, `isMobile`, `hasTouch`). Overrides go after the spread — [Emulation › Devices](https://playwright.dev/docs/emulation#devices)
- iPhone names in 1.65 run `iPhone 11` … `iPhone 17`, with `Plus`, `Pro`, `Pro Max`, `16e`, `17e` and `landscape` variants. `iPhone 17` (402×681) is the newest; all of them use `defaultBrowserType: 'webkit'`. Checked in `playwright-core@1.65.0` `types/types.d.ts` — [Emulation](https://playwright.dev/docs/emulation)
- Start the app with `webServer` and test the production build: `command: 'npm run build && npm run preview'`, `url` pointing at the base path, `reuseExistingServer: !process.env.CI`. Raise `timeout` (default 60 s) because the build runs first — [Web server](https://playwright.dev/docs/test-webserver)
- Set `use.baseURL` with the base path and a trailing slash (`http://localhost:4173/piano-quest/`). `page.goto` and `toHaveURL` merge strings with `new URL(url, baseURL)` — [Web server › Adding a baseURL](https://playwright.dev/docs/test-webserver#adding-a-baseurl)
- Use the CI defaults from the generated config: `forbidOnly: !!process.env.CI`, `retries: process.env.CI ? 2 : 0`, `workers: process.env.CI ? 1 : undefined`, `trace: 'on-first-retry'` — [Test configuration](https://playwright.dev/docs/test-configuration)
- Use `reporter: process.env.CI ? 'github' : 'html'` or keep `'html'` and upload `playwright-report/` as an artifact with `if: ${{ !cancelled() }}` — [Reporters](https://playwright.dev/docs/test-reporters), [CI › GitHub Actions](https://playwright.dev/docs/ci-intro)
- In GitHub Actions, run `npx playwright install --with-deps chromium webkit` after `npm ci`. `--with-deps` installs the Linux libraries; naming browsers skips Firefox — [Browsers › Install system dependencies](https://playwright.dev/docs/browsers#install-system-dependencies), [CI](https://playwright.dev/docs/ci)
- Assert with awaited web-first assertions (`toHaveText`, `toHaveURL`, `toBeVisible`, `toHaveCount`). They retry until the 5 s `expect` timeout. Use `expect.poll` for values read with `page.evaluate` — [Assertions](https://playwright.dev/docs/test-assertions)
- `keyboard.press(key)` is `down` then `up`. To hold a key, call `keyboard.down(key)`; each further `down` of the same key fires `keydown` with `repeat: true`; release with `keyboard.up(key)` — [Keyboard](https://playwright.dev/docs/api/class-keyboard)
- Use `locator.tap()` for touch flows. It needs `hasTouch: true` in the context, which every iPhone descriptor sets — [Locator › tap](https://playwright.dev/docs/api/class-locator#locator-tap)
- Collect errors with `page.on('pageerror', (e) => ...)` and `page.on('console', (msg) => msg.type() === 'error' && ...)`, attached before `goto`. Since 1.56, `page.consoleMessages()` and `page.pageErrors()` return the last 200 entries — [Page › events](https://playwright.dev/docs/api/class-page#page-event-console), [page.pageErrors](https://playwright.dev/docs/api/class-page#page-page-errors)
- Read storage in the page: `page.evaluate(() => ({ ...localStorage }))` and the same for `sessionStorage`. Read cookies with `context.cookies()`. `context.storageState()` covers cookies, localStorage and (with `indexedDB: true`) IndexedDB, but not sessionStorage — [BrowserContext › cookies](https://playwright.dev/docs/api/class-browsercontext#browser-context-cookies), [storageState](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state)
- **Avoid:** `waitForTimeout` and non-retrying `expect(await locator.textContent())` checks for page state; they make tests flaky — [Assertions](https://playwright.dev/docs/test-assertions)
- **Avoid:** `port` in `webServer`; it is deprecated in favour of `url` — [Web server](https://playwright.dev/docs/test-webserver)

## Pattern

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

const BASE = 'http://localhost:4173/piano-quest/';

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: { baseURL: BASE, trace: 'on-first-retry' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'iphone', use: { ...devices['iPhone 15'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

```ts
// e2e/count-round.spec.ts
import { expect, test } from '@playwright/test';

test('count 10 opens from the URL with no errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('./#/?mode=count&len=10');
  await expect(page).toHaveURL(/#\/\?mode=count&len=10$/);
  await page.keyboard.down('KeyC');
  await page.keyboard.down('KeyC'); // repeat: true, must not answer twice
  await page.keyboard.up('KeyC');
  const stored = await page.evaluate(() => ({ ...localStorage }));
  expect(stored).toEqual({});
  expect(errors).toEqual([]);
});
```

Follows [Test configuration](https://playwright.dev/docs/test-configuration) and [Web server](https://playwright.dev/docs/test-webserver).

## Traps

- A leading slash drops the base path: `page.goto('/#/?mode=count')` opens `http://localhost:4173/#/...`, not `/piano-quest/`. Use `'./#/?...'` or `'#/?...'`. A `baseURL` with no trailing slash (`.../piano-quest`) also drops it for `./` paths. Checked with `new URL()` in Node — [Web server › Adding a baseURL](https://playwright.dev/docs/test-webserver#adding-a-baseurl)
- `webServer.url` counts as ready only on 2xx, 3xx, 400, 401, 402 or 403. Point it at the base path (`/piano-quest/`), not `/`, which `vite preview` may answer with 404 — [Web server](https://playwright.dev/docs/test-webserver)
- `vite preview` serves on port 4173 by default and moves to the next free port if 4173 is busy, so a stale local server can break `url`. `reuseExistingServer` locally avoids a second one — [Vite › preview.port](https://vite.dev/config/preview-options#preview-port)
- `toHaveURL` with a string must match the whole URL, including query and hash. Use a RegExp for the hash route — [PageAssertions › toHaveURL](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-url)
- `keyboard.down` does not auto-repeat like an OS. Repeat only comes from calling `down` again before `up` — [Keyboard › down](https://playwright.dev/docs/api/class-keyboard#keyboard-down)
- `'a'` and `'KeyA'` differ: a single character is case-sensitive and generates text; `KeyA` is the physical key. Match what the app reads (`event.key` vs `event.code`) — [Keyboard › press](https://playwright.dev/docs/api/class-keyboard#keyboard-press)
- `locator.tap()` on `Desktop Chrome` fails because that descriptor has `hasTouch: false`. Branch on `test.info().project.name` or use `click()` there — [Locator › tap](https://playwright.dev/docs/api/class-locator#locator-tap)
- Web Audio on Playwright's Linux WebKit is not guaranteed. Playwright's own audio tests mark WebKit `fixme` off macOS, a new `AudioContext` starts `suspended` without a gesture, and Windows WebKit has no Web Audio at all. Do not assert on sound in e2e; assert the UI and that no `pageerror` fires. Not verified on a Linux runner — [Browsers › WebKit](https://playwright.dev/docs/browsers#webkit), [issue #14105](https://github.com/microsoft/playwright/issues/14105), [PR #33734](https://github.com/microsoft/playwright/pull/33734)
- 1.65 drops Node 20 from testing; use Node 22, 24 or 26 — [Release notes › 1.65](https://playwright.dev/docs/release-notes)
- 1.65: actions wait for elements to be not `inert` and time out if they stay inert (for example behind an open dialog) — [Release notes › 1.65](https://playwright.dev/docs/release-notes)
- 1.64: device descriptors now forward `screen`. Set `screen: undefined` after the spread to opt out — [Release notes › 1.64](https://playwright.dev/docs/release-notes)
- Vitest's default `include` also matches `e2e/*.spec.ts`; keep Vitest on `src/**/*.test.ts` (see [vitest.md](vitest.md))
- Add `test-results/`, `playwright-report/`, `blob-report/` and `playwright/.cache/` to `.gitignore` — [CI](https://playwright.dev/docs/ci)

## Sources

- [Test configuration](https://playwright.dev/docs/test-configuration) — generated config, CI options (accessed 2026-11-07)
- [Web server](https://playwright.dev/docs/test-webserver) — `webServer` options, `baseURL` merge (accessed 2026-11-07)
- [Emulation](https://playwright.dev/docs/emulation) — devices in projects (accessed 2026-11-07)
- [Continuous Integration](https://playwright.dev/docs/ci) — GitHub Actions workflow, workers (accessed 2026-11-07)
- [Browsers](https://playwright.dev/docs/browsers) — install commands, WebKit on Linux (accessed 2026-11-07)
- [Keyboard](https://playwright.dev/docs/api/class-keyboard), [Locator](https://playwright.dev/docs/api/class-locator), [Page](https://playwright.dev/docs/api/class-page), [BrowserContext](https://playwright.dev/docs/api/class-browsercontext), [PageAssertions](https://playwright.dev/docs/api/class-pageassertions) — API details (accessed 2026-11-07)
- [Assertions](https://playwright.dev/docs/test-assertions) — web-first assertions, `expect.poll` (accessed 2026-11-07)
- [Release notes](https://playwright.dev/docs/release-notes) — 1.60 to 1.65 changes (accessed 2026-11-07)
- `playwright-core@1.65.0` npm tarball — device names and descriptors, `browsers.json` (accessed 2026-11-07)
