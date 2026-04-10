import type { ProtocolConsent, ScopeEntry } from '../consent/consent-types';

export type CapabilityState =
  | 'active'
  | 'expired'
  | 'not_yet_active'
  | 'revoked'
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
};

export type CapabilityVerificationResult = {
  valid: boolean;
  errors: string[];
  normalized?: ProtocolCapability;
};

export type EvaluateCapabilityStateOptions = {
  now?: Date;
  isRevoked?: (capability: ProtocolCapability) => boolean;
};

export type CapabilityStateResult = {
  state: CapabilityState;
  reasons: string[];
};

export type CapabilityAccessRequest = {
  requested_scope: ScopeEntry[];
  requested_permissions: string[];
  subject?: string;
  grantee?: string;
  marketMakerId?: string;
  now?: Date;
  isRevoked?: (capability: ProtocolCapability) => boolean;
};

export type ParsedConsentForCapability = {
  normalized: ProtocolConsent;
  state: 'active';
};
