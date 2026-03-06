import { State, type Config, type AnyState } from './state';

import * as Utils from './utils';
import type * as Types from './types';

//

const cache: Map<string, AnyState> = (globalThis as any).__REACT_VIBE_STATE_CACHE__ ??= new Map();

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
 *   slices: { users: usersSlice, todos: todosSlice }
 * });
 * ```
 */
export function createState<
  TRootState extends object,
  TGlobalSelectors extends Types.ApiMethods<TRootState> = {},
  TGlobalActions extends Types.ApiMethods<TRootState> = {},
  TSlices extends Types.SlicesRecord = {}
>(
  config: Config<TRootState, TGlobalSelectors, TGlobalActions, TSlices>
): State<TRootState, TGlobalSelectors, TGlobalActions, TSlices> {
  const cached = cache.get(config.name);

  if (cached) {
    if (Utils.isBrowser && (import.meta as any).hot) {
      const generationChanged = config.generation !== undefined && cached.generation !== config.generation;

      //

      const consoleWarnHeader = `HMR / react-vibe-state / state "${config.name}":`;
      const consoleWarnBody = `- State will use cached instance, config changes won't apply.`;
      const consoleWarnFooter = `- You may want to reload the page.`;

      if (generationChanged) {
        const consoleWarnBodyExtra = `- Generation changed (${cached.generation} → ${config.generation}), but cached version is still using old.`;

        console.warn(
          `%c${consoleWarnHeader}\n%c${consoleWarnBody}\n${consoleWarnBodyExtra}\n${consoleWarnFooter}`,
          'font-weight: bold', ''
        );
      }
      else {
        console.warn(
          `%c${consoleWarnHeader}\n%c${consoleWarnBody}\n${consoleWarnFooter}`,
          'font-weight: bold', ''
        );
      }
    }
    
    return cached;
  }

  //

  const state = new State(config);

  cache.set(config.name, state);

  return state;
}
