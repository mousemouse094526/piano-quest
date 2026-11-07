# @biomejs/biome

**Kind:** library

**Version:** 2.6.6

**Docs:** https://biomejs.dev/ (no `llms.txt`)

## Best practices

- Install the exact version with `npm i -D -E @biomejs/biome`, so the editor and CI agree, then run `npx biome init` — [Getting Started](https://biomejs.dev/guides/getting-started/)
- `biome init` writes a `biome.json` with these settings — [Getting Started](https://biomejs.dev/guides/getting-started/):
  - `$schema` pinned to 2.6.6.
  - `vcs.enabled: false`.
  - The formatter on, with tabs.
  - `linter.rules.preset: "recommended"`.
  - `javascript.formatter.quoteStyle: "double"`.
  - `assist.actions.source.organizeImports: "on"`.
- `biome check --write` applies formatting, safe lint fixes and import sorting. Use it locally — [Getting Started](https://biomejs.dev/guides/getting-started/)
- `biome ci .` runs the formatter check, the linter and the assist actions without writing anything — [CLI › biome ci](https://biomejs.dev/reference/cli/#biome-ci)
  - It fails when files are not formatted, imports are not sorted, or a rule reports an error. `--enforce-assist` defaults to `true`.
  - On GitHub Actions it prints diagnostics as annotations — [Continuous Integration](https://biomejs.dev/recipes/continuous-integration/)
- Formatter defaults — [Configuration](https://biomejs.dev/reference/configuration/):
  - `indentStyle: "tab"`
  - `indentWidth: 2`
  - `lineWidth: 80`
  - `lineEnding: "lf"`
  - JS uses `quoteStyle: "double"`, `semicolons: "always"` and `trailingCommas: "all"`.
- Ignore build output with `files.includes: ["**", "!!**/dist"]`. A leading `!!` force-ignores, so the scanner never indexes the path — [Configuration › files.includes](https://biomejs.dev/reference/configuration/#filesincludes)
- `vcs.enabled` plus `vcs.useIgnoreFile` makes Biome respect `.gitignore` — [Configuration › vcs](https://biomejs.dev/reference/configuration/#vcs)
- **Avoid:** `linter.rules.recommended`, which is deprecated. Use `linter.rules.preset`, or run `biome migrate` to update old configs — [Configuration › linter.rules](https://biomejs.dev/reference/configuration/)

## Pattern

```json
{
  "$schema": "https://biomejs.dev/schemas/2.6.6/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": { "ignoreUnknown": false, "includes": ["**", "!!**/dist"] },
  "formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 2 },
  "linter": { "enabled": true, "rules": { "preset": "recommended" } },
  "javascript": { "formatter": { "quoteStyle": "single" } },
  "css": { "parser": { "tailwindDirectives": true } },
  "assist": { "enabled": true, "actions": { "source": { "organizeImports": "on" } } }
}
```

Single quotes and spaces match the code samples in `.claude/skills/vite-react-web`, which is a project choice. Every key was checked against `biome ci .` 2.6.6 in a scratch project: `dist/` was skipped and Tailwind CSS parsed. Follows [Configuration](https://biomejs.dev/reference/configuration/).

## Traps

- Biome 1 keys are gone. The v2 `init` output uses `files.includes` (not `files.ignore` or `files.include`), `assist.actions.source.organizeImports` (not a top-level `organizeImports`) and `linter.rules.preset`. Run `biome migrate` on any copied v1 config — [Configuration](https://biomejs.dev/reference/configuration/)
- Tailwind v4 CSS (`@theme`, `@custom-variant`, `@source`) is a parse error unless `css.parser.tailwindDirectives: true` is set. `biome ci` then fails with "Tailwind-specific syntax is disabled". Checked locally — [Configuration › css.parser.tailwindDirectives](https://biomejs.dev/reference/configuration/#cssparsertailwinddirectives)
- Biome also formats and lints JSON, including `package.json`, `tsconfig*.json` and `components.json`. Files written by npm, TS or shadcn fail `biome ci` until you run `biome check --write` once. Checked locally — [CLI › biome ci](https://biomejs.dev/reference/cli/#biome-ci)
- Files that shadcn generates fail format, and `button.tsx` hits [`lint/style/useImportType`](https://biomejs.dev/linter/rules/use-import-type/). Run `biome check --write` after each `shadcn add`. Checked locally — [shadcn.md](shadcn.md)
- The Vite template line `document.getElementById('root')!` triggers `lint/style/noNonNullAssertion`. Check for null and throw instead. Checked locally — [noNonNullAssertion](https://biomejs.dev/linter/rules/no-non-null-assertion/)
- `--changed` fails unless `vcs.defaultBranch` or `--since` is set — [CLI › biome ci](https://biomejs.dev/reference/cli/#biome-ci)
- The CI recipe installs Biome with `biomejs/setup-biome` at `version: latest`. Run `npx biome ci .` after `npm ci` instead, so CI uses the pinned version — [Continuous Integration](https://biomejs.dev/recipes/continuous-integration/)

## Sources

- [Getting Started](https://biomejs.dev/guides/getting-started/) — install, `init` output, `check --write` (accessed 2026-11-07)
- [Configuration](https://biomejs.dev/reference/configuration/) — `files.includes`, `vcs`, formatter defaults, `linter.rules.preset`, `css.parser.tailwindDirectives` (accessed 2026-11-07)
- [CLI](https://biomejs.dev/reference/cli/) — `biome ci` checks and flags (accessed 2026-11-07)
- [Continuous Integration](https://biomejs.dev/recipes/continuous-integration/) — GitHub annotations, setup action (accessed 2026-11-07)
- [noNonNullAssertion](https://biomejs.dev/linter/rules/no-non-null-assertion/) and [useImportType](https://biomejs.dev/linter/rules/use-import-type/) — rules seen in local runs (accessed 2026-11-07)
