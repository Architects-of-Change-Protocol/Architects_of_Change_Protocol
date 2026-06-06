/** Compatibility shim for Enterprise Assurance identity trust and verification runtime. */
export {
  DEFAULT_TRUST_ISSUERS,
  InMemoryTrustService,
} from '../../enterprise/src/assurance/trust/identity-trust-service';
export type {
  GrantConsentInput,
  RegisterCredentialInput,
  VerifyIdentityInput,
} from '../../enterprise/src/assurance/trust/identity-trust-service';
