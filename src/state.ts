import * as React from 'react';
import * as Valtio from 'valtio';
import * as ValtioYjs from 'valtio-yjs';
import * as Y from 'yjs';
import * as YWebrtc from 'y-webrtc';
import * as YIndexeddb from 'y-indexeddb';

import type * as Types from './types';

import * as Consts from './consts';
import * as Utils from './utils';

//

/**
 * Configuration options for creating a State instance.
 */
export interface Config<
  TRootState extends object,
  TGlobalSelectors extends Types.ApiMethods<TRootState> = {},
  TGlobalActions extends Types.ApiMethods<TRootState> = {},
  TSlices extends readonly Types.AnySlice[] = []
> {
  /**
   * Unique name identifying this state.
   * Must contain only letters, numbers, underscores, and hyphens.
   * Cannot contain key separator character. @see keySeparator
   */
  name: string;
  /**
   * Initial root state object, or a factory function that returns the initial state.
   * Factory functions are useful for dynamic values (e.g., reading from cookies, assinging current timestamp).
   */
  initial: Types.InitialState<TRootState>;
  /**
   * Global selector methods for deriving values from root state.
   * In selectors, `this` is bound to an immutable snapshot (read-only).
   */
  selectors?: TGlobalSelectors & ThisType<Valtio.Snapshot<TRootState>>;
  /**
   * Global action methods for mutating root state.
   * In actions, `this` is bound to the mutable state proxy.
   */
  actions?: TGlobalActions & ThisType<TRootState>;
  /**
   * Array of slices created with `createSlice()` to include in the state.
   * Each slice adds its state as a property keyed by the slice's key.
   */
  slices?: TSlices;
  /**
   * Enable persistence to IndexedDB and cross-tab synchronization via BroadcastChannel.
   * When enabled, state is automatically saved and synced between browser tabs.
   * @default true
   */
  persistAndSync?: boolean;
  /**
   * Storage type(s) to use for persistence.
   * - "indexed-db": use IndexedDB (default)
   * - ["indexed-db"]: array with potential fallbacks (future-proof)
   * Only used when `persistAndSync` is true.
   * @default "indexed-db"
   */
  storage?: Types.Storage | Types.Storage[];
  /**
   * Maximum time in milliseconds to wait for storage to load before timing out.
   * If storage takes longer, initialization will fail with an error.
   * @default 5000
   */
  readyTimeout?: number;
  /**
   * Generation identifier for state isolation.
   * When set, all previous generations (states with same name but different generation)
   * will be automatically purged from storage before initialization.
   * Useful for session-based state where old sessions should be invalidated or for versioning.
   */
  generation?: string | null;
  /**
   * Character used to separate parts of the storage key (prefix, name, generation).
   * The state name cannot contain this character.
   * @default ":"
   */
  keySeparator?: string;
  /**
   * Validation function for state structure. Should return true if valid.
   * 
   * Behavior:
   * - Initial state: throws if invalid (developer error - fix your code)
   * - Storage data: falls back to initial if invalid (stale/corrupted data)
   * - Remote updates: throws if invalid and `validateOnRemoteUpdate` is true
   * 
   * @param state - The state data to validate (type is unknown for safety)
   */
  validate?: null | ((state: unknown) => boolean);
  /**
   * When true, validates state after receiving updates from other browser tabs.
   * If validation fails, an error is thrown. Use `onRemoteUpdateValidationFail`
   * to handle this (e.g., trigger page refresh).
   * 
   * Requires `validate` to be set.
   * @default false
   */
  validateOnRemoteUpdate?: boolean;
  
  /**
   * Callback invoked when state initialization completes successfully.
   */
  onReady?: null | (() => void);
  /**
   * Called for non-critical warnings (e.g., failed to purge old generation database).
   * Use for logging or monitoring. These warnings don't affect core functionality.
   * @param warning - Warning data (type varies by warning source)
   */
  onWarn?: null | ((warning: unknown) => void);
  /**
   * Callback invoked when state initialization fails.
   * Receives the error that caused the failure.
   * @param error - The error that occurred during initialization
   */
  onError?: null | ((error: unknown) => void);

  /**
   * Called when a remote update (from another tab) fails validation.
   * Invoked before the error is thrown. Use this to trigger a page refresh
   * or other recovery action. Note: state may briefly contain invalid data.
   * @param state - The invalid state data received
   * @param sliceKey - The slice key if a specific slice failed, undefined for root state
   */
  onRemoteUpdateValidationFail?: null | ((state: unknown, sliceKey?: TSlices[number]['key']) => void);
  /**
   * Called when stored data fails validation during initialization.
   * Invoked before falling back to initial state. The invalid data will be
   * discarded and replaced with initial values.
   * @param state - The invalid state data from storage
   * @param sliceKey - The slice key if a specific slice failed, undefined for root state
   */
  onStorageValidationFail?: null | ((state: unknown, sliceKey?: TSlices[number]['key']) => void);
}

//

/**
 * Utility type representing any State instance regardless of its generic parameters.
 * Useful for typing collections or functions that accept any State.
 */
export type AnyState = State<any, any, any, any>;

/**
 * Reactive state container with optional persistence & cross-tab synchronization.
 * 
 * Features:
 * - Reactive state management powered by Valtio proxy
 * - Optional persistence to IndexedDB via Yjs CRDT (when `persistAndSync` is true)
 * - Optional cross-tab sync via BroadcastChannel (when `persistAndSync` is true)
 * - Type-safe selectors and actions with proper `this` binding
 * - Modular architecture with slices for organizing state
 * 
 * @example
 * ```ts
 * const appState = createState({
 *   name: 'app',
 *   initial: { count: 0 },
 *   actions: {
 *     increment() { this.count++ }
 *   }
 * });
 * 
 * // Use in React
 * const { state } = appState.useSnapshot();
 * ```
 */
export class State<
  TRootState extends object,
  TGlobalSelectors extends Types.ApiMethods<TRootState> = {},
  TGlobalActions extends Types.ApiMethods<TRootState> = {},
  TSlices extends readonly Types.AnySlice[] = []
> {
  private readonly config: Required<Config<TRootState, TGlobalSelectors, TGlobalActions, TSlices>>;
  private readonly key: string;

  private isReadyFlag: boolean = false;
  
  /**
   * Promise that resolves when state initialization completes.
   * When `persistAndSync` is enabled, resolves after storage is loaded and sync is established.
   * When `persistAndSync` is disabled, resolves immediately.
   * 
   * @example
   * ```ts
   * await appState.ready;
   * console.log('State is ready!');
   * ```
   */
  readonly ready: Promise<void>;

  private ydoc?: Y.Doc;
  private ymap?: Y.Map<unknown>;
  private providers?: Array<{ destroy: () => void }>;

  /**
   * The reactive state proxy. Mutations to this object trigger re-renders
   * in React components using useSnapshot.
   * 
   * For reading in React components, use `useSnapshot()` instead to get
   * a reactive snapshot that triggers re-renders on changes.
   */
  readonly state: Types.InferStateFromSlices<TRootState, TSlices>;
  
  /**
   * Bound selector methods for reading derived state.
   * In selectors, `this` referes to current state typed as read-only.
   * For reactive reads in React, use selectors from `useSnapshot()` instead.
   */
  readonly selectors: Types.InferApi<TGlobalSelectors, TSlices, 'selectors'>;
  
  /**
   * Bound action methods for mutating state.
   * In actions, `this` refers to the mutable state proxy.
   * Can be called from anywhere (React components, event handlers, etc.).
   */
  readonly actions: Types.InferApi<TGlobalActions, TSlices, 'actions'>;

  private activeStorage: Types.Storage | undefined;

  //

  constructor(config: Config<TRootState, TGlobalSelectors, TGlobalActions, TSlices>) {
    this.config = {
      persistAndSync: true,
      storage: "indexed-db",

      keySeparator: Consts.DEFAULT_KEY_SEPARATOR,
      readyTimeout: 5000,

      selectors: {} as TGlobalSelectors,
      actions: {} as TGlobalActions,
      slices: [] as unknown as TSlices,
      generation: null,

      validate: null,
      validateOnRemoteUpdate: false,
      
      onReady: null,
      onWarn: null,
      onError: null,

      onRemoteUpdateValidationFail: null,
      onStorageValidationFail: null,

      ...config
    };

    //

    Utils.validateName(this.config.name, this.config.keySeparator);

    //

    // Build key: prefix:name or prefix:name:generation
    this.key = Utils.buildKey(
      Consts.STORAGE_PREFIX,
      this.config.keySeparator,
      this.config.name,
      this.config.generation
    );

    //

    // Validate initial state before creating proxy
    this.validateInitialState();
    this.validateSliceKeys();

    // Create Valtio proxy with initial state (so UI works immediately)
    this.state = Valtio.proxy(this.buildEntireInitialState());

    //

    // Build selectors and actions
    this.selectors = this.buildSelectors();
    this.actions = this.buildActions();

    //

    if (Utils.isBrowser && this.config.persistAndSync) {
      // Yjs document for persistence and cross-tab sync
      this.ydoc = new Y.Doc();
      this.ymap = this.ydoc.getMap('state');
      this.providers = [];

      // Async initialization 
      this.ready = this.initialize().catch((error: unknown) => {
        this.config.onError?.(error);
        throw error;
      });
    }
    else {
      // Server-side or disabled persistAndSync - instant ready
      this.isReadyFlag = true;
      this.ready = Promise.resolve();
    }

    //

    this.ready.then(() => {
      this.config.onReady?.();
    });
  }

  private async initialize() { // (order is crucial!)
    // 0. FIRST detect and initialize storage
    await this.initStorage();

    // 1. Load from storage to Y.Doc (without binding!)
    const hadStoredData = await this.initPersistence();

    // 2. If we have data from Storage, validate and apply to state BEFORE binding
    //    This prevents overwriting Storage data with initial state
    if (hadStoredData)
      this.validateAndApplyFromStorage(this.ymap!.toJSON());

    // 3. NOW bind Valtio with Yjs
    //    - If Y.Map was empty → initial state will be copied to Y.Map
    //    - If Y.Map had data → state already has this data, deepEqual will prevent duplication
    ValtioYjs.bind(this.state, this.ymap!);

    // 4. Now we can enable cross-tab sync
    this.initSync();

    // 5. Set ready flag
    this.isReadyFlag = true;
  }

  //

  /**
   * Whether the state has completed initialization.
   * Check this before calling methods that require ready state (like `reset()`).
   */
  get isReady(): boolean {
    return this.isReadyFlag;
  }

  /**
   * The storage type currently in use for persistence.
   * Returns `undefined` if persistence is disabled or initialization hasn't completed yet.
   */
  get storage(): Types.Storage | undefined {
    return this.activeStorage;
  }

  //

  useSnapshot(): {
    state: Types.InferStateFromSlices<TRootState, TSlices>;
    selectors: Types.InferApi<TGlobalSelectors, TSlices, 'selectors'>;
  };

  useSnapshot<const TSliceKey extends TSlices[number]['key']>(
    sliceKey: TSliceKey
  ): {
    state: Types.MapSlices<TSlices, 'state'>[TSliceKey];
    selectors: Types.MapSlices<TSlices, 'selectors'>[TSliceKey];
  };

  /**
   * React hook that returns a reactive snapshot and selectors.
   * 
   * The returned `state` is an immutable snapshot that triggers re-renders
   * when relevant parts change. The returned `selectors` have `this` bound
   * to the reactive snapshot for proper reactivity.
   * 
   * @param sliceKey - Optional slice key to scope the snapshot to a specific slice
   * @returns Object containing reactive `state` snapshot and bound `selectors`
   * 
   * @example
   * ```tsx
   * // Full state
   * const { state, selectors } = appState.useSnapshot();
   * 
   * // Specific slice only
   * const { state, selectors } = appState.useSnapshot('users');
   * ```
   */
  useSnapshot(sliceKey?: string): { state: any; selectors: any } {
    const snap = Valtio.useSnapshot(this.state);
    const snapRef = React.useRef(snap);
    snapRef.current = snap;

    const selectors = React.useMemo(() => {
      if (Utils.isServer)
        return this.selectors;

      return this.buildReactiveSelectors(() => snapRef.current as any);
    }, [this]);

    if (sliceKey) {
      return {
        state: (snap as any)[sliceKey],
        selectors: (selectors as any)[sliceKey],
      };
    }

    return {
      state: snap,
      selectors,
    };
  }

  /**
   * Resets state to initial values. Can reset entire state or a specific slice.
   * 
   * @param sliceKey - Optional slice key to reset only that slice
   * @throws Error if called before state is ready
   * @throws Error if sliceKey doesn't match any registered slice
   * 
   * @example
   * ```ts
   * // Reset entire state
   * appState.reset();
   * 
   * // Reset only the 'users' slice
   * appState.reset('users');
   * ```
   */
  reset(sliceKey?: TSlices[number]['key']): void {
    if ( !this.isReadyFlag )
      throw new Error(`[${this.config.name}] Cannot reset State while it is not ready`);

    //

    if (sliceKey) {
      const slice = this.config.slices.find(s => s.key === sliceKey);

      if (!slice)
        throw new Error(`[${this.config.name}] Slice "${sliceKey}" not found`);

      Object.assign(this.state[sliceKey], this.buildSliceInitialState(slice));
      return;
    }

    Object.assign(this.state, this.buildEntireInitialState());
  }

  //

  private validateSliceKeys(): void {
    const rootKeys = new Set(Object.keys(Utils.resolveInitial(this.config.initial)));

    const sliceKeys = new Set<string>();

    for (const slice of this.config.slices) {
      if (rootKeys.has(slice.key))
        throw new Error(`[${this.config.name}] Slice key "${slice.key}" conflicts with root state property`);

      if (sliceKeys.has(slice.key))
        throw new Error(`[${this.config.name}] Duplicate slice key: "${slice.key}"`);

      sliceKeys.add(slice.key);
    }
  }

  //

  private validateInitialState(): void {
    if (this.config.validate) {
      const rootInitial = Utils.resolveInitial(this.config.initial);

      if (!this.config.validate(rootInitial))
        throw new Error(`[${this.config.name}] Root initial state failed validation`);
    }

    for (const slice of this.config.slices) {
      if (slice.validate) {
        const sliceInitial = Utils.resolveInitial(slice.initial);

        if (!slice.validate(sliceInitial))
          throw new Error(`[${this.config.name}] Slice "${slice.key}" initial state failed validation`);
      }
    }
  }

  private validateAndApplyFromStorage(fromStorage: Record<string, unknown>): void {
    const sliceKeys = new Set(this.config.slices.map(s => s.key));

    // Extract and validate root state (keys that are not slice keys)
    const rootFromStorage: Record<string, unknown> = {};
    for (const key of Object.keys(fromStorage)) {
      if (!sliceKeys.has(key))
        rootFromStorage[key] = fromStorage[key];
    }

    if (this.config.validate && !this.config.validate(rootFromStorage)) {
      for (const key of Object.keys(rootFromStorage))
        this.ymap!.delete(key);
      
      this.config.onStorageValidationFail?.(rootFromStorage);
    }
    else
      Object.assign(this.state, rootFromStorage);

    // Validate and apply each slice separately
    for (const slice of this.config.slices) {
      const sliceData = <Record<string, unknown>> fromStorage[slice.key];

      if (sliceData === undefined)
        continue;

      if (slice.validate && !slice.validate(sliceData)) {
        this.ymap!.delete(slice.key);

        slice.onStorageValidationFail?.(sliceData);
        this.config.onStorageValidationFail?.(sliceData, slice.key);
      }
      else
        (this.state as any)[slice.key] = sliceData;
    }
  }

  private validateRemoteUpdate(): void {
    const current = this.ymap!.toJSON();
    const sliceKeys = new Set(this.config.slices.map(s => s.key));

    // Validate root state
    if (this.config.validate) {
      const rootState: Record<string, unknown> = {};
      for (const key of Object.keys(current)) {
        if (!sliceKeys.has(key))
          rootState[key] = current[key];
      }

      if (!this.config.validate(rootState)) {
        this.config.onRemoteUpdateValidationFail?.(rootState);
        throw new Error(`[${this.config.name}] Remote update failed root state validation`);
      }
    }

    // Validate each slice
    for (const slice of this.config.slices) {
      if (!slice.validate)
        continue;

      const sliceData = current[slice.key];
      if (sliceData !== undefined && !slice.validate(sliceData)) {
        this.config.onRemoteUpdateValidationFail?.(sliceData, slice.key);
        throw new Error(`[${this.config.name}] Remote update failed validation for slice "${slice.key}"`);
      }
    }
  }

  //

  private buildEntireInitialState(): Types.InferStateFromSlices<TRootState, TSlices> {
    const resolvedInitial = <any>Utils.resolveInitial(this.config.initial);

    const initial = structuredClone(resolvedInitial);

    for (const slice of this.config.slices)
      initial[slice.key] = this.buildSliceInitialState(slice);

    return initial;
  }

  private buildSliceInitialState(slice: Types.AnySlice): Types.InferStateFromSlices<TRootState, TSlices> {
    const resolvedSliceInitial = Utils.resolveInitial(slice.initial);
    return structuredClone(resolvedSliceInitial);
  }

  //

  /**
   * Builds selectors with `this` bound to state proxy.
   */
  private buildSelectors(): Types.InferApi<TGlobalSelectors, TSlices, 'selectors'> {
    const selectors: Record<string, Function | Record<string, Function>> = {};

    // Global selectors - bind to root state
    for (const methodName of Object.keys(this.config.selectors ?? {})) {
      selectors[methodName] = (...args: unknown[]) => {
        return this.config.selectors[methodName].call(this.state, ...args);
      };
    }

    // Slice selectors - bind to slice state
    for (const slice of this.config.slices) {
      const sliceSelectors: Record<string, Function> = {};

      for (const methodName of Object.keys(slice.selectors ?? {})) {
        sliceSelectors[methodName] = (...args: unknown[]) => {
          return slice.selectors[methodName].call((this.state as any)[slice.key], ...args);
        };
      }

      selectors[slice.key] = sliceSelectors;
    }

    return selectors as Types.InferApi<TGlobalSelectors, TSlices, 'selectors'>;
  }

  /**
   * Builds actions with `this` bound to mutable state.
   */
  private buildActions(): Types.InferApi<TGlobalActions, TSlices, 'actions'> {
    const actions: Record<string, Function | Record<string, Function>> = {};

    // Global actions - bind to root state
    for (const methodName of Object.keys(this.config.actions ?? {})) {
      actions[methodName] = (...args: unknown[]) => {
        return (this.config.actions as any)[methodName].call(this.state, ...args);
      };
    }

    // Slice actions - bind to slice state
    for (const slice of this.config.slices) {
      const sliceActions: Record<string, Function> = {};

      for (const methodName of Object.keys(slice.actions ?? {})) {
        sliceActions[methodName] = (...args: unknown[]) => {
          return slice.actions[methodName].call((this.state as any)[slice.key], ...args);
        };
      }

      actions[slice.key] = sliceActions;
    }

    return actions as Types.InferApi<TGlobalActions, TSlices, 'actions'>;
  }

  /**
   * Builds reactive selectors with `this` bound to snapshot getter.
   * Used by useSnapshot hook for reactive reads.
   */
  private buildReactiveSelectors(
    stateGetter: () => Types.InferStateFromSlices<TRootState, TSlices>
  ): Types.InferApi<TGlobalSelectors, TSlices, 'selectors'> {
    const selectors: Record<string, Function | Record<string, Function>> = {};

    // Global selectors - bind to snapshot getter (reactive)
    for (const methodName of Object.keys(this.config.selectors ?? {})) {
      selectors[methodName] = (...args: unknown[]) => {
        return this.config.selectors[methodName].call(stateGetter(), ...args);
      };
    }

    // Slice selectors - bind to snapshot getter (reactive)
    for (const slice of this.config.slices) {
      const sliceSelectors: Record<string, Function> = {};

      for (const methodName of Object.keys(slice.selectors ?? {})) {
        sliceSelectors[methodName] = (...args: unknown[]) => {
          return slice.selectors[methodName].call((stateGetter() as any)[slice.key], ...args);
        };
      }

      selectors[slice.key] = sliceSelectors;
    }

    return selectors as Types.InferApi<TGlobalSelectors, TSlices, 'selectors'>;
  }

  //

  private async initStorage(): Promise<void> {
    // Normalize storage to array
    const storages: Types.Storage[] = typeof this.config.storage === 'string'
      ? [this.config.storage]
      : this.config.storage;

    //

    // Find first available storage
    this.activeStorage = await (async () => {
      for (const storage of storages) {
        if (await Utils.isStorageAvailable(storage))
          return storage;
      }

      throw new Error(`[${this.config.name}] No available storage found. Tried: ${storages.join(', ')}`);
    })();

    //

    if (this.config.generation) // Purge old generations before using storage
      await this.purgeOldGenerations(this.activeStorage);
  }

  //

  private async initPersistence() {
    if (this.activeStorage === undefined)
      return false;

    //

    let timeoutId: ReturnType<typeof setTimeout>;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(
        new Error('Persistence initialization timed out')
      ), this.config.readyTimeout);
    });

    //

    const initPromise = (() => {
      if (this.activeStorage === "indexed-db")
        return this.initPersistenceIndexeddb();

      return Promise.resolve(false);
    })();

    //

    try {
      return await Promise.race([initPromise, timeoutPromise]);
    }
    finally {
      clearTimeout(timeoutId!);
    }
  }

  private initPersistenceIndexeddb() {
    return new Promise<boolean>((resolve, reject) => {
      try {
        let hadStoredData: boolean = false;

        const trackOrigin = (_: unknown, origin: any) => {
          if (origin === indexeddbProvider)
            hadStoredData = true;
        };

        this.ydoc!.on('update', trackOrigin);
        const untrackOrigin = () => this.ydoc!.off('update', trackOrigin);

        //

        const indexeddbProvider = new YIndexeddb.IndexeddbPersistence(this.key, this.ydoc!);

        this.providers!.push(indexeddbProvider);

        indexeddbProvider.on('synced', () => {
          untrackOrigin();

          try {
            if (hadStoredData) { // Compact state (reduce storage usage)
              // It is undocumented method and is used internally by y-indexeddb to reduce storage usage every PREFERRED_TRIM_SIZE (500) updates.
              // Here we call it manually to reduce storage usage after first sync.
              YIndexeddb.storeState?.(indexeddbProvider, true);
            }

            resolve(hadStoredData);
          }
          catch (error) {
            reject(error);
          }
        });

        indexeddbProvider.on('error', (error: Error) => {
          untrackOrigin();
          reject(error);
        });

      }
      catch (error) {
        reject(error);
      }
    });
  }

  //

  private async purgeOldGenerations(storage: Types.Storage): Promise<void> {
    const sep = this.config.keySeparator;
    const prefix = Utils.buildKey(Consts.STORAGE_PREFIX, sep, this.config.name) + sep;

    //
    
    switch (storage) {
      case "indexed-db": {
        if (typeof globalThis.indexedDB === 'undefined' || globalThis.indexedDB === null)
          throw new Error(`[${this.config.name}] IndexedDB is not supported in this browser`);

        if (typeof globalThis.indexedDB.databases !== 'function')
          throw new Error(`[${this.config.name}] IndexedDB.databases is not supported in this browser`);

        //

        const databases = await globalThis.indexedDB.databases();

        const deletePromises = databases
          .map(db => db.name)
          .filter((name): name is string =>
            name !== undefined &&
            name.startsWith(prefix) &&
            name !== this.key
          )
          .map(name => new Promise<void>((resolve) => {
            const request = globalThis.indexedDB.deleteDatabase(name);
            request.onsuccess = () => resolve();
            request.onerror = () => {
              this.config.onWarn?.(`Failed to purge old generation database: ${name}`);
              resolve();
            };
            request.onblocked = () => {
              this.config.onWarn?.(`Purge blocked for database: ${name} (in use by another tab)`);
              resolve();
            };
          }));

        await Promise.all(deletePromises);
        break;
      }
    }
  }

  //

  private initSync(): void {
    const provider = new YWebrtc.WebrtcProvider(this.key, this.ydoc!, {
      signaling: [], // signaling is disabled, BroadcastChannel is all we need
    });

    this.providers!.push(provider);

    //

    if (this.config.validateOnRemoteUpdate) {
      this.ydoc!.on('update', (_: unknown, origin: unknown) => {
        if (origin !== provider)
          return;

        this.validateRemoteUpdate();
      });
    }
  }
}
