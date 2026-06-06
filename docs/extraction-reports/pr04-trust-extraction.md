# PR-04 Trust Registry Extraction

## Extracted components

| Component | Enterprise path | Compatibility path |
|---|---|---|
| Federated signer registry and trust-chain evaluation | `enterprise/src/assurance/trust/federated-trust-registry.ts` | `packages/trust-registry-runtime/src/index.ts` |
| Hosted identity issuer, credential, and consent service | `enterprise/src/assurance/trust/identity-trust-service.ts` | `runtime/trust/service.ts` |
| Hosted trust data types | `enterprise/src/assurance/trust/types.ts` | `runtime/trust/types.ts` |
| Canonical in-memory registry provider | `enterprise/src/assurance/trust/canonical-trust-registry.ts` | New Enterprise API |

## Adapter seams

`InMemoryCanonicalTrustRegistry` implements both Protocol-owned seams:

- `RegistryLookup.lookupRegistry`; and
- `TrustRegistryProvider.getRegistry` / `getRegistryEntry`.

The implementation stores Protocol-owned registry references and entries without redefining their shapes. Lookup supports registry, entry type, locator, and subject filtering and returns the canonical lookup result.

## Preserved compatibility

- `TrustRegistryRuntime`, `TrustedSignerRecord`, and `FederatedTrustEvaluation` remain exported from `@aoc-runtime/trust-registry-runtime`.
- `InMemoryTrustService`, its input types, `DEFAULT_TRUST_ISSUERS`, and all trust record types remain available under `runtime/trust/*` and through existing runtime barrels.
- Existing hosted API/service imports require no rewrites.

## Synchronization scope

No separate registry synchronization implementation was present in the source inventory. PR-04 therefore extracted registry storage/lookups/providers and federated trust traversal; it did not invent network synchronization behavior.

## Risks

1. Federated trust evaluation remains coupled to existing shared runtime federation types until those types receive a separate ownership decision.
2. Canonical registry comparison uses exact registry IDs and structural subject comparison; external registry normalization belongs in a future provider, not Protocol.
3. Trust data remains in-memory, matching existing behavior. Durable persistence is deferred.
