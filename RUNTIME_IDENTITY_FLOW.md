# Runtime Identity Flow

1. Request enters runtime route boundary.
2. Boundary payload may contain legacy identity fields (`subject_hash`, `subject_id`, `requester_id`, `consumer_id`).
3. Runtime internals normalize to canonical principal context (`subject_principal_id`, `requester_principal_id`, `consumer_principal_id`).
4. Domain services evaluate trust/consent/capability with preserved wire compatibility.
5. Audit and usage records emit legacy-compatible fields while retaining canonical interpretation in docs/types.

This keeps runtime behavior stable while reducing semantic drift for future SDK and package extraction.
