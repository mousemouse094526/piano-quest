# vite

**Kind:** library

**Version:** 8.3.6 with `@vitejs/plugin-react` 6.2.1

**Docs:** https://vite.dev/llms.txt

## Best practices

- A project page at `https://<user>.github.io/<repo>/` sets `base: '/<repo>/'`. Here that is `'/piano-quest/'` — [Deploying a Static Site › GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages)
- Build URLs at runtime from `import.meta.env.BASE_URL`, written exactly like that. It is replaced statically at build time — [Building for Production › Public Base Path](https://vite.dev/guide/build.html#public-base-path)
- `vite build` writes to `dist/`. Vite 8 bundles with Rolldown and transforms code with Oxc, not esbuild and Rollup — [Migration from v7 › Rolldown](https://vite.dev/guide/migration.html#rolldown)
- Vite only transpiles TypeScript. Run `tsc --noEmit` (or `tsc -b`) next to `vite build` — [Features › Transpile Only](https://vite.dev/guide/features.html#transpile-only)
- Set `isolatedModules` (or `verbatimModuleSyntax`) so TS flags code that per-file transpiling can't handle, such as `const enum` and implicit type-only imports — [Features › isolatedModules](https://vite.dev/guide/features.html#isolatedmodules)
- Add `vite/client` to `compilerOptions.types` for asset, CSS and `import.meta.env` types — [Features › Client Types](https://vite.dev/guide/features.html#client-types)
- Set the `@` alias with `resolve.alias`. `resolve.tsconfigPaths: true` also works but costs build time, and the TS team discourages using `paths` to drive other tools — [Shared Options › resolve.tsconfigPaths](https://vite.dev/config/shared-options.html#resolve-tsconfigpaths), [Features › paths](https://vite.dev/guide/features.html#paths)
- `@vitejs/plugin-react` 6 needs `vite ^8`. It enables Fast Refresh and the automatic JSX runtime. Babel is optional; it is needed only for React Compiler, through `@rolldown/plugin-babel` — [plugin-react README](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)
- **Avoid:** files that export both components and non-components. Fast Refresh needs a file to export only React components — [plugin-react README › Consistent components exports](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react#consistent-components-exports)
- **Avoid:** new `esbuild` config options. They are deprecated in favour of `oxc` — [Migration from v7 › JavaScript Transforms by Oxc](https://vite.dev/guide/migration.html#javascript-transforms-by-oxc)

## Pattern

```ts
// vite.config.ts
/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/piano-quest/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

Follows [Deploying a Static Site › GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages) and [Shared Options](https://vite.dev/config/shared-options.html). A local build with this config emitted `/piano-quest/assets/...` URLs in `dist/index.html`.

## Traps

- Without `base`, the built `index.html` links `/assets/...`, which returns 404 under `/<repo>/` on GitHub Pages — [Deploying a Static Site › GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages)
- Node engine is `^20.19.0 || >=22.12.0`. Vitest 5 needs at least 22.12, so CI should use Node 22.12 or later — `npm view vite@8.3.6 engines`
- Vite ignores `target` in tsconfig. The browser target comes from `build.target`, whose v8 default is Baseline Widely Available: Chrome 111 and Safari 16.4 — [Migration from v7 › Default Browser Target Change](https://vite.dev/guide/migration.html#default-browser-target-change), [Features › target](https://vite.dev/guide/features.html#target)
- The shadcn guide writes `path.resolve(__dirname, './src')`. `__dirname` needs `@types/node` in the Node-side tsconfig. `fileURLToPath(new URL(...))` is the ESM form — [shadcn Vite install](https://ui.shadcn.com/docs/installation/vite)

## Sources

- [Deploying a Static Site](https://vite.dev/guide/static-deploy.html) — `base` and the GitHub Pages workflow (accessed 2026-11-07)
- [Building for Production](https://vite.dev/guide/build.html) — public base path, `BASE_URL`, browser targets (accessed 2026-11-07)
- [Features](https://vite.dev/guide/features.html) — TypeScript transpile only, `isolatedModules`, client types, `paths` (accessed 2026-11-07)
- [Shared Options](https://vite.dev/config/shared-options.html) — `base`, `resolve.alias`, `resolve.tsconfigPaths` (accessed 2026-11-07)
- [Migration from v7](https://vite.dev/guide/migration.html) — Rolldown, Oxc, target change (accessed 2026-11-07)
- [@vitejs/plugin-react README](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react) — setup, options, Fast Refresh exports (accessed 2026-11-07)
