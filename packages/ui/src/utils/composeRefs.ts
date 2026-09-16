import type * as React from 'react';

type PossibleRef<T> = React.Ref<T> | undefined;

function assignRef<T>(ref: PossibleRef<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref && typeof ref === 'object') {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

/** Point several refs at the same node — needed whenever a component both
 *  measures its own DOM node and forwards a ref to the consumer. */
export function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => assignRef(ref, node));
  };
}
