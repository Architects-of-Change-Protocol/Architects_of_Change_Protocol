import { buildAOCId } from '../aocId';
import { ContentManifestV1 } from './types';

/**
 * LEGACY/CURRENT content-manifest identity — this is NOT the future
 * `SovereignAssetId`. It incorporates `manifest.storage` (backend/hash/uri)
 * into the id, which conflates content identity with storage location; a
 * future sovereign-identity slice will separate the two. This function's
 * hashing/id-derivation behavior is preserved unchanged by the
 * canonicalization consolidation in this slice (AOC Protocol Slice 0) —
 * see content/__tests__/legacy-identity-stability.test.ts for pinned
 * fixture output.
 */
export function buildContentId(manifest: ContentManifestV1): string {
  if (typeof manifest.subject !== 'string' || manifest.subject.trim() === '') {
    throw new Error('Content subject must be non-empty.');
  }

  if (typeof manifest.content_type !== 'string' || manifest.content_type.trim() === '') {
    throw new Error('Content content_type must be non-empty.');
  }

  if (!Number.isInteger(manifest.bytes) || manifest.bytes <= 0) {
    throw new Error('Content bytes must be a positive integer.');
  }

  if (typeof manifest.created_at !== 'string' || manifest.created_at.trim() === '') {
    throw new Error('Content created_at must be non-empty.');
  }

  if (typeof manifest.content_hash !== 'string' || !/^[0-9a-f]{64}$/.test(manifest.content_hash)) {
    throw new Error('Content hash must be 64 lowercase hex characters.');
  }

  return buildAOCId('content', 'object', 'v1', '0', {
    version: manifest.version,
    subject: manifest.subject,
    content_type: manifest.content_type,
    bytes: manifest.bytes,
    storage: manifest.storage,
    created_at: manifest.created_at,
    content_hash: manifest.content_hash
  });
}
