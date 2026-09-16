import * as React from 'react';

import type { SketchFrameProps } from './SketchFrame.types';
import {
  SKETCH_DASH_INNER,
  SKETCH_DASH_OUTER,
  SKETCH_FRAME_PADDING,
  buildFoldStrokes,
  buildInnerPath,
  buildOuterPath,
  buildRayStrokes,
  buildRectAccentStrokes,
  resolveRadius,
  snap,
} from './sketchPath';
import { renderTexture } from './sketchTexture';

/**
 * The hand-drawn border every component in this library sits inside.
 *
 * It is absolutely positioned and sized to exactly cover its parent, which
 * must establish a positioning context (`position: relative`). Width and
 * height are required in pixels — the SVG can't infer them — so callers
 * measure their own box (see `useMeasuredSize`) and pass the result down.
 *
 * Deliberately takes no colour props. It reads these custom properties from
 * whatever ancestor defines them:
 *   --sk-frame-paper      flat fill behind the texture
 *   --sk-frame-ink        texture mark colour
 *   --sk-frame-highlight  highlight pass (oil-pastel)
 *   --sk-frame-line       the outline itself
 */
export function SketchFrame({
  width,
  height,
  shape = 'rect',
  radius = 10,
  texture = 'none',
  dashed = false,
  ornament = 'none',
  accents = true,
  strokeWidth = 1.8,
  className,
}: SketchFrameProps) {
  // One id per instance. The original code passed ids in by hand, so any
  // button that forgot one shared `clip-undefined` with every other button
  // and inherited the wrong clip shape.
  const clipId = `sk-frame-clip-${React.useId().replace(/:/g, '')}`;

  if (!(width > 0) || !(height > 0)) return null;

  const w = snap(width);
  const h = snap(height);
  const r = resolveRadius(shape, h, radius);
  const pad = SKETCH_FRAME_PADDING;

  const outerPath = buildOuterPath(shape, w, h, r);
  const innerPath = buildInnerPath(shape, w, h, r);

  // Accent ticks are rectangle-specific ink weighting; on a pill they'd cut
  // across the round ends, and on a dashed frame they'd contradict the dashes.
  const showAccents = accents && shape === 'rect' && !dashed;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox={`${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`}
      style={{
        position: 'absolute',
        top: -pad,
        left: -pad,
        width: w + pad * 2,
        height: h + pad * 2,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <defs>
        {/* Clipping to the wobbly outline itself — not to a plain rounded
            rect — is what keeps texture from leaking past the round ends of a
            pill or the corners of a rectangle. */}
        <clipPath id={clipId}>
          <path d={outerPath} />
        </clipPath>
      </defs>

      <path d={outerPath} style={{ fill: 'var(--sk-frame-paper, transparent)' }} />

      {texture !== 'none' && (
        <g clipPath={`url(#${clipId})`} data-sk-texture={texture}>
          {renderTexture(texture, { width: w, height: h })}
        </g>
      )}

      <path
        d={outerPath}
        fill="none"
        style={{ stroke: 'var(--sk-frame-line, currentColor)' }}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? SKETCH_DASH_OUTER : undefined}
      />

      <path
        d={innerPath}
        fill="none"
        style={{ stroke: 'var(--sk-frame-line, currentColor)' }}
        strokeWidth={strokeWidth * 0.66}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? SKETCH_DASH_INNER : undefined}
        opacity={0.8}
      />

      {showAccents &&
        buildRectAccentStrokes(w, h, r).map((stroke, i) => (
          <path
            key={`accent-${i}`}
            d={stroke.d}
            fill="none"
            style={{ stroke: 'var(--sk-frame-line, currentColor)' }}
            strokeWidth={stroke.strokeWidth}
            strokeLinecap="round"
            opacity={stroke.opacity}
          />
        ))}

      {ornament === 'rays' &&
        buildRayStrokes(w).map((stroke, i) => (
          <path
            key={`ray-${i}`}
            d={stroke.d}
            fill="none"
            style={{ stroke: 'var(--sk-frame-line, currentColor)' }}
            strokeWidth={stroke.strokeWidth}
            strokeLinecap="round"
          />
        ))}

      {ornament === 'fold' &&
        buildFoldStrokes(w, h).map((stroke, i) => (
          <path
            key={`fold-${i}`}
            d={stroke.d}
            fill="none"
            style={{ stroke: 'var(--sk-frame-line, currentColor)' }}
            strokeWidth={stroke.strokeWidth}
            strokeLinecap="round"
          />
        ))}
    </svg>
  );
}

SketchFrame.displayName = 'SketchFrame';
