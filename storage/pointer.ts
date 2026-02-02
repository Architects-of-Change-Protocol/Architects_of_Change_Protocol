import { StoragePointer } from './types';

const HASH_HEX_PATTERN = /^[0-9a-f]{64}$/;

export function buildStoragePointer(backend: string, hashHex: string): StoragePointer {
  if (!backend) {
    throw new Error('Storage backend must be non-empty.');
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
