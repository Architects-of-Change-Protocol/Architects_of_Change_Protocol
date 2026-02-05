import { StoragePointer } from './types';

const HASH_HEX_PATTERN = /^[0-9a-f]{64}$/;
const BACKEND_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const STORAGE_URI_PATTERN = /^aoc:\/\/storage\/([a-z][a-z0-9]*(?:-[a-z0-9]+)*)\/0x([a-f0-9]{64})$/;

export function buildStoragePointer(backend: string, hashHex: string): StoragePointer {
  if (typeof backend !== 'string' || !BACKEND_PATTERN.test(backend)) {
    throw new Error('Storage backend must match pattern: lowercase letters, digits, hyphens (e.g., "local", "s3", "x-vendor").');
  }

  if (backend.length > 64) {
    throw new Error('Storage backend must be at most 64 characters.');
  }

  if (!HASH_HEX_PATTERN.test(hashHex)) {
    throw new Error('Storage hash must be 64 lowercase hex characters.');
  }

  return {
    uri: `aoc://storage/${backend}/0x${hashHex}`,
    backend,
    hash: hashHex
  };
}

export function parseStorageUri(uri: string): { backend: string; hash: string } {
  if (typeof uri !== 'string') {
    throw new Error('Storage URI must be a string.');
  }

  const match = STORAGE_URI_PATTERN.exec(uri);
  if (!match) {
    throw new Error('Storage URI must match pattern: aoc://storage/{backend}/0x{hash}');
  }

  return {
    backend: match[1],
    hash: match[2]
  };
}
