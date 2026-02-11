import type { ConsentObjectV1 } from '../consent';
import { validateConsentObject } from '../consent';
import type { ScopeEntry } from '../consent/types';

import type { CapabilityTokenV1 } from '../capability';
import { mintCapabilityToken, revokeCapabilityToken as capRevokeToken } from '../capability';

import type { PackManifestV1 } from '../pack';
import { canonicalizePackManifestPayload, computePackHash } from '../pack';

import type {
  Vault,
  VaultStore,
  VaultAccessRequest,
  VaultAccessResult,
  VaultErrorCode,
  VaultOptions,
  ResolvedField,
  UnresolvedField,
  VaultPolicyDecision,
} from './types';

import {
  enforceConsentPresent,
  enforceTokenRedemption,
  enforcePackPresent,
  enforcePathAccess,
} from '../enforcement';

// --- SDL path validation (v0.1 scaffold — no separate sdl/ module yet) ---

const SDL_PATH_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

function validateSdlPath(path: string): string | null {
  if (typeof path !== 'string' || !SDL_PATH_PATTERN.test(path)) {
    return `Invalid SDL path: "${path}". Must be dot-separated lowercase alphanumeric segments (minimum 2 segments).`;
  }
  return null;
}

function toVaultPolicy(decision: { decision: 'ALLOW' | 'DENY'; reason_codes: string[] }): VaultPolicyDecision {
  return {
    decision: decision.decision,
    reason_codes: decision.reason_codes as VaultErrorCode[],
  };
}

// --- Factory ---

export function createInMemoryVault(_options?: VaultOptions): Vault {
  const store: VaultStore = {
    packs: new Map(),
    consents: new Map(),
    capabilities: new Map(),
    sdl_mappings: new Map(),
  };

  function storePack(pack: PackManifestV1): string {
    // Verify hash integrity
    const payloadBytes = canonicalizePackManifestPayload({
      version: pack.version,
      subject: pack.subject,
      created_at: pack.created_at,
      fields: pack.fields,
    });
    const expectedHash = computePackHash(payloadBytes);
    if (pack.pack_hash !== expectedHash) {
      throw new Error('Pack pack_hash does not match canonical payload hash.');
    }
    store.packs.set(pack.pack_hash, pack);
    return pack.pack_hash;
  }

  function storeConsent(consent: ConsentObjectV1): string {
    validateConsentObject(consent);
    store.consents.set(consent.consent_hash, consent);
    return consent.consent_hash;
  }

  function mintCapability(
    consent_hash: string,
    scope: ScopeEntry[],
    permissions: string[],
    expires_at: string,
    opts?: { now?: Date; not_before?: string | null }
  ): CapabilityTokenV1 {
    const consent = store.consents.get(consent_hash);
    if (!consent) {
      const err = new Error(`Consent not found: ${consent_hash}`);
      (err as any).code = 'CONSENT_NOT_FOUND';
      throw err;
    }
    const token = mintCapabilityToken(consent, scope, permissions, expires_at, opts);
    store.capabilities.set(token.capability_hash, token);
    return token;
  }

  function registerSdlMapping(sdl_path: string, field_id: string): void {
    const pathError = validateSdlPath(sdl_path);
    if (pathError) {
      throw new Error(pathError);
    }
    store.sdl_mappings.set(sdl_path, field_id);
  }

  function revokeCapability(capability_hash: string): void {
    capRevokeToken(capability_hash);
  }

  function requestAccess(request: VaultAccessRequest, opts?: { now?: Date }): VaultAccessResult {
    const { capability_token, sdl_paths, pack_ref } = request;

    // Step 1: Look up parent consent for this capability (SEM gate)
    const consent = store.consents.get(capability_token.consent_ref);
    const consentDecision = enforceConsentPresent(consent);
    if (consentDecision.decision.decision === 'DENY') {
      return {
        policy: toVaultPolicy(consentDecision.decision),
        resolved_fields: [],
        unresolved_fields: [],
      };
    }

    // Step 2: Verify capability token (SEM gate: expiry/revocation/replay/derivation)
    const tokenDecision = enforceTokenRedemption(capability_token, consent!, opts);
    if (tokenDecision.decision.decision === 'DENY') {
      return {
        policy: toVaultPolicy(tokenDecision.decision),
        resolved_fields: [],
        unresolved_fields: [],
      };
    }

    // Step 3: Look up pack (SEM gate)
    const pack = store.packs.get(pack_ref);
    const packDecision = enforcePackPresent(pack !== undefined, pack_ref);
    if (packDecision.decision.decision === 'DENY') {
      return {
        policy: toVaultPolicy(packDecision.decision),
        resolved_fields: [],
        unresolved_fields: [],
      };
    }

    // Build field index from pack
    const fieldByFieldId = new Map<string, { field_id: string; content_id: string }>();
    for (const field of pack!.fields) {
      fieldByFieldId.set(field.field_id, {
        field_id: field.field_id,
        content_id: field.content_id,
      });
    }

    // Build scope index for containment checks
    const scopeKeys = new Set(capability_token.scope.map(s => `${s.type}:${s.ref}`));

    // Step 4: Sort SDL paths for deterministic processing
    const sortedPaths = [...sdl_paths].sort();

    const resolved: R
