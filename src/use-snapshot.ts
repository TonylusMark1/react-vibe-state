import type * as Types from './types';
import type { State, AnyState } from './state';

//

/**
 * React hook that returns a reactive snapshot and selectors from a State instance.
 * 
 * Alternative to `state.useSnapshot()` method for those who prefer standalone hooks.
 * Both approaches are functionally identical.
 * 
 * @param state - The State instance to get snapshot from
 * @returns Object with reactive `state` snapshot and bound `selectors`
 * 
 * @example
 * ```tsx
 * import { useSnapshot } from 'react-vibe-state';
 * 
 * function Counter() {
 *   const { state, selectors } = useSnapshot(appState);
 *   return <div>{state.count}</div>;
 * }
 * ```
 */
export function useSnapshot<
  TRootState extends object,
  TGlobalSelectors extends Types.ApiMethods<TRootState>,
  TGlobalActions extends Types.ApiMethods<TRootState>,
  TSlices extends readonly Types.AnySlice[]
>(
  state: State<TRootState, TGlobalSelectors, TGlobalActions, TSlices>
): {
  state: Types.InferStateFromSlices<TRootState, TSlices>;
  selectors: Types.InferApi<TGlobalSelectors, TSlices, 'selectors'>;
};

/**
 * React hook that returns a reactive snapshot and selectors for a specific slice.
 * 
 * Use this overload to scope reactivity to only a specific slice, which can
 * improve performance by avoiding re-renders from unrelated state changes.
 * 
 * @param state - The State instance to get snapshot from
 * @param sliceKey - The key of the slice to get snapshot for
 * @returns Object with reactive slice `state` and slice `selectors`
 * 
 * @example
 * ```tsx
 * function UserList() {
 *   const { state, selectors } = useSnapshot(appState, 'users');
 *   return <ul>{selectors.getActiveUsers().map(...)}</ul>;
 * }
 * ```
 */
export function useSnapshot<
  TRootState extends object,
  TGlobalSelectors extends Types.ApiMethods<TRootState>,
  TGlobalActions extends Types.ApiMethods<TRootState>,
  TSlices extends readonly Types.AnySlice[],
  const TSliceKey extends TSlices[number]['key']
>(
  state: State<TRootState, TGlobalSelectors, TGlobalActions, TSlices>,
  sliceKey: TSliceKey
): {
  state: Types.MapSlices<TSlices, 'state'>[TSliceKey];
  selectors: Types.MapSlices<TSlices, 'selectors'>[TSliceKey];
};

export function useSnapshot(state: AnyState, sliceKey?: string) {
  return state.useSnapshot(sliceKey);
}
