# Federated Compatibility Model

`RuntimeFederationVersionAssertion` + `RuntimeFederationCompatibilityMatrix` define runtime protocol and transport compatibility posture.

Compatibility guarantees:
- incompatible versions fail closed,
- explicit transport profile requirements,
- posture mismatches are observable via deny reasons.
