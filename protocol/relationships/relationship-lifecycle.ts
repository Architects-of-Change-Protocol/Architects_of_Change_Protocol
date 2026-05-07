import { Relationship, RelationshipActor, RelationshipState } from './types';

type TransitionInput = {
  actorId?: string;
  at?: string;
};

function isoNow(at?: string): string {
  return at ?? new Date().toISOString();
}

function assertHasSubjectActor(actors: RelationshipActor[]): void {
  if (!actors.some((actor) => actor.role === 'subject')) {
    throw new Error('Relationship must include at least one subject actor');
  }
}

function applyState(
  relationship: Relationship,
  nextState: RelationshipState,
  at?: string,
): Relationship {
  const transitionAt = isoNow(at);
  return {
    ...relationship,
    state: nextState,
    updatedAt: transitionAt,
  };
}

export function createRelationship(input: {
  id: string;
  type: string;
  actors: RelationshipActor[];
  startsAt?: string;
  expiresAt?: string;
  scope?: Relationship['scope'];
  state?: Extract<RelationshipState, 'proposed' | 'pending'>;
}): Relationship {
  assertHasSubjectActor(input.actors);

  const now = new Date().toISOString();
  return {
    id: input.id,
    type: input.type,
    state: input.state ?? 'proposed',
    actors: input.actors,
    scope: input.scope,
    policyBindings: [],
    audit: { auditEventIds: [] },
    createdAt: now,
    updatedAt: now,
    startsAt: input.startsAt,
    expiresAt: input.expiresAt,
  };
}

export function activateRelationship(
  relationship: Relationship,
  input: TransitionInput = {},
): Relationship {
  if (relationship.state === 'revoked') {
    throw new Error('Revoked relationships cannot be reactivated');
  }

  if (relationship.state === 'expired') {
    throw new Error('Expired relationships cannot transition to active');
  }

  if (relationship.state === 'suspended') {
    throw new Error('Suspended relationships require an explicit restore path');
  }

  return applyState(relationship, 'active', input.at);
}

export function suspendRelationship(
  relationship: Relationship,
  input: TransitionInput = {},
): Relationship {
  const suspended = applyState(relationship, 'suspended', input.at);
  return {
    ...suspended,
    suspendedAt: suspended.updatedAt,
  };
}

export function revokeRelationship(
  relationship: Relationship,
  input: TransitionInput = {},
): Relationship {
  const revoked = applyState(relationship, 'revoked', input.at);
  return {
    ...revoked,
    revokedAt: revoked.updatedAt,
  };
}

export function expireRelationship(
  relationship: Relationship,
  input: TransitionInput = {},
): Relationship {
  const expired = applyState(relationship, 'expired', input.at);
  return {
    ...expired,
    expiresAt: expired.updatedAt,
  };
}

export function disputeRelationship(
  relationship: Relationship,
  input: TransitionInput = {},
): Relationship {
  return applyState(relationship, 'disputed', input.at);
}
