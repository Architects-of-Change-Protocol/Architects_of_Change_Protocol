import { buildAOCId } from '../aocId';
import { ContentManifestV1 } from './types';

export function buildContentId(manifest: ContentManifestV1): string {
  if (typeof manifest.subject !== 'string' || manifest.subject.trim() === '') {
    throw new Error('Content subject must be non-empty.');
  }

  if (typeof manifest.content_hash !== 'string' || !/^[0-9a-f]{64}$/.test(manifest.content_hash)) {
    throw new Error('Content hash must be 64 lowercase hex characters.');
  }

  return buildAOCId('content', 'blob', 'v1', '0', {
    subject: manifest.subject,
    content_type: manifest.content_type,
    bytes: manifest.bytes,
    storage: manifest.storage,
    created_at: manifest.created_at,
    content_hash: manifest.content_hash
  });
}
