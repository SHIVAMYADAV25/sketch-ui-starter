import * as React from 'react';

import { composeRefs } from './composeRefs';

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

/**
 * Marks where the consumer's element sits inside a component's own markup.
 *
 * `asChild` has to answer two questions at once: which element becomes the
 * root (the consumer's `<a>`), and where that element's original children go
 * once the component has wrapped them in its internal structure. Without this
 * marker a Slot handed `[frame, label]` sees more than one child, finds no
 * single element to clone onto, and renders nothing at all.
 */
export function Slottable({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
Slottable.__sketchSlottable = true;

function isSlottable(
  child: React.ReactNode,
): child is React.ReactElement<{ children: React.ReactNode }> {
  return (
    React.isValidElement(child) &&
    (child.type as { __sketchSlottable?: boolean })?.__sketchSlottable === true
  );
}

/**
 * Finds the <Slottable> anywhere in a component's internal markup, and returns
 * that tree with the marker swapped for the consumer element's own children.
 *
 * The search is recursive rather than direct-children-only (which is all Radix
 * does) because our components wrap their label in structural spans —
 * `.sk-button__content > .sk-button__label > children`. A shallow scan finds
 * nothing there and silently renders an empty element.
 */
function extractSlottable(node: React.ReactNode): {
  target: React.ReactElement | null;
  node: React.ReactNode;
} {
  let target: React.ReactElement | null = null;

  function walk(current: React.ReactNode): React.ReactNode {
    if (Array.isArray(current)) return React.Children.map(current, walk);
    if (!React.isValidElement(current)) return current;

    if (isSlottable(current)) {
      const inner = current.props.children;
      if (React.isValidElement(inner)) {
        target = inner;
        return (inner.props as { children?: React.ReactNode }).children;
      }
      return inner;
    }

    const childProps = current.props as { children?: React.ReactNode };
    if (target || childProps.children === undefined) return current;

    const nextChildren = walk(childProps.children);
    return nextChildren === childProps.children
      ? current
      : React.cloneElement(
          current as React.ReactElement<{ children?: React.ReactNode }>,
          {
            children: nextChildren,
          },
        );
  }

  const next = walk(node);
  return { target, node: next };
}

function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...slotProps, ...childProps };

  for (const key of Object.keys(slotProps)) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];

    if (/^on[A-Z]/.test(key) && typeof slotValue === 'function') {
      // Both handlers run, the slot's first — a consumer's own onClick never
      // silently replaces the component's behaviour.
      merged[key] =
        typeof childValue === 'function'
          ? (...args: unknown[]) => {
              (slotValue as (...a: unknown[]) => void)(...args);
              (childValue as (...a: unknown[]) => void)(...args);
            }
          : slotValue;
    }
  }

  if (slotProps.className || childProps.className) {
    merged.className = [slotProps.className, childProps.className]
      .filter(Boolean)
      .join(' ');
  }
  if (slotProps.style || childProps.style) {
    merged.style = {
      ...(slotProps.style as React.CSSProperties),
      ...(childProps.style as React.CSSProperties),
    };
  }

  return merged;
}

function cloneOnto(
  element: React.ReactElement,
  slotProps: Record<string, unknown>,
  forwardedRef: React.Ref<HTMLElement>,
  children?: React.ReactNode,
) {
  const childProps = element.props as Record<string, unknown>;
  const merged = mergeProps(slotProps, childProps);

  // `element.ref` moved into props in React 19; read both so this works on 18.
  const childRef = (childProps.ref ??
    (element as unknown as { ref?: React.Ref<HTMLElement> }).ref) as
    React.Ref<HTMLElement> | undefined;
  merged.ref = composeRefs(forwardedRef, childRef);

  if (children !== undefined) merged.children = children;

  return React.cloneElement(element, merged);
}

/**
 * Renders its props onto its child element instead of a DOM node of its own.
 *
 * Same idea as Radix's Slot, reimplemented here so the library keeps zero
 * runtime dependencies. It's what lets `<Button asChild><a href="/x">` produce
 * a real anchor with the button's styling, instead of the common anti-pattern
 * of a <button> whose onClick calls router.push — which breaks middle-click,
 * "open in new tab", and link semantics for screen readers.
 */
export const Slot = React.forwardRef<HTMLElement, SlotProps>(function Slot(
  { children, ...slotProps },
  forwardedRef,
) {
  const { target, node } = extractSlottable(children);

  if (target) {
    // The consumer's element becomes the root; the component's own markup
    // moves inside it, with the element's original children spliced back into
    // the marker's position.
    return cloneOnto(target, slotProps as Record<string, unknown>, forwardedRef, node);
  }

  if (!React.isValidElement(children)) {
    if (process.env.NODE_ENV !== 'production' && children != null) {
      console.warn('[sketch-ui] `asChild` expects exactly one React element child.');
    }
    return null;
  }

  return cloneOnto(children, slotProps as Record<string, unknown>, forwardedRef);
});
