import type { VerificationStatus } from './claim-enums';
import type { CanonicalCredentialRef } from './credentials/credential-reference';
import type { CanonicalProofRef } from './proofs';
import type { CanonicalRegistryEntryRef } from './registries/registry-entry-reference';
import type { CanonicalSemanticRef } from './vocabulary/semantic-reference';
import type { CanonicalClaimId, CanonicalTimestamp, CanonicalVerificationId, CanonicalVerifier } from './primitives';
export interface CanonicalVerification {
    readonly id: CanonicalVerificationId;
    readonly claimRef: CanonicalClaimId;
    readonly status: VerificationStatus;
    readonly verifier: CanonicalVerifier;
    readonly verifiedAt: CanonicalTimestamp;
    readonly findings: readonly string[];
    readonly credentialRefs?: readonly CanonicalCredentialRef[];
    readonly proofRefs?: readonly CanonicalProofRef[];
    readonly registryRefs?: readonly CanonicalRegistryEntryRef[];
    readonly semanticRefs?: readonly CanonicalSemanticRef[];
    readonly confidence?: number;
}
//# sourceMappingURL=verification.d.ts.map