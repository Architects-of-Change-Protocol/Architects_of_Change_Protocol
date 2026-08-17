/**
 * The production Sovereignty Capability capsules.
 *
 * SM-04 shipped the first two of the canonical eight as real implementations
 * of the SM-03 socket — AOC.IDENTITY and AOC.INTEGRITY — and SM-05 adds the
 * third, AOC.PROVENANCE. Portability, Interoperability, Verifiability,
 * Licensing & Terms and Governance Compatibility remain canonical descriptors
 * with no production capsule.
 *
 * All three are plain factories with no import-time side effects. None
 * registers itself anywhere: there is no global implementation registry, and a
 * capsule is passed explicitly to `invokeSovereigntyCapability`.
 */
export {
  IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES,
  createIdentitySovereigntyCapabilityImplementation,
  isValidIdentitySovereigntyCapabilityInput,
  validateIdentitySovereigntyCapabilityInput,
} from './identity';
export type {
  CreateIdentitySovereigntyCapabilityImplementationOptions,
  IdentitySovereigntyCapabilityImplementation,
  IdentitySovereigntyCapabilityInput,
  IdentitySovereigntyCapabilityInputValidationResult,
  IdentitySovereigntyCapabilityOutput,
  IdentitySovereigntyCapabilityReasonCode,
} from './identity';

export {
  INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS,
  INTEGRITY_SOVEREIGNTY_CAPABILITY_REASON_CODES,
  createIntegritySovereigntyCapabilityImplementation,
  isValidIntegritySovereigntyCapabilityInput,
  validateIntegritySovereigntyCapabilityInput,
} from './integrity';
export type {
  ComputeContentIdentityIntegrityInput,
  ComputeContentIdentityIntegrityOutput,
  ComputeManifestDigestIntegrityInput,
  ComputeManifestDigestIntegrityOutput,
  IntegrityContentIdentityCheck,
  IntegritySovereigntyCapabilityImplementation,
  IntegritySovereigntyCapabilityInput,
  IntegritySovereigntyCapabilityInputValidationResult,
  IntegritySovereigntyCapabilityOperation,
  IntegritySovereigntyCapabilityOutput,
  IntegritySovereigntyCapabilityReasonCode,
  VerifyContentIdentityIntegrityInput,
  VerifyContentIdentityIntegrityOutput,
} from './integrity';

export {
  PROVENANCE_SOVEREIGNTY_CAPABILITY_OPERATIONS,
  PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES,
  createProvenanceSovereigntyCapabilityImplementation,
  isValidProvenanceSovereigntyCapabilityInput,
  validateProvenanceSovereigntyCapabilityInput,
} from './provenance';
export type {
  ContestProvenanceClaimInput,
  ContestProvenanceClaimOutput,
  CreateProvenanceSovereigntyCapabilityImplementationOptions,
  DeclareAuthorshipProvenanceInput,
  DeclareAuthorshipProvenanceOutput,
  DeclareOriginProvenanceInput,
  DeclareOriginProvenanceOutput,
  ProvenanceSovereigntyCapabilityImplementation,
  ProvenanceSovereigntyCapabilityInput,
  ProvenanceSovereigntyCapabilityInputValidationResult,
  ProvenanceSovereigntyCapabilityOperation,
  ProvenanceSovereigntyCapabilityOutput,
  ProvenanceSovereigntyCapabilityReasonCode,
  RecordDerivationProvenanceInput,
  RecordDerivationProvenanceOutput,
  TraceLineageProvenanceInput,
  TraceLineageProvenanceOutput,
} from './provenance';
