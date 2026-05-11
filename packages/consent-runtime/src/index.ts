import { CapabilityRef, ConsentGrant } from "@aoc-runtime/shared-types";

export interface ConsentQuery {
  actorId: string;
  capability: CapabilityRef;
  at?: string;
}

export function isGrantActive(grant: ConsentGrant, atIso: string): boolean {
  if (grant.revokedAt && grant.revokedAt <= atIso) return false;
  if (grant.expiresAt && grant.expiresAt < atIso) return false;
  return grant.issuedAt <= atIso;
}

export function isDelegatedGrant(grant: ConsentGrant): boolean {
  return Boolean(grant.delegateActorId);
}

export function isMachineConsent(grant: ConsentGrant): boolean {
  return grant.subjectActorId.startsWith("machine:") || (grant.delegateActorId?.startsWith("machine:") ?? false);
}
