import type { SignatureEnvelope } from '../identity/types';

export type ScopeEntry = {
  type: 'field' | 'content' | 'pack';
  ref: string;
};

export type ConsentObjectV1 = {
  version: string;
  subject: string;
  grantee: string;
  action: 'grant' | 'revoke';
  scope: ScopeEntry[];
  permissions: string[];
  issued_at: string;
  expires_at: string | null;
  prior_consent: string | null;
  consent_hash: string;
  signature?: SignatureEnvelope;
};

export type BuildConsentOptions = {
  now?: Date;
  expires_at?: string | null;
  prior_consent?: string | null;
};
