# Reputation Correction Policy

**Constitution Version:** v12.0

## Constitutional rule

Every reputation type marked `Correctable: Yes` must support constitutional corrections. Correction does not rewrite history. Correction creates a correction record that preserves the prior value, corrected value, reason, evidence, and decision reference. After correction, reputation transitions to `Corrected` then to `Active`.

## Valid correction causes

| Cause | Description |
|---|---|
| Source Correction | An underlying source record was corrected after reputation calculation |
| Weight Correction | Source weight was misapplied and corrected to match the sources policy |
| Aggregation Correction | Aggregation logic deviated from calculation policy and was corrected |
| Appeal Outcome | A constitutional appeal resulted in a reputation correction |
| Dispute Resolution | A dispute was resolved in favor of the initiator requiring correction |
| Constitutional Override | A constitutional amendment requires a reputation correction |

## Reputation correction registry

| Correction ID | Reputation ID | Correction Cause | Prior Value | Corrected Value | Reason | Evidence | Decision Reference | Amendment | Effective Date | Status |
|---|---|---|---|---|---|---|---|---|---|---|

## Catalog integrity

No correction may be applied without a valid cause, evidence, and decision reference. Corrections must preserve the prior value in the correction record. History is never deleted; corrections are additive records. Every correction must be traceable to an authorized correction authority and a ratified amendment.
