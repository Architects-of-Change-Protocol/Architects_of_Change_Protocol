import type { ScopeEntry } from '../consent/consent-types';
import type { ProtocolCapability } from '../capability/capability-types';

export const ENFORCEMENT_REASON_CODES = {
  CAPABILITY_INVALID: 'CAPABILITY_INVALID',
  CAPABILITY_EXPIRED: 'CAPABILITY_EXPIRED',
  CAPABILITY_REVOKED: 'CAPABILITY_REVOKED',
  CAPABILITY_NOT_YET_ACTIVE: 'CAPABILITY_NOT_YET_ACTIVE',
  SCOPE_NOT_ALLOWED: 'SCOPE_NOT_ALLOWED',
  PERMISSION_NOT_ALLOWED: 'PERMISSION_NOT_ALLOWED',
  SUBJECT_MISMATCH: 'SUBJECT_MISMATCH',
  GRANTEE_MISMATCH: 'GRANTEE_MISMATCH',
  MARKET_MAKER_MISMATCH: 'MARKET_MAKER_MISMATCH',
  REQUEST_INVALID: 'REQUEST_INVALID',
  ENFORCEMENT_ALLOW: 'ENFORCEMENT_ALLOW',
} as const;

export type EnforcementReasonCode = (typeof ENFORCEMENT_REASON_CODES)[keyof typeof ENFORCEMENT_REASON_CODES];

export type EnforcementResource = {
  type: 'field' | 'content' | 'pack';
  ref: string;
};

export type EnforcementRequest = {
  capability: unknown;
  requested_scope: ScopeEntry[];
  requested_permissions: string[];
  subject?: string;
  grantee?: string;
  marketMakerId?: string;
  resource?: EnforcementResource | null;
  action_context?: Record<string, unknown>;
  now?: Date;
  isRevoked?: (capability: ProtocolCapability) => boolean;
};

export type NormalizedEnforcementRequest = {
  capability: unknown;
  requested_scope: ScopeEntry[];
  requested_permissions: string[];
  subject?: string;
  grantee?: string;
  marketMakerId?: string;
  resource?: EnforcementResource | null;
  action_context?: Record<string, unknown>;
  now?: Date;
  isRevoked?: (capability: ProtocolCapability) => boolean;
};

export type EnforcementDecision = {
  allowed: boolean;
  decision: 'allow' | 'deny';
  reason_code: EnforcementReasonCode;
  reasons: string[];
  evaluated_at: string;
  normalized_request?: NormalizedEnforcementRequest;
  normalized_capability?: ProtocolCapability;
  matched_scope?: ScopeEntry[];
  matched_permissions?: string[];
};
