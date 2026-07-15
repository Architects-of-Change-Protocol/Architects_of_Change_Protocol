# 04 — Status Contract

## RevocationCheckPort

```ts
type RevocationCheckPort = (subject: { subjectId: string; subjectType: RevocableSubjectType }) => RevocationStatus;
```

Synchronous, because every revocation source in this repo today is an in-process registry. It
always returns a `RevocationStatus` — never `boolean`, never `null`, never throws (implementations
must catch their own I/O errors and return `unknown`; `createRegistryRevocationCheck` does this for
you around a `{ isRevoked(id): boolean }` source).

This is the single mandatory parameter every material evaluation function now requires:

- `evaluateCapabilityState(capability, { now?, checkRevocation })`
- `evaluateConsentState(consent, { now?, checkRevocation })`
- `evaluateEnforcement(request, checkRevocation)`
- `authorizeExecution(request, checkRevocation)`
- `mintCapability({ ..., checkConsentRevocation })`

Because `checkRevocation` is non-optional at the type level, forgetting to wire it is a **compile
error**, not a silent runtime default.

## Error codes

`REVOCATION_ERROR_CODES` (`protocol/revocation/revocation-types.ts`):

| Code | Category | Retryable | HTTP (documented, see below) |
|---|---|---|---|
| `REVOCATION_STATUS_UNAVAILABLE` | `not_checked` | No | 503 |
| `REVOCATION_LOOKUP_FAILED` | `lookup_error` | Yes | 503 |
| `REVOCATION_LOOKUP_TIMEOUT` | `timeout` | Yes | 503 |
| `REVOCATION_PERMISSION_DENIED` | `permission_denied` | No | 403 |
| `REVOCATION_RECORD_MALFORMED` | `malformed_record` | No | 503 |
| `REVOCATION_AUTHORITY_MISMATCH` | `authority_mismatch` | No | 403 |
| `REVOCATION_TRUST_DOMAIN_MISMATCH` | `trust_domain_mismatch` | No | 403 |
| `REVOCATION_SUBJECT_MISMATCH` | `subject_mismatch` | No | 403 |
| `REVOCATION_UNSUPPORTED_VERSION` | `unsupported_version` | No | 503 |

Plus domain-level reason codes surfaced by the protocol layer:
`ENFORCEMENT_REASON_CODES.CAPABILITY_REVOKED`, `.CAPABILITY_REVOCATION_UNKNOWN` (new — added this
sprint to distinguish "confirmed revoked" from "couldn't verify"), and
`capabilityAccessReasonCodes.MARKET_MAKER_TRUST_UNVERIFIABLE` (new).

## HTTP mapping

`mapRevocationStatusToHttpStatus` (`protocol/revocation/revocation-policy.ts`) documents the
mapping from the sprint's §36 table. **No HTTP transport layer exists in this repo today** —
`runtime/api/routes.ts` returns a transport-agnostic `ApiResponse<T> = { success, data?, error? }`
with no numeric status code. This function is forward-looking infrastructure for whenever a real
HTTP layer is added; it is fully implemented and unit-tested
(`protocol/revocation/__tests__/revocationPolicy.test.ts`) so adopting it later is a drop-in, not a
design exercise.

| Condition | HTTP (documented) |
|---|---:|
| `verified_not_revoked` | 200 |
| `revoked` | 403 |
| `unknown` — unavailable / lookup failed / timeout / malformed / unsupported version | 503 |
| `unknown` — authority / trust-domain / subject mismatch / permission denied | 403 |

Anti-enumeration note: this repo has no multi-tenant subject store to leak existence information
about, so the "403 vs 404" cross-tenant question from the sprint brief does not yet have a real
target to apply to.
