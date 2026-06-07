import type { ProtocolError } from './protocol-error';

export type ProtocolErrorCode =
  | 'validation.invalid_request'
  | 'validation.invalid_state'
  | 'authorization.forbidden'
  | 'authorization.scope_violation'
  | 'policy.evaluation_failed'
  | 'policy.not_applicable'
  | 'delegation.invalid_chain'
  | 'delegation.revoked'
  | 'consent.missing'
  | 'consent.revoked'
  | 'audit.write_failed'
  | 'audit.export_failed'
  | 'identity.not_found'
  | 'identity.ambiguous'
  | 'conflict'
  | 'unavailable'
  | 'internal';

export type ProtocolErrorCategory =
  | 'validation'
  | 'authorization'
  | 'policy'
  | 'delegation'
  | 'consent'
  | 'audit'
  | 'identity'
  | 'platform';

export interface ProtocolErrorContract {
  code: ProtocolErrorCode;
  category: ProtocolErrorCategory;
  message: string;
  recoverable: boolean;
  details?: unknown;
  causeCode?: string;
}

export interface AccessError extends ProtocolError {}
export interface VerificationError extends ProtocolError {}
export interface AuthorizationError extends ProtocolError {}
export interface TrustError extends ProtocolError {}
export interface RevocationError extends ProtocolError {}
export interface ExecutionError extends ProtocolError {}
export interface GovernanceError extends ProtocolError {}
export interface PolicyError extends ProtocolError {}
export interface RuntimeError extends ProtocolError {}
