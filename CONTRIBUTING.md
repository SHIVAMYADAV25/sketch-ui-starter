# Contributing to sketch-ui

## Requirements

- Node.js 20.17+ (see `.nvmrc`)
- pnpm 9+ (`corepack enable` will pick up the version pinned in `package.json`)

## Getting started

```bash
git clone <your-fork-url>
cd sketch-ui
pnpm install
pnpm dev
```

- `pnpm --filter @sketch-ui/react storybook` — component playground on http://localhost:6006
- `pnpm --filter docs dev` — the docs/demo app on http://localhost:5173
- `pnpm --filter web dev` — the marketing site on http://localhost:4173

## Repository structure

```
apps/
  docs/     # component playground & usage docs (Vite + React)
  web/      # public marketing site (Vite + React)
packages/
  ui/               # @sketch-ui/react — the component library (empty shell for now)
  utils/            # @sketch-ui/utils — shared runtime helpers
  eslint-config/    # @sketch-ui/eslint-config — shared flat ESLint config
  tsconfig/         # @sketch-ui/tsconfig — shared tsconfig bases
```

Turborepo orchestrates builds/tests/lint across all of the above based on the
dependency graph declared in each package's `package.json`.

## Adding a component to `packages/ui`

Every component gets its own folder under `src/components/<Name>/` with the same
four files, so the pattern stays predictable as the library grows:

```
src/components/Button/
  Button.tsx           # the component
  Button.css           # its styles
  Button.test.tsx       # behavior tests (render, role/name, interaction)
  Button.stories.tsx    # Storybook story
  index.ts              # re-exports Button.tsx
```

Then re-export it from `packages/ui/src/index.ts` — that barrel file is the
package's entire public API, nothing else is reachable from outside.

## Making a change

1. Branch off `main`.
2. Write the code + tests.
3. Run `pnpm check` locally (lint + typecheck + test + build).
4. If your change affects a published package (`ui`, `utils`), add a changeset:
   `pnpm changeset`.
5. Open a PR — CI runs the same `pnpm check`.

## Commit messages

This repo uses [Conventional Commits](https://www.conventionalcommits.org/),
enforced by commitlint via a Husky `commit-msg` hook: `feat: add Button component`,
`fix(utils): correct cn() with nested arrays`, etc.

## Release process

Merges to `main` that include changesets trigger the `release.yml` workflow, which
opens a "Version Packages" PR via Changesets. Merging that PR publishes the bumped
packages to npm.
