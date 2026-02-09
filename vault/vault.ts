import { ConsentObjectV1, validateConsentObject } from '../consent';
import { ScopeEntry } from '../consent/types';
import {
  CapabilityTokenV1,
  mintCapabilityToken,
  verifyCapabilityToken,
  revokeCapabilityToken as capRevokeToken
} from '../capability';
import { PackManifestV1 } from '../pack';
import { canonicalizePackManifestPayload, computePackHash } from '../pack';
import {
  Vault,
  VaultStore,
  VaultAccessRequest,
  VaultAccessResult,
  VaultErrorCode,
  VaultOptions,
  ResolvedField,
  UnresolvedField
} from './types';

// --- SDL path validation (v0.1 scaffold — no separate sdl/ module yet) ---

const SDL_PATH_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

function validateSdlPath(path: string): string | null {
  if (typeof path !== 'string' || !SDL_PATH_PATTERN.test(path)) {
    return `Invalid SDL path: "${path}". Must be dot-separated lowercase alphanumeric segments (minimum 2 segments).`;
  }
  return null;
}

// --- Capability error classification ---

function classifyCapabilityError(error: Error): VaultErrorCode {
  const msg = error.message;
  if (msg.includes('expired')) return 'EXPIRED';
  if (msg.includes('replay')) return 'REPLAY';
  if (msg.includes('revoked')) return 'REVOKED';
  if (msg.includes('Scope escalation') || msg.includes('Permission escalation')) {
    return 'SCOPE_ESCALATION';
  }
  return 'INVALID_CAPABILITY';
}

// --- Factory ---

export function createInMemoryVault(_options?: VaultOptions): Vault {
  const store: VaultStore = {
    packs: new Map(),
    consents: new Map(),
    capabilities: new Map(),
    sdl_mappings: new Map()
  };

  function storePack(pack: PackManifestV1): string {
    // Verify hash integrity
    const payloadBytes = canonicalizePackManifestPayload({
      version: pack.version,
      subject: pack.subject,
      created_at: pack.created_at,
      fields: pack.fields
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

  function requestAccess(
    request: VaultAccessRequest,
    opts?: { now?: Date }
  ): VaultAccessResult {
    const { capability_token, sdl_paths, pack_ref } = request;

    // Step 1: Look up parent consent for this capability
    const consent = store.consents.get(capability_token.consent_ref);
    if (!consent) {
      return {
        policy: { decision: 'DENY', reason_codes: ['INVALID_CAPABILITY'] },
        resolved_fields: [],
        unresolved_fields: []
      };
    }

    // Step 2: Verify capability token (expiry, revocation, replay, derivation)
    try {
      verifyCapabilityToken(capability_token, consent, opts);
    } catch (error) {
      const code = classifyCapabilityError(error as Error);
      return {
        policy: { decision: 'DENY', reason_codes: [code] },
        resolved_fields: [],
        unresolved_fields: []
      };
    }

    // Step 3: Look up pack
    const pack = store.packs.get(pack_ref);
    if (!pack) {
      return {
        policy: { decision: 'DENY', reason_codes: ['PACK_NOT_FOUND'] },
        resolved_fields: [],
        unresolved_fields: []
      };
    }

    // Build field index from pack
    const fieldByFieldId = new Map<string, { field_id: string; content_id: string }>();
    for (const field of pack.fields) {
      fieldByFieldId.set(field.field_id, {
        field_id: field.field_id,
        content_id: field.content_id
      });
    }

    // Build scope index for containment checks
    const scopeKeys = new Set(
      capability_token.scope.map(s => `${s.type}:${s.ref}`)
    );

    // Step 4: Sort SDL paths for deterministic processing
    const sortedPaths = [...sdl_paths].sort();

    const resolved: ResolvedField[] = [];
    const unresolved: UnresolvedField[] = [];
    let scopeEscalation = false;

    for (const sdl_path of sortedPaths) {
      // 4a: Parse + validate SDL path
      const pathError = validateSdlPath(sdl_path);
      if (pathError) {
        unresolved.push({
          sdl_path,
          error: { code: 'INVALID_SDL_PATH', message: pathError, path: sdl_path }
        });
        continue;
      }

      // 4b: Resolve SDL path to field_id via registered mapping
      const field_id = store.sdl_mappings.get(sdl_path);
      if (!field_id) {
        unresolved.push({
          sdl_path,
          error: {
            code: 'UNRESOLVED_FIELD',
            message: `No SDL mapping registered for path: "${sdl_path}"`,
            path: sdl_path
          }
        });
        continue;
      }

      // 4c: Look up field in pack
      const field = fieldByFieldId.get(field_id);
      if (!field) {
        unresolved.push({
          sdl_path,
          error: {
            code: 'UNRESOLVED_FIELD',
            message: `Field "${field_id}" not found in pack ${pack_ref}`,
            path: sdl_path
          }
        });
        continue;
      }

      // 4d: Check scope containment
      //   - pack-level: { type: 'pack', ref: pack_hash } covers entire pack
      //   - content-level: { type: 'content', ref: content_id } covers this field
      const packCovered = scopeKeys.has(`pack:${pack_ref}`);
      const contentCovered = scopeKeys.has(`content:${field.content_id}`);

      if (!packCovered && !contentCovered) {
        scopeEscalation = true;
        break;
      }

      resolved.push({
        sdl_path,
        field_id: field.field_id,
        content_id: field.content_id
      });
    }

    // Step 5: Scope escalation → DENY
    if (scopeEscalation) {
      return {
        policy: { decision: 'DENY', reason_codes: ['SCOPE_ESCALATION'] },
        resolved_fields: [],
        unresolved_fields: []
      };
    }

    // Step 6: ALLOW — capability verified, no scope escalation
    return {
      policy: { decision: 'ALLOW', reason_codes: [] },
      resolved_fields: resolved,
      unresolved_fields: unresolved
    };
  }

  return {
    storePack,
    storeConsent,
    mintCapability,
    requestAccess,
    registerSdlMapping,
    revokeCapability,
    getStore: () => store
  };
}
