import * as React from 'react';

import { buildSketchRectInnerPath, buildSketchRectOuterPath } from './sketchPath';

export interface SketchFrameProps {
  width: number;
  height: number;
  radius?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * Renders a hand-drawn rounded-rectangle fill + border, sized to exactly
 * match its parent.
 *
 * Deliberately does NOT accept color props. It reads `--sk-frame-fill` and
 * `--sk-frame-stroke` as CSS custom properties from whatever ancestor sets
 * them — the same theming mechanism every other component in this library
 * uses, so a consumer can retheme everything from CSS without touching
 * this file.
 */
export function SketchFrame({
  width,
  height,
  radius = 10,
  strokeWidth = 1.8,
  className,
}: SketchFrameProps) {
  if (width <= 0 || height <= 0) return null;

  const pad = 12;
  const outerPath = buildSketchRectOuterPath(width, height, radius);
  const innerPath = buildSketchRectInnerPath(width, height, radius);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{
        position: 'absolute',
        top: -pad,
        left: -pad,
        width: width + pad * 2,
        height: height + pad * 2,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
      viewBox={`${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`}
    >
      <path d={outerPath} style={{ fill: 'var(--sk-frame-fill, transparent)' }} />
      <path
        d={outerPath}
        fill="none"
        style={{ stroke: 'var(--sk-frame-stroke, currentColor)' }}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={innerPath}
        fill="none"
        style={{ stroke: 'var(--sk-frame-stroke, currentColor)' }}
        strokeWidth={strokeWidth * 0.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
    </svg>
  );
}
