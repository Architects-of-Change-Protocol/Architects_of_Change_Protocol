import type { CanonicalMetadata, CanonicalSubject, CanonicalTimestamp } from '../primitives';
import type { RegistryEntryType, RegistryLookupStatus } from './registry-enums';
import type { CanonicalRegistryLocator } from './registry-identifiers';
import type { CanonicalRegistryEntry } from './registry-entry';
import type { CanonicalRegistryRef } from './registry-reference';
/**
 * Portable request descriptor for registry lookup intent. It does not implement lookup.
 */
export interface CanonicalRegistryLookupRequest {
    readonly registryRef: CanonicalRegistryRef;
    readonly entryType?: RegistryEntryType;
    readonly subject?: CanonicalSubject;
    readonly locator?: CanonicalRegistryLocator;
    readonly metadata?: CanonicalMetadata;
}
/**
 * Result contract for observed registry lookup output. It is not a registry client.
 */
export interface CanonicalRegistryLookupResult {
    readonly status: RegistryLookupStatus;
    readonly registryRef: CanonicalRegistryRef;
    readonly entries: readonly CanonicalRegistryEntry[];
    readonly observedAt: CanonicalTimestamp;
    readonly metadata?: CanonicalMetadata;
}
//# sourceMappingURL=registry-lookup.d.ts.map