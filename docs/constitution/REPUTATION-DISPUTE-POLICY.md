# Reputation Dispute Policy

**Constitution Version:** v15.0

## Constitutional rule

Every reputation type marked `Disputable: Yes` must support constitutional disputes. Disputes transition the reputation to `Disputed` state pending resolution. Every dispute must include a dispute ID, reputation ID, grounds, evidence, initiator, decision reference, resolution, and status.

## Valid dispute grounds

| Ground | Description |
|---|---|
| Incorrect Source | A source record used in calculation is factually incorrect |
| Missing Source | A material source record was excluded from calculation |
| Invalid Weight | Source weight applied does not match the governing sources policy |
| Expired Evidence | Source evidence was expired at time of calculation |
| Disputed Claim | An underlying claim used as a source is under active dispute |
| Revoked Decision | An underlying decision used as a source has been revoked |
| Incorrect Aggregation | The aggregation method deviates from the governing calculation policy |
| Constitutional Conflict | The reputation signal conflicts with a constitutional requirement |

## Valid dispute statuses

| Status | Description |
|---|---|
| Open | Dispute submitted; reputation is in Disputed state |
| Under Review | Dispute actively being evaluated by authorized authority |
| Resolved — Upheld | Dispute resolved in favor of initiator; correction or revocation applied |
| Resolved — Dismissed | Dispute resolved against initiator; reputation restored or unchanged |
| Withdrawn | Initiator withdrew dispute before resolution |

## Reputation dispute registry

| Dispute ID | Reputation ID | Grounds | Evidence | Initiator | Decision Reference | Resolution | Status |
|---|---|---|---|---|---|---|---|

## Catalog integrity

No dispute may be initiated without valid grounds and evidence. Disputes must reference the reputation ID, initiator standing, and at least one decision reference or constitutional rule. Every dispute resolution must be traceable to an authorized resolution authority.
