# Clipboard API

**Kind:** browser API

**Version:** Clipboard API (MDN, checked 2026-11-09)

**Docs:** https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API

## Best practices

- `navigator.clipboard.writeText(text)` works only in a secure context (HTTPS, or `localhost`) — [Clipboard.writeText › Security considerations](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)
- Call it inside the click handler. Safari and Firefox allow a write only with transient activation (a user gesture); Chromium allows it with a gesture or the `clipboard-write` permission — [Clipboard API › Security considerations](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- It returns a Promise that rejects with a `NotAllowedError` `DOMException` when the write is refused. Catch it and say so on screen — [Clipboard.writeText › Exceptions](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)
- Baseline widely available since March 2020 — [Clipboard.writeText](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)
- **Avoid:** `document.execCommand('copy')`; it is deprecated — [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)

## Testing

- Firefox and Safari do not support the `clipboard-read` / `clipboard-write` permissions, so Playwright WebKit cannot read the clipboard back. Stub `navigator.clipboard` with `addInitScript` to read what was copied on every project — `e2e/copy-link.spec.ts`
- Headless Chromium without `permissions: ['clipboard-read', 'clipboard-write']` may refuse the write. Checked by hand with the permissions: the real write gives the full `location.href`.

## Pattern

```tsx
// src/features/note-name-quiz/components/CopyLinkButton.tsx (shape)
navigator.clipboard
  .writeText(window.location.href)
  .then(() => setCopied('copied'))
  .catch(() => setCopied('failed'));
```

## Sources

- [Clipboard.writeText](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) (accessed 2026-11-09)
- [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) (accessed 2026-11-09)
