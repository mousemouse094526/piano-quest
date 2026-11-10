# Web Share API

**Kind:** browser API

**Version:** Web Share API (MDN, checked 2026-11-09)

**Docs:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API

## Best practices

- `navigator.share(data)` works only in a secure context, needs transient activation (call it inside the click, tap or keydown handler) and the `web-share` Permissions Policy — [Navigator.share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- At least one known property must be set; `{ text }` alone is enough. Unknown-only data, a bad `url` or unsupported files reject with a plain `TypeError` — [Navigator.share › Exceptions](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- Rejections by name: `AbortError` — the user closed the sheet or there is no share target, not a failure; `InvalidStateError` — another share is still open, or the document is not fully active; `NotAllowedError` — no activation or blocked by policy; `DataError` — the target failed to start or take the data — [Navigator.share › Exceptions](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- On Windows the promise resolves when the sheet opens; on Android once the data reached the target. Never read success as "the message was sent" — [Navigator.share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- Not Baseline: feature-detect `navigator.share` and keep a fallback. `navigator.canShare(data)` checks data before sharing, mostly for files — [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
- Activation: keydown (except `Esc` and browser shortcuts), `pointerup` and `touchend` grant it; MDN does not say whether `share` consumes it, so the project never chains another gated call (such as `clipboard.writeText`) after a failed share — [Transient activation](https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation), share-results D7
- **Avoid:** passing `url` next to `text` when the link is already in the text; some targets drop `text` when `url` is set (share-results spec › Share or copy).

## Testing

- `navigator.share` is a function the page can replace: stub it with `page.addInitScript` and record the data, so the iPhone project proves the call without a real sheet — `e2e/share-results.spec.ts`
- The `(pointer: coarse)` media query matches on the Playwright `iPhone 15` (WebKit, `hasTouch`) project with no stub: `pointer-coarse:hidden` hides the `Kbd` hints there (`e2e/play-round.spec.ts` › touch screen).

## Pattern

```ts
// src/features/note-name-quiz/hooks/shareOrCopy.ts (shape): the browser parts come in from outside, so Vitest drives every path.
await deps.share({ text });          // inside the press
// AbortError | InvalidStateError → 'dismissed'; anything else → 'failed', no copy after it
```

## Sources

- [Navigator.share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) (accessed 2026-11-09)
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) (accessed 2026-11-09)
- [Transient activation](https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation) (accessed 2026-11-09)
