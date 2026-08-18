/**
 * The production Sovereignty Capability capsules.
 *
 * SM-04 shipped the first two of the canonical eight as real implementations
 * of the SM-03 socket — AOC.IDENTITY and AOC.INTEGRITY — SM-05 added the third,
 * AOC.PROVENANCE, SM-06 the fourth, AOC.PORTABILITY, SM-07 the fifth,
 * AOC.INTEROPERABILITY, and SM-08 adds the sixth, AOC.VERIFIABILITY. Licensing
 * & Terms and Governance Compatibility remain canonical descriptors with no
 * production capsule.
 *
 * All six are plain factories with no import-time side effects. None registers
 * itself anywhere: there is no global implementation registry, and a capsule is
 * passed explicitly to `invokeSovereigntyCapability`.
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

export {
  PORTABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS,
  PORTABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES,
  createPortabilitySovereigntyCapabilityImplementation,
  isValidPortabilitySovereigntyCapabilityInput,
  validatePortabilitySovereigntyCapabilityInput,
} from './portability';
export type {
  ExportPortabilityBundleInput,
  ExportPortabilityBundleOutput,
  ImportPortabilityBundleInput,
  ImportPortabilityBundleOutput,
  PortabilitySovereigntyCapabilityImplementation,
  PortabilitySovereigntyCapabilityInput,
  PortabilitySovereigntyCapabilityInputValidationResult,
  PortabilitySovereigntyCapabilityOperation,
  PortabilitySovereigntyCapabilityOutput,
  PortabilitySovereigntyCapabilityReasonCode,
} from './portability';

export {
  INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS,
  INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES,
  createInteroperabilitySovereigntyCapabilityImplementation,
  isValidInteroperabilitySovereigntyCapabilityInput,
  validateInteroperabilitySovereigntyCapabilityInput,
} from './interoperability';
export type {
  AssessInteroperabilityCompatibilityInput,
  AssessInteroperabilityCompatibilityOutput,
  DescribeInteroperabilityBundleInput,
  DescribeInteroperabilityBundleOutput,
  InteroperabilitySovereigntyCapabilityImplementation,
  InteroperabilitySovereigntyCapabilityInput,
  InteroperabilitySovereigntyCapabilityInputValidationResult,
  InteroperabilitySovereigntyCapabilityOperation,
  InteroperabilitySovereigntyCapabilityOutput,
  InteroperabilitySovereigntyCapabilityReasonCode,
} from './interoperability';

export {
  VERIFIABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS,
  VERIFIABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES,
  createVerifiabilitySovereigntyCapabilityImplementation,
  isValidVerifiabilitySovereigntyCapabilityInput,
  validateVerifiabilitySovereigntyCapabilityInput,
} from './verifiability';
export type {
  CreateVerifiabilitySovereigntyCapabilityImplementationOptions,
  SovereignProofVerificationResult,
  VerifiabilitySovereigntyCapabilityImplementation,
  VerifiabilitySovereigntyCapabilityInput,
  VerifiabilitySovereigntyCapabilityInputValidationResult,
  VerifiabilitySovereigntyCapabilityOperation,
  VerifiabilitySovereigntyCapabilityOutput,
  VerifiabilitySovereigntyCapabilityReasonCode,
  VerifySignedSovereignClaimInput,
  VerifySignedSovereignClaimOutput,
  VerifySignedSovereignManifestInput,
  VerifySignedSovereignManifestOutput,
  VerifySovereignProofInput,
  VerifySovereignProofOutput,
} from './verifiability';
