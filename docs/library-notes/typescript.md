# typescript

**Kind:** language

**Version:** 7.0.2 (native Go compiler, binary `tsc`), `strict: true`, `noEmit`, `moduleResolution: bundler`, `verbatimModuleSyntax`, `erasableSyntaxOnly`

**Docs:** https://www.typescriptlang.org/docs/ (no `llms.txt`)

## Best practices

- TS 7 is the native port of the compiler. The npm package `typescript@7.0.2` still ships the binary as `tsc`, not `tsgo`. `tsc -b`, `tsc -p` and `tsc --noEmit` all work — [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- Defaults changed in 6.0 and carried into 7.0:
  - `strict` is `true`.
  - `module` is `esnext`.
  - `types` is `[]`.
  - `rootDir` is the folder that holds the tsconfig.
  - `noUncheckedSideEffectImports` is `true`.
  - Source: [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
- List global types by hand. The app config needs `"types": ["vite/client"]` and the Node-side config (`vite.config.ts`) needs `"types": ["node"]` — [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [Vite features › Client Types](https://vite.dev/guide/features.html#client-types)
- Use `moduleResolution: "bundler"` with `module: "esnext"` for a Vite app — [TSConfig › moduleResolution](https://www.typescriptlang.org/tsconfig/#moduleResolution)
- Turn on `verbatimModuleSyntax` so imports used only as types must be written `import type`. Vite's Oxc transform compiles one file at a time and cannot see types — [TSConfig › verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax), [Vite features › isolatedModules](https://vite.dev/guide/features.html#isolatedmodules)
- Turn on `erasableSyntaxOnly`. It rejects syntax that emits runtime code: `enum`, `namespace` with values, and constructor parameter properties. Use string-literal unions and plain objects instead — [TSConfig › erasableSyntaxOnly](https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly)
- Model events and modes as discriminated unions. End every `switch` with a `never` check so a new variant fails to compile — [Narrowing › Exhaustiveness checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking)
- Write the `@/*` alias as `paths` with no `baseUrl`. Entries resolve relative to the tsconfig — [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
- **Avoid:** any tool that imports the `typescript` JS API (typescript-eslint, vite-plugin-checker, ts-loader). TS 7.0 has no stable programmatic API; the TS team expects one in 7.1 — [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- **Avoid:** `baseUrl`, `moduleResolution: node`/`node10`, `target: es5`, `downlevelIteration`, `outFile`, and `esModuleInterop: false`. All are errors in 7.0 — [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)

## Pattern

```ts
// src/features/note-name-quiz/engine/types.ts
export type Mode = { kind: 'time'; seconds: number } | { kind: 'count'; total: number };

export function modeLabel(mode: Mode): string {
  switch (mode.kind) {
    case 'time':
      return `${mode.seconds}s`;
    case 'count':
      return `${mode.total}`;
    default: {
      const unreachable: never = mode;
      return unreachable;
    }
  }
}
```

```jsonc
// tsconfig.app.json (the parts that matter)
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["vite/client"],
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "skipLibCheck": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

Follows [Narrowing › Exhaustiveness checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking) and [Vite features › TypeScript](https://vite.dev/guide/features.html#typescript).

## Traps

- `baseUrl` stops the build: `TS5102: Option 'baseUrl' has been removed`. The shadcn Vite guide still tells you to add it, so leave it out. Checked locally with `tsc` 7.0.2 — [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
- `import './index.css'` fails with `TS2882` unless `vite/client` is in `types`. The cause is that `noUncheckedSideEffectImports` is now on by default and `types` is `[]`. Checked locally — [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
- `enum` fails with `TS1294` under `erasableSyntaxOnly` — [TSConfig › erasableSyntaxOnly](https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly)
- `import ts from 'typescript'` returns only version info. The package's `.` export is `lib/version.cjs`, and the API sits under `typescript/unstable/*`. Checked in the installed package — [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- A tsconfig in the project folder plus file paths on the command line (`tsc src/a.ts`) is an error unless you pass `--ignoreConfig` — [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
- `tsc -b` with a solution `tsconfig.json` (`files: []` plus `references`) works when the referenced projects set `noEmit`. Checked locally with 7.0.2 — [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- Vite does not type-check. CI must run `tsc` on its own — [Vite features › Transpile Only](https://vite.dev/guide/features.html#transpile-only)

## Sources

- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) — native compiler, binary name, removed options, API status (accessed 2026-11-07)
- [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html) — changed defaults, deprecations removed in 7.0 (accessed 2026-11-07)
- [TSConfig reference](https://www.typescriptlang.org/tsconfig/) — `moduleResolution`, `verbatimModuleSyntax`, `erasableSyntaxOnly` (accessed 2026-11-07)
- [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — exhaustiveness checking with `never` (accessed 2026-11-07)
- [Vite features › TypeScript](https://vite.dev/guide/features.html#typescript) — `isolatedModules`, client types, transpile only (accessed 2026-11-07)
- `npm view typescript@7.0.2 bin` → `{ "tsc": "bin/tsc" }` (accessed 2026-11-07)
