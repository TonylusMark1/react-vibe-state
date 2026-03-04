import { State, type Config, type AnyState } from './state';

import * as Utils from './utils';
import type * as Types from './types';

//

const cache = new Map<string, AnyState>();

//

/**
 * Creates a reactive State instance with optional persistence & cross-tab sync.
 * 
 * Instances are cached by name - calling with the same name returns the existing instance.
 * This ensures singleton behavior and supports Hot Module Replacement (HMR) during development.
 * You can refresh the page to ensure you get fully fresh instance.
 * 
 * @param config - Configuration options for the state
 * @returns A State instance with reactive state, selectors, and actions
 * 
 * @example
 * ```ts
 * const appState = createState({
 *   name: 'app',
 *   initial: { count: 0, user: null },
 *   selectors: {
 *     isLoggedIn() { return this.user !== null; }
 *   },
 *   actions: {
 *     increment() { this.count++; },
 *     setUser(user) { this.user = user; }
 *   },
 *   slices: [usersSlice, todosSlice]
 * });
 * ```
 */
export function createState<
  TRootState extends object,
  TGlobalSelectors extends Types.ApiMethods<TRootState> = {},
  TGlobalActions extends Types.ApiMethods<TRootState> = {},
  TSlices extends readonly Types.AnySlice[] = []
>(
  config: Config<TRootState, TGlobalSelectors, TGlobalActions, TSlices>
): State<TRootState, TGlobalSelectors, TGlobalActions, TSlices> {
  const cached = cache.get(config.name);

  if (cached) {
    const message = `State "${config.name}" already exists, returning cached instance. You may want to reload the page.`;

    if (Utils.isBrowser && (import.meta as any).hot)
      console.warn(message);
    
    return cached;
  }

  //

  const state = new State(config);

  cache.set(config.name, state);

  return state;
}
