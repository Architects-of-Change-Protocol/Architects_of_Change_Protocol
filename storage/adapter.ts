import { StoragePointer } from './types';

export interface IStorageAdapter {
  put(blob: Uint8Array): Promise<StoragePointer>;
  get(pointer: StoragePointer): Promise<Uint8Array>;
  delete(pointer: StoragePointer): Promise<void>;
}
