# AOC Runtime Governance Layer

This module introduces the canonical governance execution runtime for AOC Core.

## Why this runtime exists

PDP, identity policy, relationship state, and audit each existed as separate protocol primitives. This runtime coordinates them into deterministic execution semantics for real governance decisions.

## Policy evaluation vs governance orchestration

- **Policy evaluation (PDP / identity-policy):** computes decision context, reason codes, obligations, and governance flags.
- **Governance orchestration (this module):** turns those outputs into runtime state transitions, executable obligations, escalation paths, and human-review checkpoints.

## Obligation execution philosophy

Obligations are represented as first-class runtime objects (`pending` / `completed` / `failed`) and are tracked in-session. They are not externally executed by engines yet; the runtime only enforces deterministic obligation lifecycle and failure propagation.

## AI escalation semantics

AI governance flags can trigger:

- explicit escalation records
- runtime transition to `escalated`
- optional human review transition to `awaiting_human_review`

Escalations must be resolved before completion paths can continue.

## Human review semantics

Human review is modeled as protocol-level primitives (`create`, `approve`, `deny`) with strict state implications:

- pending review gates completion
- approval returns runtime to evaluation
- denial transitions governance outcome to denied

## Audit continuity goals

The runtime supports lightweight audit propagation hooks so governance orchestration emits canonical events without rewriting the durable audit plane.

## Future enterprise implications

This module intentionally avoids workflow engines, distributed infra, queues, and UI concerns. It establishes deterministic governance semantics now, so enterprise orchestration can later scale without semantic drift.
