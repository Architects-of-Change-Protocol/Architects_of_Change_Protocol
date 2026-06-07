import type { CanonicalClaim } from './claim';

export const CAPABILITY_CLAIM_VERSION = 'aoc-capability-claim-v1' as const;
export type CapabilityClaimVersion = typeof CAPABILITY_CLAIM_VERSION;
export type ClaimIssuerType = 'system' | 'user' | 'agent';
export type ClaimSubjectType = 'user' | 'agent';

/** Legacy capability-claim shape retained exactly for import-only migration. */
export interface CapabilityClaim {
  version: CapabilityClaimVersion;
  issuer: {
    app: string;
    workspaceId: string;
    issuerType: ClaimIssuerType;
    issuerUserId?: string;
    issuerAgentId?: string;
    trustDomain?: string;
    issuerId?: string;
  };
  subject: { subjectType: ClaimSubjectType; userId?: string; agentId?: string };
  authority: {
    action: string;
    requestedPermission: string;
    resourceType?: string;
    resourceId?: string;
    workspaceId: string;
    projectId?: string;
  };
  constraints: {
    maxUses?: number;
    allowedUntil: string;
    canDelegate?: boolean;
    delegationDepth?: number;
    allowedActions?: string[];
    allowedProjectIds?: string[];
    allowedResourceTypes?: string[];
  };
  lineage: {
    parentDecisionId?: string;
    parentGrantId?: string;
    parentDelegationId?: string;
    rootApprovalRequestId?: string;
    issuedAt: string;
  };
  proof: {
    algorithm: string;
    keyId: string;
    signature: string;
    trustDomain?: string;
    issuedAt?: string;
  };
}

/** Ownership aliases for claim categories previously spread across legacy barrels. */
export type DelegationClaim = CanonicalClaim;
export type GrantClaim = CanonicalClaim;
export type VerificationClaim = CanonicalClaim;
export type TrustClaim = CanonicalClaim;
export type AttestationClaim = CanonicalClaim;
export type CredentialClaim = CanonicalClaim;
export type RevocationClaim = CanonicalClaim;
