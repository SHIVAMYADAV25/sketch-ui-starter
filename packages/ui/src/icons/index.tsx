import * as React from 'react';

export type SketchIconProps = React.SVGProps<SVGSVGElement>;

/**
 * A small set of icons sized in `em` and stroked with `currentColor`.
 *
 * Both of those matter. The original icons hardcoded `stroke="#1a1a1a"` and
 * `width="18"`, so on a dark gouache fill the icon disappeared into the paint,
 * and on a `size="xl"` button it stayed tiny next to 1.6rem text. Inheriting
 * colour and scaling with font-size fixes both at once, and means consumers
 * can drop in lucide-react or their own set with no adapter.
 */
function Icon({ children, ...props }: SketchIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const PlusIcon = (props: SketchIconProps) => (
  <Icon {...props}>
    <path d="M12 5V19M5 12H19" />
  </Icon>
);

export const ArrowRightIcon = (props: SketchIconProps) => (
  <Icon {...props}>
    <path d="M5 12H19" />
    <path d="M13 6L19 12L13 18" />
  </Icon>
);

export const ArrowLeftIcon = (props: SketchIconProps) => (
  <Icon {...props}>
    <path d="M19 12H5" />
    <path d="M11 6L5 12L11 18" />
  </Icon>
);

export const DownloadIcon = (props: SketchIconProps) => (
  <Icon {...props} strokeWidth={1.8}>
    <path d="M12 3V15" />
    <path d="M7 10L12 15L17 10" />
    <path d="M4 17V20H20V17" />
  </Icon>
);

export const TrashIcon = (props: SketchIconProps) => (
  <Icon {...props} strokeWidth={1.8}>
    <path d="M3 6H21" />
    <path d="M9 3H15" />
    <path d="M5 6L7 20H17L19 6" />
  </Icon>
);

export const MenuIcon = (props: SketchIconProps) => (
  <Icon {...props}>
    <path d="M4 7H20" />
    <path d="M4 12H20" />
    <path d="M4 17H20" />
  </Icon>
);

export const HeartIcon = (props: SketchIconProps) => (
  <Icon {...props} strokeWidth={1.8}>
    <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9z" />
  </Icon>
);
