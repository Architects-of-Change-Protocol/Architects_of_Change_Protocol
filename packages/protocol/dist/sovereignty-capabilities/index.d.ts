export { SOVEREIGNTY_CAPABILITY_IDS, SOVEREIGNTY_CAPABILITY_KEYS, SOVEREIGNTY_CAPABILITY_NAMESPACE, isSovereigntyCapabilityId, isSovereigntyCapabilityKey, } from './ids';
export type { SovereigntyCapabilityId, SovereigntyCapabilityKey, SovereigntyCapabilityNamespace, } from './ids';
export type { SovereigntyCapabilityDefinition } from './types';
export { isSovereigntyCapabilityVersion } from './version';
export type { SovereigntyCapabilityVersion } from './version';
export { SOVEREIGNTY_CAPABILITIES } from './definitions';
export { getSovereigntyCapability, getSovereigntyCapabilityByKey, listSovereigntyCapabilities, } from './registry';
export { getSovereigntyCapabilityRef, getSovereigntyCapabilityRefByKey, isValidSovereigntyCapabilityRef, sovereigntyCapabilityRefsEqual, toSovereigntyCapabilityRef, } from './capability-ref';
export type { SovereigntyCapabilityRef } from './capability-ref';
export { isValidSovereigntyCapabilityInvocationId, mintSovereigntyCapabilityInvocationId, } from './invocation-id';
export type { SovereigntyCapabilityInvocationId } from './invocation-id';
export { SOVEREIGNTY_CAPABILITY_INVOCATION_SCHEMA_VERSION, buildSovereigntyCapabilityInvocation, isValidSovereigntyCapabilityInvocation, validateSovereigntyCapabilityInvocation, } from './invocation';
export type { BuildSovereigntyCapabilityInvocationInput, SovereigntyCapabilityInvocation, SovereigntyCapabilityInvocationSchemaVersion, SovereigntyCapabilityInvocationValidationResult, } from './invocation';
export { isValidSovereigntyCapabilityExecutionOutcome } from './implementation';
export type { SovereigntyCapabilityExecutionOutcome, SovereigntyCapabilityFailureOutcome, SovereigntyCapabilityImplementation, SovereigntyCapabilitySuccessOutcome, } from './implementation';
export { SOVEREIGNTY_CAPABILITY_INVOCATION_EVENT_TYPE, SOVEREIGNTY_CAPABILITY_INVOCATION_EVIDENCE_SCHEMA_VERSION, isValidSovereigntyCapabilityInvocationEvidence, toSovereigntyCapabilityInvocationAuditEvent, } from './evidence';
export type { SovereigntyCapabilityInvocationEvidenceSchemaVersion, SovereigntyCapabilityInvocationEvidenceV1, SovereigntyCapabilityInvocationOutcomeStatus, } from './evidence';
export { SOVEREIGNTY_CAPABILITY_RESULT_SCHEMA_VERSION, resolveSovereigntyCapabilitySubject, } from './result';
export type { SovereigntyCapabilityFailureResult, SovereigntyCapabilityResult, SovereigntyCapabilityResultSchemaVersion, SovereigntyCapabilitySuccessResult, } from './result';
export { SOVEREIGNTY_CAPABILITY_INVOCATION_ERROR_CODES, SovereigntyCapabilityInvocationError, isSovereigntyCapabilityInvocationError, } from './invocation-error';
export type { SovereigntyCapabilityInvocationErrorCode, SovereigntyCapabilityInvocationErrorDetails, } from './invocation-error';
export { invokeSovereigntyCapability } from './invoke';
export type { InvokeSovereigntyCapabilityOptions } from './invoke';
export type { SovereigntyCapabilityClock } from './time';
/**
 * Re-exported for consumer ergonomics: an implementation returning
 * `evidenceRefs`, and anything reading them off an evidence record, needs
 * this type without also depending on `@aoc/protocol/claims`. It is the same
 * Protocol-owned evidence reference the repository already uses for
 * `AuthorityClaim.evidenceRefs` — a re-export, not a second definition.
 */
export type { CanonicalEvidenceId } from '../claims/primitives';
export { IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES, INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS, INTEGRITY_SOVEREIGNTY_CAPABILITY_REASON_CODES, createIdentitySovereigntyCapabilityImplementation, createIntegritySovereigntyCapabilityImplementation, isValidIdentitySovereigntyCapabilityInput, isValidIntegritySovereigntyCapabilityInput, validateIdentitySovereigntyCapabilityInput, validateIntegritySovereigntyCapabilityInput, } from './capsules';
export type { ComputeContentIdentityIntegrityInput, ComputeContentIdentityIntegrityOutput, ComputeManifestDigestIntegrityInput, ComputeManifestDigestIntegrityOutput, CreateIdentitySovereigntyCapabilityImplementationOptions, IdentitySovereigntyCapabilityImplementation, IdentitySovereigntyCapabilityInput, IdentitySovereigntyCapabilityInputValidationResult, IdentitySovereigntyCapabilityOutput, IdentitySovereigntyCapabilityReasonCode, IntegrityContentIdentityCheck, IntegritySovereigntyCapabilityImplementation, IntegritySovereigntyCapabilityInput, IntegritySovereigntyCapabilityInputValidationResult, IntegritySovereigntyCapabilityOperation, IntegritySovereigntyCapabilityOutput, IntegritySovereigntyCapabilityReasonCode, VerifyContentIdentityIntegrityInput, VerifyContentIdentityIntegrityOutput, } from './capsules';
export { PROVENANCE_SOVEREIGNTY_CAPABILITY_OPERATIONS, PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES, createProvenanceSovereigntyCapabilityImplementation, isValidProvenanceSovereigntyCapabilityInput, validateProvenanceSovereigntyCapabilityInput, } from './capsules';
export type { ContestProvenanceClaimInput, ContestProvenanceClaimOutput, CreateProvenanceSovereigntyCapabilityImplementationOptions, DeclareAuthorshipProvenanceInput, DeclareAuthorshipProvenanceOutput, DeclareOriginProvenanceInput, DeclareOriginProvenanceOutput, ProvenanceSovereigntyCapabilityImplementation, ProvenanceSovereigntyCapabilityInput, ProvenanceSovereigntyCapabilityInputValidationResult, ProvenanceSovereigntyCapabilityOperation, ProvenanceSovereigntyCapabilityOutput, ProvenanceSovereigntyCapabilityReasonCode, RecordDerivationProvenanceInput, RecordDerivationProvenanceOutput, TraceLineageProvenanceInput, TraceLineageProvenanceOutput, } from './capsules';
export { PORTABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS, PORTABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES, createPortabilitySovereigntyCapabilityImplementation, isValidPortabilitySovereigntyCapabilityInput, validatePortabilitySovereigntyCapabilityInput, } from './capsules';
export type { ExportPortabilityBundleInput, ExportPortabilityBundleOutput, ImportPortabilityBundleInput, ImportPortabilityBundleOutput, PortabilitySovereigntyCapabilityImplementation, PortabilitySovereigntyCapabilityInput, PortabilitySovereigntyCapabilityInputValidationResult, PortabilitySovereigntyCapabilityOperation, PortabilitySovereigntyCapabilityOutput, PortabilitySovereigntyCapabilityReasonCode, } from './capsules';
export { INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS, INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES, createInteroperabilitySovereigntyCapabilityImplementation, isValidInteroperabilitySovereigntyCapabilityInput, validateInteroperabilitySovereigntyCapabilityInput, } from './capsules';
export type { AssessInteroperabilityCompatibilityInput, AssessInteroperabilityCompatibilityOutput, DescribeInteroperabilityBundleInput, DescribeInteroperabilityBundleOutput, InteroperabilitySovereigntyCapabilityImplementation, InteroperabilitySovereigntyCapabilityInput, InteroperabilitySovereigntyCapabilityInputValidationResult, InteroperabilitySovereigntyCapabilityOperation, InteroperabilitySovereigntyCapabilityOutput, InteroperabilitySovereigntyCapabilityReasonCode, } from './capsules';
export { VERIFIABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS, VERIFIABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES, createVerifiabilitySovereigntyCapabilityImplementation, isValidVerifiabilitySovereigntyCapabilityInput, validateVerifiabilitySovereigntyCapabilityInput, } from './capsules';
export type { CreateVerifiabilitySovereigntyCapabilityImplementationOptions, SovereignProofVerificationResult, VerifiabilitySovereigntyCapabilityImplementation, VerifiabilitySovereigntyCapabilityInput, VerifiabilitySovereigntyCapabilityInputValidationResult, VerifiabilitySovereigntyCapabilityOperation, VerifiabilitySovereigntyCapabilityOutput, VerifiabilitySovereigntyCapabilityReasonCode, VerifySignedSovereignClaimInput, VerifySignedSovereignClaimOutput, VerifySignedSovereignManifestInput, VerifySignedSovereignManifestOutput, VerifySovereignProofInput, VerifySovereignProofOutput, } from './capsules';
export { LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS, createLicensingTermsSovereigntyCapabilityImplementation, isValidLicensingTermsSovereigntyCapabilityInput, validateLicensingTermsSovereigntyCapabilityInput, } from './capsules';
export type { ContestLicenseTermsClaimInput, ContestLicenseTermsClaimOutput, CreateLicensingTermsSovereigntyCapabilityImplementationOptions, DeclareLicenseTermsInput, DeclareLicenseTermsOutput, LicensingTermsSovereigntyCapabilityImplementation, LicensingTermsSovereigntyCapabilityInput, LicensingTermsSovereigntyCapabilityInputValidationResult, LicensingTermsSovereigntyCapabilityOperation, LicensingTermsSovereigntyCapabilityOutput, ValidateLicenseTermsInput, ValidateLicenseTermsOutput, } from './capsules';
/**
 * Re-exported so a consumer holding only `@aoc/protocol/sovereignty-capabilities`
 * can read the reason codes AOC.LICENSING_TERMS reports without also importing
 * `@aoc/protocol/licensing`.
 *
 * These are the **same** frozen constant and the same type, not a capsule-local
 * copy. Licensing is the one mineral whose reason codes live in its contract
 * layer rather than in its capsule, because the terms validators are
 * deliberately usable on their own — so both readers share one vocabulary
 * instead of two spellings drifting apart.
 */
export { LICENSING_TERMS_REASON_CODES } from '../licensing';
export type { LicensingTermsReasonCode, LicensingTermsValidationResult } from '../licensing';
//# sourceMappingURL=index.d.ts.map