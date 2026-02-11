import { promises as fs } from 'fs';
import path from 'path';

import { sha256Hex } from './hash';
import { IStorageAdapter } from './adapter';
import { buildStoragePointer } from './pointer';
import { StoragePointer } from './types';

import { enforceStorageIntegrity } from '../enforcement';

const STORAGE_DIR = '.aoc_storage';

export class LocalFilesystemAdapter implements IStorageAdapter {
  private baseDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
  }

  async put(blob: Uint8Array): Promise<StoragePointer> {
    const hashHex = sha256Hex(blob);
    const pointer = buildStoragePointer('local', hashHex);
    const filePath = this.getFilePath(hashHex);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, blob);

    return pointer;
  }

  async get(pointer: StoragePointer): Promise<Uint8Array> {
    const filePath = this.getFilePath(pointer.hash);
    const data = await fs.readFile(filePath);

    const decision = enforceStorageIntegrity(pointer, data);

    if (decision.decision.decision === 'DENY') {
      throw new Error(decision.error!.message);
    }

    return data;
  }

  async delete(pointer: StoragePointer): Promise<void> {
    const filePath = this.getFilePath(pointer.hash);
    await fs.rm(filePath, { force: true });
  }

  private getFilePath(hashHex: string): string {
    return path.join(this.baseDir, STORAGE_DIR, hashHex);
  }
}
