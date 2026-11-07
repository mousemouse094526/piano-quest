# GitHub Pages deploy via Actions

**Kind:** library

**Version:**

- `actions/checkout@v7` (latest v7.0.1)
- `actions/setup-node@v7` (latest v7.1.0)
- `actions/configure-pages@v6` (latest v6.0.0)
- `actions/upload-pages-artifact@v5` (latest v5.0.0)
- `actions/deploy-pages@v5` (latest v5.0.1)

**Docs:** https://docs.github.com/llms.txt

## Best practices

- Set Settings, then Pages, then Source to **GitHub Actions**. A Vite site needs a build step, so a branch source won't work — [Vite › Deploying to GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages)
- The job that deploys needs `pages: write` and `id-token: write`. `id-token` is used to request the OIDC token that proves where the deployment came from — [deploy-pages README](https://github.com/actions/deploy-pages#usage), [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages#deploying-github-pages-artifacts)
- Deploy into the `github-pages` environment and set `url: ${{ steps.deployment.outputs.page_url }}`. The environment's protection rules decide which branches may deploy — [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages#deploying-github-pages-artifacts)
- Split the work into a `build` job, which uploads with `upload-pages-artifact` and `path: ./dist`, and a `deploy` job with `needs: build`. Without `needs`, the deploy can wait on an artifact that never comes — [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages#linking-separate-build-and-deploy-jobs)
- Use `concurrency: { group: pages, cancel-in-progress: false }`. GitHub's starter skips queued runs but lets a deploy that has started finish. Vite's sample uses `true`, which can cut a deploy off partway — [starter workflow pages/static.yml](https://github.com/actions/starter-workflows/blob/main/pages/static.yml)
- Run checks on `pull_request` and on `push` to `main`. Gate the deploy job with `if: github.event_name == 'push' && github.ref == 'refs/heads/main'` — [Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- **Avoid:** granting `pages: write` and `id-token: write` to the whole workflow when PR runs only check. Set them on the deploy job and keep the workflow at `contents: read` — [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages#deploying-github-pages-artifacts)

## Pattern

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

concurrency:
  group: pages-${{ github.ref }}
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npx biome ci .
      - run: npx tsc -b
      - run: npx vitest run
      - run: npm run build
      - if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: actions/configure-pages@v6
      - if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v5
        with:
          path: ./dist

  deploy:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

Follows [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [Vite › GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages). The step order mirrors `.claude/skills/vite-react-web/rules/testing.md`; ticket 03 adds Playwright.

## Traps

- Vitest 5 needs Node 22.12 or later. Pin `node-version: 24`, or at least 22.12, rather than 20 — [vitest.md](vitest.md)
- `upload-pages-artifact` v4 and later leave out dotfiles unless you pass `include-hidden-files: true` (added in v5). Vite's `dist` normally has none — [upload-pages-artifact v4.0.0 release](https://github.com/actions/upload-pages-artifact/releases/tag/v4.0.0), [v5.0.0 release](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0)
- The Pages artifact must be a gzip tar under 10 GB, with no symlinks or hard links — [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages#configuring-the-upload-pages-artifact-action)
- The `github-pages` environment is protected by default. A deploy from a branch other than `main` is rejected even when the `if` is wrong — [deploy-pages README](https://github.com/actions/deploy-pages#usage)
- `actions/checkout` v7 blocks checking out fork PR code under `pull_request_target` and `workflow_run`. Use plain `pull_request` for PR checks — [checkout v7.0.0 release](https://github.com/actions/checkout/releases/tag/v7.0.0)
- GitHub's docs pages still show older tags (`configure-pages@v5`, `upload-pages-artifact@v4`, `deploy-pages@v4`). Use the majors listed above, which come from each repo's releases page — [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## Sources

- [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) — permissions, environment, `needs`, artifact limits (accessed 2026-11-07)
- [deploy-pages README](https://github.com/actions/deploy-pages) — required permissions, environment protection (accessed 2026-11-07)
- [starter workflow pages/static.yml](https://github.com/actions/starter-workflows/blob/main/pages/static.yml) — concurrency setting (accessed 2026-11-07)
- [Vite › Deploying a Static Site › GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages) — Pages source, sample workflow (accessed 2026-11-07)
- [Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows) — `push` and `pull_request` (accessed 2026-11-07)
- Release pages for [checkout](https://github.com/actions/checkout/releases), [setup-node](https://github.com/actions/setup-node/releases), [configure-pages](https://github.com/actions/configure-pages/releases), [upload-pages-artifact](https://github.com/actions/upload-pages-artifact/releases) and [deploy-pages](https://github.com/actions/deploy-pages/releases) — current majors (accessed 2026-11-07)
