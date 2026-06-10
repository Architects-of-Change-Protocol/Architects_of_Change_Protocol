# Reputation Calculation Policy

**Constitution Version:** v14.0

## Constitutional rule

Every reputation type must define its calculation basis, weighting method, aggregation window, confidence bounds, negative event treatment, correction treatment, and decision influence rule. Reputation may influence decisions. Reputation may not override authority, capability, policy, standing, claim evidence, or verification requirements.

## Reputation calculation registry

| Calculation Policy ID | Reputation Class | Calculation Basis | Weighting Method | Aggregation Window | Confidence Bounds | Negative Event Treatment | Correction Treatment | Decision Influence Rule | Amendment | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| RCP-0001 | Constitutional | Source-weighted aggregate of constitutional record outcomes | Recency-weighted; amendment-backed events weighted higher | Rolling 365-day window; events older than 730 days excluded | Minimum 0.0; Maximum 1.0; Confidence interval required | Negative events reduce score proportionally; fraud events apply maximum penalty | Corrections replace current score; prior value preserved in correction record | May be presented as input to constitutional decisions; may not replace standing or amendment requirements | AOC-AMD-0009 | Active |
| RCP-0002 | Governance | Source-weighted aggregate of governance record outcomes | Recency-weighted; ratified-amendment-backed events weighted higher | Rolling 180-day window; events older than 365 days excluded | Minimum 0.0; Maximum 1.0; Confidence interval required | Negative events reduce score proportionally; decision failures apply elevated penalty | Corrections replace current score; prior value preserved in correction record | May be presented as input to governance decisions; may not replace policy or standing requirements | AOC-AMD-0009 | Active |
| RCP-0003 | Runtime | Source-weighted aggregate of runtime record outcomes | Recency-weighted; verification-backed events weighted higher | Rolling 90-day window; events older than 180 days excluded | Minimum 0.0; Maximum 1.0; Confidence interval required | Negative events reduce score proportionally; revocation events apply elevated penalty | Corrections replace current score; prior value preserved in correction record | May be presented as input to runtime decisions; may not replace claim evidence or verification requirements | AOC-AMD-0009 | Active |
| RCP-0004 | Operational | Source-weighted aggregate of operational record outcomes | Recency-weighted; audit-backed events weighted higher | Rolling 90-day window; events older than 180 days excluded | Minimum 0.0; Maximum 1.0; Confidence interval required | Negative events reduce score proportionally; compliance failures apply elevated penalty | Corrections replace current score; prior value preserved in correction record | May be presented as input to operational decisions; may not replace audit or compliance requirements | AOC-AMD-0009 | Active |
