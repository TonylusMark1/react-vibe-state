import type * as Valtio from 'valtio';

import type * as Types from './types';

//

/**
 * Configuration for creating a slice.
 */
export interface SliceConfig<
  TState extends object,
  TSelectors extends Types.ApiMethods<TState> = {},
  TActions extends Types.ApiMethods<TState> = {}
> {
  /** Initial state object, or a factory function that returns the initial state. */
  initial: TState | (() => TState);
  /** Selector methods for deriving values. `this` is bound to immutable snapshot (read-only). */
  selectors?: TSelectors & ThisType<Valtio.Snapshot<TState>>;
  /** Action methods for mutating state. `this` is bound to mutable state proxy. */
  actions?: TActions & ThisType<TState>;
  /** Optional validation function. Returns true if state structure is valid. */
  validate?: (state: unknown) => boolean;
  /** Called when stored data fails validation (before falling back to initial state). */
  onStorageValidationFail?: (state: unknown) => void;
  /** Called when remote update fails validation (before throwing error). */
  onRemoteUpdateValidationFail?: (state: unknown) => void;
}

//

/**
 * Creates a modular slice of state with its own selectors and actions.
 * 
 * Slices allow organizing complex state into logical, self-contained units.
 * Each slice has its own state, selectors, and actions scoped to that slice.
 * 
 * @param config - Slice configuration
 * @returns A Slice object to pass to createState's `slices` object
 * 
 * @example
 * ```ts
 * const usersSlice = createSlice({
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
 * 
 * // Use in createState
 * createState({
 *   name: 'app',
 *   initial: {},
 *   slices: { users: usersSlice }
 * });
 * ```
 */
export function createSlice<
  TState extends object,
  TSelectors extends Types.ApiMethods<TState> = {},
  TActions extends Types.ApiMethods<TState> = {}
>(
  config: SliceConfig<TState, TSelectors, TActions>
): Types.Slice<TState, TSelectors, TActions> {
  return {
    initial: config.initial,
    selectors: config.selectors ?? {} as TSelectors,
    actions: config.actions ?? {} as TActions,
    validate: config.validate,
    onStorageValidationFail: config.onStorageValidationFail,
    onRemoteUpdateValidationFail: config.onRemoteUpdateValidationFail,
  };
}
