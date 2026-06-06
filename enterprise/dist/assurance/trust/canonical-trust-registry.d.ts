import type { AdapterLookupContext, RegistryLookup, TrustRegistryProvider } from '@aoc/protocol/adapters';
import type { CanonicalRegistryEntry, CanonicalRegistryEntryRef, CanonicalRegistryLookupRequest, CanonicalRegistryLookupResult, CanonicalRegistryRef } from '@aoc/protocol/claims';
export declare class InMemoryCanonicalTrustRegistry implements RegistryLookup, TrustRegistryProvider {
    private readonly registries;
    private readonly entries;
    registerRegistry(registry: CanonicalRegistryRef): void;
    registerEntry(entry: CanonicalRegistryEntry): void;
    getRegistry(registryRef: CanonicalRegistryRef, _context?: AdapterLookupContext): CanonicalRegistryRef | undefined;
    getRegistryEntry(entryRef: CanonicalRegistryEntryRef, _context?: AdapterLookupContext): CanonicalRegistryEntry | undefined;
    lookupRegistry(request: CanonicalRegistryLookupRequest, context?: AdapterLookupContext): CanonicalRegistryLookupResult;
}
//# sourceMappingURL=canonical-trust-registry.d.ts.map