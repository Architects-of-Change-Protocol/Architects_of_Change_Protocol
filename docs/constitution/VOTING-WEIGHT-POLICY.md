# Voting Weight Policy

**Constitution Version:** v14.0

## Weight policy catalog

| Weight Policy ID | Voting Class | Weight Model | Calculation Basis | Minimum Threshold | Maximum Threshold | Normalization Rule | Revocation Rule | Amendment | Status |
|---|---|---|---|---|---|---|---|---|---|
| VWT-0001 | Constitutional | Constitutional Weight | Equal weight per eligible constitutional actor | 1.0 | 1.0 | No normalization; equal weight enforced | Revoked on standing or eligibility failure | AOC-AMD-0014 | Active |
| VWT-0002 | Governance | Standing Weight | Standing-level weight per eligible governance actor | 0.1 | 1.0 | Normalized to eligible participant pool | Revoked on standing or eligibility failure | AOC-AMD-0014 | Active |
| VWT-0003 | Runtime | Reputation Weight | Reputation-score weight per eligible runtime actor | 0.0 | 1.0 | Normalized to sum of eligible weights | Revoked on reputation revocation or eligibility failure | AOC-AMD-0014 | Active |
| VWT-0004 | Operational | Trust Weight | Trust-score weight per eligible operational actor | 0.0 | 1.0 | Normalized to sum of eligible weights | Revoked on trust revocation or eligibility failure | AOC-AMD-0014 | Active |
