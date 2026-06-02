import type { AuthorityStatus } from './claim-enums';
import type {
  CanonicalAuthorityId,
  CanonicalCapabilityId,
  CanonicalScope,
  CanonicalTimestamp,
} from './primitives';

export interface CanonicalAuthority {
  readonly id: CanonicalAuthorityId;
  readonly capabilityRefs: readonly CanonicalCapabilityId[];
  readonly scope: CanonicalScope;
  readonly status: AuthorityStatus;
  readonly issuedAt: CanonicalTimestamp;
}
