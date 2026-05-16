# Federated Trust Semantics

Trust states: trusted, untrusted, suspended, revoked, degraded, incompatible, delegated, attested, replay-authorized, replay-denied.

Trust levels: trusted, partially-trusted, capability-limited, replay-authorized, degraded-trust, revoked.

Guarantees:
- revoked/untrusted/incompatible fail closed.
- degraded trust constrains delegation depth.
- capability-limited trust requires explicit capability scopes.
