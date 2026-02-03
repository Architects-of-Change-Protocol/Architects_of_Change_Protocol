import { canonicalizeJSON } from '../canonicalize';
import { ContentManifestV1 } from './types';

type ContentManifestPayload = Omit<ContentManifestV1, 'content_hash'>;

export function canonicalizeContentManifestPayload(
  payload: ContentManifestPayload
): Uint8Array {
  const canonical = canonicalizeJSON(payload);
  return new TextEncoder().encode(canonical);
}
