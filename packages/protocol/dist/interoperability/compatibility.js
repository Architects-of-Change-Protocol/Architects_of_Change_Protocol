"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOVEREIGNTY_INTEROPERABILITY_COMPATIBILITY_STATUSES = exports.SOVEREIGNTY_INTEROPERABILITY_REPORT_SCHEMA_VERSION = void 0;
exports.assessSovereigntyInteroperabilityCompatibility = assessSovereigntyInteroperabilityCompatibility;
const features_1 = require("./features");
const descriptor_1 = require("./descriptor");
const reason_codes_1 = require("./reason-codes");
exports.SOVEREIGNTY_INTEROPERABILITY_REPORT_SCHEMA_VERSION = 'aoc-sovereignty-interoperability-report/1';
/**
 * The three possible outcomes of a compatibility assessment.
 *
 * Enumerated and explainable, never scored. There is no "80% compatible", no
 * `0.74` match and no confidence value, because a consuming system cannot act
 * responsibly on a number: it needs to know *which* semantics it does not
 * understand, so that it can decide what to do about those specific ones.
 *
 * These are semantic-consumption results, not authorization outcomes. None of
 * them says allow, deny, approve, reject, grant or enforce. What an application
 * does with a `partially-compatible` representation is the application's
 * decision, made at the application or Enterprise layer.
 */
exports.SOVEREIGNTY_INTEROPERABILITY_COMPATIBILITY_STATUSES = Object.freeze([
    'compatible',
    'partially-compatible',
    'incompatible',
]);
const compareStrings = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const missingFrom = (required, supported) => {
    const declared = new Set(supported);
    return Object.freeze([...required].filter((entry) => !declared.has(entry)).sort(compareStrings));
};
/**
 * Assesses one described representation against one consumer's declared
 * support.
 *
 * Pure: no clock, no network, no filesystem, no registry, no persistence and no
 * side effect of any kind. Neither argument is mutated — nothing is sorted in
 * place, no field is added to either document, and no derived artifact is
 * emitted alongside the report.
 *
 * Feature gaps are computed whether or not core support holds. An `incompatible`
 * result therefore still tells the consumer which features it would also have
 * been missing, which is strictly more useful than a bare refusal when someone
 * is working out what to implement next.
 */
function assessSovereigntyInteroperabilityCompatibility(descriptor, consumerSupport) {
    const codes = reason_codes_1.SOVEREIGNTY_INTEROPERABILITY_REASON_CODES;
    const reasonCodes = new Set();
    // --- core: can the consumer read this as the representation it is? -------
    const core = {
        profile: consumerSupport.profile.id === descriptor.profile.id
            // Exact version matching. No "closest version" is chosen and no unknown
            // future major is assumed compatible.
            && consumerSupport.profile.acceptedVersions.includes(descriptor.profile.version),
        mediaType: consumerSupport.mediaTypes.includes(descriptor.mediaType),
        representationSchema: consumerSupport.representationSchemaVersions.includes(descriptor.representation.schemaVersion),
        canonicalizationProfile: consumerSupport.canonicalizationProfiles.includes(descriptor.representation.canonicalizationProfile),
    };
    if (!core.profile)
        reasonCodes.add(codes.unsupportedProfile);
    if (!core.mediaType)
        reasonCodes.add(codes.unsupportedMediaType);
    if (!core.representationSchema)
        reasonCodes.add(codes.unsupportedRepresentationSchema);
    if (!core.canonicalizationProfile)
        reasonCodes.add(codes.unsupportedCanonicalizationProfile);
    // --- features: which present semantics does the consumer not understand? -
    const unsupportedArtifactKinds = missingFrom((0, descriptor_1.presentInteroperabilityArtifactKinds)(descriptor), consumerSupport.artifactKinds);
    const unsupportedClaimTypes = missingFrom(descriptor.present.claimTypes, consumerSupport.claimTypes);
    const unsupportedStandingStatuses = missingFrom(descriptor.present.standingStatuses, consumerSupport.standingStatuses);
    // Semantic concepts compare on `namespace` + `termRef`, never on the
    // occurrence id of the ref they were extracted from.
    const declaredTerms = new Set(consumerSupport.semanticTerms.map((entry) => (0, features_1.interoperabilitySemanticRequirementKey)(entry)));
    const unsupportedSemanticTerms = Object.freeze(descriptor.present.semanticRequirements
        .filter((entry) => !declaredTerms.has((0, features_1.interoperabilitySemanticRequirementKey)(entry)))
        .map((entry) => Object.freeze({ namespace: entry.namespace, termRef: entry.termRef }))
        .sort(features_1.compareInteroperabilitySemanticRequirements));
    if (unsupportedArtifactKinds.length > 0)
        reasonCodes.add(codes.unsupportedArtifactKind);
    if (unsupportedClaimTypes.length > 0)
        reasonCodes.add(codes.unsupportedClaimType);
    if (unsupportedStandingStatuses.length > 0)
        reasonCodes.add(codes.unsupportedStandingStatus);
    if (unsupportedSemanticTerms.length > 0)
        reasonCodes.add(codes.unsupportedSemanticTerm);
    // A representation carrying no semantic refs imposes no semantic
    // requirements, and that dimension is satisfied. No requirement is invented
    // to have something to check.
    const coreSupported = core.profile && core.mediaType && core.representationSchema && core.canonicalizationProfile;
    const featureGaps = unsupportedArtifactKinds.length
        + unsupportedClaimTypes.length
        + unsupportedStandingStatuses.length
        + unsupportedSemanticTerms.length;
    const status = !coreSupported
        ? 'incompatible'
        : featureGaps > 0
            ? 'partially-compatible'
            : 'compatible';
    return Object.freeze({
        schemaVersion: exports.SOVEREIGNTY_INTEROPERABILITY_REPORT_SCHEMA_VERSION,
        status,
        core: Object.freeze({ ...core }),
        unsupportedArtifactKinds,
        unsupportedClaimTypes,
        unsupportedStandingStatuses,
        unsupportedSemanticTerms,
        reasonCodes: Object.freeze([...reasonCodes].sort(compareStrings)),
    });
}
