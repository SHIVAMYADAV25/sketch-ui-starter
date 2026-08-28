import clsx, { type ClassValue } from 'clsx';

/** Thin wrapper around clsx kept as our own export so the merge strategy
 * (e.g. swapping in tailwind-merge later) can change without touching
 * every consumer's import. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}
