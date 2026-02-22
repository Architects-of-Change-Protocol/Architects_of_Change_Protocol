import type { ConsentObjectV1, ConsentObjectV2, ScopeEntry } from '../consent';
import type { CapabilityTokenV1, CapabilityTokenV2 } from '../capability';
import type { PackManifestV1 } from '../pack';
import type { RenewalRequest, RenewalResponse, AccessLedgerEntry } from '../temporal/types';
export type { RenewalRequest, RenewalResponse, AccessLedgerEntry } from '../temporal/types';

// --- Error Codes ---

export type VaultErrorCode =
  | 'EXPIRED'
  | 'REPLAY'
  | 'REVOKED'
  | 'SCOPE_ESCALATION'
  | 'INVALID_CAPABILITY'
  | 'INVALID_SDL_PATH'
  | 'UNRESOLVED_FIELD'
  | 'PACK_NOT_FOUND'
  | 'CONSENT_NOT_FOUND'
  | 'ACCESS_WINDOW_NOT_OPEN'
  | 'AFFILIATION_REVOKED';

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

// --- V2 Access Request ---

export type VaultAccessRequestV2 = {
  capability_token: CapabilityTokenV2;
  sdl_paths: string[];
  pack_ref: string;
};

// --- Vault Store ---

export type VaultStore = {
  packs: Map<string, PackManifestV1>;
  consents: Map<string, ConsentObjectV1>;
  capabilities: Map<string, CapabilityTokenV1>;
  sdl_mappings: Map<string, string>;
  // V2 stores (co-exist; backward compatible)
  consents_v2: Map<string, ConsentObjectV2>;
  capabilities_v2: Map<string, CapabilityTokenV2>;
  revoked_consents: Set<string>;          // consent_hashes revoked pre-expiry
};

// --- Vault Options ---

export type VaultOptions = {
  now?: Date;
};

// --- Vault Interface ---

export type Vault = {
  storePack(pack: PackManifestV1): string;
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

  // --- V2 Temporal API ---
  storeConsentV2(consent: ConsentObjectV2): string;
  mintCapabilityV2(
    consent_hash: string,
    scope: ScopeEntry[],
    permissions: string[],
    expires_at: string,
    opts?: { now?: Date; not_before?: string | null; renewal_generation?: number }
  ): CapabilityTokenV2;
  requestAccessV2(
    request: VaultAccessRequestV2,
    opts?: { now?: Date }
  ): VaultAccessResult;
  revokeConsentV2(consent_hash: string, opts?: { now?: Date }): void;
  revokeByAffiliation(
    affiliation_credential_ref: string,
    opts?: { now?: Date }
  ): string[];
  processRenewal(
    request: RenewalRequest,
    opts?: { now?: Date; auto_renewal?: boolean }
  ): { response: RenewalResponse; new_consent: ConsentObjectV2 | null };
  getLedger(): ReadonlyArray<AccessLedgerEntry>;
};
