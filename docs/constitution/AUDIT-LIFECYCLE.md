# Audit Lifecycle

**Constitution Version:** v18.0

## Preamble

The audit lifecycle governs the states and transitions through which a constitutional audit progresses from inception to certification or retirement. Every lifecycle transition must be authorized, evidenced, and traceable to a ratified amendment.

## Lifecycle States

| State | Description |
|---|---|
| Planned | The audit scope has been defined and approved but execution has not begun. |
| Running | Audit execution is in progress. Scanners are executing and findings are being recorded. |
| Blocked | Audit execution is paused due to unresolvable dependencies or missing prerequisites. |
| Failed | Audit execution encountered Critical violations that prevent progression. |
| Remediating | All findings have been recorded and remediation is in progress. |
| Verified | All findings have been resolved or formally accepted. Audit awaits certification review. |
| Certified | The Certification Authority has certified the audit findings and outcomes. |
| Ratification Ready | The Ratification Readiness Authority has approved ratification readiness. |
| Retired | The audit has been superseded or archived. No further transitions are permitted. |

## Valid Lifecycle Transitions

| From | To | Authorized By | Required Evidence |
|---|---|---|---|
| Planned | Running | AUD-0001 | Audit scope document |
| Running | Blocked | AUD-0001 | Blocking evidence |
| Running | Failed | AUD-0001 | Violation records |
| Running | Remediating | AUD-0001 | Complete findings list |
| Blocked | Running | AUD-0001 | Unblocking evidence |
| Failed | Remediating | AUD-0007 | Remediation plan |
| Remediating | Verified | AUD-0005 | Remediation closure records |
| Verified | Certified | AUD-0006 | Certification evidence |
| Certified | Ratification Ready | AUD-0008 | Ratification readiness report |
| Any | Retired | AUD-0001 | Retirement rationale |

## Audit lifecycle transition ledger

| Transition ID | Audit ID | From | To | Authorized By | Evidence | Amendment | Effective Date |
|---|---|---|---|---|---|---|---|
