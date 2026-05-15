export type ProtocolErrorCode =
  | "validation.invalid_request"
  | "validation.invalid_state"
  | "authorization.forbidden"
  | "authorization.scope_violation"
  | "policy.evaluation_failed"
  | "policy.not_applicable"
  | "delegation.invalid_chain"
  | "delegation.revoked"
  | "consent.missing"
  | "consent.revoked"
  | "audit.write_failed"
  | "audit.export_failed"
  | "identity.not_found"
  | "identity.ambiguous"
  | "conflict"
  | "unavailable"
  | "internal";

export type ProtocolErrorCategory =
  | "validation"
  | "authorization"
  | "policy"
  | "delegation"
  | "consent"
  | "audit"
  | "identity"
  | "platform";

export type ProtocolErrorContract = {
  code: ProtocolErrorCode;
  category: ProtocolErrorCategory;
  message: string;
  recoverable: boolean;
  details?: unknown;
  causeCode?: string;
};
