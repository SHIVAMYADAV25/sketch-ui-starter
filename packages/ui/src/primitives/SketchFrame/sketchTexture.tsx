import * as React from 'react';

/**
 * The fill textures a <SketchFrame> can be shaded with.
 *
 * Naming rule: each value names the *drawing medium or mark* being imitated,
 * never the colour or the component using it. Adding a texture = adding one
 * entry here and one renderer in TEXTURE_RENDERERS below; nothing else changes.
 *
 *   none         no shading, just the flat paper fill
 *   oil-pastel   diagonal waxy crayon strokes with lighter highlight passes
 *   gouache      opaque roller-laid paint (this was "solid-paint" before)
 *   cross-hatch  two opposing sets of thin pen strokes
 *   stipple      dotted ink grain
 *   blueprint    dashed graph-paper grid
 *   scribble     loose horizontal wave strokes
 */
export const SKETCH_TEXTURES = [
  'none',
  'oil-pastel',
  'gouache',
  'cross-hatch',
  'stipple',
  'blueprint',
  'scribble',
] as const;

export type SketchTexture = (typeof SKETCH_TEXTURES)[number];

/** Textures dense enough that light text sits on them more legibly than dark. */
export const OPAQUE_TEXTURES: readonly SketchTexture[] = ['gouache'];

export interface TextureRenderArgs {
  width: number;
  height: number;
}

/**
 * Colours come from CSS custom properties, not props, so a consumer can
 * retheme every texture in the library from a stylesheet:
 *   --sk-frame-ink        the mark colour
 *   --sk-frame-highlight  the lighter pass on top (oil-pastel only)
 *
 * They're applied via `style`, not the `stroke`/`fill` presentation
 * attributes — `var()` is only resolved in the style position.
 */
const inkStroke: React.CSSProperties = { stroke: 'var(--sk-frame-ink, currentColor)' };
const inkFill: React.CSSProperties = { fill: 'var(--sk-frame-ink, currentColor)' };
const highlightStroke: React.CSSProperties = {
  stroke: 'var(--sk-frame-highlight, rgba(255,255,255,0.85))',
};

/* ------------------------------------------------------------------ *
 * 1. Oil pastel — diagonal wax strokes + highlight passes
 * ------------------------------------------------------------------ */
function OilPastel({ width, height }: TextureRenderArgs) {
  const strokes: React.ReactElement[] = [];
  const spacing = 3.4;

  for (let x = -height * 1.2; x < width + height; x += spacing) {
    const jX = ((x * 17) % 7) - 3.5;
    const jY = ((x * 11) % 5) - 2.5;
    strokes.push(
      <line
        key={`wax-${x}`}
        x1={x + jX}
        y1={height + 6 + jY}
        x2={x + height * 0.95 + jX}
        y2={-6 + jY}
        style={inkStroke}
        strokeWidth={1.1 + ((x * 7) % 3) * 0.4}
        strokeLinecap="round"
        opacity={0.25 + (Math.sin(x * 0.45) + 1) * 0.22}
      />,
    );
  }

  for (let x = -height; x < width + height; x += spacing * 3.6) {
    const jX = ((x * 13) % 9) - 4.5;
    strokes.push(
      <line
        key={`hi-${x}`}
        x1={x + jX}
        y1={height + 5}
        x2={x + height * 0.9 + jX}
        y2={-5}
        style={highlightStroke}
        strokeWidth={1.1}
        strokeLinecap="round"
        opacity={0.38}
      />,
    );
  }

  return <>{strokes}</>;
}

/* ------------------------------------------------------------------ *
 * 2. Gouache — opaque paint laid down with a roller
 * ------------------------------------------------------------------ */
function Gouache({ width, height }: TextureRenderArgs) {
  const strokes: React.ReactElement[] = [];
  for (let y = 6; y < height; y += 8) {
    const jY = ((y * 13) % 5) - 2.5;
    strokes.push(
      <path
        key={`roller-${y}`}
        d={`M 4,${y + jY} Q ${width * 0.5},${y + jY + 2} ${width - 4},${y + jY}`}
        fill="none"
        style={inkStroke}
        strokeWidth={10}
        strokeLinecap="round"
        opacity={0.88}
      />,
    );
  }
  return (
    <>
      {/* Bleeds past the frame on purpose — the clip path trims it to shape. */}
      <rect
        x={-6}
        y={-6}
        width={width + 12}
        height={height + 12}
        style={inkFill}
        opacity={0.82}
      />
      {strokes}
    </>
  );
}

/* ------------------------------------------------------------------ *
 * 3. Cross hatch — two opposing sets of pen strokes
 * ------------------------------------------------------------------ */
function CrossHatch({ width, height }: TextureRenderArgs) {
  const lines: React.ReactElement[] = [];
  const step = 6;

  for (let x = -height; x < width + height; x += step) {
    lines.push(
      <line
        key={`ch1-${x}`}
        x1={x}
        y1={height + 4}
        x2={x + height * 0.9}
        y2={-4}
        style={inkStroke}
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.35}
      />,
    );
  }
  for (let x = -height; x < width + height; x += step * 1.25) {
    lines.push(
      <line
        key={`ch2-${x}`}
        x1={x}
        y1={-4}
        x2={x + height * 0.9}
        y2={height + 4}
        style={inkStroke}
        strokeWidth={0.85}
        strokeLinecap="round"
        opacity={0.3}
      />,
    );
  }
  return <>{lines}</>;
}

/* ------------------------------------------------------------------ *
 * 4. Stipple — ink grain
 * ------------------------------------------------------------------ */
function Stipple({ width, height }: TextureRenderArgs) {
  const dots: React.ReactElement[] = [];
  const count = Math.floor((width * height) / 95);
  const spanX = Math.max(width - 16, 1);
  const spanY = Math.max(height - 12, 1);

  for (let i = 0; i < count; i++) {
    dots.push(
      <circle
        key={`dot-${i}`}
        cx={8 + ((i * 37) % spanX)}
        cy={6 + ((i * 23) % spanY)}
        r={0.6 + ((i * 7) % 4) * 0.35}
        style={inkFill}
        opacity={0.22 + ((i * 13) % 5) * 0.12}
      />,
    );
  }
  return <>{dots}</>;
}

/* ------------------------------------------------------------------ *
 * 5. Blueprint — dashed graph grid
 * ------------------------------------------------------------------ */
function Blueprint({ width, height }: TextureRenderArgs) {
  const grid: React.ReactElement[] = [];
  const step = 10;

  for (let x = 6; x < width; x += step) {
    grid.push(
      <line
        key={`gv-${x}`}
        x1={x}
        y1={2}
        x2={x}
        y2={height - 2}
        style={inkStroke}
        strokeWidth={0.75}
        strokeDasharray="2 3"
        opacity={0.45}
      />,
    );
  }
  for (let y = 6; y < height; y += step) {
    grid.push(
      <line
        key={`gh-${y}`}
        x1={2}
        y1={y}
        x2={width - 2}
        y2={y}
        style={inkStroke}
        strokeWidth={0.75}
        strokeDasharray="2 3"
        opacity={0.45}
      />,
    );
  }
  return <>{grid}</>;
}

/* ------------------------------------------------------------------ *
 * 6. Scribble — loose horizontal waves
 * ------------------------------------------------------------------ */
function Scribble({ width, height }: TextureRenderArgs) {
  const paths: React.ReactElement[] = [];
  for (let i = 0; i < 5; i++) {
    const yBase = 10 + i * (height / 5.5);
    paths.push(
      <path
        key={`sc-${i}`}
        d={`M 10,${yBase} Q ${width * 0.25},${yBase + (i % 2 === 0 ? 5 : -5)} ${width * 0.5},${yBase} T ${width - 10},${yBase}`}
        fill="none"
        style={inkStroke}
        strokeWidth={1.3}
        strokeLinecap="round"
        opacity={0.32}
      />,
    );
  }
  return <>{paths}</>;
}

export const TEXTURE_RENDERERS: Record<
  SketchTexture,
  ((args: TextureRenderArgs) => React.ReactElement) | null
> = {
  none: null,
  'oil-pastel': OilPastel,
  gouache: Gouache,
  'cross-hatch': CrossHatch,
  stipple: Stipple,
  blueprint: Blueprint,
  scribble: Scribble,
};

export function renderTexture(texture: SketchTexture, args: TextureRenderArgs) {
  const Renderer = TEXTURE_RENDERERS[texture];
  return Renderer ? <Renderer {...args} /> : null;
}
