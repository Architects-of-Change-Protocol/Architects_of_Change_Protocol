# Execution Lifecycle Model

## States
planned, authorized, pending, running/executing, checkpointed, suspended, resumed, replayed, completed, failed, revoked, invalid.

## Guarantees
- Unauthorized execution cannot start.
- Revoked capability invalidates execution.
- Protected-stage failures fail closed.
- Invalid transitions throw deterministically.
- Suspension preserves context and constraints.

## Helpers
`createExecutionPlan`, `transitionExecutionState`, `validateExecutionTransition`, `checkpointExecution`, `suspendExecution`, `resumeExecution`, `replayExecution`, `attestExecutionResult`.
