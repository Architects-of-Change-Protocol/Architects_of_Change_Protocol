# Decision Registry Model

Registry location: `runtime/governance/reason-codes.ts`.

Each entry includes:
- code
- category
- severity
- audience
- lifecycle
- visibility
- owner
- classification
- summary
- machineMeaning
- explainabilityHint
- compatibilityNotes
- telemetryClassification
- sdkExposurePolicy
- auditSafe
- telemetryOnly

Deterministic lookup APIs:
- `getReasonCode`
- `normalizeReasonCode`
- `classifyReasonCode`
- `isStableReasonCode`
- `isSdkSafeReasonCode`
- `isAuditSafeReasonCode`
- `isDeprecatedReasonCode`
