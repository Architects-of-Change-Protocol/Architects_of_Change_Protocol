export const ProofType = {
  HashProof: 'HashProof',
  SignatureProof: 'SignatureProof',
  AttestationProof: 'AttestationProof',
  IntegrityProof: 'IntegrityProof',
  ChainProof: 'ChainProof',
  CredentialProof: 'CredentialProof',
  AuditProof: 'AuditProof',
  TraceProof: 'TraceProof',
  Custom: 'Custom',
} as const;
export type ProofType = (typeof ProofType)[keyof typeof ProofType];

export const ProofFormat = {
  JSON: 'JSON',
  JWT: 'JWT',
  JWS: 'JWS',
  VC: 'VC',
  Hash: 'Hash',
  URI: 'URI',
  Custom: 'Custom',
} as const;
export type ProofFormat = (typeof ProofFormat)[keyof typeof ProofFormat];

export const ProofStatus = {
  Declared: 'Declared',
  Observed: 'Observed',
  Verified: 'Verified',
  Invalid: 'Invalid',
  Unknown: 'Unknown',
} as const;
export type ProofStatus = (typeof ProofStatus)[keyof typeof ProofStatus];
