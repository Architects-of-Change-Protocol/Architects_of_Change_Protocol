import type { CanonicalProofRef } from '../proofs';
import type { CanonicalMetadata, CanonicalSubject, CanonicalTimestamp } from '../primitives';
import type { CanonicalSemanticRef } from '../vocabulary/semantic-reference';
import type { RegistryEntryStatus, RegistryEntryType } from './registry-enums';
import type { CanonicalRegistryEntryId, CanonicalRegistryLocator } from './registry-identifiers';
import type { CanonicalRegistryRef } from './registry-reference';
/**
 * Descriptor for a registry entry. This is not storage and not the canonical object itself.
 */
export interface CanonicalRegistryEntry {
    readonly id: CanonicalRegistryEntryId;
    readonly registryRef: CanonicalRegistryRef;
    readonly entryType: RegistryEntryType;
    readonly subject: CanonicalSubject;
    readonly locator: CanonicalRegistryLocator;
    readonly status: RegistryEntryStatus;
    readonly createdAt: CanonicalTimestamp;
    readonly updatedAt?: CanonicalTimestamp;
    readonly proofRefs?: readonly CanonicalProofRef[];
    readonly semanticRefs?: readonly CanonicalSemanticRef[];
    readonly metadata?: CanonicalMetadata;
}
//# sourceMappingURL=registry-entry.d.ts.map