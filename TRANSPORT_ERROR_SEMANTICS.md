# Transport Error Semantics

Error categories are canonicalized into:
- transport
- runtime
- capability
- consent
- validation
- compatibility
- auth

Runtime only returns safe error envelopes; stack traces/internal internals are not serialized.
