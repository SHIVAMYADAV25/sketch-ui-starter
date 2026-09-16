# Conventions

Contents:

1. Naming
2. Token system
3. Variant CSS pattern
4. Consuming SketchFrame
5. Adding a texture
6. Responsive rules
7. Typography scale
8. Visual verification harness

---

## 1. Naming

| Thing                              | Convention                       | Example                                |
| ---------------------------------- | -------------------------------- | -------------------------------------- |
| Component folder                   | PascalCase                       | `src/components/Input/`                |
| CSS block                          | `sk-` + kebab component          | `.sk-input`                            |
| CSS element                        | BEM element                      | `.sk-input__field`                     |
| CSS modifier                       | BEM modifier                     | `.sk-input--size-lg`                   |
| State that CSS and tests both read | `data-` attribute                | `data-status="error"`                  |
| Custom property                    | `--sk-<scope>-<role>`            | `--sk-frame-ink`                       |
| Primitive                          | describes the mark, not the user | `SketchFrame`, not `ButtonBorder`      |
| Texture                            | names the medium                 | `oil-pastel`, `gouache`, `cross-hatch` |

Use classes for things a consumer might target (variant, size) and `data-`
attributes for runtime state, so tests can assert on state without coupling to
styling classes.

Texture naming rule: name the drawing medium or mark being imitated, never the
colour (`blue-hatch`) and never the consuming component (`button-fill`).

## 2. Token system

Every colour, space, radius and type size lives in `src/styles.css`. Ramps run
100 (pastel wash) / 500 (pastel-weight marks) / 600 (link ink) / 700 (opaque
paint), so a variant can express all its weights from one hue name.

Frame properties every visual primitive reads:

| Property               | Role                                     |
| ---------------------- | ---------------------------------------- |
| `--sk-frame-paper`     | flat wash behind the texture             |
| `--sk-frame-ink`       | texture marks                            |
| `--sk-frame-solid`     | saturated colour used by opaque textures |
| `--sk-frame-line`      | the drawn outline                        |
| `--sk-frame-highlight` | lighter pass in oil-pastel               |

Adding a new hue means adding the 100/500/700 trio to `styles.css`, never a hex
value inside a component.

## 3. Variant CSS pattern

Variants set custom properties and nothing else. This is what keeps colour
decoupled from geometry — the same frame code serves every variant.

```css
.sk-input--danger {
  --sk-frame-paper: var(--sk-color-rose-100, #f9c5cd);
  --sk-frame-ink: var(--sk-color-rose-500, #cf5a73);
  --sk-frame-solid: var(--sk-color-rose-700, #e11d48);
}

/* Cross-cutting rule instead of a combinatorial variant */
.sk-input[data-texture='gouache'] {
  --sk-frame-ink: var(--sk-frame-solid);
  --sk-button-text: var(--sk-color-paper);
}
```

Always provide a fallback in `var()` so a consumer who forgets the stylesheet
still gets something sane.

## 4. Consuming SketchFrame

The parent must establish a positioning context, or the absolutely positioned
SVG escapes to the page corner — this was a real shipped bug.

```tsx
const innerRef = React.useRef<HTMLDivElement>(null);
const size = useMeasuredSize(innerRef);

<div ref={innerRef} className="sk-input">
  {' '}
  {/* position: relative in CSS */}
  {size ? (
    <SketchFrame
      className="sk-input__frame"
      width={size.width}
      height={size.height}
      texture={resolvedTexture}
    />
  ) : null}
  <input className="sk-input__field" /> {/* position: relative; z-index: 1 */}
</div>;
```

Render the frame only once a measurement exists. Drawing it against a guessed
size makes it visibly snap into place on mount.

For a text input specifically: the frame wraps the whole control, the native
`<input>` sits transparent on top with `border: none; background: transparent;
outline: none`, and focus styling moves to the wrapper via `:focus-within`.

## 5. Adding a texture

Textures live in one registry (`primitives/SketchFrame/sketchTexture.tsx`), not
in components. Adding one means:

1. Add the name to the `SKETCH_TEXTURES` const array — this is the type source.
2. Write a renderer taking `{ width, height }` and returning SVG elements, with
   colours from `style={{ stroke: 'var(--sk-frame-ink, currentColor)' }}`.
3. Register it in `TEXTURE_RENDERERS`.

Storybook controls and `it.each(SKETCH_TEXTURES)` tests pick it up with no
further edits — which is the point of exporting the array.

Keep renderers deterministic. Let strokes overshoot the box; the clip path
trims them, and stopping them exactly at the edge produces a visible flat line
that breaks the hand-drawn illusion.

## 6. Responsive rules

- Intrinsic sizing plus `min-inline-size`. Never a fixed `width` in component
  CSS.
- `max-inline-size: 100%` on anything that could overflow its column.
- Single-line controls get `overflow: hidden; text-overflow: ellipsis;
white-space: nowrap` on the label element, so a long string can't force a
  two-line box the frame has to stretch around.
- `fullWidth` sets `inline-size: 100%` _and_ `min-inline-size: 0`, otherwise the
  min-width fights the container.
- Check the component at 320px. Grids in stories use
  `repeat(auto-fill, minmax(230px, 1fr))` so they reflow rather than overflow.

## 7. Typography scale

```
--sk-font-size-sm: 1.05rem    --sk-font-size-lg: 1.45rem
--sk-font-size-md: 1.25rem    --sk-font-size-xl: 1.6rem
```

The handwriting face renders small for its point size, which is why the scale
sits above a typical UI scale. Use `rem` so it respects user font settings.
`line-height: 1` is for single-line controls only; prose gets 1.4–1.5, and body
text stays under ~70 characters per line.

Never hardcode a font stack in a component — `var(--sk-font-display)`.

## 8. Visual verification harness

Typechecking proves nothing about pixels. To actually look at the output:

```bash
pip install cairosvg --break-system-packages
npm i -D tsx
```

Server-render the primitive, resolve custom properties to concrete values
(rasterizers don't implement `var()`), rasterize, then view the PNG:

```tsx
let svg = renderToStaticMarkup(
  <SketchFrame width={200} height={48} texture="oil-pastel" />,
);
svg = svg
  .replace(/var\(--sk-frame-paper[^)]*\)/g, '#b8cff7')
  .replace(/var\(--sk-frame-ink[^)]*\)/g, '#4f78d6')
  .replace(/var\(--sk-frame-line[^)]*\)/g, '#1a1a1a')
  .replace(/style="position:absolute;[^"]*"/, '');
```

**Known harness trap:** each separate `renderToStaticMarkup` call restarts
`useId` at `R0`, so tiling several renders into one document produces duplicate
clip ids and the first shape wins — textures then appear clipped to the wrong
outline. Rewrite the ids per cell (`svg.replace(/sk-frame-clip-R0/g, 'clip-' + i)`)
before concluding the component is broken. Inside a single React tree ids are
unique, so this is a harness artifact only.

Render every texture and both shapes, and compare against the user's mock
before reporting done.

For interactive components, bundle a demo into one self-contained HTML file:

```bash
npx esbuild demo/main.tsx --bundle --minify --format=iife --jsx=automatic \
  --define:process.env.NODE_ENV='"production"' --outfile=demo/bundle.js
```

then inline `dist/styles.css` and the bundle into a single HTML file and publish
it, so the user can interact with the real component rather than a screenshot.
