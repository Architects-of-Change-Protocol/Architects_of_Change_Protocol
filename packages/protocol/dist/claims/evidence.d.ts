import type { EvidenceType } from './claim-enums';
import type { CanonicalCredentialRef } from './credentials/credential-reference';
import type { CanonicalProofRef } from './proofs';
import type { CanonicalRegistryEntryRef } from './registries/registry-entry-reference';
import type { CanonicalSemanticRef } from './vocabulary/semantic-reference';
import type { CanonicalEvidenceId, CanonicalIssuer, CanonicalMetadata, CanonicalSource, CanonicalSubject, CanonicalTimestamp } from './primitives';
export interface CanonicalEvidence {
    readonly id: CanonicalEvidenceId;
    readonly type: EvidenceType;
    readonly subject: CanonicalSubject;
    readonly issuer: CanonicalIssuer;
    readonly source: CanonicalSource;
    readonly description: string;
    readonly createdAt: CanonicalTimestamp;
    readonly credentialRefs?: readonly CanonicalCredentialRef[];
    readonly proofRefs?: readonly CanonicalProofRef[];
    readonly registryRefs?: readonly CanonicalRegistryEntryRef[];
    readonly semanticRefs?: readonly CanonicalSemanticRef[];
    readonly metadata?: CanonicalMetadata;
}
//# sourceMappingURL=evidence.d.ts.map