import type { ConsentObjectV1, ScopeEntry } from '../consent';
import type { CapabilityTokenV1 } from '../capability';
import type { PackManifestV1 } from '../pack';
import type { NonceRegistry } from '../capability/registries/NonceRegistry';
import type { RevocationRegistry } from '../capability/registries/RevocationRegistry';

// --- Error Codes ---

export type VaultErrorCode =
  | 'EXPIRED'
  | 'NOT_YET_VALID'
  | 'REPLAY'
  | 'REVOKED'
  | 'SCOPE_ESCALATION'
  | 'SCOPE_MISMATCH'
  | 'INVALID_SCOPE'
  | 'INVALID_CAPABILITY'
  | 'MALFORMED_CAPABILITY'
  | 'INVALID_SDL_PATH'
  | 'UNRESOLVED_FIELD'
  | 'PACK_NOT_FOUND'
  | 'CONSENT_NOT_FOUND'
  | 'CONSENT_MISMATCH'
  | 'RESOURCE_RESTRICTION_FAILED'
  | 'REQUEST_CONTEXT_MISMATCH'
  | 'RATE_LIMIT_UNSUPPORTED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_DENY';

// --- Vault Error ---

export type VaultError = {
  code: VaultErrorCode;
  message: string;
  path?: string;
};

// --- Policy Decision ---

export type VaultPolicyDecision = {
  decision: 'ALLOW' | 'DENY';
  reason_codes: VaultErrorCode[];
};

// --- Resolved / Unresolved Fields ---

export type ResolvedField = {
  sdl_path: string;
  field_id: string;
  content_id: string;
};

export type UnresolvedField = {
  sdl_path: string;
  error: VaultError;
};

// --- Access Request / Result ---

export type VaultAccessRequest = {
  capability_token: CapabilityTokenV1;
  sdl_paths: string[];
  pack_ref: string;
};

export type VaultAccessResult = {
  policy: VaultPolicyDecision;
  resolved_fields: ResolvedField[];
  unresolved_fields: UnresolvedField[];
};

// --- Vault Store ---

export type VaultStore = {
  packs: Map<string, PackManifestV1>;
  consents: Map<string, ConsentObjectV1>;
  capabilities: Map<string, CapabilityTokenV1>;
  sdl_mappings: Map<string, string>;
};

// --- Vault Options ---

export type VaultOptions = {
  now?: Date;
  nonceRegistry?: NonceRegistry;
  revocationRegistry?: RevocationRegistry;
};

// --- Vault Interface ---

export type Vault = {
  storePack(pack: PackManifestV1): string;
  applyConsent(consent: ConsentObjectV1): string;
  storeConsent(consent: ConsentObjectV1): string;
  mintCapability(
    consent_hash: string,
    scope: ScopeEntry[],
    permissions: string[],
    expires_at: string,
    opts?: { now?: Date; not_before?: string | null }
  ): CapabilityTokenV1;
  requestAccess(
    request: VaultAccessRequest,
    opts?: { now?: Date }
  ): VaultAccessResult;
  registerSdlMapping(sdl_path: string, field_id: string): void;
  revokeCapability(capability_hash: string): void;
  getStore(): Readonly<VaultStore>;
};
