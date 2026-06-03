import type { CanonicalId } from '../contracts';
import type { CanonicalMetadata } from './primitives';

export const PrincipalKind = {
  Human: 'Human',
  Organization: 'Organization',
  System: 'System',
  AI: 'AI',
  Runtime: 'Runtime',
  GovernanceBody: 'GovernanceBody',
  MarketMaker: 'MarketMaker',
  CredentialIssuer: 'CredentialIssuer',
  Unknown: 'Unknown',
} as const;
export type PrincipalKind = (typeof PrincipalKind)[keyof typeof PrincipalKind];

export const ReferenceSourceKind = {
  URI: 'URI',
  DID: 'DID',
  Wallet: 'Wallet',
  Email: 'Email',
  Domain: 'Domain',
  Registry: 'Registry',
  InternalId: 'InternalId',
  ExternalId: 'ExternalId',
  Document: 'Document',
  AuditTrace: 'AuditTrace',
  RuntimeTrace: 'RuntimeTrace',
  Unknown: 'Unknown',
} as const;
export type ReferenceSourceKind = (typeof ReferenceSourceKind)[keyof typeof ReferenceSourceKind];

export const ScopeKind = {
  Global: 'Global',
  Organization: 'Organization',
  Workspace: 'Workspace',
  Project: 'Project',
  Resource: 'Resource',
  Action: 'Action',
  Policy: 'Policy',
  Market: 'Market',
  Custom: 'Custom',
} as const;
export type ScopeKind = (typeof ScopeKind)[keyof typeof ScopeKind];

/**
 * Identifies the source namespace or locator used for a canonical reference.
 * This is not verification and does not imply authority over the referenced value.
 */
export interface CanonicalReferenceSource {
  readonly kind: ReferenceSourceKind;
  readonly value: string;
  readonly label?: string;
  readonly metadata?: CanonicalMetadata;
}

/**
 * Identifies or describes a referenced principal without proving identity,
 * standing, or authority.
 */
export interface CanonicalPrincipalRef {
  readonly id: CanonicalId;
  readonly kind: PrincipalKind;
  readonly displayName?: string;
  readonly source?: CanonicalReferenceSource;
  readonly metadata?: CanonicalMetadata;
}

/**
 * Identifies a scope boundary for authority without resolving policies,
 * resources, or runtime permissions.
 */
export interface CanonicalScopeRef {
  readonly kind: ScopeKind;
  readonly value: string;
  readonly description?: string;
  readonly metadata?: CanonicalMetadata;
}
