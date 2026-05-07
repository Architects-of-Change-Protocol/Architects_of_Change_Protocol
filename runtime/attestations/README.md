# Governance Attestation Layer (AOC Core)

This module defines **canonical governance attestations** for AOC Core runtimes.

## Why attestations exist

Operational logs are useful for debugging, but governance evidence requires stronger semantics:
- stable identifiers
- explicit linkage to policy traces and sessions
- integrity proof references
- chain continuity across decisions/events

Attestations are structured evidence envelopes that can later be verified by stronger trust systems.

## Logs vs attestations

- **Logs**: append-only runtime narratives; often implementation-specific.
- **Attestations**: canonical governance facts with typed fields, integrity references, and chain semantics.

Logs can contain attestations, but attestations are intentionally compact and deterministic so they can be replayed and reconstructed.

## Integrity proof philosophy

Current proofs are local and lightweight (`sha256` over payload serialization).
They provide:
- tamper-evidence baseline
- deterministic hash identity for payload snapshots
- parent-proof linkage for chained proofs

They do **not** yet provide decentralized trust or signer identity assurances.

## Attestation chaining philosophy

Attestations can reference `previousAttestationRef` and be aggregated by chain ID.
This supports:
- replay continuity checks
- timestamp monotonicity validation
- governance reconstruction and forensic ordering

## Replay-safe governance evidence

Replay-safety currently relies on:
- proof parent linkage
- attestation previous linkage
- timestamp regressions detection

This is a foundation for stronger anti-replay guarantees in later phases.

## AI attestation reasoning

AI attestations capture:
- allowed scopes
- executed actions
- autonomous use counts
- human-review and escalation references

Validation can enforce policy-like constraints without coupling to any single AI provider or network service.

## Remote governance verification goals

Remote governance attestations record:
- source/target runtime pairing
- federation reference
- remote decision linkage
- remote audit references

Validation guards federation compatibility and trust-boundary pairing.

## Current limitations

- local-only storage (in-memory maps)
- no PKI signatures or hardware roots
- no distributed consensus
- no network trust synchronization
- no persistent anti-replay nonce store
- hash covers `JSON.stringify` serialization (ordering caveats for non-canonical objects)

These semantics are intentionally lightweight foundations for future cryptographic hardening.
