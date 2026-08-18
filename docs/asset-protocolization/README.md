# Asset Protocolization Vertical (Workstream A)

A vertical built **on** AOC Protocol that turns an asset — a file, a recording, a physical
work, a plot of land — into a verifiable AOC record backed by declarations, evidence,
automated checks and, where the asset class requires it, a professional or notarial
attestation.

> **Asset Protocolization is a vertical built on AOC Protocol. It is not AOC Protocol
> itself, it is not AOC Enterprise, and it does not tokenize.**

## Layer map

```text
AOC PROTOCOL            subject identity, integrity, canonical signed record,
                        evidence/claim/attestation/verification/standing vocabulary,
                        registry & credential references, canonicalization,
                        capability invocation + evidence, portability, adapter ports
                        —— knows nothing about asset classes

ASSET PROTOCOLIZATION   profiles, intake, case + lifecycle, requirement definitions,
VERTICAL                declaration capture, verification pipeline, professional review,
                        attestation workflow, protocolization, fee assessment
                        —— knows what a house and a WAV file are; governs nothing

AOC ENTERPRISE          authority, policy, approvals, decisions, obligations,
                        grants, enforcement, revocation, usage evidence
                        —— governs actions; registers nothing legally

TOKENIZER               issuance, contracts, custody, marketplace, settlement
                        —— executes; decides nothing
```

## Documents

| Step | Document | Status |
|---|---|---|
| APV-00 | [`APV_00_RECONNAISSANCE.md`](./APV_00_RECONNAISSANCE.md) | `VERIFIED` |
| APV-01 | [`../architecture/adr-asset-protocolization-vertical-boundary.md`](../architecture/adr-asset-protocolization-vertical-boundary.md) | Accepted — frozen |
| APV-02 | [`APV_02_VERTICAL_PROTOCOL_CONTRACT.md`](./APV_02_VERTICAL_PROTOCOL_CONTRACT.md) | Frozen (specification; no code) |
| **GATE A0** | **Vertical boundary frozen** | **Awaiting sign-off** |
| APV-03…APV-20 | not started | blocked by GATE A0 |

The ADR lives under `docs/architecture/` to follow this repository's existing ADR naming
convention (`docs/architecture/adr-*.md`).

## Gate A0 — what must be signed off before any vertical code exists

```text
Protocol                 != Asset Protocolization      frozen  (ADR §1, §2)
Asset Protocolization    != Enterprise Governance      frozen  (ADR §1, §2)
Enterprise Governance    != Tokenizer                  frozen  (ADR §1, §2)
Vertical → substrate contract                          frozen  (APV-02 §2)
```

Six open decisions carried from APV-00 §8 (`U-1`…`U-6`); `U-5` is closed by ADR §3. The
remaining five need a human decision before APV-03 begins.

## Reading order for an implementer

1. `docs/architecture/sovereign-asset-core.md` — the frozen substrate and its invariants.
2. `docs/protocol/SOVEREIGNTY_CAPABILITIES.md` — the canonical eight and the invocation
   spine.
3. `APV_00_RECONNAISSANCE.md` §3 — the reuse map. **If you are about to define a type named
   `Evidence`, `Claim`, `Attestation`, `Verification` or `Proof`, stop and read it first.**
4. The ADR — what you may and may not own.
5. `APV_02_VERTICAL_PROTOCOL_CONTRACT.md` — what you must emit.
6. `docs/constitution/ARCHITECTURAL-LAWS.md` — which mistakes fail the build.

## Workstream B

Tokenization governance (`TOKENIZE` as an AOC Enterprise capability) begins only after
GATE A4. It is deliberately not started, and no tokenization concept appears anywhere in
this workstream.
