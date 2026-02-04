import { buildAOCId } from '../aocId';
import { FieldManifestV1 } from './types';

export function buildFieldId(manifest: FieldManifestV1): string {
  if (typeof manifest.field_id !== 'string' || manifest.field_id.trim() === '') {
    throw new Error('Field field_id must be non-empty.');
  }

  if (typeof manifest.data_type !== 'string' || manifest.data_type.trim() === '') {
    throw new Error('Field data_type must be non-empty.');
  }

  if (typeof manifest.semantics !== 'string' || manifest.semantics.trim() === '') {
    throw new Error('Field semantics must be non-empty.');
  }

  if (typeof manifest.created_at !== 'string' || manifest.created_at.trim() === '') {
    throw new Error('Field created_at must be non-empty.');
  }

  if (
    typeof manifest.field_hash !== 'string' ||
    !/^[0-9a-f]{64}$/.test(manifest.field_hash)
  ) {
    throw new Error('Field hash must be 64 lowercase hex characters.');
  }

  return buildAOCId('field', 'definition', 'v1', '0', {
    field_id: manifest.field_id,
    data_type: manifest.data_type,
    semantics: manifest.semantics,
    created_at: manifest.created_at,
    field_hash: manifest.field_hash
  });
}
