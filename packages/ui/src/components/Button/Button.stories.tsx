import type { Meta, StoryObj } from '@storybook/react';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DownloadIcon,
  HeartIcon,
  MenuIcon,
  PlusIcon,
  TrashIcon,
} from '../../icons';
import { SKETCH_TEXTURES } from '../../primitives/SketchFrame';

import { Button } from './Button';
import { BUTTON_SIZES, BUTTON_STATUSES, BUTTON_VARIANTS } from './Button.types';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A button drawn with a hand-sketched SVG frame. Colour comes from `variant`, ' +
          'shading from `texture`, and the frame sizes itself to the real rendered box, ' +
          'so long labels and full-width layouts work without retuning anything.',
      },
    },
  },
  args: {
    children: 'Save changes',
    variant: 'primary',
    size: 'md',
    shape: 'rect',
    status: 'idle',
    ornament: 'none',
    dashed: false,
    fullWidth: false,
  },
  argTypes: {
    variant: { control: 'select', options: BUTTON_VARIANTS },
    size: { control: 'select', options: BUTTON_SIZES },
    status: { control: 'select', options: BUTTON_STATUSES },
    shape: { control: 'inline-radio', options: ['rect', 'pill'] },
    texture: {
      control: 'select',
      options: SKETCH_TEXTURES,
      description: 'Overrides the variant default (`oil-pastel` for coloured variants).',
    },
    ornament: { control: 'inline-radio', options: ['none', 'rays', 'fold'] },
    dashed: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    leftIcon: { control: false },
    rightIcon: { control: false },
    asChild: { control: false },
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ *
 * Layout helpers used by the multi-example stories
 * ------------------------------------------------------------------ */

const Grid = ({
  children,
  columns = 4,
}: {
  children: React.ReactNode;
  columns?: number;
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap: '48px 32px',
      alignItems: 'end',
      padding: '16px',
    }}
  >
    {children}
  </div>
);

const Cell = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'grid', justifyItems: 'center', gap: 12 }}>
    <span
      style={{ fontFamily: 'var(--sk-font-display)', fontSize: '1rem', color: '#555' }}
    >
      {label}
    </span>
    {children}
  </div>
);

/* ------------------------------------------------------------------ *
 * Stories
 * ------------------------------------------------------------------ */

export const Playground: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Grid>
      {BUTTON_VARIANTS.map((variant) => (
        <Cell key={variant} label={variant}>
          <Button variant={variant}>
            {variant[0]!.toUpperCase() + variant.slice(1)}
          </Button>
        </Cell>
      ))}
    </Grid>
  ),
};

export const Textures: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Grid>
      {SKETCH_TEXTURES.map((texture) => (
        <Cell key={texture} label={texture}>
          <Button variant="primary" texture={texture}>
            {texture}
          </Button>
        </Cell>
      ))}
      <Cell label="gouache + danger">
        <Button variant="danger" texture="gouache">
          Delete forever
        </Button>
      </Cell>
    </Grid>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Grid columns={5}>
      {BUTTON_SIZES.map((size) => (
        <Cell key={size} label={size}>
          <Button
            variant="secondary"
            size={size}
            aria-label={size === 'icon' ? 'Add item' : undefined}
          >
            {size === 'icon' ? <PlusIcon /> : size}
          </Button>
        </Cell>
      ))}
    </Grid>
  ),
};

export const Statuses: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Grid>
      <Cell label="idle">
        <Button>Save</Button>
      </Cell>
      <Cell label="loading">
        <Button status="loading" loadingText="Saving…">
          Save
        </Button>
      </Cell>
      <Cell label="success">
        <Button variant="success" status="success">
          Saved
        </Button>
      </Cell>
      <Cell label="error">
        <Button variant="danger" status="error">
          Couldn’t save
        </Button>
      </Cell>
      <Cell label="disabled">
        <Button variant="secondary" disabled>
          Disabled
        </Button>
      </Cell>
    </Grid>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Grid>
      <Cell label="leftIcon">
        <Button variant="secondary" leftIcon={<PlusIcon />}>
          Add item
        </Button>
      </Cell>
      <Cell label="rightIcon">
        <Button variant="secondary" rightIcon={<ArrowRightIcon />}>
          Continue
        </Button>
      </Cell>
      <Cell label="both">
        <Button
          variant="secondary"
          leftIcon={<DownloadIcon />}
          rightIcon={<ArrowRightIcon />}
        >
          Download
        </Button>
      </Cell>
      <Cell label="on a painted fill">
        <Button variant="danger" texture="gouache" leftIcon={<TrashIcon />}>
          Delete
        </Button>
      </Cell>
      <Cell label="icon only">
        <Button size="icon" variant="secondary" aria-label="Add item" ornament="rays">
          <PlusIcon />
        </Button>
      </Cell>
      <Cell label="icon + label beside">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <Button size="icon" variant="secondary" aria-label="Open menu">
            <MenuIcon />
          </Button>
          <span style={{ fontFamily: 'var(--sk-font-display)', fontSize: '1.25rem' }}>
            Menu
          </span>
        </div>
      </Cell>
      <Cell label="tinted icon">
        <Button variant="secondary" leftIcon={<HeartIcon style={{ color: '#e04f6e' }} />}>
          Like
        </Button>
      </Cell>
    </Grid>
  ),
};

export const ShapesAndOrnaments: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Grid>
      <Cell label="pill · back">
        <Button shape="pill" leftIcon={<ArrowLeftIcon />}>
          Back
        </Button>
      </Cell>
      <Cell label="pill · teal override">
        <Button
          shape="pill"
          rightIcon={<ArrowRightIcon />}
          style={
            {
              '--sk-frame-paper': 'var(--sk-color-teal-100)',
              '--sk-frame-ink': 'var(--sk-color-teal-500)',
            } as React.CSSProperties
          }
        >
          Continue
        </Button>
      </Cell>
      <Cell label="rays">
        <Button variant="secondary" ornament="rays">
          Primary action
        </Button>
      </Cell>
      <Cell label="dashed + fold">
        <Button variant="secondary" dashed ornament="fold">
          Draft file
        </Button>
      </Cell>
    </Grid>
  ),
};

export const Layout: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 40, width: 420, padding: 16 }}>
      <Cell label="fullWidth inside a 420px column">
        <Button fullWidth variant="success">
          Full width
        </Button>
      </Cell>
      <Cell label="a long label the frame grows around">
        <Button variant="secondary">
          Send the invitation to everyone on the guest list
        </Button>
      </Cell>
      <Cell label="width set by the consumer">
        <Button variant="info" style={{ width: 320 }}>
          Fixed 320px
        </Button>
      </Cell>
    </div>
  ),
};

/** Renders a real anchor while keeping the button's styling. */
export const AsLink: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'inline-flex', gap: 24, alignItems: 'center', padding: 16 }}>
      <Button asChild variant="secondary" rightIcon={<ArrowRightIcon />}>
        <a href="https://example.com">Open the docs</a>
      </Button>
      <Button variant="link">Text button</Button>
    </div>
  ),
};

/** The full reference sheet, matching the design mock one-to-one. */
export const ReferenceSheet: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <Grid>
      <Cell label="Primary">
        <Button variant="secondary" ornament="rays">
          Primary
        </Button>
      </Cell>
      <Cell label="Secondary">
        <Button variant="secondary">Secondary</Button>
      </Cell>
      <Cell label="Filled">
        <Button variant="primary">Filled</Button>
      </Cell>
      <Cell label="Dashed">
        <Button variant="secondary" dashed>
          Dashed
        </Button>
      </Cell>

      <Cell label="Success">
        <Button variant="success">Success</Button>
      </Cell>
      <Cell label="Danger">
        <Button variant="danger">Danger</Button>
      </Cell>
      <Cell label="Warning">
        <Button variant="warning">Warning</Button>
      </Cell>
      <Cell label="Info">
        <Button variant="info">Info</Button>
      </Cell>

      <Cell label="Left icon">
        <Button variant="secondary" leftIcon={<PlusIcon />}>
          Add new
        </Button>
      </Cell>
      <Cell label="Right icon">
        <Button variant="secondary" rightIcon={<ArrowRightIcon />}>
          Continue
        </Button>
      </Cell>
      <Cell label="Download">
        <Button variant="secondary" ornament="fold" leftIcon={<DownloadIcon />}>
          Download
        </Button>
      </Cell>
      <Cell label="Icon only">
        <Button size="icon" variant="secondary" ornament="rays" aria-label="Add">
          <PlusIcon />
        </Button>
      </Cell>

      <Cell label="Cross hatch">
        <Button variant="success" texture="cross-hatch">
          Cross hatch
        </Button>
      </Cell>
      <Cell label="Stipple">
        <Button variant="danger" texture="stipple">
          Stipple grain
        </Button>
      </Cell>
      <Cell label="Scribble">
        <Button variant="warning" texture="scribble">
          Scribble wax
        </Button>
      </Cell>
      <Cell label="Blueprint">
        <Button variant="info" texture="blueprint">
          Blueprint grid
        </Button>
      </Cell>

      <Cell label="Solid blue">
        <Button variant="primary" texture="gouache">
          Solid blue
        </Button>
      </Cell>
      <Cell label="Solid green">
        <Button variant="success" texture="gouache">
          Solid green
        </Button>
      </Cell>
      <Cell label="Solid crimson">
        <Button variant="danger" texture="gouache">
          Solid crimson
        </Button>
      </Cell>
      <Cell label="Solid amber">
        <Button variant="warning" texture="gouache" leftIcon={<PlusIcon />}>
          Add item
        </Button>
      </Cell>
    </Grid>
  ),
};
