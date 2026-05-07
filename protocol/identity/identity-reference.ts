import { IdentityReference, IdentityReferenceKind, VerificationStatus } from './types';

export function createIdentityReference(input: {
  referenceId: string;
  actorId: string;
  kind: IdentityReferenceKind;
  value: string;
  provider?: string;
  verificationStatus?: VerificationStatus;
  now?: Date;
  metadata?: Record<string, unknown>;
}): IdentityReference {
  if (!input.referenceId || !input.actorId || !input.value) {
    throw new Error('referenceId, actorId, and value are required.');
  }

  const nowIso = (input.now ?? new Date()).toISOString();

  return {
    referenceId: input.referenceId,
    actorId: input.actorId,
    kind: input.kind,
    value: input.value,
    provider: input.provider,
    verificationStatus: input.verificationStatus ?? 'unverified',
    verifiedAt: input.verificationStatus === 'verified' ? nowIso : undefined,
    createdAt: nowIso,
    updatedAt: nowIso,
    metadata: input.metadata
  };
}
