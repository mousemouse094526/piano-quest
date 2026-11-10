# Radix Dialog

**Kind:** library

**Version:** `radix-ui` 1.8.1 (`@radix-ui/react-dialog` 1.3.1), through shadcn's `src/components/ui/dialog.tsx`

**Docs:** https://www.radix-ui.com/primitives/docs/components/dialog

## Best practices

- Controlled: `open` with `onOpenChange`. `Dialog.Trigger` keeps `aria-haspopup`, `aria-expanded` and `aria-controls` on the button that opens it — [Dialog › API Reference › Root, Trigger](https://www.radix-ui.com/primitives/docs/components/dialog#api-reference)
- Give every Dialog a `Dialog.Title`; `Dialog.Description` is announced with it. Without a Description, pass `aria-describedby={undefined}` to Content to silence the warning — [Dialog › Accessibility](https://www.radix-ui.com/primitives/docs/components/dialog#accessibility)
- Modal by default: focus is trapped in Content, the rest of the page is `aria-hidden` and gets no pointer events — [Dialog › Root `modal`](https://www.radix-ui.com/primitives/docs/components/dialog#root)
- Content props to steer the built-in behaviour, each cancellable with `event.preventDefault()` — [Dialog › Content](https://www.radix-ui.com/primitives/docs/components/dialog#content):
  - `onOpenAutoFocus` — focus on open (default: the first tabbable element in Content);
  - `onCloseAutoFocus` — focus on close (default: back to the Trigger);
  - `onEscapeKeyDown` — `Esc` closes unless prevented;
  - `onPointerDownOutside`, `onInteractOutside` — a click outside closes unless prevented.
- Keyboard: `Tab`/`Shift+Tab` cycle inside Content, `Esc` closes — [Dialog › Keyboard Interactions](https://www.radix-ui.com/primitives/docs/components/dialog#keyboard-interactions)

## Pattern

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="ปุ่มลัด">
      <Keyboard aria-hidden="true" />
    </Button>
  </DialogTrigger>
  <DialogContent
    onEscapeKeyDown={(e) => { if (waiting) { e.preventDefault(); stopWaiting(); } }}
    onCloseAutoFocus={(e) => { e.preventDefault(); gameArea.current?.focus(); }}
  >
    <DialogTitle>ปุ่มลัด</DialogTitle>
  </DialogContent>
</Dialog>
```

## Traps

Read from the installed source (`node_modules/@radix-ui/react-dismissable-layer`, `react-dialog`) on 2026-11-09:

- `Esc` is caught by a `keydown` listener on `document` in the **capture** phase. It calls `onEscapeKeyDown` first; if that didn't prevent, it calls `event.preventDefault()` and closes. So by the time a `window` listener (bubble) sees that `Esc`, the Dialog has already asked to close and `event.defaultPrevented` is true — a `window` listener must check `defaultPrevented` or it acts on the same key.
- `onCloseAutoFocus` runs the prop handler first; when it calls `preventDefault`, Radix skips its own move back to the Trigger.
- Content renders in a portal (`document.body`), but React events still bubble through the **React** tree: a `onMouseDown` on an ancestor of `<Dialog>` (e.g. the Mode bar `<nav>`) sees clicks inside Content. Stop them on Content when that ancestor prevents focus moves.
- `keydown` inside Content reaches a React `onKeyDown` on Content before it bubbles to `window`, so `preventDefault` there is visible to `window` listeners.
- shadcn's `DialogContent` adds a close button with an English `sr-only` "Close"; this project changes it to Thai (ADR-0006, our own wording).

## Sources

- [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) — API, keyboard interactions, accessibility (accessed 2026-11-09)
- Installed source of `@radix-ui/react-dismissable-layer` and `@radix-ui/react-dialog` 1.3.1 (read 2026-11-09)
