import type * as Valtio from 'valtio';

import type * as Types from './types';

//

/**
 * Configuration for creating a slice.
 */
export interface SliceConfig<
  TKey extends string,
  TState extends object,
  TSelectors extends Types.ApiMethods<TState> = {},
  TActions extends Types.ApiMethods<TState> = {}
> {
  /** Unique identifier for the slice. Becomes a property key on the root state. */
  key: TKey;
  /** Initial state object, or a factory function that returns the initial state. */
  initial: TState | (() => TState);
  /** Selector methods for deriving values. `this` is bound to immutable snapshot (read-only). */
  selectors?: TSelectors & ThisType<Valtio.Snapshot<TState>>;
  /** Action methods for mutating state. `this` is bound to mutable state proxy. */
  actions?: TActions & ThisType<TState>;
  /** Optional validation function. Returns true if state structure is valid. */
  validate?: (state: unknown) => boolean;
  /** Called when stored data fails validation (before falling back to initial state). */
  onStorageValidationFail?: (data: unknown) => void;
}

//

/**
 * Creates a modular slice of state with its own selectors and actions.
 * 
 * Slices allow organizing complex state into logical, self-contained units.
 * Each slice has its own state, selectors, and actions scoped to that slice.
 * 
 * @param config - Slice configuration
 * @returns A Slice object to pass to createState's `slices` array
 * 
 * @example
 * ```ts
 * const usersSlice = createSlice({
 *   key: 'users',
 *   initial: { list: [], selectedId: null },
 *   selectors: {
 *     selectedUser() {
 *       return this.list.find(u => u.id === this.selectedId);
 *     }
 *   },
 *   actions: {
 *     addUser(user) { this.list.push(user); },
 *     selectUser(id) { this.selectedId = id; }
 *   }
 * });
 * ```
 */
export function createSlice<
  const TKey extends string,
  TState extends object,
  TSelectors extends Types.ApiMethods<TState> = {},
  TActions extends Types.ApiMethods<TState> = {}
>(
  config: SliceConfig<TKey, TState, TSelectors, TActions>
): Types.Slice<TKey, TState, TSelectors, TActions> {
  return {
    key: config.key,
    initial: config.initial,
    selectors: config.selectors ?? {} as TSelectors,
    actions: config.actions ?? {} as TActions,
    validate: config.validate,
    onStorageValidationFail: config.onStorageValidationFail,
  };
}
