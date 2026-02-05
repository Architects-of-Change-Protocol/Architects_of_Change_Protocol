import { canonicalizeJSON } from '../canonicalize';

type StoragePointerPayload = {
  backend: string;
  hash: string;
};

export function canonicalizeStoragePointerPayload(
  payload: StoragePointerPayload
): Uint8Array {
  const canonical = canonicalizeJSON(payload);
  return new TextEncoder().encode(canonical);
}
