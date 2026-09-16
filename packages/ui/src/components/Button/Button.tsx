import * as React from 'react';

import { useMeasuredSize } from '../../hooks/useMeasuredSize';
import { SketchFrame } from '../../primitives/SketchFrame';
import type { SketchTexture } from '../../primitives/SketchFrame';
import { SketchUnderline } from '../../primitives/SketchUnderline';
import { Slot, Slottable, composeRefs, cx } from '../../utils';

import type { ButtonProps, ButtonVariant } from './Button.types';

/** Coloured variants are shaded by default; neutral ones are left flat. */
const DEFAULT_TEXTURE: Record<ButtonVariant, SketchTexture> = {
  primary: 'oil-pastel',
  secondary: 'none',
  ghost: 'none',
  link: 'none',
  success: 'oil-pastel',
  danger: 'oil-pastel',
  warning: 'oil-pastel',
  info: 'oil-pastel',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    shape = 'rect',
    texture,
    ornament = 'none',
    dashed = false,
    status = 'idle',
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    asChild = false,
    type = 'button',
    disabled,
    className,
    children,
    ...rest
  },
  forwardedRef,
) {
  const innerRef = React.useRef<HTMLButtonElement>(null);
  const size2d = useMeasuredSize(innerRef);

  const isIconOnly = size === 'icon';
  const isLink = variant === 'link';
  const isLoading = status === 'loading';
  const isDisabled = disabled || isLoading;
  const resolvedTexture = texture ?? DEFAULT_TEXTURE[variant];

  const hasAccessibleName = Boolean(
    rest['aria-label'] ?? rest['aria-labelledby'] ?? rest.title,
  );
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (isIconOnly && !hasAccessibleName) {
      console.warn(
        '[sketch-ui] <Button size="icon"> has no accessible name. Pass `aria-label`.',
      );
    }
  }, [isIconOnly, hasAccessibleName]);

  const Root = asChild ? Slot : 'button';

  const rootProps = {
    ref: composeRefs(forwardedRef, innerRef) as React.Ref<HTMLButtonElement>,
    className: cx(
      'sk-button',
      `sk-button--${variant}`,
      `sk-button--size-${size}`,
      fullWidth && 'sk-button--full-width',
      className,
    ),
    'data-shape': shape,
    'data-texture': resolvedTexture,
    'data-status': status,
    'data-dashed': dashed || undefined,
    'aria-busy': isLoading || undefined,
    'aria-disabled': asChild && isDisabled ? true : undefined,
    ...rest,
    ...(asChild ? {} : { type, disabled: isDisabled }),
  };

  function renderStatusGlyph() {
    if (isLoading) return <span className="sk-button__spinner" aria-hidden="true" />;
    if (status === 'success') return <span aria-hidden="true">✓</span>;
    if (status === 'error') return <span aria-hidden="true">!</span>;
    return null;
  }

  // With `asChild`, the consumer's element is the root, so its own children
  // have to be marked rather than rendered directly here.
  function renderLabel() {
    const label = isLoading ? (loadingText ?? children) : children;
    return asChild ? <Slottable>{label}</Slottable> : label;
  }

  function renderContent() {
    const glyph = renderStatusGlyph();

    // An icon button has no room for a label, so a status glyph replaces the
    // icon entirely rather than crowding in beside it.
    if (isIconOnly) return glyph ?? renderLabel();

    return (
      <>
        {glyph}
        {status === 'idle' ? leftIcon : null}
        <span className="sk-button__label">{renderLabel()}</span>
        {status === 'idle' ? rightIcon : null}
      </>
    );
  }

  const content = <span className="sk-button__content">{renderContent()}</span>;

  return (
    <Root {...(rootProps as React.ComponentProps<'button'>)}>
      {/* The frame is only rendered once the real box has been measured —
          drawing it against a guessed width is what made the old border float
          away from the button at odd sizes. */}
      {!isLink && size2d ? (
        <SketchFrame
          className="sk-button__frame"
          width={size2d.width}
          height={size2d.height}
          shape={shape}
          radius={isIconOnly ? 8 : 10}
          texture={resolvedTexture}
          dashed={dashed}
          ornament={ornament}
        />
      ) : null}

      {isLink ? (
        <span className="sk-button__link-body">
          {content}
          <SketchUnderline className="sk-button__underline" />
        </span>
      ) : (
        content
      )}
    </Root>
  );
});

Button.displayName = 'Button';
