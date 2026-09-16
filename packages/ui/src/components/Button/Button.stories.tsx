import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'success', 'danger', 'warning'],
    },

    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'icon'],
    },

    status: {
      control: 'select',
      options: ['idle', 'loading', 'success', 'error'],
    },

    loadingText: {
      control: 'text',
    },

    fullWidth: {
      control: 'boolean',
    },

    disabled: {
      control: 'boolean',
    },

    leftIcon: {
      control: false,
    },

    rightIcon: {
      control: false,
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/* -------------------------------------------------
   BASIC
------------------------------------------------- */

export const Primary: Story = {
  args: {
    children: 'Save',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Cancel',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'More',
    variant: 'ghost',
  },
};

/* -------------------------------------------------
   VARIANTS
------------------------------------------------- */

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
};

export const Danger: Story = {
  args: {
    children: 'Delete',
    variant: 'danger',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
};

/* -------------------------------------------------
   SIZES
------------------------------------------------- */

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    children: 'Extra Large',
    size: 'xl',
  },
};

export const Icon: Story = {
  args: {
    children: '★',
    size: 'icon',
    'aria-label': 'Favorite',
  },
};

/* -------------------------------------------------
   STATES
------------------------------------------------- */

export const Loading: Story = {
  args: {
    children: 'Save',
    status: 'loading',
    loadingText: 'Saving...',
  },
};

export const SuccessState: Story = {
  args: {
    children: 'Saved',
    status: 'success',
  },
};

export const ErrorState: Story = {
  args: {
    children: 'Try Again',
    status: 'error',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

/* -------------------------------------------------
   ICONS
------------------------------------------------- */

export const WithLeftIcon: Story = {
  args: {
    children: 'Download',
    leftIcon: <span aria-hidden="true">↓</span>,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Continue',
    rightIcon: <span aria-hidden="true">→</span>,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: 'Continue',
    leftIcon: <span aria-hidden="true">←</span>,
    rightIcon: <span aria-hidden="true">→</span>,
  },
};

/* -------------------------------------------------
   FULL WIDTH
------------------------------------------------- */

export const FullWidth: Story = {
  args: {
    children: 'Continue',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

/* -------------------------------------------------
   LONG CONTENT
------------------------------------------------- */

export const LongLabel: Story = {
  args: {
    children: 'This is a button with a longer label',
    size: 'md',
  },
};
