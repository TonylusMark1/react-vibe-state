import type * as Types from './types';
import type { State, AnyState } from './state';

//

/**
 * React hook that returns a reactive snapshot, selectors, and actions from a State instance.
 * 
 * Alternative to `state.useSnapshot()` method for those who prefer standalone hooks.
 * Both approaches are functionally identical.
 * 
 * Note: `actions` are included for convenience, but they operate on the actual mutable state
 * (not the snapshot). Calling an action will mutate the real state and trigger reactivity updates.
 * 
 * @param state - The State instance to get snapshot from
 * @returns Object with reactive `state` snapshot, bound `selectors`, and `actions`
 * 
 * @example
 * ```tsx
 * import { useSnapshot } from 'react-vibe-state';
 * 
 * function Counter() {
 *   const { state, selectors, actions } = useSnapshot(appState);
 *   return <div>{state.count}</div>;
 * }
 * ```
 */
export function useSnapshot<
  TRootState extends object,
  TGlobalSelectors extends Types.ApiMethods<TRootState>,
  TGlobalActions extends Types.ApiMethods<TRootState>,
  TSlices extends Types.SlicesRecord
>(
  state: State<TRootState, TGlobalSelectors, TGlobalActions, TSlices>
): {
  state: Types.InferStateFromSlices<TRootState, TSlices>;
  selectors: Types.InferApi<TGlobalSelectors, TSlices, 'selectors'>;
  actions: Types.InferApi<TGlobalActions, TSlices, 'actions'>;
};

/**
 * React hook that returns a reactive snapshot, selectors, and actions for a specific slice.
 * 
 * Use this overload to scope reactivity to only a specific slice, which can
 * improve performance by avoiding re-renders from unrelated state changes.
 * 
 * Note: `actions` are included for convenience, but they operate on the actual mutable state
 * (not the snapshot). Calling an action will mutate the real state and trigger reactivity updates.
 * 
 * @param state - The State instance to get snapshot from
 * @param sliceKey - The key of the slice to get snapshot for
 * @returns Object with reactive slice `state`, slice `selectors`, and slice `actions`
 * 
 * @example
 * ```tsx
 * function UserList() {
 *   const { state, selectors, actions } = useSnapshot(appState, 'users');
 *   return <ul>{selectors.getActiveUsers().map(...)}</ul>;
 * }
 * ```
 */
export function useSnapshot<
  TRootState extends object,
  TGlobalSelectors extends Types.ApiMethods<TRootState>,
  TGlobalActions extends Types.ApiMethods<TRootState>,
  TSlices extends Types.SlicesRecord,
  const TSliceKey extends keyof TSlices & string
>(
  state: State<TRootState, TGlobalSelectors, TGlobalActions, TSlices>,
  sliceKey: TSliceKey
): {
  state: Types.MapSlices<TSlices, 'state'>[TSliceKey];
  selectors: Types.MapSlices<TSlices, 'selectors'>[TSliceKey];
  actions: Types.MapSlices<TSlices, 'actions'>[TSliceKey];
};

export function useSnapshot(state: AnyState, sliceKey?: string) {
  return state.useSnapshot(sliceKey as any);
}
