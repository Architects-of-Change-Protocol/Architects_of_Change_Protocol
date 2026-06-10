# Governance Challenge Policy

**Constitution Version:** v14.0

## Purpose

A governance challenge is a formal constitutional challenge to a governance act. Challenges must be grounded in valid constitutional cause and supported by evidence.

## Valid challenge grounds

- `Invalid Standing`
- `Invalid Proposal`
- `Invalid Motion`
- `Invalid Consensus`
- `Invalid Mandate`
- `Scope Violation`
- `Conflict Of Interest`
- `Evidence Failure`
- `Constitutional Conflict`
- `Governance Conflict`

## Challenge fields

| Field | Required | Description |
|---|---|---|
| Challenge ID | Yes | Unique identifier in format GCH-NNNN |
| Governance ID | Yes | Reference to the governance authority under challenge |
| Target ID | Yes | ID of the challenged governance artifact |
| Grounds | Yes | One or more valid challenge grounds |
| Evidence | Yes | Evidence supporting the challenge |
| Initiator | Yes | Standing-backed challenge initiator |
| Decision Reference | Yes | Reference to authorizing decision |
| Resolution | Yes | Description of challenge resolution |
| Status | Yes | Current challenge status |

## Challenge registry

| Challenge ID | Governance ID | Target ID | Grounds | Evidence | Initiator | Decision Reference | Resolution | Amendment | Status |
|---|---|---|---|---|---|---|---|---|---|

## Constitutional rule

No challenge may proceed without valid grounds and standing-backed initiator. A challenge that lacks valid grounds is constitutionally void.
