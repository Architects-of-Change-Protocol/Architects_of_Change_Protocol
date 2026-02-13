import type { SignatureEnvelope } from '../identity/types';

import type { ScopeEntry } from '../consent/types';

export type { ScopeEntry };

export type CapabilityTokenV1 = {
  version: string;
  subject: string;
  grantee: string;
  consent_ref: string;
  scope: ScopeEntry[];
  permissions: string[];
  issued_at: string;
  not_before: string | null;
  expires_at: string;
  token_id: string;
  capability_hash: string;
  signature?: SignatureEnvelope;
};

export type MintCapabilityOptions = {
  now?: Date;
  not_before?: string | null;
};
