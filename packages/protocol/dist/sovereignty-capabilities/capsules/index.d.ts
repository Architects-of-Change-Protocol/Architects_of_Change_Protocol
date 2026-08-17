/**
 * The production Sovereignty Capability capsules.
 *
 * SM-04 ships the first two of the canonical eight as real implementations of
 * the SM-03 socket: AOC.IDENTITY and AOC.INTEGRITY. Provenance, Portability,
 * Interoperability, Verifiability, Licensing & Terms and Governance
 * Compatibility remain canonical descriptors with no production capsule.
 *
 * Both are plain factories with no import-time side effects. Neither registers
 * itself anywhere: there is no global implementation registry, and a capsule is
 * passed explicitly to `invokeSovereigntyCapability`.
 */
export { IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES, createIdentitySovereigntyCapabilityImplementation, isValidIdentitySovereigntyCapabilityInput, validateIdentitySovereigntyCapabilityInput, } from './identity';
export type { CreateIdentitySovereigntyCapabilityImplementationOptions, IdentitySovereigntyCapabilityImplementation, IdentitySovereigntyCapabilityInput, IdentitySovereigntyCapabilityInputValidationResult, IdentitySovereigntyCapabilityOutput, IdentitySovereigntyCapabilityReasonCode, } from './identity';
export { INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS, INTEGRITY_SOVEREIGNTY_CAPABILITY_REASON_CODES, createIntegritySovereigntyCapabilityImplementation, isValidIntegritySovereigntyCapabilityInput, validateIntegritySovereigntyCapabilityInput, } from './integrity';
export type { ComputeContentIdentityIntegrityInput, ComputeContentIdentityIntegrityOutput, ComputeManifestDigestIntegrityInput, ComputeManifestDigestIntegrityOutput, IntegrityContentIdentityCheck, IntegritySovereigntyCapabilityImplementation, IntegritySovereigntyCapabilityInput, IntegritySovereigntyCapabilityInputValidationResult, IntegritySovereigntyCapabilityOperation, IntegritySovereigntyCapabilityOutput, IntegritySovereigntyCapabilityReasonCode, VerifyContentIdentityIntegrityInput, VerifyContentIdentityIntegrityOutput, } from './integrity';
//# sourceMappingURL=index.d.ts.map