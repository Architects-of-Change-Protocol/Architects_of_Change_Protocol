# Governance Lifecycle

**Constitution Version:** v1.0

## Lifecycle states

| State | Description |
|---|---|
| Proposed | A governance proposal has been created in Draft or Submitted status |
| Submitted | A proposal has been formally submitted for admissibility review |
| Admissible | A proposal has been determined to meet admission requirements |
| Motioned | An admissible proposal has been prepared as a motion |
| Open | A motion is open for collective evaluation |
| Passed | A motion has satisfied its consensus requirement |
| Mandated | A passed motion has produced an authorized mandate |
| Active | A mandate is currently in effect |
| Suspended | A mandate has been temporarily suspended |
| Completed | A mandate has fulfilled its scope |
| Challenged | An active governance act is under formal challenge |
| Expired | A governance artifact has reached its expiration |
| Revoked | A governance act has been revoked |
| Retired | A governance artifact has been permanently retired |

## Governance lifecycle transition ledger

| Transition ID | Governance ID | From | To | Authorized By | Evidence | Amendment | Effective Date |
|---|---|---|---|---|---|---|---|

## Allowed transitions

| From | To | Condition |
|---|---|---|
| Proposed | Submitted | Proposal formally submitted |
| Submitted | Admissible | Admissibility criteria satisfied |
| Submitted | Rejected | Admissibility criteria not satisfied |
| Submitted | Withdrawn | Proposer withdraws |
| Admissible | Motioned | Motion prepared from proposal |
| Admissible | Withdrawn | Proposer withdraws |
| Motioned | Open | Motion opened for evaluation |
| Open | Passed | Consensus requirement satisfied |
| Open | Failed | Evaluation window closed without passing |
| Open | Expired | Evaluation window expired |
| Open | Withdrawn | Motion withdrawn before evaluation completes |
| Passed | Mandated | Mandate created from passed motion |
| Mandated | Active | Mandate becomes effective |
| Mandated | Suspended | Mandate suspended before activation |
| Mandated | Revoked | Mandate revoked before activation |
| Mandated | Expired | Mandate expired before activation |
| Active | Completed | Mandate scope fulfilled |
| Active | Challenged | Formal challenge initiated |
| Active | Suspended | Mandate temporarily suspended |
| Active | Expired | Mandate expiration reached |
| Active | Revoked | Mandate revoked |
| Suspended | Active | Suspension lifted |
| Suspended | Revoked | Mandate revoked while suspended |
| Suspended | Expired | Mandate expired while suspended |
| Challenged | Active | Challenge resolved in favor of mandate |
| Challenged | Revoked | Challenge results in revocation |
| Challenged | Completed | Challenge resolved; mandate scope fulfilled |
| Challenged | Retired | Challenge results in retirement |
| Completed | Retired | Completed mandate retired |
| Expired | Retired | Expired artifact retired |
| Revoked | Retired | Revoked artifact retired |
