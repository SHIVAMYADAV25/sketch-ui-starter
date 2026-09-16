---
name: sketch-ui-component
description: Turns a rough, hand-drawn React component sketch into a production component inside the sketch-ui library — correct folder structure, typed prop contract, CSS-variable theming, tests, Storybook stories, responsive intrinsic sizing, and accessibility — while preserving the sketch's exact visual look. Use this skill whenever the user pastes or uploads component code for the sketch-ui / hand-drawn component library (Button, Input, Card, Modal, Checkbox, Select, Textarea, Tooltip, Badge, Tabs, anything), or says things like "standardize this component", "make this production ready", "add this to my component library", "port this into the repo", "this looks bad in Storybook", or "make it like shadcn". Use it even when the user only pastes raw component code with no explicit instruction, as long as the code is a hand-drawn/sketch-styled React component. Also use it when the user asks how to wire the finished component into their workspace or publish it to a registry.
---

# Sketch UI — component standardization

## What this skill is for

The user designs hand-drawn UI components — wobbly SVG borders, crayon and
gouache textures, sketchbook typography. They design them as _one-file
prototypes_: everything inlined, magic numbers, fixed pixel widths, hardcoded
hex colours, `Math.random()`, no tests, no types.

Your job is to turn that prototype into a component that belongs in a real
component library, **without changing how it looks**.

Those two goals pull against each other constantly. When they conflict, the
look wins and you find another way to get the engineering property you wanted.
The user has said repeatedly, in different words, that the visual result must
match the sketch exactly. Treat their prototype as the design spec, not as code
to be improved into something cleaner-looking.

## The prime directive

**The sketch is the design brief. Port its geometry verbatim.**

Do not re-tune bezier control points, stroke widths, opacities, spacing
constants, dash patterns or texture densities because you think they'd look
better. Copy the numbers across. If a value must change for a structural reason
(e.g. a clip rect must match the fill path so texture stops leaking), change it
for that reason, say so explicitly in your summary, and verify the result still
looks the same.

If the user's prototype and this skill's conventions genuinely can't coexist,
raise it rather than silently picking one.

## Before you write anything

1. **Read the repo.** Find the package root (usually `packages/ui`). Read
   `package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`,
   `.storybook/`, `src/styles.css`, `src/index.ts`, and _at least one existing
   component end to end_. Match what's there. The conventions in this skill
   describe the intended state of that repo, but the repo is the source of
   truth for anything that differs.
2. **Read the existing primitives** in `src/primitives/`. Most hand-drawn
   components need the same wobbly frame. If `SketchFrame` exists, the new
   component almost certainly consumes it rather than re-implementing a border.
   Re-implementing the border is the single most common mistake here.
3. **Inventory the prototype.** List every distinct visual feature in it —
   each texture, each ornament, each state, each shape. That list becomes the
   prop contract. Don't drop features silently; if you defer one, say so.
4. **Check for reusable extraction.** If the prototype contains something a
   _future_ component will also need (a new texture, a focus ring treatment, a
   caret, a checkmark path), it belongs in `primitives/` or the texture
   registry, not buried in the component file.

## Non-negotiable invariants

These exist because each one caused a real, shipped bug in this repo. Explain
them in code comments where a future reader would otherwise "clean them up".

**Geometry must be deterministic.** No `Math.random()` anywhere in path or
texture generation. Randomness causes server/client hydration mismatches, makes
the border re-wobble on every re-render, and makes tests unassertable. Use
modular arithmetic on the coordinate (`(x * 17) % 7`) for jitter instead.

**Path math lives in a pure `.ts` file**, separate from the component —
`(width, height, radius) => string`. This is the rough.js migration point.

**Primitives take no colour props.** Colour arrives through CSS custom
properties so a consumer can retheme from a stylesheet. Because `var()` is not
resolved in SVG presentation attributes, apply it via `style`:

```tsx
// works
<line style={{ stroke: 'var(--sk-frame-ink, currentColor)' }} />
// silently renders nothing
<line stroke="var(--sk-frame-ink)" />
```

**Never import CSS from a component file.** `import './Input.css'` makes esbuild
emit an unexported `dist/index.css`, and the published package silently ships
without styles. `scripts/build-css.mjs` discovers and concatenates stylesheets
into the single exported `dist/styles.css`; Storybook globs the same files.

**Measure the border box, never `contentRect`.** `ResizeObserver`'s
`contentRect` excludes padding, so a padded element gets a frame tens of pixels
too small. Use `borderBoxSize`, falling back to `getBoundingClientRect()`. Reuse
the existing `useMeasuredSize` hook rather than writing another observer.

**Every SVG `<clipPath>`/`<filter>`/gradient id comes from `React.useId()`.**
Hand-passed ids collide the moment someone forgets one, and every instance on
the page inherits the first one's shape.

**Icons use `currentColor` and `1em` sizing**, so they stay visible on dark
fills and scale with the size token.

**Clip textures to the drawn outline path**, not to a `<rect>` that approximates
it — otherwise texture leaks past rounded corners and pill ends.

## File manifest

Produce every one of these for a component named `X`:

```
packages/ui/src/components/X/
├── X.tsx           # logic; forwardRef; consumes primitives
├── X.types.ts      # prop contract + exported const arrays for Storybook
├── X.css           # layout, typography, variant custom properties
├── X.test.tsx      # behaviour, rendering, accessibility
├── X.stories.tsx   # Playground + one story per axis + reference sheet
└── index.ts        # named exports, no default export
```

Plus, when the component introduces something reusable:

```
packages/ui/src/primitives/<Name>/   # new shared visual primitive
packages/ui/src/hooks/               # new shared behaviour
```

And always: add the export to `src/index.ts`, and add any new token to
`src/styles.css`.

Never use default exports. Barrel files export the component and its types.

## The prop contract

Model it on shadcn/Radix, not on the prototype's flat prop list.

```ts
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  texture?: SketchTexture;
  status?: InputStatus;
  // ...component-specific props
}
```

- **Extend the native element's attributes.** Never re-declare `aria-*`,
  `name`, `form`, `onChange` by hand — extending gives you all of them, plus
  correctness as the DOM spec evolves.
- **String unions over booleans.** `status="loading"` not `isLoading` +
  `isSuccess` + `isError`, which can contradict each other.
- **Separate axes.** Meaning (`variant`) is independent of medium (`texture`),
  shape, size and ornament. Resist `dangerSolidDashed`.
- **Export the option arrays** (`INPUT_VARIANTS`, `INPUT_SIZES`) so Storybook
  controls and `it.each` tests stay in sync with the type automatically.
- **`forwardRef` always**, with `displayName` set.
- **`asChild`** where the component could reasonably be another element.
- Sensible defaults on every optional prop; the bare `<X />` must render well.

## Styling standards

Read `references/conventions.md` for the full token list, the naming scheme and
worked CSS examples. The short version:

- **Everything is a token.** No hex value outside `src/styles.css`. Variants set
  custom properties and nothing else, so colour stays decoupled from shape.
- **Intrinsic sizing.** Padding + content define the box; use `min-inline-size`
  per size token so short content still looks generous. Hardcoded pixel widths
  break the moment a label is translated.
- **Responsive by construction.** Relative units, `max-inline-size: 100%`, no
  fixed widths that can overflow a narrow column, wide content scrolls inside
  its own container. Test at 320px.
- **Typography from tokens** — `--sk-font-display` for the handwriting face,
  a defined size scale, and `line-height: 1` only on single-line controls;
  multi-line text gets `1.4`–`1.5`.
- **The library ships no webfont.** The app loads it; Storybook loads it in
  `preview-head.html`.
- Respect `prefers-reduced-motion`, and restore a real border under
  `forced-colors: active` since the SVG frame's colours are dropped there.

## Accessibility floor

- Decorative SVG is `aria-hidden="true"` and `focusable="false"`.
- Visible keyboard focus that doesn't fight the drawn frame — an offset dashed
  ring reads as part of the aesthetic.
- Form controls are labelled; if the component renders its own label, wire
  `htmlFor`/`id` with `useId` and connect help/error text via
  `aria-describedby` and `aria-invalid`.
- Warn in development (`process.env.NODE_ENV !== 'production'`) when a
  component is used in a way that can't have an accessible name.
- Disabled and loading states are conveyed to assistive tech, not just visually.

## Testing and stories

See `references/testing-and-stories.md` for templates. Requirements:

- Tests cover behaviour, rendering, and accessibility. Aim for roughly 15–20
  meaningful assertions, not coverage theatre.
- Include a **regression test for every bug you fixed while porting**, phrased
  so the test name explains the bug.
- jsdom has no layout: the `vitest.setup.ts` `ResizeObserver` stub supplies a
  fixed box. Assert the component consumed _that measurement_ rather than a
  constant.
- Use `it.each(EXPORTED_OPTIONS)` so adding a variant automatically adds tests.
- Stories: `Playground` with full controls, one story per axis, and a
  `ReferenceSheet` story reproducing the user's original mock cell for cell —
  that story is how they verify the look survived the port.

## Verification — do not skip this

Never hand over code you haven't run. In order:

```bash
pnpm --filter @sketch-ui/react typecheck
pnpm --filter @sketch-ui/react test
node packages/ui/scripts/build-css.mjs   # then grep dist/styles.css for the new rules
```

Then **verify the look**, because typechecking proves nothing about pixels.
If you have a sandbox, server-render the component's SVG, resolve the CSS
variables to concrete values (rasterizers don't support `var()`), rasterize with
`cairosvg`, and actually look at the image next to the user's mock. Render each
texture and shape. `references/conventions.md` has the harness recipe, including
the `useId` collision that appears when you rasterize several separate renders
into one document.

If the component is interactive, bundle a small demo with esbuild into one
self-contained HTML file and publish it so the user can click through it.

## What to hand back

Structure the final response like this:

1. **What was wrong with the prototype** — each bug, its root cause, and the
   fix. Be specific; "improved accessibility" is not a finding.
2. **Verification status** — typecheck, test count, CSS build, visual check.
   State it plainly, including anything you couldn't verify.
3. **The files** — packaged as a zip mirroring the repo layout, so it unzips at
   the repo root. Present it with `present_files`.
4. **Integration steps** — the exact edits to make in their repo: the
   `src/index.ts` export line, any new token in `styles.css`, any
   `.storybook` change, any new devDependency.
5. **Judgement calls** — anything where you chose library convention over the
   prototype's literal structure, and how to revert it if they disagree.
6. **One next step** — the component that most naturally follows.

Keep the prose tight. The code is the deliverable; the summary orients them.

## Distribution

When the user asks about workspace wiring, npm/pnpm registries, private
publishing, or a shadcn-style per-component CLI, read
`references/distribution.md`. It covers workspace linking, subpath exports for
per-component imports, publishing public and private, and the honest trade-off
between shadcn's copy-the-source model and keeping the implementation closed.

## Reference files

- `references/conventions.md` — tokens, naming, CSS patterns, texture registry,
  the visual verification harness recipe
- `references/testing-and-stories.md` — test and story templates
- `references/distribution.md` — workspace wiring, registries, per-component
  distribution, code secrecy
