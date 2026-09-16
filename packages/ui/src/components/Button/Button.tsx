import * as React from 'react';

import { SketchFrame } from '../../primitives/SketchFrame';

import type { ButtonProps } from './Button.types';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    status = 'idle',
    loadingText = 'Loading…',
    leftIcon,
    rightIcon,
    fullWidth = false,
    type = 'button',
    disabled,
    className,
    children,
    ...rest
  },
  forwardedRef,
) {
  const innerRef = React.useRef<HTMLButtonElement>(null);
  const [size2d, setSize2d] = React.useState<{ width: number; height: number } | null>(
    null,
  );

  React.useImperativeHandle(forwardedRef, () => innerRef.current as HTMLButtonElement);

  React.useLayoutEffect(() => {
    const node = innerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize2d({ width, height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const isDisabled = disabled || status === 'loading';
  const isIconOnly = size === 'icon';
  const classNames = [
    'sk-button',
    `sk-button--variant-${variant}`,
    `sk-button--size-${size}`,
    fullWidth && 'sk-button--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  function renderContent() {
    if (status === 'loading')
      return (
        <>
          <span className="sk-button__spinner" aria-hidden="true" />
          {!isIconOnly ? loadingText : null}
        </>
      );
    if (status === 'success')
      return (
        <>
          <span aria-hidden="true">✓</span>
          {!isIconOnly ? children : null}
        </>
      );
    if (status === 'error')
      return (
        <>
          <span aria-hidden="true">!</span>
          {!isIconOnly ? children : null}
        </>
      );
    if (isIconOnly) return children;
    return (
      <>
        {leftIcon}
        {children}
        {rightIcon}
      </>
    );
  }

  return (
    <button
      ref={innerRef}
      type={type}
      disabled={isDisabled}
      aria-busy={status === 'loading' || undefined}
      className={classNames}
      {...rest}
    >
      {size2d ? (
        <SketchFrame
          width={size2d.width}
          height={size2d.height}
          radius={isIconOnly ? size2d.height / 2 : 10}
          className="sk-button__frame"
        />
      ) : null}
      <span className="sk-button__content">{renderContent()}</span>
    </button>
  );
});
Button.displayName = 'Button';
