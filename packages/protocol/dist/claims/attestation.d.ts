import type { AttestationType } from './claim-enums';
import type { CanonicalAttestationId, CanonicalAttester, CanonicalClaimId, CanonicalMetadata, CanonicalTimestamp } from './primitives';
export interface CanonicalAttestation {
    readonly id: CanonicalAttestationId;
    readonly type: AttestationType;
    readonly attester: CanonicalAttester;
    readonly claimRef: CanonicalClaimId;
    readonly statement: string;
    readonly issuedAt: CanonicalTimestamp;
    readonly metadata?: CanonicalMetadata;
}
//# sourceMappingURL=attestation.d.ts.map