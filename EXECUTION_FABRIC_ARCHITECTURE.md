# Execution Fabric Architecture

Defines a governed execution fabric (not a workflow engine) with deterministic lifecycle, stage boundaries, lineage, replay, checkpointing, and attestations.

## Canonical model
- ExecutionId, ExecutionVersion, ExecutionPlan, ExecutionStage, ExecutionCheckpoint, ExecutionBoundary.
- ExecutionIntent/Constraint/Obligation/Decision/Result.
- ExecutionLifecycle state machine with fail-closed invalid transition handling.

## Audit inventory
Current runtime execution paths include policy evaluation, access, capability enforcement, payout flow, transport request handling, SDK invocation, telemetry/audit emission, and reason code emission.
Implicit gap closed by this pass: canonical state transitions, replay lineage, suspension/resume semantics, and attestation record structure.

## Examples
- Multi-stage execution: authorize -> executing -> checkpointed -> completed.
- Delegated execution: parent runtime emits continuation and child runtime step lineage.
- Enterprise governed execution: capability + policy + tenant boundary checks per stage.
