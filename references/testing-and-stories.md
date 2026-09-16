# Testing and stories

## Test file shape

Three describe blocks: behaviour, rendering, accessibility. Test names read as
sentences describing guaranteed behaviour, so a failure tells you what broke.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './Input';

describe('Input — behaviour', () => {
  it('forwards refs to the underlying DOM node', () => {
    /* ... */
  });
  it('passes through native attributes', () => {
    /* ... */
  });
});

describe('Input — rendering', () => {
  it('draws a frame sized to the measured box, not to a hardcoded width', () => {
    /* ... */
  });
  it('gives every instance its own clip id so textures cannot collide', () => {
    /* ... */
  });
});

describe('Input — accessibility', () => {
  it('associates its label with the control', () => {
    /* ... */
  });
  it('hides decorative frame SVGs from assistive tech', () => {
    /* ... */
  });
});
```

## What to test

**Behaviour** — the user-facing contract: events fire, disabled suppresses them,
controlled and uncontrolled both work, refs forward, native attributes pass
through (`type`, `name`, `form`, `required`), `asChild` renders the child
element with the styling applied.

**Rendering** — the frame appears after measurement and uses that measurement;
clip ids are unique across instances; the default texture for a variant applies
and can be overridden; shape-specific geometry is correct (assert on the path
command, e.g. a pill clip contains an `A` arc command a rectangle never would);
variants and sizes produce the right classes.

**Accessibility** — accessible name exists and comes from the right source;
keyboard reaches and operates the component; `aria-invalid` / `aria-describedby`
wire up for form controls; decorative SVG is hidden; development warnings fire
when the component can't be named.

**Regression tests** — one per bug fixed during the port. Name it after the bug:

```tsx
it('keeps the frame on the element when only tokens are loaded', () => {
  /* ... */
});
it('renders a usable frame at full width instead of NaN coordinates', () => {
  /* ... */
});
```

## Things that only work because of the setup file

jsdom implements no layout, so every element measures 0×0 and the frame would
never render. `vitest.setup.ts` stubs `ResizeObserver` and
`getBoundingClientRect` with one fixed box. Assert against _that_ box — it
proves the component consumed the measurement rather than a constant:

```tsx
expect(frame).toHaveAttribute('viewBox', expect.stringContaining('236'));
```

Don't loosen this to `toBeInTheDocument()`; that passes even when the sizing
regresses, which is the exact bug class this guards.

## Data-driven tests

Iterate the exported option arrays so new variants can't ship untested:

```tsx
it.each(SKETCH_TEXTURES.filter((t) => t !== 'none'))(
  'renders the %s texture',
  (texture) => {
    const { container } = render(
      <SketchFrame width={200} height={48} texture={texture} />,
    );
    expect(
      container.querySelector(`[data-sk-texture="${texture}"]`)?.childElementCount,
    ).toBeGreaterThan(0);
  },
);
```

## Story file shape

```tsx
const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: { layout: 'centered', docs: { description: { component: '…' } } },
  args: {/* every default, so controls start populated */},
  argTypes: {
    variant: { control: 'select', options: INPUT_VARIANTS },
    texture: { control: 'select', options: SKETCH_TEXTURES },
    onChange: { action: 'changed' },
  },
} satisfies Meta<typeof Input>;
```

Required stories:

- **Playground** — every control live. The first thing anyone opens.
- **One per axis** — `Variants`, `Textures`, `Sizes`, `Statuses`, `WithIcons`,
  `ShapesAndOrnaments`, whichever apply. Generate from the exported arrays so
  they never drift from the types.
- **Layout** — the cases that historically broke: full width, a very long value,
  a consumer-set width, narrow container.
- **ReferenceSheet** — the user's original mock reproduced cell for cell. This
  is how they verify the port preserved the look, so match their labels and
  ordering rather than reorganising it.

Set `parameters: { controls: { disable: true } }` on multi-example stories,
since controls can't meaningfully drive twenty instances at once.

## Storybook configuration

Component CSS is globbed in `.storybook/preview.ts`:

```ts
import '../src/styles.css';
const componentStyles = import.meta.glob('../src/**/*.css', { eager: true });
void componentStyles;
```

Importing only `styles.css` leaves component rules undefined — including
`position: relative`, which lets the absolutely positioned frame escape to the
viewport corner while the control falls back to browser default chrome. That is
the signature of this bug; if a user reports "Storybook looks nothing like the
design", check this first.

The webfont is loaded in `.storybook/preview-head.html`, not by the library.
