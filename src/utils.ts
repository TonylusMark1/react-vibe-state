import type * as Types from './types';

//

export const isBrowser = (
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined'
);

export const isServer = !isBrowser;

//

/**
 * Resolves initial state value, executing it if it's a function.
 */
export function resolveInitial<T>(initial: T | (() => T)): T {
  return typeof initial === 'function' ? (initial as () => T)() : initial;
}

//

/**
 * Builds a storage/sync key from parts.
 * Returns "prefix:name" or "prefix:name:generation" depending on whether generation is provided.
 */
export function buildKey(
  prefix: string,
  separator: string,
  name: string,
  generation?: string | null
): string {
  const base = `${prefix}${separator}${name}`;
  return generation ? `${base}${separator}${generation}` : base;
}

//

/**
 * Validates state name.
 */
export function validateName(name: string, separator: string): void {
  if (!name || !name.trim())
    throw new Error('State name cannot be empty');
  
  if (name.includes(separator))
    throw new Error(`State name cannot contain separator "${separator}"`);
  
  if (!/^[a-zA-Z0-9_-]+$/.test(name))
    throw new Error('State name can only contain letters, numbers, underscores and hyphens');
}

//

const storageAvailabilityCache = new Map<Types.Storage, boolean | Promise<boolean>>();

/**
 * Checks if given storage type is available.
 * For IndexedDB, this actually attempts to open a test database
 * to catch Safari/WebView quota/privacy issues.
 * Uses pending promise tracking to avoid duplicate tests when called concurrently.
 */
export async function isStorageAvailable(type: Types.Storage): Promise<boolean> {
  const cached = storageAvailabilityCache.get(type);

  if (cached !== undefined)
    return cached;

  //

  if (type === "indexed-db") {
    if (typeof globalThis.indexedDB === 'undefined' || globalThis.indexedDB === null) {
      storageAvailabilityCache.set(type, false);
      return false;
    }

    const pending = new Promise<boolean>((resolve) => {
      const finalize = (result: boolean) => {
        storageAvailabilityCache.set(type, result);
        resolve(result);
      };
      
      const testDb = `__react-vibe-state_test_${Date.now()}_${Math.random().toString(36).slice(2, 9)}__`;

      try {
        const request = globalThis.indexedDB.open(testDb, 1);

        request.onsuccess = async () => {
          request.result.close();
          globalThis.indexedDB.deleteDatabase(testDb);
          finalize(true);
        };

        request.onerror = () => finalize(false);
        request.onblocked = () => finalize(false);
      }
      catch {
        finalize(false);
      }
    });

    storageAvailabilityCache.set(type, pending);
    return pending;
  }

  //

  throw new Error(`Unknown storage type: ${type}`);
}
