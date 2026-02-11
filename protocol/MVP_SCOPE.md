# AOC Protocol — MVP Scope (Sovereign Enforcement)

## MVP Goal
The MVP goal is to make sovereign enforcement **impossible to bypass**: market makers, adapters, and integrators MUST NOT obtain, expand, or retain access outside user-authorized scope, even if they are the primary commercial path.

## MVP-Blocking Invariants
The following invariants are release blockers for MVP. If any is not enforced end-to-end, MVP is not complete.

| Blocker Invariant | Why it blocks MVP | Enforcement point(s) |
|---|---|---|
| Protocol `INV-AUTH-01` (no access without valid authorization) | Prevents adapter/market-maker bypass reads. | Vault authorization boundary; resolver pre-check before field/blob return. |
| Protocol `INV-AUTH-02` + Capability `INV-DER-05` (scope containment) | Prevents minted token scope expansion beyond consent. | Capability token minting pipeline; token validator at redemption. |
| Protocol `INV-AUTH-03` + Capability `INV-DER-06` (permission containment) | Prevents permission escalation (e.g., read->write/admin). | Capability token minting pipeline; policy engine on every request. |
| Protocol `INV-AUTH-04` (revocation effective immediately) | Ensures post-revocation access cannot continue via cached/old token paths. | Revocation check on every access attempt at resolver and vault boundary. |
| Protocol `INV-AUTH-10` + `INV-AUTH-11` (replay and time-bounds) | Prevents replay of captured tokens/requests and use outside validity window. | Request verifier at ingress; token redemption endpoint; resolver pre-check. |
| Protocol `INV-INT-10` + `INV-INT-11` and Storage Pointer `INV-INT-01` (retrieved bytes hash-verify) | Prevents substituted/tampered payload delivery by storage adapters. | Storage retrieval path before resolver materializes bytes; pack/content verification path. |
| Protocol `INV-SEC-01` (private keys never leave wallet unencrypted) | Prevents adapter/market-maker custody or key exfiltration bypass. | Vault boundary, signer interface, adapter bridge/API surface. |
| Protocol `INV-SEC-02` (adapter never sees plaintext protected data where declared) | Enforces architectural data-minimization boundary. | Resolver output filter; adapter integration boundary; logging pipeline. |
| Protocol `INV-OBS-02` (deny decisions are explainable with stable codes) | Ensures bypass attempts are diagnosable/auditable and fail closed consistently. | Decision object emission at every deny path (auth, integrity, revocation, replay). |

## Required Enforcement Points (MVP)
Implementations MUST enforce blocker invariants at the following concrete boundaries:

1. **Vault boundary**: before any protected field/blob leaves wallet-controlled trust boundary (`INV-AUTH-01`, `INV-AUTH-04`, `INV-SEC-01`).
2. **Resolver / policy engine**: before resolving scoped objects and before returning assembled responses (`INV-AUTH-01/02/03/10/11`, `INV-SEC-02`).
3. **Storage retrieval**: immediately after byte fetch and before consumption (`INV-INT-10/11`, Storage Pointer `INV-INT-01`).
4. **Token minting**: at derivation time from consent (`INV-AUTH-02/03`, Capability `INV-DER-05/06`).
5. **Token redemption / ingress verification**: on every signed request/token use (`INV-AUTH-10/11`, `INV-AUTH-04`).
6. **Decision/error emission**: on every deny/fail-closed path (`INV-OBS-02`).

## Definition of Done (Per Invariant)
Each blocker invariant is done only when all criteria below are met.

| Invariant | DoD evidence (MUST) | Required negative-path test (MUST fail closed) |
|---|---|---|
| `INV-AUTH-01` | Automated integration test proves protected data is returned only with valid consent+capability. | Access request with missing/invalid capability returns deny decision and no data. |
| `INV-AUTH-02` + `INV-DER-05` | Minting logic enforces token.scope ⊆ consent.scope; audited in tests. | Attempt to mint capability with extra scope entry is rejected. |
| `INV-AUTH-03` + `INV-DER-06` | Minting + runtime policy enforce token.permissions ⊆ consent.permissions. | Attempted permission escalation at mint or request time is rejected. |
| `INV-AUTH-04` | Revocation status is checked at request time (not only at issue time). | Redeem previously valid token after revocation; request is denied immediately. |
| `INV-AUTH-10` + `INV-AUTH-11` | Nonce/request-id uniqueness and time-window checks are active in verifier. | Replay same signed request or use expired/not-before token; request is denied. |
| `INV-INT-10/11` + Storage Pointer `INV-INT-01` | Retrieval path recomputes hashes and blocks mismatch before resolver output. | Serve bytes whose SHA-256 does not match declared hash; retrieval is rejected. |
| `INV-SEC-01` | Static and runtime checks demonstrate signer APIs never export raw private key material. | Adapter call attempting key export/sign-with-exposed-key path is rejected. |
| `INV-SEC-02` | Dataflow tests confirm adapter-facing interfaces expose only allowed ciphertext/metadata in protected flows. | Adapter integration test attempts plaintext retrieval and receives denial/sanitized output. |
| `INV-OBS-02` | Deny responses include stable code + machine-readable reason in Decision/Error Objects. | Trigger each deny class above and assert stable error code family is present. |

## Explicit Non-Goals (Not in MVP)
- New cryptographic primitives, new object schemas, or changes to core AOC primitives.
- Economic optimization features (pricing strategy, fee experiments, revenue analytics).
- Advanced trust-scoring/ML risk models beyond deterministic checks already specified.
- Cross-jurisdiction legal policy automation beyond existing governance/compliance requirements.
- Performance tuning not required to preserve the blocker invariants above.
