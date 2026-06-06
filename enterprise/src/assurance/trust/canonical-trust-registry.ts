import type { AdapterLookupContext, RegistryLookup, TrustRegistryProvider } from '@aoc/protocol/adapters';
import type {
  CanonicalRegistryEntry,
  CanonicalRegistryEntryRef,
  CanonicalRegistryLookupRequest,
  CanonicalRegistryLookupResult,
  CanonicalRegistryRef,
} from '@aoc/protocol/claims';

const entryKey = (entry: CanonicalRegistryEntryRef | CanonicalRegistryEntry): string =>
  `${entry.registryRef.id}:${entry.id}`;

export class InMemoryCanonicalTrustRegistry implements RegistryLookup, TrustRegistryProvider {
  private readonly registries = new Map<string, CanonicalRegistryRef>();
  private readonly entries = new Map<string, CanonicalRegistryEntry>();

  registerRegistry(registry: CanonicalRegistryRef): void {
    this.registries.set(registry.id, registry);
  }

  registerEntry(entry: CanonicalRegistryEntry): void {
    this.registerRegistry(entry.registryRef);
    this.entries.set(entryKey(entry), entry);
  }

  getRegistry(registryRef: CanonicalRegistryRef, _context?: AdapterLookupContext): CanonicalRegistryRef | undefined {
    return this.registries.get(registryRef.id);
  }

  getRegistryEntry(entryRef: CanonicalRegistryEntryRef, _context?: AdapterLookupContext): CanonicalRegistryEntry | undefined {
    return this.entries.get(entryKey(entryRef));
  }

  lookupRegistry(request: CanonicalRegistryLookupRequest, context?: AdapterLookupContext): CanonicalRegistryLookupResult {
    const entries = [...this.entries.values()].filter((entry) => {
      if (entry.registryRef.id !== request.registryRef.id) return false;
      if (request.entryType !== undefined && entry.entryType !== request.entryType) return false;
      if (request.locator !== undefined && entry.locator !== request.locator) return false;
      if (request.subject !== undefined && JSON.stringify(entry.subject) !== JSON.stringify(request.subject)) return false;
      return true;
    });
    return {
      status: entries.length === 0 ? 'NotFound' : 'Found',
      registryRef: request.registryRef,
      entries,
      observedAt: context?.requestedAt ?? new Date().toISOString(),
    };
  }
}
