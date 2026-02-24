# AOC Protocol Commercial Readiness Audit (HRKey MVP, 30-Day Lens)

**Date:** 2026-02-24  
**Auditor posture:** Commercially ruthless. Shipping > elegance.

## Executive Verdict

**Can AOC support HRKey MVP production in 30 days?**

**Yes, but only as a tightly scoped single-tenant MVP with explicit compromises.**  
Core authorization primitives are implemented and test-backed, but production-critical gaps remain in auditability, persistence robustness, and chain anchoring.

---

## 1) Required MVP components: production-ready vs prototype vs missing

| Required capability | Status | Evidence | Commercial call |
|---|---|---|---|
| 1. Vault-like structured storage | **Prototype usable** | In-memory Vault with structured maps for packs/consents/capabilities/SDL mappings and access flow exists; Local FS storage adapter exists for blobs. | Works for MVP pilot traffic; not hardened ops-grade without persistent backing strategy and operational controls. |
| 2. Consent Object | **Production-ready for MVP** | Consent builder/validator module exists with extensive tests; vault persists and validates consent objects before use. | Ship as-is. |
| 3. Time-limited access control | **Production-ready for MVP** | Capability mint/verify enforces expires_at, not_before, replay checks, revocation checks, and scope/permission containment; vault requestAccess gates access via SEM. | Ship as-is, but monitor replay semantics (global nonce registry). |
| 4. Shareable verification capability | **Prototype usable** | Capability token is portable and can be passed to requestAccess through HRKey adapter; deterministic policy response returned. | Sufficient for MVP sharing inside trusted integration boundary; lacks signatures, so weaker external trust semantics. |
| 5. Basic audit trail | **Missing** | No audit log/event sink in vault interface or adapter; requestAccess returns decision but does not persist access records. | Must implement before production launch. |
| 6. Simple anchor / verification proof (single-chain) | **Missing** | No runtime chain adapter, no anchoring function, no on-chain proof emission in implementation modules. | Must implement minimal hash anchoring job before production launch. |

---

## 2) Production risks (top-down)

1. **No auditable event trail (P0 risk).** You cannot defend disputes or compliance questions without immutable access and denial logs.
2. **No anchoring/proof path (P0 risk for trust/commercial credibility).** You cannot prove timestamped existence of consent/capability states to third parties.
3. **State model is mostly in-memory at vault level (P1 risk).** Process restart risk unless HRKey wraps with durable lifecycle and restore logic.
4. **Replay/revocation registries are process-global in module memory (P1 risk).** Behavior across multi-instance deployments can drift or become inconsistent.
5. **No crypto signatures on consent/capability artifacts (P1 risk).** Internal hashing integrity exists, but external non-repudiation is weak.
6. **Cloud storage adapter not implemented (P2 risk).** R2 adapter is stubbed and throws; limits quick scale-out storage options.

---

## 3) Estimated days to MVP-level stability

### Assumptions
- One focused team, no scope creep.
- Keep current architecture; do not redesign protocol.
- MVP means "reliable, supportable production pilot," not "institutional-grade sovereignty stack."

### Delivery estimate

| Workstream | Scope | Est. days |
|---|---|---:|
| Basic audit trail | Append-only access/deny/revocation events with stable schema + tests + retention config | 4-6 |
| Simple single-chain anchor proof | Anchor consent/capability hash batches (daily/hourly) to one chain + verification endpoint/script | 5-8 |
| Persistence hardening | Durable storage for vault state (consent/capability/revocation/nonce) or deterministic restore pipeline | 4-6 |
| Runtime hardening | Idempotency, crash recovery checks, minimal observability/alerts, env/config guards | 3-5 |
| Integration soak + fail-path tests | End-to-end HRKey flows with negative-path regression pack | 3-4 |

**Total:** **19-29 engineering days**  
**Recommended plan for 30-day ship:** Freeze scope now and execute this exact backlog.

---

## 4) What to freeze immediately (distraction kill list)

Freeze these areas for this 30-day window unless they directly unblock the six MVP requirements:

1. `markets/` and market-maker economic expansion docs.
2. `protocol/governance/` and DAO/compliance process elaboration.
3. `protocol/wallet/` long-horizon architecture, multichain/privacy advanced patterns.
4. Any multichain or advanced token-economics work under `integration/hrkey/ECONOMICS.md` follow-ons.
5. New adapters beyond one chosen storage backend needed for launch.
6. Any feature that does not change one of: audit trail, anchor proof, persistence, reliability.

---

## 5) 30-day ship recommendation

### Go/No-Go call

- **Go** if leadership accepts a **narrow MVP contract**: single-chain anchor, basic append-only logs, one stable deployment topology.
- **No-Go** if leadership expects strong external verifiability/compliance claims without implementing audit + anchor.

### Ruthless priority order (must execute in order)

1. Implement basic audit trail.
2. Implement minimal single-chain anchoring + verification script.
3. Persist revocation + nonce + consent/capability state durably.
4. Run integration soak and chaos-lite restart tests.
5. Ship.

Anything else is vanity in this 30-day window.
