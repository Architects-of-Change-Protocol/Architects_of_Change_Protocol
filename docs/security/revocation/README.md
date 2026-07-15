# Revocation Safety — AOC-REVOCATION-00

Canonical documentation for the revocation fail-closed sprint. Implements ADR
[`docs/architecture/adr-agent-identity-passport-trust.md`](../../architecture/adr-agent-identity-passport-trust.md)
§12 ("Revocation is canonical and fail-closed") and §13 ("Security operations cannot be blocked by
billing").

| Doc | Contents |
|---|---|
| [`01-current-state.md`](01-current-state.md) | Inventory of every revocation implementation found in the repo before this sprint |
| [`02-threat-model.md`](02-threat-model.md) | Threats this sprint addresses and residual risk |
| [`03-revocation-semantics.md`](03-revocation-semantics.md) | Canonical `RevocationStatus` model and subject types |
| [`04-status-contract.md`](04-status-contract.md) | `RevocationCheckPort`, error codes, HTTP mapping |
| [`05-fail-closed-policy.md`](05-fail-closed-policy.md) | The allow/block table and where it's enforced |
| [`06-cascade-design.md`](06-cascade-design.md) | Atomicity design and its documented limitation |
| [`07-idempotency.md`](07-idempotency.md) | Idempotency-key semantics for `revokeGrant` |
| [`08-billing-safety-override.md`](08-billing-safety-override.md) | Evidence containment ops aren't billing-gated |
| [`09-observability.md`](09-observability.md) | Telemetry events and what's redacted |
| [`10-test-evidence.md`](10-test-evidence.md) | Real commands and real results, including the DB-backed-test limitation |
| [`11-migration-and-compatibility.md`](11-migration-and-compatibility.md) | Breaking changes and who was migrated |
| [`12-rollback.md`](12-rollback.md) | Rollback procedure — never restores fail-open |
| [`13-final-verdict.md`](13-final-verdict.md) | Executive verdict and next-sprint recommendation (superseded in part by `14`) |
| [`14-independent-review.md`](14-independent-review.md) | Independent adversarial review of commit `cc0ca97`: empirical vulnerability reproduction, caller audit, mutation testing, corrective commits, and the READY WITH CONDITIONS verdict |
| [`15-final-hardening.md`](15-final-hardening.md) | Final hardening iteration: classifies the legacy HMAC capability surface with evidence (dead/legacy/unreachable/live/almost-live), contains it (demoted to `runtime/internal.ts`, gated, documented) rather than building revocation for it, closes the specific typecheck-coverage gap mutation testing found, and re-confirms the verdict — **the current, most up-to-date readiness verdict** |
