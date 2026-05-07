import { Relationship } from './types';

export function isRelationshipCurrentlyValid(
  relationship: Relationship,
  now: Date = new Date(),
): boolean {
  if (relationship.state !== 'active') {
    return false;
  }

  if (relationship.revokedAt) {
    return false;
  }

  const nowMs = now.getTime();

  if (relationship.startsAt && nowMs < new Date(relationship.startsAt).getTime()) {
    return false;
  }

  if (relationship.expiresAt && nowMs >= new Date(relationship.expiresAt).getTime()) {
    return false;
  }

  return true;
}
