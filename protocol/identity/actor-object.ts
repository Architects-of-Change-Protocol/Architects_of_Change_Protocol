import { Actor, ActorAuthorityBoundary, ActorType, TrustLevel } from './types';

const VALID_ACTOR_TYPES = new Set<ActorType>([
  'human',
  'organization',
  'brand',
  'app',
  'ai_agent',
  'delegate',
  'system'
]);

export function defaultAuthorityBoundary(): ActorAuthorityBoundary {
  return {
    maxDelegationDepth: 2,
    blockedActions: [],
    restrictedScopes: [],
    aiRestrictions: {
      disallowAutonomousDelegation: true,
      requireHumanEscalationForActions: [],
      blockedScopes: []
    },
    requireHumanReview: false
  };
}

export function createActor(input: {
  actorId: string;
  actorType: ActorType;
  displayName: string;
  trustLevel?: TrustLevel;
  organizationId?: string;
  parentActorId?: string;
  authorityBoundary?: ActorAuthorityBoundary;
  metadata?: Record<string, unknown>;
  now?: Date;
}): Actor {
  if (!input.actorId || !input.actorId.trim()) {
    throw new Error('actorId is required.');
  }
  if (!VALID_ACTOR_TYPES.has(input.actorType)) {
    throw new Error(`Invalid actorType: ${input.actorType}.`);
  }
  if (!input.displayName || !input.displayName.trim()) {
    throw new Error('displayName is required.');
  }

  const now = (input.now ?? new Date()).toISOString();

  return {
    actorId: input.actorId,
    actorType: input.actorType,
    displayName: input.displayName,
    organizationId: input.organizationId,
    parentActorId: input.parentActorId,
    trustLevel: input.trustLevel ?? 'baseline',
    active: true,
    authorityBoundary: input.authorityBoundary ?? defaultAuthorityBoundary(),
    metadata: input.metadata,
    createdAt: now,
    updatedAt: now
  };
}
