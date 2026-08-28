import { describe, expect, it } from 'vitest';

import { cn } from '../cn';

describe('cn', () => {
  it('merges truthy class names and drops falsy ones', () => {
    const showB = false;
    expect(cn('a', showB && 'b', 'c')).toBe('a c');
  });

  it('handles objects', () => {
    expect(cn({ a: true, b: false })).toBe('a');
  });
});
