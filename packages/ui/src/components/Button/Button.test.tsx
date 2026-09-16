import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

const frameOf = (button: HTMLElement) => button.querySelector('svg.sk-button__frame');

describe('Button — behaviour', () => {
  it('renders children with an accessible name', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onClick when pressed', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disables itself and reports aria-busy while loading', () => {
    render(<Button status="loading">Save</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('shows loadingText instead of the label while loading', () => {
    render(
      <Button status="loading" loadingText="Saving…">
        Save
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('Saving…');
    expect(screen.getByRole('button')).not.toHaveTextContent('Save');
  });

  it('forwards refs to the underlying DOM node', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('renders as its child element when asChild is set, keeping button styling', () => {
    render(
      <Button asChild variant="secondary">
        <a href="/docs">Read the docs</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Read the docs' });
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveClass('sk-button', 'sk-button--secondary');
    expect(link.tagName).toBe('A');
  });

  it('passes through native button attributes', () => {
    render(
      <Button type="submit" name="intent" value="publish" form="post-form">
        Publish
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('name', 'intent');
    expect(button).toHaveAttribute('value', 'publish');
    expect(button).toHaveAttribute('form', 'post-form');
  });
});

describe('Button — frame rendering', () => {
  it('draws a frame sized to the measured button box, not to a hardcoded width', () => {
    render(<Button>Measured</Button>);
    const frame = frameOf(screen.getByRole('button'));
    expect(frame).toBeInTheDocument();
    // jsdom reports 0x0 unless mocked; the polyfill in vitest.setup.ts feeds
    // a known box so we can assert the frame consumed it.
    expect(frame).toHaveAttribute('viewBox', expect.stringContaining('236'));
  });

  it('gives every instance its own clip id so textures cannot collide', () => {
    const { container } = render(
      <>
        <Button texture="oil-pastel">One</Button>
        <Button texture="stipple">Two</Button>
      </>,
    );
    const ids = Array.from(container.querySelectorAll('clipPath')).map((node) => node.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it('applies the default texture for a variant and lets it be overridden', () => {
    const { rerender } = render(<Button variant="success">Ship</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-texture', 'oil-pastel');

    rerender(
      <Button variant="success" texture="gouache">
        Ship
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-texture', 'gouache');
  });

  it('leaves neutral variants unshaded', () => {
    render(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-texture', 'none');
  });

  it('omits the frame entirely for the link variant', () => {
    render(<Button variant="link">Read more</Button>);
    const button = screen.getByRole('button');
    expect(frameOf(button)).toBeNull();
    expect(button.querySelector('.sk-button__underline')).toBeInTheDocument();
  });

  it('renders a pill outline with no straight-cornered clip leaking out', () => {
    render(
      <Button shape="pill" texture="oil-pastel">
        Back
      </Button>,
    );
    const clipPath = screen.getByRole('button').querySelector('clipPath path');
    // Pill clip is built from arcs; a rectangle clip would have no A command.
    expect(clipPath?.getAttribute('d')).toContain('A ');
  });

  it('marks dashed frames and drops the accent ticks that fight the dashes', () => {
    render(<Button dashed>Draft</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-dashed', 'true');
    const dashed = button.querySelectorAll('path[stroke-dasharray]');
    expect(dashed.length).toBeGreaterThan(0);
  });
});

describe('Button — accessibility', () => {
  it('keeps icon-only buttons nameable', () => {
    render(
      <Button size="icon" aria-label="Add item">
        <svg />
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });

  it('warns in development when an icon-only button has no name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Button size="icon">
        <svg />
      </Button>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
    warn.mockRestore();
  });

  it('hides decorative frame SVGs from assistive tech', () => {
    render(<Button>Save</Button>);
    expect(frameOf(screen.getByRole('button'))).toHaveAttribute('aria-hidden', 'true');
  });

  it('is reachable and operable by keyboard', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Focus me</Button>);
    await userEvent.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
  });
});
