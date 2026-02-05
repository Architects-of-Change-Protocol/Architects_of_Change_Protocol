import { buildAOCId } from '../aocId';
import { PackManifestV1 } from './types';

const HASH_HEX_PATTERN = /^[0-9a-f]{64}$/;
const VERSION_PATTERN = /^[0-9]+\.[0-9]+$/;

export function buildPackId(manifest: PackManifestV1): string {
  if (typeof manifest.subject !== 'string' || manifest.subject.trim() === '') {
    throw new Error('Pack subject must be non-empty.');
  }

  if (typeof manifest.version !== 'string' || !VERSION_PATTERN.test(manifest.version)) {
    throw new Error('Pack version must match pattern MAJOR.MINOR.');
  }

  if (!Number.isInteger(manifest.created_at) || manifest.created_at <= 0) {
    throw new Error('Pack created_at must be a positive integer.');
  }

  if (!Array.isArray(manifest.fields) || manifest.fields.length === 0) {
    throw new Error('Pack fields must be a non-empty array.');
  }

  if (typeof manifest.pack_hash !== 'string' || !HASH_HEX_PATTERN.test(manifest.pack_hash)) {
    throw new Error('Pack hash must be 64 lowercase hex characters.');
  }

  return buildAOCId('pack', 'object', 'v1', '0', {
    version: manifest.version,
    subject: manifest.subject,
    created_at: manifest.created_at,
    fields: manifest.fields,
    pack_hash: manifest.pack_hash
  });
}
