# Legacy Reason Code Mappings

Compatibility aliases (`legacyReasonCodeAliases`):
- `POLICY_DENIED` -> `POLICY_DENY_OVERRIDES`
- `ACCESS_DENIED_NOT_FOUND` -> `TRUST_INVALID`
- `ACCESS_DENIED_ISSUER_INACTIVE` -> `TRUST_INVALID`
- `ACCESS_DENIED_EXPIRED` -> `TRUST_INVALID`
- `ACCESS_DENIED_REVOKED` -> `TRUST_INVALID`
- `ACCESS_DENIED_CONSENT_REQUIRED` -> `TRUST_INVALID`

Migration posture:
- Legacy strings remain accepted as input.
- Emitted route/access decisions normalize to canonical codes.
