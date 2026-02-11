import type { ConsentObjectV1 } from '../consent';
import type { CapabilityTokenV1 } from '../capability';
import type { FieldManifestV1 } from '../field/types';
import type { StoragePointer } from '../storage/types';
import { verifyCapabilityToken } from '../capability';
import { sha256Hex } from '../storage/hash';

export type SemDecision = {
  decision: 'ALLOW' | 'DENY';
  reason_codes: string[];
};

export type SemErrorObject = {
  code: string;
  message: string;
  path?: string;
};

export type SemResult = {
  decision: SemDecision;
  error?: SemErrorObject;
};

function allow(): SemResult {
  return { decision: { decision: 'ALLOW', reason_codes: [] } };
}

function deny(code: string, message: string, path?: string): SemResult {
  return {
    decision: { decision: 'DENY', reason_codes: [code] },
    error: { code, message, ...(path !== undefined ? { path } : {}) }
  };
}

function classifyCapabilityError(error: Error): string {
  const msg = error.message || '';
  if (msg.includes('expired')) return 'EXPIRED';
  if (msg.includes('replay')) return 'REPLAY';
  if (msg.includes('revoked')) return 'REVOKED';
  if (msg.includes('Scope escalation') || msg.includes('Permission escalation')) return 'SCOPE_ESCALATION';
  return 'INVALID_CAPABILITY';
}

export function enforceConsentPresent(consent: ConsentObjectV1 | undefined): SemResult {
  if (!consent) return deny('INVALID_CAPABILITY', 'Parent consent not found for capability token.');
  return allow();
}

export function enforceTokenRedemption(
  capability_token: CapabilityTokenV1,
  consent: ConsentObjectV1,
  opts?: { now?: Date }
): SemResult {
  try {
    verifyCapabilityToken(capability_token, consent, opts);
    return allow();
  } catch (e) {
    const err = e as Error;
    return deny(classifyCapabilityError(err), err.message);
  }
}

export function enforcePackPresent(packFound: boolean, packRef: string): SemResult {
  if (!packFound) return deny('PACK_NOT_FOUND', `Pack not found: ${packRef}`);
  return allow();
}

export function enforceResolverField(path: string, manifest?: FieldManifestV1): SemResult {
  if (!manifest) return deny('FIELD_NOT_FOUND', `No field manifest found for SDL path "${path}".`, path);
  return allow();
}

export function enforcePathAccess(scopeKeys: Set<string>, packRef: string, contentId: string): SemResult {
  const packCovered = scopeKeys.has(`pack:${packRef}`);
  const contentCovered = scopeKeys.has(`content:${contentId}`);
  if (!packCovered && !contentCovered) {
    return deny(
      'SCOPE_ESCALATION',
      `Requested content "${contentId}" is outside capability scope for pack "${packRef}".`
    );
  }
  return allow();
}

export function enforceStorageIntegrity(pointer: StoragePointer, bytes: Uint8Array): SemResult {
  const hashHex = sha256Hex(bytes);
  if (hashHex !== pointer.hash) return deny('INTEGRITY_HASH_MISMATCH', `Storage hash mismatch for ${pointer.uri}`);
  return allow();
}
