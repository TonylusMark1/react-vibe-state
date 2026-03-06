import * as Y from 'yjs';

//

export interface StorageGenericConfig {
  key: string;
  ydoc: Y.Doc;
  onWarn?: (warning: unknown) => void;
}

//

/**
 * Abstract base class for storage adapters.
 * Each adapter handles persistence and generation purging for a specific storage backend.
 * The `State` class creates and manages the adapter instance.
 */
export abstract class StorageGeneric<
  Config extends StorageGenericConfig = StorageGenericConfig,
  Provider extends any = any
> {
  protected static readonly availableCache = new Map<Function, boolean | Promise<boolean> | undefined>();

  //

  protected readonly config: Config;

  provider?: Provider;

  //

  constructor(config: Config) {
    this.config = config;
  }

  //

  static async isAvailable(): Promise<boolean> {
    const cached = this.availableCache.get(this);

    if (cached !== undefined)
      return cached;
    
    //

    const result = await this.checkAvailability();

    this.availableCache.set(this, result);

    return result;
  }

  protected static checkAvailability(): Promise<boolean> {
    throw new Error('Not implemented');
  }
  
  //

  /**
   * Initializes persistence - loads stored data into the Y.Doc.
   * Resolves when the initial sync from storage is complete.
   */
  abstract initPersistence(): Promise<void>;

  /**
   * Deletes all databases/entries with keys starting with the given prefix.
   * Keys in skipKeys array are excluded from deletion.
   */
  abstract purgeByPrefix(keyPrefix: string, skipKeys?: string[]): Promise<void>;
}
