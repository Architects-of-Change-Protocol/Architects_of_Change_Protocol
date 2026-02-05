import { canonicalizeJSON } from '../canonicalize';
import { FieldReference, PackManifestV1 } from './types';

type PackManifestPayload = Omit<PackManifestV1, 'pack_hash'>;

/**
 * Canonicalizes a single FieldReference for deterministic encoding.
 * Keys are sorted alphabetically: bytes, content_id, field_id, storage.
 * Storage keys are sorted: backend, hash, uri.
 */
function canonicalizeFieldReference(ref: FieldReference): object {
  return {
    bytes: ref.bytes,
    content_id: ref.content_id,
    field_id: ref.field_id,
    storage: {
      backend: ref.storage.backend,
      hash: ref.storage.hash,
      uri: ref.storage.uri
    }
  };
}

/**
 * Canonicalizes the pack manifest payload for hashing.
 *
 * Per pack-object-spec.md Section 5-6:
 * - Excludes pack_hash (self-referential)
 * - Sorts fields array by field_id in ascending Unicode code point order
 * - Top-level keys in alphabetical order: created_at, fields, subject, version
 * - FieldReference keys in alphabetical order: bytes, content_id, field_id, storage
 * - StoragePointer keys in alphabetical order: backend, hash, uri
 */
export function canonicalizePackManifestPayload(
  payload: PackManifestPayload
): Uint8Array {
  // Sort fields by field_id in ascending order
  const sortedFields = [...payload.fields].sort((a, b) =>
    a.field_id.localeCompare(b.field_id)
  );

  // Build canonical payload with sorted fields
  const canonicalPayload = {
    created_at: payload.created_at,
    fields: sortedFields.map(canonicalizeFieldReference),
    subject: payload.subject,
    version: payload.version
  };

  const canonical = canonicalizeJSON(canonicalPayload);
  return new TextEncoder().encode(canonical);
}
