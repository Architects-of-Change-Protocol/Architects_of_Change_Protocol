import { canonicalizeContentManifestPayload } from './canonical';
import { computeContentHash } from './hash';
import { BuildContentOptions, ContentManifestV1 } from './types';
import { StoragePointer } from '../storage/types';

/**
 * Builds the LEGACY/CURRENT content manifest and its `content_hash`. This
 * is deliberately preserved as-is by AOC Protocol Slice 0 even though the
 * hash includes `storage` (violating the future Sovereign Asset principle
 * that content identity must not depend on where the bytes are stored) —
 * that redesign belongs to a future sovereign-identity slice, not this
 * one. See content/contentId.ts for the corresponding note.
 */
export function buildContentManifest(
  subject: string,
  content_type: string,
  bytes: number,
  storage: StoragePointer,
  opts: BuildContentOptions = {}
): ContentManifestV1 {
  if (typeof subject !== 'string' || subject.trim() === '') {
    throw new Error('Content subject must be non-empty.');
  }

  if (typeof content_type !== 'string' || content_type.trim() === '') {
    throw new Error('Content content_type must be non-empty.');
  }

  if (!Number.isInteger(bytes) || bytes <= 0) {
    throw new Error('Content bytes must be a positive integer.');
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
