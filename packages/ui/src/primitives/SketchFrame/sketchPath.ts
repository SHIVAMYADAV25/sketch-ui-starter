/**
 * Pure SVG path builders for the hand-drawn rectangle used by <SketchFrame>.
 *
 * These are plain functions that take numbers and return a `d` string —
 * deterministic, so the same (width, height, radius) always produces the
 * exact same path. That matters for two reasons:
 *   1. Server-rendered and client-rendered markup match exactly (no
 *      hydration mismatch, no visible "jump" on mount).
 *   2. Re-renders don't cause the border to redraw with a different wobble.
 *
 * Kept separate from SketchFrame.tsx on purpose: this is the ONE file you
 * rewrite when you migrate to rough.js. Swap the body of these two
 * functions for calls to `rough.generator.path(...)`, keep the same
 * (width, height, radius) -> string signature, and nothing in
 * SketchFrame.tsx or any component that uses it needs to change.
 */

export function buildSketchRectOuterPath(
  width: number,
  height: number,
  r: number,
): string {
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

export function buildSketchRectInnerPath(
  width: number,
  height: number,
  r: number,
): string {
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
