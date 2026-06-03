import type { CanonicalMetadata } from '../primitives';
import type { RegistryEntryStatus, RegistryEntryType } from './registry-enums';
import type { CanonicalRegistryEntryId, CanonicalRegistryLocator } from './registry-identifiers';
import type { CanonicalRegistryRef } from './registry-reference';
/**
 * Identifies an entry inside a registry without embedding the referenced object.
 */
export interface CanonicalRegistryEntryRef {
    readonly id: CanonicalRegistryEntryId;
    readonly registryRef: CanonicalRegistryRef;
    readonly entryType: RegistryEntryType;
    readonly locator: CanonicalRegistryLocator;
    readonly status?: RegistryEntryStatus;
    readonly metadata?: CanonicalMetadata;
}
//# sourceMappingURL=registry-entry-reference.d.ts.map