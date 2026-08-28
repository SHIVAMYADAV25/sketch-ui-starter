<div align="center">

# sketch-ui

**Starter monorepo for a production-grade React component library.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

</div>

---

This is the scaffolding for `@sketch-ui/react` — the tooling, build pipeline, and
project structure are fully wired and verified working; **no components have been
written yet**. It's meant to be the starting point you build the actual library on
top of.

## What's already set up

- **pnpm workspaces + Turborepo** — `packages/*` and `apps/*` build/lint/test/typecheck
  through one `turbo.json` pipeline, in correct dependency order, with caching.
- **`packages/ui`** (`@sketch-ui/react`) — an empty component library shell: `tsup`
  build (ESM + CJS + `.d.ts`), Vitest + Testing Library wired up, Storybook configured
  (no stories yet). Add components under `src/components/<Name>/`.
- **`packages/utils`** (`@sketch-ui/utils`) — a tiny generic `cn()` helper with a
  passing test, as a working example of the build → test → typecheck pipeline.
- **`packages/eslint-config`** / **`packages/tsconfig`** — shared, internal-only
  configs every other package extends.
- **`apps/docs`** / **`apps/web`** — bare Vite + React + TS apps wired to the
  workspace packages, ready to become the real docs/playground and marketing site.
- **Tooling**: ESLint 9 flat config, Prettier, Husky (`pre-commit` + `commit-msg`)
  with lint-staged, commitlint (Conventional Commits), Changesets for versioning,
  GitHub Actions (`ci.yml`, `release.yml`, `chromatic.yml`), issue/PR templates,
  dependabot, CODEOWNERS.

## Getting started

```bash
pnpm install
pnpm dev      # runs every app/package's dev script in parallel
pnpm check    # lint + typecheck + test + build, everything
```

## Where to start building

1. Design your first component under `packages/ui/src/components/<Name>/` — see
   `CONTRIBUTING.md` for the file layout every component should follow.
2. Export it from `packages/ui/src/index.ts`.
3. Demo it in `apps/docs`.
4. Run `pnpm changeset` once it's ready to ship.

## License

[MIT](./LICENSE) © sketch-ui contributors
