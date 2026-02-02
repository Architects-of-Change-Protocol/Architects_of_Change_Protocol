import { canonicalizeJSON } from './canonicalize';
import { sha256Hex } from './hash';

export function computeContentHash(obj: any): string {
  const canonical = canonicalizeJSON(obj);
  const encoder = new TextEncoder();
  const bytes = encoder.encode(canonical);
  return sha256Hex(bytes);
}

export function buildAOCId(
  domain: string,
  type: string,
  schema: string,
  version: string,
  obj: any
): string {
  const contentHash = computeContentHash(obj);
  return `aoc://${domain}/${type}/${schema}/${version}/0x${contentHash}`;
}
