import type {
  AuditEventEnvelope,
  CapabilityToken,
  ConsentGrant,
  ScopedAccessRequest
} from '@aoc/protocol/contracts';

const ensureTypes = (
  token: CapabilityToken,
  grant: ConsentGrant,
  request: ScopedAccessRequest,
  audit: AuditEventEnvelope
): void => {
  void token;
  void grant;
  void request;
  void audit;
};

export { ensureTypes };
