/**
 * HRKey ↔ AOC Vault Integration Contract
 *
 * This file defines the EXACT interface surface HRKey relies on.
 * HRKey MUST NOT import from AOC core modules directly.
 * All AOC interaction flows through the adapter defined here.
 *
 * Invariants:
 *   - All inputs/outputs are plain serializable objects (no classes).
 *   - All hashes are lowercase 64-char hex (SHA-256).
 *   - All timestamps are ISO 8601 UTC (YYYY-MM-DDTHH:MM:SSZ).
 *   - DIDs follow pattern: did:<method>:<id>
 *   - Deterministic: same inputs → same outputs, always.
 */

// ─── Re-export AOC types that cross the boundary ────────────────────

// These are type-only re-exports. HRKey code references these types
// but never constructs AOC internals directly.
export type {
  ConsentObjectV1,
  ScopeEntry,
} from '../../consent';

export type {
  CapabilityTokenV1,
} from '../../capability';

export type {
  PackManifestV1,
  FieldReference,
} from '../../pack';

export type {
  VaultAccessResult,
  VaultPolicyDecision,
  VaultErrorCode,
  ResolvedField,
  UnresolvedField,
} from '../../vault';

// ─── HRKey Domain Types ─────────────────────────────────────────────

/** Identifies a candidate in HRKey's domain. Must be a valid DID. */
export type CandidateDID = string;

/** Identifies an employer (or any grantee) in HRKey's domain. Must be a valid DID. */
export type EmployerDID = string;

/** HRKey-specific SDL paths for professional reference data. */
export type HRKeySDLPath = string;

// ─── Adapter Input Types ────────────────────────────────────────────

/** Input for registering a candidate's data pack through HRKey. */
export type RegisterPackInput = {
  /** The pre-built PackManifestV1 from the candidate's wallet. */
  pack: PackManifestV1;
  /** SDL path → field_id mappings for this pack's fields. */
  sdl_mappings: ReadonlyArray<{ sdl_path: string; field_id: string }>;
};

/** Input for a candidate granting consent to an employer via HRKey. */
export type GrantConsentInput = {
  candidate: CandidateDID;
  employer: EmployerDID;
  scope: ScopeEntry[];
  permissions: string[];
  expires_at: string | null;
};

/** Input for minting an attenuated capability token. */
export type MintCapabilityInput = {
  consent_hash: string;
  scope: ScopeEntry[];
  permissions: string[];
  expires_at: string;
  not_before?: string | null;
};

/** Input for an employer requesting access to candidate data. */
export type AccessRequestInput = {
  capability: CapabilityTokenV1;
  sdl_paths: string[];
  pack_hash: string;
};

// ─── Adapter Result Types ───────────────────────────────────────────

/** Result of registering a pack. */
export type RegisterPackResult = {
  pack_hash: string;
  sdl_paths_registered: number;
};

/** Result of granting consent. */
export type GrantConsentResult = {
  consent_hash: string;
  consent: ConsentObjectV1;
};

/** Result of minting a capability. */
export type MintCapabilityResult = {
  capability_hash: string;
  capability: CapabilityTokenV1;
};

// VaultAccessResult is used directly for access results (no wrapping needed).

// ─── Adapter Interface ──────────────────────────────────────────────

/**
 * The contract HRKey code programs against.
 *
 * This is the ONLY surface HRKey should touch.
 * Implementation is provided by AocVaultAdapter.
 */
export interface IHRKeyVaultAdapter {
  /**
   * Register a candidate's data pack and its SDL mappings.
   * Vault stores the pack; SDL mappings are registered for resolution.
   *
   * @throws if pack hash integrity fails
   * @throws if any SDL path is invalid
   */
  registerPack(input: RegisterPackInput): RegisterPackResult;

  /**
   * Record a candidate's consent grant for an employer.
   * Builds a ConsentObjectV1 and stores it in the Vault.
   *
   * @throws if DID format is invalid
   * @throws if scope/permissions are empty or malformed
   */
  grantConsent(input: GrantConsentInput, opts?: { now?: Date }): GrantConsentResult;

  /**
   * Mint an attenuated capability token from an existing consent.
   * Token scope/permissions must be subsets of parent consent.
   *
   * @throws CONSENT_NOT_FOUND if consent_hash is not in the Vault
   * @throws if scope or permissions escalate beyond consent
   */
  mintCapability(input: MintCapabilityInput, opts?: { now?: Date }): MintCapabilityResult;

  /**
   * Validate an employer's access request against the Vault.
   * Returns ALLOW/DENY with resolved and unresolved fields.
   *
   * Deterministic: identical inputs produce identical outputs.
   * Replay-protected: same token cannot be presented twice.
   */
  requestAccess(input: AccessRequestInput, opts?: { now?: Date }): VaultAccessResult;

  /**
   * Revoke a previously minted capability token.
   * Subsequent requestAccess calls with this token will return DENY(REVOKED).
   */
  revokeCapability(capability_hash: string): void;
}
