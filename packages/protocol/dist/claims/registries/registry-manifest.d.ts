import type { CanonicalId } from '../../contracts';
import type { CanonicalProofRef } from '../proofs';
import type { CanonicalIssuer, CanonicalMetadata, CanonicalTimestamp } from '../primitives';
import type { RegistryAuthorityLevel, RegistryEntryType } from './registry-enums';
import type { CanonicalRegistryRef } from './registry-reference';
/**
 * Portable declaration of registry capabilities. It is not runtime discovery.
 */
export interface CanonicalRegistryManifest {
    readonly id: CanonicalId;
    readonly registryRef: CanonicalRegistryRef;
    readonly name: string;
    readonly description?: string;
    readonly supportedEntryTypes: readonly RegistryEntryType[];
    readonly authorityLevel: RegistryAuthorityLevel;
    readonly maintainedBy: CanonicalIssuer;
    readonly issuedAt: CanonicalTimestamp;
    readonly proofRefs?: readonly CanonicalProofRef[];
    readonly metadata?: CanonicalMetadata;
}
//# sourceMappingURL=registry-manifest.d.ts.map