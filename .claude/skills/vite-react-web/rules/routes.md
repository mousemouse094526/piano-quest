# Routes

**Owns:** URL shape, search-param validation, mounting feature screens.

**Must not:** contain game logic or UI beyond mounting a feature component.

## Shape

```ts
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (raw): QuizSearch => parseQuizSearch(raw),
  component: QuizPage,
});
```

## Rules

- Code-based routes (`createRootRoute`, `createRoute`); no router plugin.
- `validateSearch` is hand-written and returns defaults for missing or bad
  values; it never throws.
- Setting changes navigate with `replace: true`.

## Good examples

- `src/routes/_public/index.tsx` — `createRoute` mounting a feature component; `src/main.tsx` builds the tree and the hash-history router.
- `src/features/note-name-quiz/search.ts` — the feature's search parser: pure, unit-tested, one fallback per param; `validateSearch` only calls it.
