# @tanstack/react-router

**Kind:** library

**Version:** 1.170.46

**Docs:** https://tanstack.com/router/latest/llms.txt

## Best practices

- Code-based routing builds the tree by hand:
  - `createRootRoute()` makes the root route.
  - `createRoute({ getParentRoute, path, component })` makes every other route.
  - `rootRoute.addChildren([...])` joins them into the tree.
  - Source: [Code-Based Routing](https://tanstack.com/router/latest/docs/routing/code-based-routing)
- Every `createRoute` needs `getParentRoute`, because the types flow from the parent — [Code-Based Routing › Anatomy of a Route](https://tanstack.com/router/latest/docs/routing/code-based-routing#anatomy-of-a-route)
- Pass `history: createHashHistory()` to `createRouter`. Hash routing suits hosts that can't rewrite every path to `index.html`, such as GitHub Pages — [History Types › Hash Routing](https://tanstack.com/router/latest/docs/guide/history-types#hash-routing)
- Register the router type through declaration merging on `Register`. The docs mark this "DO NOT SKIP" — [Creating a Router › Router Type Safety](https://tanstack.com/router/latest/docs/guide/creating-a-router#router-type-safety)
- `validateSearch` receives the JSON-parsed but unvalidated params as `Record<string, unknown>`. It returns a typed object and should fall back to defaults for bad values — [Search Params › Validating Search Params](https://tanstack.com/router/latest/docs/guide/search-params#validating-search-params)
- Read params with `route.useSearch()`. A shared component outside a known route uses `useSearch({ strict: false })` — [Search Params › Search Params in Components](https://tanstack.com/router/latest/docs/guide/search-params#search-params-in-components), [Type Safety](https://tanstack.com/router/latest/docs/guide/type-safety)
- Add a 404 with `notFoundComponent` on the root route — [Creating a Router › 404 Not Found Route](https://tanstack.com/router/latest/docs/guide/creating-a-router#404-not-found-route)
- **Avoid:** throwing from `validateSearch`. A throw sends the route to `errorComponent` with `routerCode: VALIDATE_SEARCH` — [Search Params › Validating Search Params](https://tanstack.com/router/latest/docs/guide/search-params#validating-search-params)
- **Avoid:** typing props as bare `LinkProps`, which is a huge union and slow to check. Use `as const satisfies LinkProps` — [Type Safety › Performance Recommendations](https://tanstack.com/router/latest/docs/guide/type-safety#performance-recommendations)

## Pattern

```tsx
// src/main.tsx (router part)
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { parseQuizSearch, type QuizSearch } from '@/features/note-name-quiz/search';
import { QuizPage } from '@/features/note-name-quiz/components/quiz-page';

const rootRoute = createRootRoute({ notFoundComponent: () => <p>ไม่พบหน้านี้</p> });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (raw: Record<string, unknown>): QuizSearch => parseQuizSearch(raw),
  component: QuizPage,
});

const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute]),
  history: createHashHistory(),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return <RouterProvider router={router} />;
}
```

Follows [Code-Based Routing](https://tanstack.com/router/latest/docs/routing/code-based-routing), [History Types](https://tanstack.com/router/latest/docs/guide/history-types) and [Creating a Router](https://tanstack.com/router/latest/docs/guide/creating-a-router).

## Traps

- The docs push file-based routing. Skip any page that uses `createFileRoute`, `routeTree.gen.ts` or the router Vite plugin; this project builds routes in code — [Code-Based Routing](https://tanstack.com/router/latest/docs/routing/code-based-routing)
- Search params are parsed as JSON, so `?seconds=30` arrives as the number `30`, not `'30'`. `validateSearch` must accept both types — [Search Params › JSON-first Search Params](https://tanstack.com/router/latest/docs/guide/search-params#json-first-search-params)
- If `validateSearch` returns required keys, every `<Link to="/">` and `navigate` must pass `search`, or it fails to type-check. Make keys optional or fill defaults in the parser — [Search Params › Adapters](https://tanstack.com/router/latest/docs/guide/search-params#adapters)
- If `Register` is missing, hooks and `Link` fall back to loose types without any error — [Creating a Router › Router Type Safety](https://tanstack.com/router/latest/docs/guide/creating-a-router#router-type-safety)
- To keep `search` optional on `<Link to="/">` while `validateSearch` returns complete values, intersect the validator's input type with `SearchSchemaInput`. A plain `Record<string, unknown>` input still makes `search` required. Checked locally on 1.170.46 — [Search Params › Validating Search Params](https://tanstack.com/router/latest/docs/guide/search-params#validating-search-params)
- `createHashHistory` builds the location from the hash path plus `window.location.search`, so `/app/?fbclid=x#/?a=1&b=2` reads `b` as `2?fbclid=x`. Drop the real query with `history.replaceState` before creating the router. Read in `@tanstack/history` source and checked locally on 1.170.46
- The router writes the validated search back to the URL when the page loads, but not when only the hash changes inside a loaded page (Playwright `page.goto('#/?…')` twice in a row). A test that checks the rewritten URL needs a fresh load. Checked locally on 1.170.46
- `defaultStringifySearch` wraps a string that JSON could read as something else in quotes: `'1234567'` → `%221234567%22`, `'ASDFGHJ'` stays bare. On the way in, an unquoted `1234567` arrives as a number, `1234.50` as `1234.5`, `1e23456` as `Infinity`, `[12345]` as an array. Checked locally on 1.170.46
- Under hash history the path lives after `#`. `https://.../piano-quest/#/?mode=time` is the URL shape, and Vite's `base` stays `/piano-quest/` — [History Types](https://tanstack.com/router/latest/docs/guide/history-types)

## Sources

- [Code-Based Routing](https://tanstack.com/router/latest/docs/routing/code-based-routing) — root route, `createRoute`, `getParentRoute` (accessed 2026-11-07)
- [History Types](https://tanstack.com/router/latest/docs/guide/history-types) — `createHashHistory` (accessed 2026-11-07)
- [Creating a Router](https://tanstack.com/router/latest/docs/guide/creating-a-router) — `createRouter`, `Register`, not-found route (accessed 2026-11-07)
- [Search Params](https://tanstack.com/router/latest/docs/guide/search-params) — JSON parsing, `validateSearch`, required search on links (accessed 2026-11-07)
- [Type Safety](https://tanstack.com/router/latest/docs/guide/type-safety) — `strict: false`, TS performance advice (accessed 2026-11-07)
