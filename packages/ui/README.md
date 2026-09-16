# @sketch-ui/react

Hand-drawn React components. The wobble is real SVG geometry, not a filter or a
background image, so it stays crisp at any size and in any colour.

```bash
npm install @sketch-ui/react
```

```tsx
import { Button } from '@sketch-ui/react';
import '@sketch-ui/react/styles.css';

<Button variant="primary" onClick={save}>
  Save changes
</Button>;
```

The library ships no webfont. Load a handwriting face yourself and point the
token at it, so your app keeps control of font loading:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap"
  rel="stylesheet"
/>
```

## Button

| Prop                     | Type                                                                               | Default     |
| ------------------------ | ---------------------------------------------------------------------------------- | ----------- |
| `variant`                | `primary \| secondary \| ghost \| link \| success \| danger \| warning \| info`    | `primary`   |
| `size`                   | `sm \| md \| lg \| xl \| icon`                                                     | `md`        |
| `shape`                  | `rect \| pill`                                                                     | `rect`      |
| `texture`                | `none \| oil-pastel \| gouache \| cross-hatch \| stipple \| blueprint \| scribble` | per variant |
| `ornament`               | `none \| rays \| fold`                                                             | `none`      |
| `dashed`                 | `boolean`                                                                          | `false`     |
| `status`                 | `idle \| loading \| success \| error`                                              | `idle`      |
| `loadingText`            | `ReactNode`                                                                        | `children`  |
| `leftIcon` / `rightIcon` | `ReactNode`                                                                        | —           |
| `fullWidth`              | `boolean`                                                                          | `false`     |
| `asChild`                | `boolean`                                                                          | `false`     |

Everything else forwards to the underlying `<button>`: `type`, `name`, `value`,
`form`, `onClick`, every `aria-*` attribute. They aren't re-declared as props
because `ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>`.

### Variant vs. texture

`variant` is _what the action means_; `texture` is _how the fill is drawn_. They
are separate axes on purpose — a destructive action can be a pastel wash in a
settings panel and opaque paint in a confirmation modal without inventing a
`dangerSolid` variant.

```tsx
<Button variant="danger">Delete</Button>                   // pastel, dark label
<Button variant="danger" texture="gouache">Delete</Button>  // opaque, light label
```

Coloured variants default to `oil-pastel`; `secondary`, `ghost` and `link`
default to `none`.

### Status, not four booleans

```tsx
<Button status="loading" loadingText="Saving…">
  Save
</Button>
```

`loading` disables the button and sets `aria-busy`. A single `status` value can't
express the contradictory states `loading && success` allowed.

### Links

```tsx
<Button asChild variant="secondary">
  <a href="/pricing">See pricing</a>
</Button>
```

Renders a real anchor with the button's styling. Middle-click, "open in new
tab", and screen-reader link semantics all keep working — unlike a `<button>`
whose `onClick` calls `router.push`.

### Sizing

Buttons are sized by their content and padding, with a `min-inline-size` per
size token so short labels still look generous. There are no hardcoded pixel
widths, so a long translated label grows the button and the frame follows it:

```tsx
<Button fullWidth>Full width</Button>
<Button style={{ width: 320 }}>Fixed width</Button>
<Button>Send the invitation to everyone on the guest list</Button>
```

## Theming

Variants set custom properties and nothing else, so you can retheme from CSS
without touching a component or a build step. Override globally on `:root`, per
subtree on a wrapper, or per instance with `style`:

```css
:root {
  --sk-color-blue-100: #cfe3ff;
  --sk-font-display: 'Caveat', cursive;
}
```

```tsx
<Button
  shape="pill"
  style={
    {
      '--sk-frame-paper': 'var(--sk-color-teal-100)',
      '--sk-frame-ink': 'var(--sk-color-teal-500)',
    } as React.CSSProperties
  }
>
  Continue
</Button>
```

| Property               | Role                               |
| ---------------------- | ---------------------------------- |
| `--sk-frame-paper`     | flat wash behind the texture       |
| `--sk-frame-ink`       | texture marks                      |
| `--sk-frame-solid`     | saturated colour used by `gouache` |
| `--sk-frame-line`      | the outline itself                 |
| `--sk-frame-highlight` | lighter pass in `oil-pastel`       |
| `--sk-button-text`     | label colour                       |

## SketchFrame

The border is a standalone primitive, so `Card`, `Input` and `Modal` share one
implementation instead of each reinventing the wobble:

```tsx
<div style={{ position: 'relative' }}>
  <SketchFrame width={320} height={160} texture="blueprint" />
  <div style={{ position: 'relative', zIndex: 1 }}>…</div>
</div>
```

It takes pixel dimensions because an SVG can't infer its parent's size; use the
exported `useMeasuredSize` hook to supply them, as `Button` does. It takes no
colour props at all — see the table above.

### Migrating to rough.js

All the geometry lives in `sketchPath.ts` as pure `(width, height, r) => string`
functions. Swap their bodies for `rough.generator.path(...)` calls and nothing
else in the library changes. Keep them deterministic: a `Math.random()` in there
causes hydration mismatches and makes the border re-wobble on every re-render.

## Accessibility

- Decorative SVG is `aria-hidden`; the accessible name comes from the label.
- Keyboard focus draws a dashed ring outside the frame, and a real border is
  restored under `forced-colors`.
- `prefers-reduced-motion` stops the press animation and slows the spinner.
- `<Button size="icon">` warns in development if it has no accessible name.

## Development

```bash
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest
pnpm storybook    # component workshop
pnpm build        # tsup + scripts/build-css.mjs
```

Component CSS is never imported from a `.tsx` file. `scripts/build-css.mjs`
discovers every `src/**/*.css` and concatenates it into the single exported
`dist/styles.css`; Storybook globs the same files. Importing CSS from a
component instead makes esbuild emit an unexported `dist/index.css`, and the
published package silently loses its styles.
