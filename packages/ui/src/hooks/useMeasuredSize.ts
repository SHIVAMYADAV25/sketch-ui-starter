import * as React from 'react';

export interface MeasuredSize {
  width: number;
  height: number;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

/**
 * Reports the live border-box size of a DOM node.
 *
 * Needed because the hand-drawn frame is an SVG that has to be told its
 * dimensions in pixels, while the components it decorates are sized
 * intrinsically by their content and padding. Measuring — rather than
 * hardcoding a width per size token — is what lets a button hold a long
 * translated label, or stretch to `width: 100%`, without the border breaking.
 *
 * Returns `null` until the first measurement lands, so callers can skip
 * rendering the frame on the server pass instead of drawing it at the wrong
 * size and snapping.
 */
export function useMeasuredSize<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
): MeasuredSize | null {
  const [size, setSize] = React.useState<MeasuredSize | null>(null);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const apply = (width: number, height: number) => {
      setSize((previous) =>
        previous && previous.width === width && previous.height === height
          ? previous
          : { width, height },
      );
    };

    // Measure synchronously before paint so the frame is present in the very
    // first frame the user sees rather than popping in one tick later.
    const rect = node.getBoundingClientRect();
    apply(rect.width, rect.height);

    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const box = entry.borderBoxSize?.[0];
      if (box) {
        apply(box.inlineSize, box.blockSize);
      } else {
        // Never fall back to `entry.contentRect` — that's the *content* box,
        // so on a padded element it reports a frame several dozen pixels too
        // small, which is exactly the shrunken border in the bug report.
        const fallback = (entry.target as HTMLElement).getBoundingClientRect();
        apply(fallback.width, fallback.height);
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
