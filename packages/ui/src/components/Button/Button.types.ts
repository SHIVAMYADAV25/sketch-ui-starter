import type { ButtonHTMLAttributes, ReactNode } from 'react';

import type {
  SketchOrnament,
  SketchShape,
  SketchTexture,
} from '../../primitives/SketchFrame';

/** What the action means. Drives colour only — never shape or size. */
export type ButtonVariant =
  'primary' | 'secondary' | 'ghost' | 'link' | 'success' | 'danger' | 'warning' | 'info';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

/** Async lifecycle of the action, as one value rather than four booleans that
 *  can contradict each other (`loading` and `success` both true). */
export type ButtonStatus = 'idle' | 'loading' | 'success' | 'error';

export const BUTTON_VARIANTS: readonly ButtonVariant[] = [
  'primary',
  'secondary',
  'ghost',
  'link',
  'success',
  'danger',
  'warning',
  'info',
];

export const BUTTON_SIZES: readonly ButtonSize[] = ['sm', 'md', 'lg', 'xl', 'icon'];

export const BUTTON_STATUSES: readonly ButtonStatus[] = [
  'idle',
  'loading',
  'success',
  'error',
];

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'color'
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: SketchShape;
  /**
   * How the fill is shaded. Defaults to `oil-pastel` for the coloured
   * variants and `none` for primary/secondary/ghost/link — pass a value to
   * override, e.g. `texture="gouache"` for an opaque painted button.
   */
  texture?: SketchTexture;
  /** Decoration outside the frame: burst marks or a turned-up corner. */
  ornament?: SketchOrnament;
  /** Draw the outline as uneven hand-drawn dashes. */
  dashed?: boolean;
  status?: ButtonStatus;
  /** Label shown while `status="loading"`. Falls back to `children`. */
  loadingText?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  /** Render the child element instead of a <button>, keeping all styling. */
  asChild?: boolean;
}
