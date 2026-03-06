export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

//

/**
 * Supported storage backends for state persistence.
 * Currently only IndexedDB is supported, with potential for future extensions.
 */
export type Storage = "indexed-db";

/**
 * Origin of an external update that triggered validation.
 */
export type UpdateOrigin = 'storage' | 'remote';

//

/**
 * Initial state can be an object or a function returning an object.
 * Function is useful for dynamic values (e.g., reading from cookies, setting current timestamp).
 */
export type InitialState<T extends object> = T | (() => T);

//

/**
 * Resolves the initial type - handles object or function.
 */
type ResolveInitial<T> = T extends () => infer R ? R : T;

//

/**
 * Type constraint for selector and action method definitions.
 * Methods receive `this` bound to the state they operate on.
 */
export interface ApiMethods<TState extends object> {
  [key: string]: (this: TState, ...args: any[]) => any;
}

/**
 * Type representing a slice definition created by `createSlice()`.
 */
export interface Slice<
  TState extends object = object,
  TSelectors extends ApiMethods<TState> = {},
  TActions extends ApiMethods<TState> = {}
> {
  /** Initial state value or factory function */
  readonly initial: TState | (() => TState);
  /** Selector methods for deriving values */
  readonly selectors: TSelectors;
  /** Action methods for mutating state */
  readonly actions: TActions;
  /** Optional validation function for storage/remote data */
  readonly validate?: (state: unknown) => boolean;
  /** Callback when an external update (storage or remote) fails validation */
  readonly onUpdateValidationFail?: (state: unknown, origin: UpdateOrigin) => void;
}

/**
 * Any slice type.
 */
export type AnySlice = Slice<any, any, any>;

/**
 * Record of slices keyed by their identifier.
 */
export type SlicesRecord = Record<string, AnySlice>;

/**
 * Infers state type from a single slice.
 */
export type InferSliceState<T extends AnySlice> = ResolveInitial<T['initial']>;

/**
 * Type for bound API methods.
 * Methods already have bound this, so we call them normally.
 */
export type BoundApi<TApi extends Record<string, (...args: any[]) => any>> = {
  [K in keyof TApi]: OmitThisParameter<TApi[K]>;
};

/**
 * Unified mapped type for extracting slice data by property.
 */
export type MapSlices<
  TSlices extends SlicesRecord,
  TExtract extends 'state' | 'selectors' | 'actions'
> = {
  [K in keyof TSlices]: 
    TExtract extends 'state' ? InferSliceState<TSlices[K]> :
    TExtract extends 'selectors' ? BoundApi<TSlices[K]['selectors']> :
    BoundApi<TSlices[K]['actions']>;
};

/**
 * Infers full state type from root state and slices.
 * Combines root state with all slice states.
 */
export type InferStateFromSlices<
  TRootState extends object,
  TSlices extends SlicesRecord
> = TRootState & MapSlices<TSlices, 'state'>;

/**
 * Infers API type (selectors or actions) from global API and slices.
 */
export type InferApi<
  TGlobalApi extends ApiMethods<any>,
  TSlices extends SlicesRecord,
  TKind extends 'selectors' | 'actions'
> = BoundApi<TGlobalApi> & MapSlices<TSlices, TKind>;
