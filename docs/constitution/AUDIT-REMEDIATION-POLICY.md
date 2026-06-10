# Audit Remediation Policy

**Constitution Version:** v18.0

## Preamble

Audit remediation is the governed process through which constitutional findings are tracked, prioritized, assigned, resolved, and closed. Every finding must be documented in the finding registry and resolved or formally accepted before an audit can advance to `Verified`.

## Finding Fields

Every finding must contain the following fields:

| Field | Description |
|---|---|
| Finding ID | Unique identifier for the finding (format: FND-NNNN) |
| Domain | The constitutional domain where the finding was detected |
| Severity | The severity level of the finding (Critical, High, Medium, Low) |
| Evidence | The specific artifact, record, or observation that produced the finding |
| Root Cause | The constitutional root cause of the finding |
| Remediation | The prescribed remediation action |
| Owner | The authority responsible for remediation |
| Status | The current status of the finding (Open, In Progress, Resolved, Accepted) |

## Severity Levels

| Severity | Description | Remediation Requirement |
|---|---|---|
| Critical | Finding constitutes a constitutional integrity failure or certification fraud. Blocks audit progression. | Must be resolved before `Verified` transition. May not be formally accepted. |
| High | Finding constitutes a significant governance gap or traceability failure. | Must be resolved or formally accepted with documented rationale before `Verified` transition. |
| Medium | Finding constitutes a coverage gap or documentation deficiency. | Must be resolved or formally accepted before `Certified` transition. |
| Low | Finding constitutes a minor documentation inconsistency or style violation. | Must be resolved or formally accepted before `Ratification Ready` transition. |

## Remediation Process

1. The Remediation Authority (AUD-0007) assigns all findings to an owner.
2. The owner resolves the finding by correcting the underlying constitutional artifact, scanner, test, or record.
3. The Integrity Audit Authority (AUD-0005) verifies the resolution.
4. The finding is closed in the finding registry.

## Finding registry

| Finding ID | Domain | Severity | Evidence | Root Cause | Remediation | Owner | Status |
|---|---|---|---|---|---|---|---|

## Creation Amendment

AOC-AMD-0018
