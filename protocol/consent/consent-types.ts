export type ScopeEntry = {
  type: 'field' | 'content' | 'pack';
  ref: string;
};

export type ProtocolConsent = {
  version: string;
  subject: string;
  grantee: string;
  action: 'grant' | 'revoke';
  scope: ScopeEntry[];
  permissions: string[];
  pricing?: {
    model: 'per_use';
    amount: number;
    currency: string;
  };
  marketMakerId?: string;
  revoke_target?: {
    capability_hash: string;
  };
  issued_at: string;
  expires_at: string | null;
  prior_consent: string | null;
  consent_hash: string;
};

export type ConsentState =
  | 'active'
  | 'expired'
  | 'revoked'
  | 'inactive'
  | 'invalid';

export type ConsentValidationResult = {
  valid: boolean;
  errors: string[];
};

export type ConsentStateResult = {
  state: ConsentState;
  reasons: string[];
};

export type ConsentEvaluationOptions = {
  now?: Date;
  isRevoked?: (consent: ProtocolConsent) => boolean;
};

export type ConsentScopeRequest = {
  scope: ScopeEntry[];
  permissions: string[];
  subject?: string;
  grantee?: string;
  marketMakerId?: string;
  now?: Date;
  isRevoked?: (consent: ProtocolConsent) => boolean;
};
