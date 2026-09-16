import type { Meta, StoryObj } from '@storybook/react';

import { SketchFrame } from './SketchFrame';
import { SKETCH_TEXTURES } from './sketchTexture';

/**
 * The frame on its own, so you can build Card, Input, Modal or anything else
 * on the same border without copying the path math.
 */
const meta: Meta<typeof SketchFrame> = {
  title: 'Primitives/SketchFrame',
  component: SketchFrame,
  parameters: { layout: 'centered' },
  args: {
    width: 240,
    height: 64,
    shape: 'rect',
    texture: 'oil-pastel',
    ornament: 'none',
  },
  argTypes: {
    texture: { control: 'select', options: SKETCH_TEXTURES },
    shape: { control: 'inline-radio', options: ['rect', 'pill'] },
    ornament: { control: 'inline-radio', options: ['none', 'rays', 'fold'] },
    width: { control: { type: 'range', min: 60, max: 600, step: 2 } },
    height: { control: { type: 'range', min: 32, max: 240, step: 2 } },
  },
  decorators: [
    (Story, ctx) => (
      <div
        style={{
          position: 'relative',
          width: (ctx.args as { width: number }).width,
          height: (ctx.args as { height: number }).height,
          margin: 48,
          // The frame reads these; a real component sets them from its variant.
          ['--sk-frame-paper' as string]: '#b8cff7',
          ['--sk-frame-ink' as string]: '#4f78d6',
          ['--sk-frame-line' as string]: '#1a1a1a',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SketchFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AnyContentCanSitInIt: Story = {
  args: { width: 320, height: 160, texture: 'blueprint' },
  render: (args) => (
    <>
      <SketchFrame width={0} height={0} {...args} />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: 20,
          fontFamily: 'var(--sk-font-display)',
          fontSize: '1.2rem',
        }}
      >
        A card, an input, a modal — the frame doesn’t know or care what it wraps.
      </div>
    </>
  ),
};
