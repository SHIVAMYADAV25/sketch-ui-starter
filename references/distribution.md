# Distribution

Covers: workspace wiring, per-component imports, publishing, and the
shadcn-style CLI with closed source.

---

## 1. Workspace wiring (internal use, nothing published)

In a pnpm workspace, `packages/ui` is consumed by other packages in the repo
with the workspace protocol — no registry involved:

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```jsonc
// apps/web/package.json
"dependencies": { "@sketch-ui/react": "workspace:*" }
```

```bash
pnpm install
```

```tsx
import { Button } from '@sketch-ui/react';
import '@sketch-ui/react/styles.css';
```

For npm workspaces, use `"workspaces": ["packages/*", "apps/*"]` in the root
`package.json` and `"@sketch-ui/react": "*"` as the dependency.

During development, `pnpm --filter @sketch-ui/react build --watch` keeps `dist`
fresh, or point the package's `exports` at `src` in a dev-only condition.

## 2. Per-component imports

Consumers importing one component shouldn't pay for the whole library. Two
mechanisms, used together:

**Tree shaking** — `"sideEffects": ["*.css"]` in `package.json` plus ESM output
means a bundler drops unused exports from a barrel import automatically. This is
usually enough and needs no API change.

**Subpath exports** — explicit per-component entry points, useful when a
consumer's bundler is unreliable or you want the import to document the cost:

```jsonc
"exports": {
  ".":            { "types": "./dist/index.d.ts",  "import": "./dist/index.js" },
  "./button":     { "types": "./dist/button.d.ts", "import": "./dist/button.js" },
  "./input":      { "types": "./dist/input.d.ts",  "import": "./dist/input.js" },
  "./styles.css": "./dist/styles.css"
}
```

```ts
// tsup.config.ts
entry: {
  index:  'src/index.ts',
  button: 'src/components/Button/index.ts',
  input:  'src/components/Input/index.ts',
}
```

```tsx
import { Button } from '@sketch-ui/react/button';
```

Generate the entry map from the components directory rather than maintaining it
by hand, so a new component can't be left unreachable.

## 3. Publishing

**Public npm:**

```bash
cd packages/ui
pnpm build
npm pack --dry-run      # inspect exactly what would ship — do this every time
npm publish --access public
```

The `files` field should list only `dist` and `README.md`. Source never ships.

**Private registry** (GitHub Packages, Verdaccio, Artifactory, npm private):

```
# .npmrc
@sketch-ui:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

```bash
npm publish   # scope must match the registry's namespace
```

Consumers need the same `.npmrc` and a read token.

**Before a first public release:** add a `LICENSE` (MIT for adoption), adopt
semver and stay on `0.x` while the API moves, add CI running typecheck + test +
build on every PR, and consider `changesets` for versioning and changelogs.

## 4. shadcn-style per-component CLI

If the user wants `npx sketch-ui add button` — components pulled in
individually rather than installed as one dependency — be direct about the
trade-off first:

**shadcn's model is copy-the-source.** It puts readable `.tsx` files into the
consumer's repo, which they then own and edit. That is the entire value
proposition. It is incompatible with hiding the implementation.

So there are two coherent designs:

**(a) Open, copy-the-source.** A registry of JSON manifests
(`{ name, dependencies, registryDependencies, files: [{ path, content }] }`),
a CLI that fetches one and writes the files into `src/components/ui/`, resolving
shared primitives (`SketchFrame`) as `registryDependencies` so they're pulled in
once. The user gets adoption and contributions; the source is public by design.

**(b) Closed, install-the-artifact.** The CLI fetches a pre-built, minified,
comment-stripped bundle per component plus a `.d.ts` and CSS, and writes those
instead. Same à-la-carte UX, but what lands is a black box. Keep `packages/ui`
private and never publish `src`. The CLI package itself is safe to publish
publicly since it contains no component logic.

### Honest limits on secrecy

Anything that ships to a browser is inspectable in principle — minification and
obfuscation raise the cost of reading it, they don't prevent it. Sourcemaps must
be off (`sourcemap: false`) or the whole exercise is void. Commercial component
libraries handle this with licensing and gating, not technical secrecy: a
license key checked by the CLI before it will fetch, terms that prohibit
redistribution, and accepting that determined readers can always decompile.

Say this plainly when the user asks for secrecy; don't imply obfuscation makes
code unreadable.

### Registry build shape

```
registry/
├── index.json          # component list with descriptions and deps
├── button.json         # manifest: files (source or compiled), deps, css
└── input.json
```

Build it with a script that reads `src/components/*` and emits one manifest per
component, so publishing a new component is one command. Host on any static
CDN, or behind an auth-checking endpoint for the gated variant.
