import { canonicalizeContentManifestPayload } from './canonical';
import { computeContentHash } from './hash';
import { BuildContentOptions, ContentManifestV1 } from './types';
import { StoragePointer } from '../storage/types';

export function buildContentManifest(
  subject: string,
  content_type: string,
  storage: StoragePointer,
  bytes: number,
  opts: BuildContentOptions = {}
): ContentManifestV1 {
  if (typeof subject !== 'string' || subject.trim() === '') {
    throw new Error('Content subject must be non-empty.');
  }

  if (typeof content_type !== 'string' || content_type.trim() === '') {
    throw new Error('Content content_type must be non-empty.');
  }

  if (typeof storage.backend !== 'string' || storage.backend.trim() === '') {
    throw new Error('Content storage backend must be non-empty.');
  }

  if (typeof storage.hash !== 'string' || !/^[0-9a-f]{64}$/.test(storage.hash)) {
    throw new Error('Content storage hash must be 64 lowercase hex characters.');
  }

  const expectedUri = `aoc://storage/${storage.backend}/0x${storage.hash}`;
  if (storage.uri !== expectedUri) {
    throw new Error('Content storage uri must match backend and hash.');
  }

  if (!Number.isInteger(bytes) || bytes <= 0) {
    throw new Error('Content bytes must be a positive integer.');
  }

  const trimmedSubject = subject.trim();
  const trimmedContentType = content_type.trim();
  const created_at = (opts.now ?? new Date()).toISOString();

  const payloadBytes = canonicalizeContentManifestPayload({
    version: 1,
    subject: trimmedSubject,
    content_type: trimmedContentType,
    bytes,
    storage,
    created_at
  });

  const content_hash = computeContentHash(payloadBytes);

  return {
    version: 1,
    subject: trimmedSubject,
    content_type: trimmedContentType,
    bytes,
    storage,
    created_at,
    content_hash
  };
}
