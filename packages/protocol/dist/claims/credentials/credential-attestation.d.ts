import type { CanonicalId } from '../../contracts';
import type { CanonicalAttester, CanonicalMetadata, CanonicalTimestamp } from '../primitives';
import type { CanonicalProofRef } from '../proofs/proof-reference';
import type { CanonicalRegistryEntryRef } from '../registries/registry-entry-reference';
import type { CanonicalCredentialRef } from './credential-reference';
/**
 * Attests to a credential descriptor without evaluating that attestation.
 */
export interface CanonicalCredentialAttestation {
    readonly id: CanonicalId;
    readonly credentialRef: CanonicalCredentialRef;
    readonly attester: CanonicalAttester;
    readonly statement: string;
    readonly issuedAt: CanonicalTimestamp;
    readonly proofRefs?: readonly CanonicalProofRef[];
    readonly registryRefs?: readonly CanonicalRegistryEntryRef[];
    readonly metadata?: CanonicalMetadata;
}
//# sourceMappingURL=credential-attestation.d.ts.map