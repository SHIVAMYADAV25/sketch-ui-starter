/**
 * Pure SVG path builders for the hand-drawn frame used by <SketchFrame>.
 *
 * Every function here is a deterministic function of (width, height, radius):
 * the same input always produces the same `d` string. No Math.random(), ever.
 * That matters for three reasons:
 *   1. Server and client markup match exactly — no hydration mismatch.
 *   2. A re-render doesn't make the border wobble differently.
 *   3. Tests can assert on output.
 *
 * This is also the ONE file to rewrite when migrating to rough.js: keep the
 * `(width, height, r) => string` signatures and nothing else changes.
 */

/** Frames are drawn into a viewBox padded by this much on every side, so that
 *  overshooting strokes, rays and fold marks aren't clipped by the <svg> box. */
export const SKETCH_FRAME_PADDING = 18;

/** Snap a measured pixel size to a half pixel so fractional layout widths
 *  (e.g. 182.34375) don't produce a new path string on every resize. */
export function snap(value: number): number {
  return Math.round(value * 2) / 2;
}

export function resolveRadius(
  shape: 'rect' | 'pill',
  height: number,
  radius: number,
): number {
  return shape === 'pill' ? height / 2 : Math.min(radius, height / 2);
}

/* ------------------------------------------------------------------ *
 * Rectangle
 * ------------------------------------------------------------------ */

/** Main ink outline. Closed with Z so it can be used as a fill and a clip path. */
export function buildRectOuterPath(width: number, height: number, r: number): string {
  return `
    M ${r + 2},2
    C ${width * 0.35},1.2 ${width * 0.65},2.4 ${width - r - 2},1.5
    C ${width - 3},1.2 ${width + 0.8},3.8 ${width + 0.2},${r + 2}
    C ${width - 0.4},${height * 0.38} ${width + 0.9},${height * 0.68} ${width + 0.2},${height - r - 2}
    C ${width + 0.5},${height - 3.5} ${width - 3.2},${height + 1.2} ${width - r - 2},${height + 0.6}
    C ${width * 0.65},${height + 1.2} ${width * 0.35},${height - 0.2} ${r + 2},${height + 0.6}
    C 3.5,${height + 0.5} 0.6,${height - 3.5} 1.2,${height - r - 2}
    C 0.6,${height * 0.62} 1.6,${height * 0.38} 1.2,${r + 2}
    C 1.0,3.8 3.5,1.5 ${r + 2},2
    Z
  `;
}

/** Second, lighter pass just inside the outline — the "drawn twice" look. */
export function buildRectInnerPath(width: number, height: number, r: number): string {
  return `
    M ${r - 2},3.6
    C ${width * 0.38},2.0 ${width * 0.72},3.8 ${width - r + 3},2.8
    C ${width - 1.5},2.4 ${width + 1.8},5.2 ${width - 0.2},${r + 4}
    C ${width + 1.2},${height * 0.42} ${width - 0.6},${height * 0.72} ${width - 0.2},${height - r}
    C ${width - 0.1},${height - 1.8} ${width - 4},${height + 1.8} ${width - r - 3},${height}
    C ${width * 0.58},${height - 0.6} ${width * 0.24},${height + 1.4} ${r - 1},${height - 0.2}
    C 2.2,${height - 0.2} -0.2,${height - 4.5} 1.6,${height - r + 1}
    C 0.9,${height * 0.55} 0.4,${height * 0.28} 2.0,${r - 1}
    C 2.4,2.6 5.0,2.2 ${r + 4},3.2
    Z
  `;
}

/* ------------------------------------------------------------------ *
 * Pill
 * ------------------------------------------------------------------ */

export function buildPillOuterPath(width: number, height: number): string {
  const r = height / 2;
  return `
    M ${r},2
    C ${width * 0.35},1.2 ${width * 0.65},2.4 ${width - r},2
    A ${r - 2} ${r - 2} 0 0 1 ${width - r},${height - 2}
    C ${width * 0.65},${height - 1.2} ${width * 0.35},${height - 2.4} ${r},${height - 2}
    A ${r - 2} ${r - 2} 0 0 1 ${r},2
    Z
  `;
}

export function buildPillInnerPath(width: number, height: number): string {
  const r = height / 2;
  return `
    M ${r + 2},3.4
    C ${width * 0.35},2.6 ${width * 0.65},3.8 ${width - r - 2},3.4
    A ${r - 3.4} ${r - 3.4} 0 0 1 ${width - r - 2},${height - 3.4}
    C ${width * 0.65},${height - 2.6} ${width * 0.35},${height - 3.8} ${r + 2},${height - 3.4}
    A ${r - 3.4} ${r - 3.4} 0 0 1 ${r + 2},3.4
    Z
  `;
}

/* ------------------------------------------------------------------ *
 * Shape dispatch
 * ------------------------------------------------------------------ */

export function buildOuterPath(
  shape: 'rect' | 'pill',
  width: number,
  height: number,
  r: number,
): string {
  return shape === 'pill'
    ? buildPillOuterPath(width, height)
    : buildRectOuterPath(width, height, r);
}

export function buildInnerPath(
  shape: 'rect' | 'pill',
  width: number,
  height: number,
  r: number,
): string {
  return shape === 'pill'
    ? buildPillInnerPath(width, height)
    : buildRectInnerPath(width, height, r);
}

/* ------------------------------------------------------------------ *
 * Ornaments
 * ------------------------------------------------------------------ */

/**
 * The heavier ink on the right edge, the doubled baseline, and the two small
 * corner ticks. These are what make the frame read as "pressed harder on the
 * way down" rather than as a plain rounded rect.
 *
 * Returned as `{ d, strokeWidth, opacity }` so <SketchFrame> stays declarative.
 */
export interface SketchStroke {
  d: string;
  strokeWidth: number;
  opacity?: number;
}

export function buildRectAccentStrokes(
  width: number,
  height: number,
  r: number,
): SketchStroke[] {
  return [
    {
      // weighted right edge
      d: `M ${width - 3},${r - 4} C ${width + 1.8},${r} ${width + 2},${height * 0.5} ${width + 0.8},${height - r + 3} C ${width + 0.2},${height - 2} ${width - 3},${height + 1.2} ${width - r},${height + 1}`,
      strokeWidth: 1.6,
    },
    {
      // doubled baseline
      d: `M 10,${height + 0.8} C ${width * 0.35},${height - 0.4} ${width * 0.7},${height + 1.8} ${width - 2},${height + 0.6}`,
      strokeWidth: 1.5,
    },
    {
      // bottom-left tick
      d: `M 6.5,${height - 16} L 6.8,${height - 8} Q 7.5,${height - 6.5} 12,${height - 7}`,
      strokeWidth: 1.2,
      opacity: 0.8,
    },
    {
      // bottom-right tick
      d: `M ${width - 7},${height - 16} L ${width - 6.5},${height - 8}`,
      strokeWidth: 1.2,
      opacity: 0.75,
    },
  ];
}

/** The four "pop" marks above the frame. */
export function buildRayStrokes(width: number): SketchStroke[] {
  return [
    { d: 'M -6,-2 L -14,-9', strokeWidth: 2 },
    { d: 'M 4,-5 L 2,-15', strokeWidth: 2 },
    { d: `M ${width - 4},-5 L ${width - 2},-15`, strokeWidth: 2 },
    { d: `M ${width + 6},-2 L ${width + 14},-9`, strokeWidth: 2 },
  ];
}

/** The turned-up bottom-right corner, for "draft"/"file" affordances. */
export function buildFoldStrokes(width: number, height: number): SketchStroke[] {
  return [
    {
      d: `M ${width - 15},${height - 1} L ${width - 1},${height - 15}`,
      strokeWidth: 1.4,
    },
    {
      d: `M ${width - 12},${height - 2} L ${width - 2},${height - 12}`,
      strokeWidth: 0.9,
    },
    { d: `M ${width - 9},${height - 2} L ${width - 2},${height - 9}`, strokeWidth: 0.9 },
    { d: `M ${width - 6},${height - 2} L ${width - 2},${height - 6}`, strokeWidth: 0.9 },
  ];
}

/** Dash patterns, kept here so "dashed" looks hand-drawn (uneven) not CSS-y. */
export const SKETCH_DASH_OUTER = '8 6 11 5 7 7';
export const SKETCH_DASH_INNER = '6 8 9 7';
