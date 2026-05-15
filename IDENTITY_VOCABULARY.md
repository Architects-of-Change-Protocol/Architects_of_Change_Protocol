# Identity Vocabulary

## Canonical -> Legacy mappings
- `subject_principal_id` <- `subject_id` OR `subject_hash`
- `requester_principal_id` <- `requester_id`
- `consumer_principal_id` <- `consumer_id`

## Domain notes
- **Access + Trust** currently use `subject_hash` + `consumer_id` semantics.
- **Control plane** uses `subject_id` + `requester_id` semantics.
- **Usage + monetization** meter by `consumer_id` (canonical consumer principal).

## Drift guardrails
- New runtime identity-carrying types should include canonical annotations/comments.
- Retain legacy field names only at API boundaries; prefer canonical naming in internal helper types.
