import type { CanonicalId } from '../../contracts';
import type { ClaimType } from '../claim-enums';
import type { CanonicalMetadata, CanonicalTimestamp } from '../primitives';
import type { CanonicalProofRef } from '../proofs/proof-reference';
import type { CanonicalRegistryEntryRef } from '../registries/registry-entry-reference';
import type { CanonicalCredentialIssuer } from './credential-issuer';
import type { CanonicalCredentialRef } from './credential-reference';
/**
 * Portable declaration of what a credential represents without issuing it or
 * discovering runtime services.
 */
export interface CanonicalCredentialManifest {
    readonly id: CanonicalId;
    readonly credentialRef: CanonicalCredentialRef;
    readonly name: string;
    readonly description?: string;
    readonly supportedClaimTypes?: readonly ClaimType[];
    readonly issuer: CanonicalCredentialIssuer;
    readonly issuedAt: CanonicalTimestamp;
    readonly proofRefs?: readonly CanonicalProofRef[];
    readonly registryRefs?: readonly CanonicalRegistryEntryRef[];
    readonly metadata?: CanonicalMetadata;
}
//# sourceMappingURL=credential-manifest.d.ts.map