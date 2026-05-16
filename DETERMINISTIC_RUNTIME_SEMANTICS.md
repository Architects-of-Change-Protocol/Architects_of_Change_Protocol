# Deterministic Runtime Semantics

Determinism expectations across adapters:
- same writes + same reads => same observable outputs;
- same audit query => same sorted/filter result set;
- same payout withdrawal id => same cached idempotent decision;
- same usage record set => same summary counts/fees/reason tallies.

Any adapter that changes these outcomes is non-compliant.
