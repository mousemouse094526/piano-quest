# tailwindcss

**Kind:** library

**Version:** 4.3.5 with `@tailwindcss/vite` 4.3.5

**Docs:** https://tailwindcss.com/docs (no `llms.txt`)

## Best practices

- Vite install takes three steps — [Installation › Using Vite](https://tailwindcss.com/docs/installation/using-vite):
  1. `npm install tailwindcss @tailwindcss/vite`.
  2. Add `tailwindcss()` to `plugins` in `vite.config.ts`.
  3. Write `@import "tailwindcss";` in the CSS entry.
- v4 needs no `tailwind.config.js`. Theme tokens go in CSS with `@theme` — [Installation › Using Vite](https://tailwindcss.com/docs/installation/using-vite)
- `dark:` follows `prefers-color-scheme` by default, with no setup — [Dark mode](https://tailwindcss.com/docs/dark-mode)
- `pointer-coarse:` / `pointer-fine:` (and `any-pointer-*`) style by the primary pointer; checked in the build: `pointer-coarse:hidden` → `@media (pointer:coarse)`. Playwright's `iPhone 15` (WebKit) matches it, `Desktop Chrome` does not — [Hover, focus, and other states › pointer and any-pointer](https://tailwindcss.com/docs/hover-focus-and-other-states)
- `group-has-[...]` styles by a group's descendants, and named groups (`group/{name}`) work with it: `group-has-[nav:focus-within]/quiz:hidden` compiles to `.group\/quiz:has(nav:focus-within) …`, checked in the build — [Hover, focus, and other states › Styling based on the descendants of a group](https://tailwindcss.com/docs/hover-focus-and-other-states)
- To switch dark mode to a class or attribute, override the variant with `@custom-variant dark (&:where(.dark, .dark *));` — [Dark mode › Toggling dark mode manually](https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually)
- Tailwind scans every project file as plain text. It skips `.gitignore`d files, `node_modules`, binaries, CSS and lockfiles. Use `@source` to add or exclude paths — [Detecting classes in source files](https://tailwindcss.com/docs/detecting-classes-in-source-files)
- **Avoid:** building class names from pieces (`` `bg-${color}-600` ``). Map each value to a full class string instead — [Detecting classes › Dynamic class names](https://tailwindcss.com/docs/detecting-classes-in-source-files#dynamic-class-names)

## Pattern

```css
/* src/index.css — dark follows the OS, no class toggle */
@import "tailwindcss";

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
  }
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

```tsx
const verdictClass = { correct: 'text-green-700 dark:text-green-400', wrong: 'text-red-700 dark:text-red-400' } as const;
```

Follows [Dark mode](https://tailwindcss.com/docs/dark-mode) and [Detecting classes › Dynamic class names](https://tailwindcss.com/docs/detecting-classes-in-source-files#dynamic-class-names).

## Traps

- `shadcn init` writes `@custom-variant dark (&:is(.dark *));` and a `.dark { ... }` token block. With that line, `dark:` no longer follows the OS, and nothing adds `.dark` to the page. Remove the line and move the tokens under `@media (prefers-color-scheme: dark) { :root { ... } }`. Checked with a local `shadcn@4.23.0 init` — [Dark mode](https://tailwindcss.com/docs/dark-mode)
- The Tailwind manual-toggle example and the shadcn Vite theme provider save the choice in `localStorage`. ADR-0001 bans that, so keep OS-driven dark mode — [Dark mode](https://tailwindcss.com/docs/dark-mode), [shadcn Dark Mode › Vite](https://ui.shadcn.com/docs/dark-mode/vite)
- Biome rejects `@theme`, `@custom-variant` and `@source` unless `css.parser.tailwindDirectives` is `true`. Without it, `biome ci` fails with "Tailwind-specific syntax is disabled" — [Biome configuration › css.parser.tailwindDirectives](https://biomejs.dev/reference/configuration/#cssparsertailwinddirectives)

## Sources

- [Installation › Using Vite](https://tailwindcss.com/docs/installation/using-vite) — packages, plugin, CSS import (accessed 2026-11-07)
- [Dark mode](https://tailwindcss.com/docs/dark-mode) — `prefers-color-scheme` default, `@custom-variant` (accessed 2026-11-07)
- [Detecting classes in source files](https://tailwindcss.com/docs/detecting-classes-in-source-files) — scanning rules, dynamic class names, `@source` (accessed 2026-11-07)
- [Biome configuration](https://biomejs.dev/reference/configuration/) — `css.parser.tailwindDirectives` (accessed 2026-11-07)
