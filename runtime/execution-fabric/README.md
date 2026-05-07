# Governance Execution Fabric (AOC Core)

The Governance Execution Fabric provides semantic execution coordination for AOC Core governance flows across runtimes and trust domains.

## Why this exists

AOC had governance decisioning and distributed governance primitives, but it lacked a resumable execution layer that could:
- pause and resume execution,
- preserve ownership via leases,
- route work through continuations,
- preserve obligation and attestation continuity,
- and capture failure/retry semantics.

## Why this is not a workflow engine

This module does **not** introduce orchestration infrastructure, transport, or external schedulers. It defines protocol/runtime semantics for governance execution state, dependencies, leases, continuation records, and attestation references. It is execution-governance state logic, not a generic BPMN/workflow replacement.

## Governance internet foundation

Execution fabric enables governance work to move between runtimes while maintaining:
- explicit execution ownership,
- trust-domain-aware continuation points,
- auditable state transitions,
- and obligation/attestation continuity.

This is a foundational layer for future distributed execution.

## Plan vs session

- **Governance Session**: policy/governance context and decision envelope.
- **Execution Plan**: concrete execution graph for actions, obligations, dependencies, leases, and continuation states.

## Leases and continuations

- **Execution leases**: time-bounded execution ownership claims.
- **Execution continuations**: resumable hand-off contracts between runtimes or between automation and human review.

## Distributed obligation coordination

Obligations are attached at step level and tracked through required/optional semantics. Required-step failure fails the plan; optional-step failure is tolerated.

## Human review continuation

Steps such as `request_human_review` and continuation type `remote_human_review` enable pause-and-resume around human approvals.

## Attestation continuity

No cryptography is implemented here. The fabric only handles attestation references, validation seams, and step-level attestation requirements.

## Current limitations

- No networking or transport.
- No consensus, distributed locks, or global clock guarantees.
- In-memory state only.
- No persistence/recovery guarantees.
- No automated backoff/scheduling logic.
