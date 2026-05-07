# Durable Audit Plane (AOC Core)

This module defines protocol-grade **audit infrastructure** for governance decisions. Audit is not operator logging: it is canonical evidence for why governance allowed, denied, escalated, or revoked an action.

## Why this exists
- PDP, identity, relationships, delegation, and AI governance each emit decision signals.
- Without normalization, explainability and traceability are fragmented.
- The audit plane creates one canonical event model for future replay, compliance export, and cross-module reasoning.

## Logging vs. Audit
- Logging is implementation diagnostics.
- Audit is governance evidence with stable semantics (`decision`, `reasons`, `obligations`, trace references, and relationship/delegation links).

## System relationship
- PDP contributes policy traces and decisions.
- Identity-policy contributes denial reasons, delegation IDs, trust-chain references, and AI restrictions.
- Relationship lifecycle contributes state transitions.
- Delegation contributes grant create/revoke and validation outcomes.
- AI governance contributes blocked scopes + escalation obligations.

## Explainability goals
- Deterministically reconstruct why access was denied/allowed.
- Rebuild relationship and delegation timelines.
- Surface AI escalation and human-review obligations.

## Future compliance and forensic replay
This phase is intentionally in-memory only. Canonical schemas and correlations are the foundation for future durable storage, retention policy enforcement, and forensic replay pipelines without changing event semantics.
