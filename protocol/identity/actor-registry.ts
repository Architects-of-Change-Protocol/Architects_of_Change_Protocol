import { Actor } from './types';

export interface ActorRegistryAdapter {
  get(actorId: string): Actor | undefined;
  set(actor: Actor): void;
  values(): Iterable<Actor>;
}

export class InMemoryActorRegistryAdapter implements ActorRegistryAdapter {
  private readonly actors = new Map<string, Actor>();

  get(actorId: string): Actor | undefined {
    return this.actors.get(actorId);
  }

  set(actor: Actor): void {
    this.actors.set(actor.actorId, actor);
  }

  values(): Iterable<Actor> {
    return this.actors.values();
  }
}

export class ActorRegistry {
  constructor(private readonly adapter: ActorRegistryAdapter = new InMemoryActorRegistryAdapter()) {}

  registerActor(actor: Actor): Actor {
    if (this.adapter.get(actor.actorId)) {
      throw new Error(`Actor already exists: ${actor.actorId}`);
    }
    this.adapter.set(actor);
    return actor;
  }

  updateActor(actorId: string, patch: Partial<Actor>, now: Date = new Date()): Actor {
    const current = this.resolveActor(actorId);
    const updated: Actor = { ...current, ...patch, actorId: current.actorId, updatedAt: now.toISOString() };
    this.adapter.set(updated);
    return updated;
  }

  deactivateActor(actorId: string, now: Date = new Date()): Actor {
    return this.updateActor(actorId, { active: false, deactivatedAt: now.toISOString() }, now);
  }

  resolveActor(actorId: string): Actor {
    const actor = this.adapter.get(actorId);
    if (!actor) {
      throw new Error(`Actor not found: ${actorId}`);
    }
    return actor;
  }
}


export function resolveRelationshipActors(
  registry: ActorRegistry,
  relationship: { subjectActorId: string; objectActorId: string }
): { subject: Actor; object: Actor } {
  return {
    subject: registry.resolveActor(relationship.subjectActorId),
    object: registry.resolveActor(relationship.objectActorId)
  };
}

export function normalizeActorForPDP(actor: Actor): {
  actorId: string;
  actorType: string;
  organizationId?: string;
  trustLevel: string;
  active: boolean;
} {
  return {
    actorId: actor.actorId,
    actorType: actor.actorType,
    organizationId: actor.organizationId,
    trustLevel: actor.trustLevel,
    active: actor.active
  };
}
