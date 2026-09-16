import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SketchFrame } from './SketchFrame';
import { buildRectOuterPath, snap } from './sketchPath';
import { SKETCH_TEXTURES } from './sketchTexture';

describe('sketchPath', () => {
  it('is deterministic — the same size always yields the same path', () => {
    expect(buildRectOuterPath(210, 50, 10)).toBe(buildRectOuterPath(210, 50, 10));
  });

  it('closes the outline so it can be used as a fill and a clip path', () => {
    expect(buildRectOuterPath(210, 50, 10).trim().endsWith('Z')).toBe(true);
  });

  it('snaps fractional layout widths to a half pixel', () => {
    expect(snap(182.34375)).toBe(182.5);
    expect(snap(182.2)).toBe(182);
  });
});

describe('SketchFrame', () => {
  it('renders nothing before a real measurement arrives', () => {
    const { container } = render(<SketchFrame width={0} height={0} />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('covers the parent box plus padding for overshooting strokes', () => {
    const { container } = render(<SketchFrame width={200} height={48} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '-18 -18 236 84');
  });

  it.each(SKETCH_TEXTURES.filter((t) => t !== 'none'))(
    'renders the %s texture',
    (texture) => {
      const { container } = render(
        <SketchFrame width={200} height={48} texture={texture} />,
      );
      const group = container.querySelector(`[data-sk-texture="${texture}"]`);
      expect(group).toBeInTheDocument();
      expect(group?.childElementCount).toBeGreaterThan(0);
    },
  );

  it('clips every texture to the drawn outline', () => {
    const { container } = render(
      <SketchFrame width={200} height={48} shape="pill" texture="oil-pastel" />,
    );
    const group = container.querySelector('[data-sk-texture]');
    const clipId = container.querySelector('clipPath')?.id;
    expect(group?.getAttribute('clip-path')).toBe(`url(#${clipId})`);
  });

  it('draws ray ornaments outside the outline', () => {
    const { container } = render(<SketchFrame width={200} height={48} ornament="rays" />);
    const rays = Array.from(container.querySelectorAll('path')).filter((p) =>
      p.getAttribute('d')?.includes('-15'),
    );
    expect(rays.length).toBeGreaterThan(0);
  });

  it('skips rectangle accent ticks on pills, where they would cut the round ends', () => {
    const rect = render(<SketchFrame width={200} height={48} shape="rect" />);
    const pill = render(<SketchFrame width={200} height={48} shape="pill" />);
    const count = (c: HTMLElement) => c.querySelectorAll('path').length;
    expect(count(rect.container)).toBeGreaterThan(count(pill.container));
  });

  it('takes no colour props — theming stays in CSS custom properties', () => {
    const { container } = render(
      <SketchFrame width={200} height={48} texture="stipple" />,
    );
    const html = container.innerHTML;
    expect(html).toContain('var(--sk-frame-ink');
    expect(html).toContain('var(--sk-frame-line');
  });
});
