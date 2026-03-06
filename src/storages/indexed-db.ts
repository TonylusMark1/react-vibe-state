import * as YIndexeddb from 'y-indexeddb';

import { StorageGeneric, type StorageGenericConfig } from './generic';

//

export interface StorageIndexedDBConfig extends StorageGenericConfig {}

//

/**
 * IndexedDB storage adapter.
 * Persists Y.Doc state to IndexedDB via y-indexeddb and handles generation purging.
 */
export class StorageIndexedDB extends StorageGeneric<StorageIndexedDBConfig, YIndexeddb.IndexeddbPersistence> {
  protected static readonly indexedDB = globalThis.indexedDB;
  protected static readonly databaseTestName = `__react-vibe-state_test__${Date.now()}_${Math.random().toString(36).slice(2, 9)}__`;

  //

  protected static async checkAvailability(): Promise<boolean> {
    if (typeof globalThis.indexedDB === 'undefined' || globalThis.indexedDB === null)
      return false;

    //

    return new Promise<boolean>((resolve) => {
      try {
        const request = globalThis.indexedDB.open(StorageIndexedDB.databaseTestName, 1);

        request.onsuccess = () => {
          request.result.close();
          globalThis.indexedDB.deleteDatabase(StorageIndexedDB.databaseTestName);
          resolve(true);
        };

        request.onerror = () => resolve(false);
        request.onblocked = () => resolve(false);
      }
      catch {
        resolve(false);
      }
    });
  }

  //

  async initPersistence(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.provider = new YIndexeddb.IndexeddbPersistence(this.config.key, this.config.ydoc);

        this.provider.once('synced', () => {
          try {
            YIndexeddb.storeState?.(this.provider!, true);
            resolve();
          }
          catch (error) {
            reject(error);
          }
        });

        this.provider.on('error', (error: Error) => reject(error));
      }
      catch (error) {
        reject(error);
      }
    });
  }

  //

  async purgeByPrefix(keyPrefix: string, skipKeys?: string[]): Promise<void> {
    if (typeof StorageIndexedDB.indexedDB === 'undefined' || StorageIndexedDB.indexedDB === null)
      throw new Error('IndexedDB is not supported in this browser');

    if (typeof StorageIndexedDB.indexedDB.databases !== 'function')
      throw new Error('IndexedDB.databases() is not supported in this browser');

    //

    const databases = await StorageIndexedDB.indexedDB.databases();
    const keysToSkip = skipKeys ? new Set(skipKeys) : null;

    //

    const deletePromises = databases
      .map(db => db.name)
      .filter((name): name is string =>
        name !== undefined &&
        name.startsWith(keyPrefix) &&
        !keysToSkip?.has(name)
      )
      .map(name => new Promise<void>((resolve) => {
        const request = StorageIndexedDB.indexedDB.deleteDatabase(name);
        request.onsuccess = () => resolve();
        request.onerror = () => {
          this.config.onWarn?.(`Failed to delete database: ${name}`);
          resolve();
        };
        request.onblocked = () => {
          this.config.onWarn?.(`Delete blocked for database: ${name}`);
          resolve();
        };
      }));

    //
    
    await Promise.all(deletePromises);
  }
}
