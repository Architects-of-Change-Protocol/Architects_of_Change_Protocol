# Execution Checkpoint Model

ExecutionCheckpointRecord provides deterministic checkpoints by sequence and hash.

Rules:
- Checkpoints are append-only.
- Sequence ordering is monotonic.
- Replay must reference historical checkpoint IDs.
