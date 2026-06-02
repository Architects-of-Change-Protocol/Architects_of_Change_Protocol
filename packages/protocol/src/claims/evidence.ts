import type { EvidenceType } from './claim-enums';
import type {
  CanonicalEvidenceId,
  CanonicalIssuer,
  CanonicalMetadata,
  CanonicalSource,
  CanonicalSubject,
  CanonicalTimestamp,
} from './primitives';

export interface CanonicalEvidence {
  readonly id: CanonicalEvidenceId;
  readonly type: EvidenceType;
  readonly subject: CanonicalSubject;
  readonly issuer: CanonicalIssuer;
  readonly source: CanonicalSource;
  readonly description: string;
  readonly createdAt: CanonicalTimestamp;
  readonly metadata?: CanonicalMetadata;
}
