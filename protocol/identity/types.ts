export type ActorType =
  | 'human'
  | 'organization'
  | 'brand'
  | 'app'
  | 'ai_agent'
  | 'delegate'
  | 'system';

export type TrustLevel = 'untrusted' | 'baseline' | 'trusted' | 'high_assurance';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type IdentityReferenceKind = 'internal' | 'did' | 'external_provider';

export type IdentityReference = {
  referenceId: string;
  actorId: string;
  kind: IdentityReferenceKind;
  value: string;
  provider?: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};

export type AIRestrictions = {
  disallowAutonomousDelegation: boolean;
  requireHumanEscalationForActions: string[];
  blockedScopes: string[];
};

export type ActorAuthorityBoundary = {
  maxDelegationDepth: number;
  blockedActions: string[];
  restrictedScopes: string[];
  aiRestrictions: AIRestrictions;
  requireHumanReview: boolean;
};

export type Actor = {
  actorId: string;
  actorType: ActorType;
  displayName: string;
  organizationId?: string;
  parentActorId?: string;
  trustLevel: TrustLevel;
  active: boolean;
  authorityBoundary: ActorAuthorityBoundary;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deactivatedAt?: string;
};

export type DelegationGrant = {
  grantId: string;
  delegatorActorId: string;
  delegateActorId: string;
  allowedActions: string[];
  allowedScopes: string[];
  issuedAt: string;
  expiresAt?: string;
  revokedAt?: string;
  metadata?: Record<string, unknown>;
};

export type TrustChain = {
  rootActorId: string;
  delegatedActors: string[];
  trustPath: Array<{ fromActorId: string; toActorId: string; grantId: string }>;
  chainValidity: 'valid' | 'invalid';
  evaluatedAt: string;
  reasons: string[];
};

export type DelegationValidationResult = {
  valid: boolean;
  reasons: string[];
};
