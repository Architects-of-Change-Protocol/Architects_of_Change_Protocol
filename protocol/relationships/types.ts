export const RELATIONSHIP_STATES = [
  'proposed',
  'pending',
  'active',
  'suspended',
  'expired',
  'revoked',
  'disputed',
] as const;

export type RelationshipState = (typeof RELATIONSHIP_STATES)[number];

export const RELATIONSHIP_ACTOR_ROLES = [
  'subject',
  'brand',
  'organization',
  'app',
  'ai_agent',
  'delegate',
] as const;

export type RelationshipActorRole = (typeof RELATIONSHIP_ACTOR_ROLES)[number];

export type RelationshipActor = {
  actorId: string;
  actorType: string;
  role: RelationshipActorRole;
};

export type RelationshipTemporalConstraints = {
  startsAt?: string;
  expiresAt?: string;
  validDaysOfWeek?: number[];
  validHoursUtc?: {
    startHour: number;
    endHour: number;
  };
};

export type RelationshipCommunicationLimits = {
  maxMessagesPerDay?: number;
  quietHoursUtc?: {
    startHour: number;
    endHour: number;
  };
};

export type AIDelegationBoundary = {
  delegatedAiActorIds?: string[];
  allowedPurposes?: string[];
  blockedCategories?: string[];
  requiresHumanReview?: boolean;
};

export type RelationshipScope = {
  categories?: string[];
  purposes?: string[];
  allowedBrands?: string[];
  allowedChannels?: string[];
  allowedActions?: string[];
  temporalConstraints?: RelationshipTemporalConstraints;
  communicationLimits?: RelationshipCommunicationLimits;
  aiDelegation?: AIDelegationBoundary;
};

export type RelationshipPolicyBinding = {
  policyId: string;
  attachedAt: string;
  active: boolean;
  version?: string;
};

export type RelationshipAuditReference = {
  auditEventIds: string[];
  lastEvaluatedAt?: string;
  lastPolicyTraceId?: string;
};

export type Relationship = {
  id: string;
  type: string;
  state: RelationshipState;
  actors: RelationshipActor[];
  scope?: RelationshipScope;
  policyBindings?: RelationshipPolicyBinding[];
  audit?: RelationshipAuditReference;
  createdAt: string;
  updatedAt: string;
  startsAt?: string;
  expiresAt?: string;
  suspendedAt?: string;
  revokedAt?: string;
};
