---
"@aoc/protocol": minor
"@aoc/audit-sdk": patch
---

Stabilize the public shapes of `ScopedAccessRequest` and `AuditEventEnvelope` after their first
real cross-repo consumption by AOC Enterprise (see PR #74 in `AOC-Enterprise`, which validated
against the real tarball from PR #314 and documented three contract gaps).

- **`ScopedAccessRequest`**: no shape change. Confirmed via git history that `requestedScope` is and
  has always been the sole canonical scope field — there is no `scope`/`action` predecessor to keep
  compatible. Added a facade parity assertion (`tests/contracts/symbol-parity.test.ts`) and
  declaration-level shape tests (`tests/contracts/audit-envelope-and-scoped-access-shape.test.ts`)
  that were previously missing.
- **`AuditEventEnvelope`**: additive, backwards-compatible new optional fields — `occurredAt`,
  `subject: ResourceRef`, `correlationId: CanonicalId`, `reasonCodes: readonly string[]`, and
  `schemaVersion: string`. Existing required fields (`eventId`, `eventType`, `emittedAt`, `payload`)
  and the optional `actorId` are unchanged. These fields give downstream consumers with richer,
  product-specific audit event shapes (e.g. Enterprise's `event_id`/`occurred_at`/`subject_id`/
  `requester_id`/`request_id`/`reason`) a canonical, portable target to map onto without inventing
  incompatible shapes locally.
- **`@aoc/audit-sdk`**: fixed `auditEventSchemaExample`, a pre-existing, unreferenced constant whose
  `required` field list (`schemaVersion`, `actor`, `action`, `resource`, `timestamp`,
  `tenantIsolation`) never matched the real `AuditEventEnvelope` shape since it was introduced. It now
  reflects the real required fields.
- **`AocIdentityClaims`** (imported by AOC Enterprise but never exported by Protocol) is explicitly
  documented as an Enterprise-owned concept, not added to Protocol — see
  `docs/protocol/PUBLIC_API.md` "Governance decisions" for the full rationale. No Protocol code
  change follows from this; Enterprise's migration off the import is separate, Enterprise-side work.

No exports were removed or renamed. No breaking changes. Not published.
