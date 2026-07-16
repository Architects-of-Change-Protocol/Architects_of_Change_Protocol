# Reference Consumer Evidence: AOC Enterprise

AOC Enterprise is `@aoc/protocol`'s **real reference consumer, validated against the pinned
tarball**. This document records that evidence precisely. It does **not** claim a production
deployment — no deployment evidence exists in either repository, and none is asserted; what is
evidenced is merged, CI-enforced consumption of the real packaged artifact.

All Enterprise-side facts below are read from the merged state of
`Architects-of-Change-Protocol/AOC-Enterprise` (read-only; Enterprise was not modified by any
Protocol sprint).

## Identity of what was validated

| Field | Value |
| --- | --- |
| Enterprise merged commit | `454d7cc5623ecf431c0386de055f3eb3458746f7` (merge of Enterprise PR #75, branch `claude/aoc-enterprise-protocol-adoption-n21c78`) |
| Protocol source commit pinned by Enterprise | `ab2ac6ef573c871a029a67b13d33ba9738cb5939` ("feat(protocol): stabilize AuditEventEnvelope and ScopedAccessRequest public shapes", PR #315) |
| Package | `@aoc/protocol` |
| Package version | `0.1.0` (`"private": true` — not published to any registry) |
| Dependency declaration | `"@aoc/protocol": "file:./vendor/aoc-protocol-0.1.0.tgz"`, peer range `>=0.1.0` |
| Tarball SHA-256 | `4e5289b74bc30bcbd63afe87cd00d5417aa6bc665fe50d7c9c1b845bf1896b27` (35,526 bytes) |
| Chain of custody | Fresh `npm pack` runs from this repository were byte-identical to Enterprise's vendored artifact through 2026-07-15 (Protocol commits `ab2ac6ef`…`2ae1979`); Enterprise's evidence additionally records three independent rebuilds from the pinned commit with identical SHA-256. **As of PR #319 (Apache-2.0 relicense, 2026-07-16), a fresh pack differs in exactly one file (`package.json`, the appended license field) and hashes `d4a8b67d…c7704`** — see the identity note in [`RELEASE_CANDIDATE_READINESS.md`](RELEASE_CANDIDATE_READINESS.md). Enterprise's pinned `4e5289b7…` artifact remains exactly what Enterprise validated; its lock will need revalidation against a post-relicense build at the next version cut |
| Compatibility record | Enterprise `protocol-consumer.lock.json`: pinned repo+commit+version+checksum, all six public exports listed as verified, `knownGaps: []` |

## Validation battery (Enterprise-side, against the real vendored tarball)

Recorded in Enterprise's `docs/release/PROTOCOL_CONSUMPTION_EVIDENCE.md` and enforced by its CI:

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run lint` | PASS |
| `npm run test` | PASS |
| `check:protocol-consumption` | PASS |
| `check:aoc-boundaries` | PASS |
| `validate:publishability` | PASS |
| `check:release-integrity` | PASS |
| Forbidden import scan (deep/source imports) | PASS |
| Declaration path leak scan | PASS |

Module resolution was proven against the **real package, not a shim**: `tsc --traceResolution`
resolves every `@aoc/protocol` import to
`node_modules/@aoc/protocol/dist/contracts/index.d.ts` (Package ID `…@0.1.0`), with zero
occurrences of any `types/aoc-protocol` path.

## CI blocking

Enterprise's `.github/workflows/publishability.yml` `protocol-tarball-consumption` job is
**blocking** (`continue-on-error` removed) on every PR and push. It rebuilds a reproducible
tarball from the pinned Protocol commit, verifies commit/version/checksum against
`protocol-consumer.lock.json`, installs it into an isolated copy, and runs the full battery above.
Enterprise CI runs Node 22.

## Shim removal

- The former ambient shim `types/aoc-protocol/index.d.ts` and its `tsconfig.base.json` `paths`
  entry are **deleted** (verified: no `types/aoc-protocol` directory exists at the merged commit).
- A second, narrower fixture-local shim was also deleted; that fixture now type-checks against the
  real installed package.
- Negative tests enforce this permanently: Enterprise fails CI if an ambient
  `declare module '@aoc/protocol'` reappears, if `AocIdentityClaims` is imported by name from
  `@aoc/protocol`, or if the audit mapper regresses to spreads/structural casts.

## Contract gaps: raised, resolved, none open

The three contract-shape gaps Enterprise documented during adoption (`AocIdentityClaims` never
exported; `ScopedAccessRequest` `.scope`/`.action` vs. real `requestedScope`; `AuditEventEnvelope`
field-naming divergence) are all **resolved consumer-side** — `VerifiedActorClaims`,
`EnterpriseScopedAccessRequest`, and the `toProtocolAuditEventEnvelope()` mapper respectively —
with `knownGaps: []` in the lock. Details and the Protocol-side governance decisions are in
[`../protocol/PUBLIC_API.md`](../protocol/PUBLIC_API.md) and
[`MIGRATION_GUIDE_0.2.md`](MIGRATION_GUIDE_0.2.md).

Remaining Enterprise-side follow-ups (e.g. its crypto `capability-verifier`/`delegation-verifier`
modules import `CapabilityToken` from `@aoc/protocol` but internally widen it to an untyped record)
are consumer-side hardening items, tracked in Enterprise — **not Protocol contract defects** (see
[`KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md)).
