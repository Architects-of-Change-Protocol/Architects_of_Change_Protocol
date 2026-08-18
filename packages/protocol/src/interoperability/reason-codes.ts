/**
 * Stable, machine-readable reason codes the interoperability contract can
 * report.
 *
 * One map, shared by the descriptor builder, the consumer-support validator,
 * the compatibility evaluator and the production capsule, so a consumer sees
 * the same code for the same fact no matter which surface reported it — the
 * same single-source discipline `SOVEREIGNTY_PORTABILITY_REASON_CODES`
 * established in SM-06. The capsule extends this map with its own
 * operation-level codes rather than restating any of these.
 *
 * The `unsupported*` codes are deliberately *not* errors. They are the
 * explainable content of an ordinary compatibility report: a report saying
 * "this consumer does not understand `Derivation`" is a successful assessment
 * that produced a negative answer, not a failed one. Only the `invalid*` and
 * `subjectMismatch` codes describe malformed input.
 */
export const SOVEREIGNTY_INTEROPERABILITY_REASON_CODES = Object.freeze({
  invalidInput: 'INTEROPERABILITY_INVALID_INPUT',
  invalidBundle: 'INTEROPERABILITY_INVALID_BUNDLE',
  invalidProfile: 'INTEROPERABILITY_INVALID_PROFILE',
  invalidDescriptor: 'INTEROPERABILITY_INVALID_DESCRIPTOR',
  invalidConsumerSupport: 'INTEROPERABILITY_INVALID_CONSUMER_SUPPORT',
  /**
   * An explicitly supplied invocation subject is not the subject the
   * representation is about. The two references are never merged and no winner
   * is picked — reconciling them is a lifecycle decision, not a descriptive one.
   */
  subjectMismatch: 'INTEROPERABILITY_SUBJECT_MISMATCH',
  unsupportedProfile: 'INTEROPERABILITY_UNSUPPORTED_PROFILE',
  unsupportedMediaType: 'INTEROPERABILITY_UNSUPPORTED_MEDIA_TYPE',
  unsupportedRepresentationSchema: 'INTEROPERABILITY_UNSUPPORTED_REPRESENTATION_SCHEMA',
  unsupportedCanonicalizationProfile: 'INTEROPERABILITY_UNSUPPORTED_CANONICALIZATION_PROFILE',
  unsupportedArtifactKind: 'INTEROPERABILITY_UNSUPPORTED_ARTIFACT_KIND',
  unsupportedClaimType: 'INTEROPERABILITY_UNSUPPORTED_CLAIM_TYPE',
  unsupportedStandingStatus: 'INTEROPERABILITY_UNSUPPORTED_STANDING_STATUS',
  unsupportedSemanticTerm: 'INTEROPERABILITY_UNSUPPORTED_SEMANTIC_TERM',
} as const);

export type SovereigntyInteroperabilityReasonCode =
  (typeof SOVEREIGNTY_INTEROPERABILITY_REASON_CODES)[keyof typeof SOVEREIGNTY_INTEROPERABILITY_REASON_CODES];
