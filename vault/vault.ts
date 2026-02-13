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

// --- SDL path validation scaffold (temporary) ---
// TODO(protocol/sdl): Replace this with canonical parser from protocol/sdl module
// Must align with protocol/sdl/README.md grammar.
const SDL_PATH_PATTERN = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/;

function validateSdlPath(path: string): string | null {
  if (typeof path !== 'string' || path.trim() === '') {
    return `Invalid SDL path: "${path}". Must be a non-empty dot-separated path with at least 2 segments.`;
  }

  const normalizedPath = path.trim();

  if (!SDL_PATH_PATTERN.test(normalizedPath)) {
    return `Invalid SDL path: "${path}". Must be dot-separated lowercase segments allowing digits and hyphens.`;
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

    // Step 1 — Consent enforcement
    const consent = store.consents.get(capability_token.consent_ref);

    const consentDecision = enforceConsentPresent(consent);

    if (consentDecision.decision.decision === 'DENY') {
      return {
        policy: toVaultPolicy(consentDecision.decision),
        resolved_fields: [],
        unresolved_fields: [],
      };
    }

    // Step 2 — Capability enforcement
    const tokenDecision = enforceTokenRedemption(capability_token, consent!, opts);

    if (tokenDecision.decision.decision === 'DENY') {
      return {
        policy: toVaultPolicy(tokenDecision.decision),
        resolved_fields: [],
        unresolved_fields: [],
      };
    }

    // Step 3 — Pack enforcement
    const pack = store.packs.get(pack_ref);

    const packDecision = enforcePackPresent(pack !== undefined, pack_ref);

    if (packDecision.decision.decision === 'DENY') {
      return {
        policy: toVaultPolicy(packDecision.decision),
        resolved_fields: [],
        unresolved_fields: [],
      };
    }

    // Step 4 — Build field index
    const fieldByFieldId = new Map<string, { field_id: string; content_id: string }>();

    for (const field of pack!.fields) {
      fieldByFieldId.set(field.field_id, {
        field_id: field.field_id,
        content_id: field.content_id,
      });
    }

    // Step 5 — Build scope index
    const scopeKeys = new Set(
      capability_token.scope.map(s => `${s.type}:${s.ref}`)
    );

    // Step 6 — Deterministic ordering
    const sortedPaths = [...sdl_paths].sort();

    const resolved: ResolvedField[] = [];
    const unresolved: UnresolvedField[] = [];

    // Step 7 — Resolve paths deterministically
    for (const sdl_path of sortedPaths) {
      const validationError = validateSdlPath(sdl_path);

      if (validationError) {
        unresolved.push({
          sdl_path,
          error: {
            code: 'INVALID_SDL_PATH',
            message: validationError,
            path: sdl_path,
          },
        });

        continue;
      }

      const field_id = store.sdl_mappings.get(sdl_path);

      if (!field_id) {
        unresolved.push({
          sdl_path,
          error: {
            code: 'UNRESOLVED_FIELD',
            message: `No mapping found for SDL path: ${sdl_path}`,
            path: sdl_path,
          },
        });

        continue;
      }

      const fieldRef = fieldByFieldId.get(field_id);

      if (!fieldRef) {
        unresolved.push({
          sdl_path,
          error: {
            code: 'UNRESOLVED_FIELD',
            message: `Field "${field_id}" not present in pack ${pack_ref}`,
            path: sdl_path,
          },
        });

        continue;
      }

      const scopeDecision = enforcePathAccess(
        scopeKeys,
        pack_ref,
        fieldRef.content_id
      );

      if (scopeDecision.decision.decision === 'DENY') {
        return {
          policy: toVaultPolicy(scopeDecision.decision),
          resolved_fields: [],
          unresolved_fields: [],
        };
      }

      resolved.push({
        sdl_path,
        field_id: fieldRef.field_id,
        content_id: fieldRef.content_id,
      });
    }

    return {
      policy: {
        decision: 'ALLOW',
        reason_codes: [],
      },
      resolved_fields: resolved,
      unresolved_fields: unresolved,
    };
  }

  function getStore(): Readonly<VaultStore> {
    return store;
  }

  return {
    storePack,
    storeConsent,
    mintCapability,
    requestAccess,
    registerSdlMapping,
    revokeCapability,
    getStore,
  };
}
