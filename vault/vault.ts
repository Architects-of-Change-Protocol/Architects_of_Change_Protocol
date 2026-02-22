import type { ConsentObjectV1, ConsentObjectV2 } from '../consent';
import { validateConsentObject, validateConsentObjectV2 } from '../consent';
import type { ScopeEntry } from '../consent/types';

import type { CapabilityTokenV1, CapabilityTokenV2 } from '../capability';
import {
  mintCapabilityToken,
  mintCapabilityTokenV2,
  verifyCapabilityTokenV2,
  revokeCapabilityToken as capRevokeToken,
} from '../capability';

import type { PackManifestV1 } from '../pack';
import { canonicalizePackManifestPayload, computePackHash } from '../pack';

import type {
  Vault,
  VaultStore,
  VaultAccessRequest,
  VaultAccessRequestV2,
  VaultAccessResult,
  VaultErrorCode,
  VaultOptions,
  ResolvedField,
  UnresolvedField,
  VaultPolicyDecision,
  RenewalRequest,
  RenewalResponse,
} from './types';

import {
  enforceConsentPresent,
  enforceTokenRedemption,
  enforcePackPresent,
  enforcePathAccess,
} from '../enforcement';

import {
  appendLedgerEntry,
  getLedger,
} from './accessLedger';

import {
  processRenewalRequest,
  revokeByAffiliationCredential,
} from './renewal';

import type { AccessLedgerEntry } from '../temporal/types';

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
    // V2 stores
    consents_v2: new Map(),
    capabilities_v2: new Map(),
    revoked_consents: new Set(),
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

  // -------------------------------------------------------------------------
  // V2 Temporal Enforcement Methods
  // -------------------------------------------------------------------------

  function storeConsentV2(consent: ConsentObjectV2): string {
    validateConsentObjectV2(consent);
    store.consents_v2.set(consent.consent_hash, consent);
    return consent.consent_hash;
  }

  function mintCapabilityV2(
    consent_hash: string,
    scope: ScopeEntry[],
    permissions: string[],
    expires_at: string,
    opts?: { now?: Date; not_before?: string | null; renewal_generation?: number }
  ): CapabilityTokenV2 {
    const consent = store.consents_v2.get(consent_hash);

    if (!consent) {
      const err = new Error(`ConsentV2 not found: ${consent_hash}`);
      (err as any).code = 'CONSENT_NOT_FOUND';
      throw err;
    }

    const token = mintCapabilityTokenV2(consent, scope, permissions, expires_at, opts);
    store.capabilities_v2.set(token.capability_hash, token);
    return token;
  }

  /**
   * V2 access request with full temporal enforcement:
   *  1. Consent presence
   *  2. Consent not revoked (pre-expiry revocation)
   *  3. Access window open (now >= access_start_timestamp)
   *  4. Token verification (expiry, replay, revocation, scope, etc.)
   *  5. Pack presence
   *  6. Field resolution and scope check
   *
   * Logs ACCESS_GRANTED or ACCESS_DENIED events to the Access Ledger.
   * On EXPIRED: logs EXPIRED event and auto-revokes the capability token.
   */
  function requestAccessV2(
    request: VaultAccessRequestV2,
    opts?: { now?: Date }
  ): VaultAccessResult {
    const { capability_token, sdl_paths, pack_ref } = request;

    // Step 1 — Consent presence
    const consent = store.consents_v2.get(capability_token.consent_ref);

    const consentDecision = enforceConsentPresent(consent);
    if (consentDecision.decision.decision === 'DENY') {
      appendLedgerEntry(
        'ACCESS_DENIED',
        capability_token.capability_hash,
        capability_token.consent_ref,
        capability_token.subject,
        capability_token.grantee,
        'CONSENT_NOT_FOUND',
        null,
        opts?.now
      );
      return {
        policy: toVaultPolicy(consentDecision.decision),
        resolved_fields: [],
        unresolved_fields: [],
      };
    }

    // Step 2 — Consent pre-expiry revocation
    if (store.revoked_consents.has(capability_token.consent_ref)) {
      appendLedgerEntry(
        'ACCESS_DENIED',
        capability_token.capability_hash,
        capability_token.consent_ref,
        capability_token.subject,
        capability_token.grantee,
        'REVOKED',
        null,
        opts?.now
      );
      return {
        policy: toVaultPolicy({ decision: 'DENY', reason_codes: ['REVOKED'] }),
        resolved_fields: [],
        unresolved_fields: [],
      };
    }

    // Step 3 — Temporal verification (expiry, access window, replay, revocation, scope)
    let tokenError: string | null = null;
    let tokenErrorCode: VaultErrorCode = 'INVALID_CAPABILITY';

    try {
      verifyCapabilityTokenV2(capability_token, consent!, opts);
    } catch (e) {
      const err = e as Error;
      tokenError = err.message;
      if (err.message.includes('expired')) {
        tokenErrorCode = 'EXPIRED';
        // Auto-revoke the capability token on expiration
        try { capRevokeToken(capability_token.capability_hash); } catch { /* already revoked */ }
        appendLedgerEntry(
          'EXPIRED',
          capability_token.capability_hash,
          capability_token.consent_ref,
          capability_token.subject,
          capability_token.grantee,
          'EXPIRED',
          null,
          opts?.now
        );
      } else if (err.message.includes('replay')) {
        tokenErrorCode = 'REPLAY';
      } else if (err.message.includes('revoked')) {
        tokenErrorCode = 'REVOKED';
      } else if (
        err.message.includes('Scope escalation') ||
        err.message.includes('Permission escalation')
      ) {
        tokenErrorCode = 'SCOPE_ESCALATION';
      } else if (err.message.toLowerCase().includes('access window')) {
        tokenErrorCode = 'ACCESS_WINDOW_NOT_OPEN';
      }
    }

    if (tokenError !== null) {
      if (tokenErrorCode !== 'EXPIRED') {
        appendLedgerEntry(
          'ACCESS_DENIED',
          capability_token.capability_hash,
          capability_token.consent_ref,
          capability_token.subject,
          capability_token.grantee,
          tokenErrorCode,
          null,
          opts?.now
        );
      }
      return {
        policy: toVaultPolicy({ decision: 'DENY', reason_codes: [tokenErrorCode] }),
        resolved_fields: [],
        unresolved_fields: [],
      };
    }

    // Step 4 — Pack presence
    const pack = store.packs.get(pack_ref);
    const packDecision = enforcePackPresent(pack !== undefined, pack_ref);
    if (packDecision.decision.decision === 'DENY') {
      appendLedgerEntry(
        'ACCESS_DENIED',
        capability_token.capability_hash,
        capability_token.consent_ref,
        capability_token.subject,
        capability_token.grantee,
        'PACK_NOT_FOUND',
        null,
        opts?.now
      );
      return {
        policy: toVaultPolicy(packDecision.decision),
        resolved_fields: [],
        unresolved_fields: [],
      };
    }

    // Step 5 — Field resolution (same logic as V1)
    const fieldByFieldId = new Map<string, { field_id: string; content_id: string }>();
    for (const field of pack!.fields) {
      fieldByFieldId.set(field.field_id, {
        field_id: field.field_id,
        content_id: field.content_id,
      });
    }

    const scopeKeys = new Set(
      capability_token.scope.map(s => `${s.type}:${s.ref}`)
    );

    const sortedPaths = [...sdl_paths].sort();
    const resolved: ResolvedField[] = [];
    const unresolved: UnresolvedField[] = [];

    for (const sdl_path of sortedPaths) {
      const validationError = validateSdlPath(sdl_path);
      if (validationError) {
        unresolved.push({
          sdl_path,
          error: { code: 'INVALID_SDL_PATH', message: validationError, path: sdl_path },
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

      const scopeDecision = enforcePathAccess(scopeKeys, pack_ref, fieldRef.content_id);
      if (scopeDecision.decision.decision === 'DENY') {
        appendLedgerEntry(
          'ACCESS_DENIED',
          capability_token.capability_hash,
          capability_token.consent_ref,
          capability_token.subject,
          capability_token.grantee,
          'SCOPE_ESCALATION',
          { sdl_path },
          opts?.now
        );
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

    // Log successful access
    appendLedgerEntry(
      'ACCESS_GRANTED',
      capability_token.capability_hash,
      capability_token.consent_ref,
      capability_token.subject,
      capability_token.grantee,
      null,
      { pack_ref, resolved_count: String(resolved.length) },
      opts?.now
    );

    return {
      policy: { decision: 'ALLOW', reason_codes: [] },
      resolved_fields: resolved,
      unresolved_fields: unresolved,
    };
  }

  /**
   * Revokes a ConsentObjectV2 before its natural expiration.
   * Also auto-revokes all capability tokens derived from it.
   */
  function revokeConsentV2(consent_hash: string, opts?: { now?: Date }): void {
    const consent = store.consents_v2.get(consent_hash);
    if (!consent) {
      throw new Error(`ConsentV2 not found: ${consent_hash}`);
    }

    store.revoked_consents.add(consent_hash);

    // Auto-revoke all V2 capability tokens derived from this consent
    for (const [cap_hash, token] of store.capabilities_v2.entries()) {
      if (token.consent_ref === consent_hash) {
        try { capRevokeToken(cap_hash); } catch { /* already revoked */ }
        appendLedgerEntry(
          'REVOKED',
          cap_hash,
          consent_hash,
          consent.subject,
          consent.grantee,
          'CONSENT_REVOKED',
          null,
          opts?.now
        );
      }
    }
  }

  /**
   * Revokes all consents in 'institutional-affiliation' mode bound to the
   * specified affiliation credential.  Called when a VC is invalidated.
   */
  function revokeByAffiliation(
    affiliation_credential_ref: string,
    opts?: { now?: Date }
  ): string[] {
    const revoked = revokeByAffiliationCredential(
      affiliation_credential_ref,
      store.consents_v2,
      opts
    );

    for (const hash of revoked) {
      store.revoked_consents.add(hash);
      // Auto-revoke derived capability tokens
      for (const [cap_hash, token] of store.capabilities_v2.entries()) {
        if (token.consent_ref === hash) {
          try { capRevokeToken(cap_hash); } catch { /* already revoked */ }
        }
      }
    }

    return revoked;
  }

  /**
   * Processes a renewal request through the protocol renewal flow.
   * Default: manual renewal required (PENDING_SUBJECT_SIGNATURE).
   */
  function processRenewal(
    request: RenewalRequest,
    opts?: { now?: Date; auto_renewal?: boolean }
  ): { response: RenewalResponse; new_consent: ConsentObjectV2 | null } {
    const existing = store.consents_v2.get(request.prior_consent_hash);
    if (!existing) {
      return {
        response: {
          status: 'DENIED',
          new_consent_hash: null,
          denial_reason: `Consent not found: ${request.prior_consent_hash}`,
          signature_request_id: null,
        },
        new_consent: null,
      };
    }

    const result = processRenewalRequest(existing, request, opts);

    if (result.response.status === 'APPROVED' && result.new_consent !== null) {
      // Store the renewed consent
      store.consents_v2.set(result.new_consent.consent_hash, result.new_consent);
    }

    return result;
  }

  function getVaultLedger(): ReadonlyArray<AccessLedgerEntry> {
    return getLedger();
  }

  return {
    storePack,
    storeConsent,
    mintCapability,
    requestAccess,
    registerSdlMapping,
    revokeCapability,
    getStore,
    // V2 Temporal API
    storeConsentV2,
    mintCapabilityV2,
    requestAccessV2,
    revokeConsentV2,
    revokeByAffiliation,
    processRenewal,
    getLedger: getVaultLedger,
  };
}
