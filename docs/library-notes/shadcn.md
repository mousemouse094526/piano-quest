# shadcn

**Kind:** library

**Version:** 4.23.0 (CLI). The components are copied into `src/components/ui/`.

**Docs:** https://ui.shadcn.com/llms.txt

## Best practices

- In an existing Vite app, set things up in this order — [Installation › Vite › Existing Project](https://ui.shadcn.com/docs/installation/vite#existing-vite-project):
  1. Install Tailwind.
  2. Add the `@/*` alias to the root `tsconfig.json`.
  3. Add the same alias to `tsconfig.app.json`.
  4. Add `resolve.alias` in `vite.config.ts`.
  5. Run `npx shadcn@latest init`.
- `init` installs dependencies, writes `components.json`, adds the `cn` util and writes CSS variables into the Tailwind CSS file — [CLI › init](https://ui.shadcn.com/docs/cli#init)
- Flags for a run with no prompts — [CLI › init](https://ui.shadcn.com/docs/cli#init):
  - `-t vite` sets the template.
  - `-b radix` sets the base: `radix`, `base` or `aria`.
  - `-p <preset>` sets the preset.
  - `-y` skips confirmation; it is on by default.
  - `--no-monorepo` and `--no-rtl` skip those prompts.
- Avoid `-d`: it means `--template=next --preset=nova`, the wrong template for Vite — [CLI › init](https://ui.shadcn.com/docs/cli#init)
- `add <name> -y` adds a component without a prompt. Use `--dry-run` or `--diff` to preview — [CLI › add](https://ui.shadcn.com/docs/cli#add)
- `style`, `tailwind.baseColor` and `tailwind.cssVariables` in `components.json` cannot change after init. For Tailwind v4, leave `tailwind.config` empty — [components.json](https://ui.shadcn.com/docs/components-json)
- **Avoid:** editing `aliases` in `components.json` without updating `paths` and `resolve.alias` too. The CLI uses them to write files and rewrite imports — [components.json › aliases](https://ui.shadcn.com/docs/components-json#aliases)

## Pattern

```sh
npx shadcn@4.23.0 init -t vite -b radix -p nova -y --no-monorepo --no-rtl
npx shadcn@4.23.0 add button -y
npx biome check --write src/components/ui src/lib components.json
```

Follows [CLI](https://ui.shadcn.com/docs/cli). Ran in a scratch copy of this stack (Vite 8, TS 7, Tailwind 4) on 2026-11-07, with these results:

- It wrote `components.json` with `style: radix-nova` and `iconLibrary: lucide`.
- It created `src/lib/utils.ts` and `src/components/ui/button.tsx`.
- It rewrote `src/index.css`.
- `tsc -b` and `vite build` passed afterwards.

## Traps

- The Vite guide says to add `"baseUrl": "."`. TypeScript 7 rejects that (`TS5102`). Use `paths` alone; `init` still passed "Validating import alias" with no `baseUrl` — [Installation › Vite](https://ui.shadcn.com/docs/installation/vite), [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
- `init` adds these runtime `dependencies` with caret ranges, observed locally:
  - `class-variance-authority`
  - `cn`, which replaces `clsx` plus `tailwind-merge`
  - `radix-ui`
  - `lucide-react`
  - `tw-animate-css`
  - `@fontsource-variable/geist`
  - `shadcn` itself, because the CSS imports `shadcn/tailwind.css`
  - Pin them exactly if the project pins versions — [Manual Installation](https://ui.shadcn.com/docs/installation/manual)
- `init` writes class-based dark mode (`@custom-variant dark (&:is(.dark *))` plus a `.dark {}` block). See [tailwindcss.md](tailwindcss.md) for switching it to `prefers-color-scheme` — [Dark Mode](https://ui.shadcn.com/docs/dark-mode)
- The Vite dark-mode `ThemeProvider` in the docs reads and writes `localStorage`, which ADR-0001 bans. Don't copy it — [Dark Mode › Vite](https://ui.shadcn.com/docs/dark-mode/vite)
- Generated files use double quotes and no semicolons. Run `biome check --write` after each `init` or `add`, or `biome ci` fails on format. Biome also flagged `lint/style/useImportType` in the generated `button.tsx`. Checked locally — [CLI › add](https://ui.shadcn.com/docs/cli#add)
- The Geist font comes in through `@fontsource-variable/geist` and ends up in `dist/assets` as `.woff2`. Geist is openly licensed (OFL), but check it against ADR-0006 before keeping it — [Manual Installation](https://ui.shadcn.com/docs/installation/manual)

## Sources

- [Installation › Vite](https://ui.shadcn.com/docs/installation/vite) — existing-project steps, alias setup (accessed 2026-11-07)
- [CLI](https://ui.shadcn.com/docs/cli) — `init` and `add` flags (accessed 2026-11-07)
- [components.json](https://ui.shadcn.com/docs/components-json) — fields fixed after init, aliases (accessed 2026-11-07)
- [Manual Installation](https://ui.shadcn.com/docs/installation/manual) — dependency list, `cn` util (accessed 2026-11-07)
- [Dark Mode › Vite](https://ui.shadcn.com/docs/dark-mode/vite) — theme provider uses `localStorage` (accessed 2026-11-07)
- [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html) — `baseUrl` removal (accessed 2026-11-07)
