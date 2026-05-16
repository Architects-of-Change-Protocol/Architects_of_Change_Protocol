# Compatibility Matrix

## SDK ↔ Runtime transport

| SDK transport major | Runtime transport major | Result |
|---|---|---|
| equal | equal and runtime minor <= sdk minor | Compatible |
| equal | equal and runtime minor > sdk minor | Warning (forward skew) |
| different | any | Incompatible |

## Runtime ↔ Transport envelope
Runtime envelope metadata is valid only when emitted from canonical `buildMetadata` and aligned to `runtime/versioning.ts` constants.

## SDK ↔ Contracts
SDK compatibility is guaranteed for matching `SDK_COMPATIBILITY_VERSION` major with runtime-published handshake compatibility metadata.

## Experimental ↔ Stable
Experimental APIs have no compatibility guarantee; no stable consumer may depend on experimental semantics without explicit opt-in.
