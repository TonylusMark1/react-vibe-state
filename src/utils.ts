export const isBrowser = (
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined'
);

export const isServer = !isBrowser;

//

/**
 * Resolves a value or getter function to its actual value.
 */
export function resolveValue<T>(valueOrGetter: T | (() => T)): T {
  return typeof valueOrGetter === 'function' ? (valueOrGetter as () => T)() : valueOrGetter;
}
