"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCanonicalTrustRegistry = void 0;
const entryKey = (entry) => `${entry.registryRef.id}:${entry.id}`;
class InMemoryCanonicalTrustRegistry {
    constructor() {
        this.registries = new Map();
        this.entries = new Map();
    }
    registerRegistry(registry) {
        this.registries.set(registry.id, registry);
    }
    registerEntry(entry) {
        this.registerRegistry(entry.registryRef);
        this.entries.set(entryKey(entry), entry);
    }
    getRegistry(registryRef, _context) {
        return this.registries.get(registryRef.id);
    }
    getRegistryEntry(entryRef, _context) {
        return this.entries.get(entryKey(entryRef));
    }
    lookupRegistry(request, context) {
        const entries = [...this.entries.values()].filter((entry) => {
            if (entry.registryRef.id !== request.registryRef.id)
                return false;
            if (request.entryType !== undefined && entry.entryType !== request.entryType)
                return false;
            if (request.locator !== undefined && entry.locator !== request.locator)
                return false;
            if (request.subject !== undefined && JSON.stringify(entry.subject) !== JSON.stringify(request.subject))
                return false;
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
exports.InMemoryCanonicalTrustRegistry = InMemoryCanonicalTrustRegistry;
