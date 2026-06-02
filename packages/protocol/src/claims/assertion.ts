import type {
  CanonicalAssertionId,
  CanonicalEvidenceId,
  CanonicalIssuer,
  CanonicalSubject,
  CanonicalTimestamp,
} from './primitives';

export interface CanonicalAssertion {
  readonly id: CanonicalAssertionId;
  readonly subject: CanonicalSubject;
  readonly statement: string;
  readonly evidenceRefs: readonly CanonicalEvidenceId[];
  readonly issuer: CanonicalIssuer;
  readonly createdAt: CanonicalTimestamp;
}
