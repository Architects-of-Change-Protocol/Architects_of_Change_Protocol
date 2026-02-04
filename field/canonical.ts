import { canonicalizeJSON } from '../canonicalize';
import { FieldManifestV1 } from './types';

type FieldManifestPayload = Omit<FieldManifestV1, 'field_hash'>;

export function canonicalizeFieldManifestPayload(
  payload: FieldManifestPayload
): Uint8Array {
  const canonical = canonicalizeJSON(payload);
  return new TextEncoder().encode(canonical);
}
