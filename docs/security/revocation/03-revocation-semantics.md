# 03 — Canonical Revocation Status Model

Defined in `protocol/revocation/revocation-types.ts`.

```ts
type RevocationStatus =
  | { status: 'verified_not_revoked'; subjectId; subjectType; checkedAt; sourceVersion }
  | { status: 'revoked'; subjectId; subjectType; revocationId; reasonCode; revokedAt; checkedAt }
  | { status: 'unknown'; subjectId?; subjectType?; checkedAt; errorCode; category; retryable };
```

There is no fourth state for "not checked" — omission collapses into `unknown`. This is the
concrete implementation of the sprint's central rule:

> A failure to prove that a subject is not revoked must never be interpreted as proof that it is
> valid.

## Revocable subject types

`RevocableSubjectType` (`protocol/revocation/revocation-types.ts`):

| Subject type | Canonical owner in this repo today | Revocation effect | Cascade target | Reversible |
|---|---|---|---|---|
| `capability_grant` | `capability/revocation.ts` (hash registry), wrapped by `protocol/revocation` | Redemption/enforcement/execution denied | None modeled — capability tokens don't reference a passport/identity chain in this codebase | No |
| `consent_grant` | `protocol/consent` (in-process; no registry backs it yet) | Minting new capabilities from the consent blocked; `evaluateConsentState` returns `revoked` | Capabilities already minted from it are **not** retroactively invalidated — see `06-cascade-design.md` limitation | No |
| `agent_identity`, `agent_passport`, `public_key`, `credential`, `delegation`, `execution_grant`, `service_identity`, `issuer_authority`, `trust_domain_membership` | Not implemented — no real store exists for these subjects in this codebase | N/A | N/A | N/A |

The type is intentionally a superset of what's implemented today (per ADR §1's ownership list) so
that adding a real store for one of these subjects is additive — it plugs a new
`RevocationCheckPort` implementation into the existing contract rather than inventing a new one.

## State semantics — not synonyms

- **Revoked**: permanent/long-duration security invalidation. Modeled as `RevokedStatus`.
- **Suspended / Expired / Superseded / Compromised**: not separately modeled as `RevocationStatus`
  variants in this sprint, because no subject type in this codebase currently distinguishes them
  from plain expiry (`ProtocolConsent.expires_at`, `ProtocolCapability.expires_at`) or plain
  revocation. Introducing them without a real backing store would be speculative. Recommended as
  next-sprint work once a persistent subject store exists (see `13-final-verdict.md`).
- **Unknown**: the state can't be verified — timeout, lookup failure, permission denied, malformed
  record, authority/trust-domain/subject mismatch, unsupported version, or simply "no check was
  ever wired". All nine `RevocationFailureCategory` values collapse to the same blocking decision.
