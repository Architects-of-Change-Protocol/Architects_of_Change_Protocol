import type { ConsentObjectV1 } from '../consent';
import { validateConsentObject } from '../consent';
import type { ScopeEntry } from '../consent/types';

import type { CapabilityTokenV1 } from '../capability';
import { mintCapabilityToken, revokeCapabilityToken as capRevokeToken } from '../capability';
import { InMemoryNonceRegistry } from '../capability/registries/InMemoryNonceRegistry';
import { InMemoryRevocationRegistry } from '../capability/registries/InMemoryRevocationRegistry';

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
} from './types';

import {
  enforceConsentPresent,
  enforcePackPresent,
} from '../enforcement';
import { enforceCapability } from '../protocol/capabilities/capabilityEnforcer';

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

function mapCapabilityDenyCode(code: string): VaultErrorCode {
  if (code === 'SCOPE_MISMATCH' || code === 'INVALID_SCOPE') {
    return 'SCOPE_ESCALATION';
  }

  if (code === 'MALFORMED_CAPABILITY') {
    return 'INVALID_CAPABILITY';
  }

  return code as VaultErrorCode;
}

function denyAccess(reason_codes: VaultErrorCode[]): VaultAccessResult {
  return {
    policy: {
      decision: 'DENY',
      reason_codes,
    },
    resolved_fields: [],
    unresolved_fields: [],
  };
}

function allowAccess(
  resolved_fields: ResolvedField[],
  unresolved_fields: UnresolvedField[]
): VaultAccessResult {
  return {
    policy: {
      decision: 'ALLOW',
      reason_codes: [],
    },
    resolved_fields,
    unresolved_fields,
  };
}

function denyDecision(decision: { decision: 'ALLOW' | 'DENY'; reason_codes: string[] }): VaultAccessResult {
  return denyAccess(decision.reason_codes as VaultErrorCode[]);
}

// --- Factory ---

export function createInMemoryVault(options?: VaultOptions): Vault {
  const store: VaultStore = {
    packs: new Map(),
    consents: new Map(),
    capabilities: new Map(),
    sdl_mappings: new Map(),
  };

  const nonceRegistry = options?.nonceRegistry ?? new InMemoryNonceRegistry();
  const revocationRegistry = options?.revocationRegistry ?? new InMemoryRevocationRegistry();

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

  function applyConsent(consent: ConsentObjectV1): string {
    validateConsentObject(consent);

    if (consent.action === 'revoke') {
      const targetCapabilityHash = consent.revoke_target!.capability_hash;
      const targetCapability = store.capabilities.get(targetCapabilityHash);

      if (!targetCapability) {
        throw new Error(`Capability not found: ${targetCapabilityHash}`);
      }

      const originalConsent = store.consents.get(targetCapability.consent_ref);
      if (!originalConsent || originalConsent.subject !== consent.subject) {
        throw new Error('Consent subject must match revoked capability subject.');
      }

      capRevokeToken(targetCapabilityHash, revocationRegistry);
    }

    store.consents.set(consent.consent_hash, consent);
    return consent.consent_hash;
  }

  function storeConsent(consent: ConsentObjectV1): string {
    return applyConsent(consent);
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
    capRevokeToken(capability_hash, revocationRegistry);
  }

  function requestAccess(request: VaultAccessRequest, opts?: { now?: Date }): VaultAccessResult {
    const { capability_token, sdl_paths, pack_ref } = request;

    // Step 1 — Consent enforcement
    const consent = store.consents.get(capability_token.consent_ref);
    const consentDecision = enforceConsentPresent(consent);

    if (consentDecision.decision.decision === 'DENY') {
      return denyDecision(consentDecision.decision);
    }

    // Step 2 — Pack enforcement
    const pack = store.packs.get(pack_ref);
    const packDecision = enforcePackPresent(pack !== undefined, pack_ref);

    if (packDecision.decision.decision === 'DENY') {
      return denyDecision(packDecision.decision);
    }

    // Step 3 — Build field index
    const fieldByFieldId = new Map<string, { field_id: string; content_id: string }>();

    for (const field of pack!.fields) {
      fieldByFieldId.set(field.field_id, {
        field_id: field.field_id,
        content_id: field.content_id,
      });
    }

    // Step 4 — Deterministic ordering
    const sortedPaths = [...sdl_paths].sort();

    const resolved: ResolvedField[] = [];
    const unresolved: UnresolvedField[] = [];

    // Step 5 — Resolve paths deterministically
    let tokenConsumed = false;

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

      const contentDecision = enforceCapability({
        required_scope: `content:${fieldRef.content_id}`,
        token: capability_token,
        consent: consent!,
        resource_context: {
          resource_type: 'content',
          content_ref: fieldRef.content_id,
          pack_ref,
        },
        request_context: {
          subject: consent!.subject,
          grantee: capability_token.grantee,
          endpoint: 'vault.requestAccess',
        },
        now: opts?.now,
        registries: { nonceRegistry, revocationRegistry },
        consume: !tokenConsumed,
      });

      const accessDecision = contentDecision.allowed
        ? contentDecision
        : contentDecision.code === 'SCOPE_MISMATCH'
          ? enforceCapability({
              required_scope: `pack:${pack_ref}`,
              token: capability_token,
              consent: consent!,
              resource_context: {
                resource_type: 'pack',
                pack_ref,
              },
              request_context: {
                subject: consent!.subject,
                grantee: capability_token.grantee,
                endpoint: 'vault.requestAccess',
              },
              now: opts?.now,
              registries: { nonceRegistry, revocationRegistry },
              consume: !tokenConsumed,
            })
          : contentDecision;

      if (!accessDecision.allowed) {
        return denyAccess([mapCapabilityDenyCode(accessDecision.code)]);
      }

      tokenConsumed = true;

      resolved.push({
        sdl_path,
        field_id: fieldRef.field_id,
        content_id: fieldRef.content_id,
      });
    }

    return allowAccess(resolved, unresolved);
  }

  function getStore(): Readonly<VaultStore> {
    return store;
  }

  return {
    storePack,
    applyConsent,
    storeConsent,
    mintCapability,
    requestAccess,
    registerSdlMapping,
    revokeCapability,
    getStore,
  };
}
