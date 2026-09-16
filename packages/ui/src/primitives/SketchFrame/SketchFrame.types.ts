import type { SketchTexture } from './sketchTexture';

export type SketchShape = 'rect' | 'pill';

/** Decoration drawn outside the frame outline. */
export type SketchOrnament = 'none' | 'rays' | 'fold';

export interface SketchFrameProps {
  /** Measured width of the element being framed, in px. */
  width: number;
  /** Measured height of the element being framed, in px. */
  height: number;
  shape?: SketchShape;
  /** Corner radius for `shape="rect"`. Ignored for pills (always height / 2). */
  radius?: number;
  texture?: SketchTexture;
  dashed?: boolean;
  ornament?: SketchOrnament;
  /** Extra ink weighting + corner ticks. Rectangles only. */
  accents?: boolean;
  strokeWidth?: number;
  className?: string;
}
