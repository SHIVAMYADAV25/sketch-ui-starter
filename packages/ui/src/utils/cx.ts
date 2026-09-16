/** Join conditional class names. Keeps JSX readable without pulling in clsx. */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
