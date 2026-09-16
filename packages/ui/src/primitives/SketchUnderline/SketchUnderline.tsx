export interface SketchUnderlineProps {
  className?: string;
  /** Height of the underline band in px. */
  height?: number;
}

/**
 * Two overlapping pen strokes used to underline text-only actions.
 *
 * Stretches to its container with `preserveAspectRatio="none"`, so it works
 * under a one-word label or a full sentence without re-tuning the path.
 * Colour comes from `--sk-underline`.
 */
export function SketchUnderline({ className, height = 8 }: SketchUnderlineProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height, overflow: 'visible' }}
    >
      <path
        d="M 2,4 C 25,2.5 60,5.5 98,3.5"
        fill="none"
        style={{ stroke: 'var(--sk-underline, currentColor)' }}
        strokeWidth={2.2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M 5,4.8 C 30,5.8 70,2.8 95,4.2"
        fill="none"
        style={{ stroke: 'var(--sk-underline, currentColor)' }}
        strokeWidth={1.1}
        strokeLinecap="round"
        opacity={0.8}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

SketchUnderline.displayName = 'SketchUnderline';
