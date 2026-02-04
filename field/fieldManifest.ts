import { canonicalizeFieldManifestPayload } from './canonical';
import { computeFieldHash } from './hash';
import { BuildFieldOptions, FieldManifestV1 } from './types';

export function buildFieldManifest(
  field_id: string,
  data_type: string,
  semantics: string,
  opts: BuildFieldOptions = {}
): FieldManifestV1 {
  if (typeof field_id !== 'string' || field_id.trim() === '') {
    throw new Error('Field field_id must be non-empty.');
  }

  if (typeof data_type !== 'string' || data_type.trim() === '') {
    throw new Error('Field data_type must be non-empty.');
  }

  if (typeof semantics !== 'string' || semantics.trim() === '') {
    throw new Error('Field semantics must be non-empty.');
  }

  const trimmedFieldId = field_id.trim();
  const trimmedDataType = data_type.trim();
  const trimmedSemantics = semantics.trim();
  const created_at = (opts.now ?? new Date()).toISOString();

  const payloadBytes = canonicalizeFieldManifestPayload({
    version: 1,
    field_id: trimmedFieldId,
    data_type: trimmedDataType,
    semantics: trimmedSemantics,
    created_at
  });

  const field_hash = computeFieldHash(payloadBytes);

  return {
    version: 1,
    field_id: trimmedFieldId,
    data_type: trimmedDataType,
    semantics: trimmedSemantics,
    created_at,
    field_hash
  };
}
