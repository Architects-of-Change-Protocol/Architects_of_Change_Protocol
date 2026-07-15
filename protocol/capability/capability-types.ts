import type { ProtocolConsent, ScopeEntry } from '../consent/consent-types';
import type { RevocationCheckPort, RevocationStatus } from '../revocation';

export type CapabilityState =
  | 'active'
  | 'expired'
  | 'not_yet_active'
  | 'revoked'
  | 'revocation_unknown'
  | 'invalid';

export type ProtocolCapability = {
  capability_hash: string;
  parent_consent_hash: string;
  subject: string;
  grantee: string;
  scope: ScopeEntry[];
  permissions: string[];
  issued_at: string;
  expires_at: string;
  not_before?: string;
  marketMakerId?: string;
  metadata?: Record<string, unknown>;
};

export type MintCapabilityInput = {
  consent: unknown;
  requested_scope: ScopeEntry[];
  requested_permissions: string[];
  issued_at: string;
  expires_at?: string;
  not_before?: string;
  marketMakerId?: string;
  metadata?: Record<string, unknown>;
  /** Minting is a material operation: the parent consent's revocation status must be proven. */
  checkConsentRevocation: RevocationCheckPort;
};

export type CapabilityVerificationResult = {
  valid: boolean;
  errors: string[];
  normalized?: ProtocolCapability;
};

export type EvaluateCapabilityStateOptions = {
  now?: Date;
  /**
   * Mandatory: every material evaluation must present an explicit revocation determination.
   * There is no default — omission is a compile-time error, not a silent "not revoked".
   */
  checkRevocation: RevocationCheckPort;
};

export type CapabilityStateResult = {
  state: CapabilityState;
  reasons: string[];
  revocationStatus?: RevocationStatus;
};

export type CapabilityAccessRequest = {
  requested_scope: ScopeEntry[];
  requested_permissions: string[];
  subject?: string;
  grantee?: string;
  marketMakerId?: string;
  now?: Date;
  checkRevocation: RevocationCheckPort;
};

export type ParsedConsentForCapability = {
  normalized: ProtocolConsent;
  state: 'active';
};
