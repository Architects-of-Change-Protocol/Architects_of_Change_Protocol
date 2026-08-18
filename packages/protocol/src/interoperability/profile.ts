import { CANONICAL_JSON_PROFILE } from '../canonical';
import type { CanonicalSemanticVocabulary } from '../claims/vocabulary';
import {
  PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS,
  PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS,
  SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION,
  type PortableSovereignClaimArtifactKind,
  type PortableSovereignManifestArtifactKind,
} from '../portability';
import {
  INTEROPERABLE_CLAIM_TYPES,
  INTEROPERABLE_STANDING_STATUSES,
  SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS,
  type InteroperableClaimType,
  type SovereigntyInteroperabilityArtifactKind,
} from './features';
import { AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY } from './vocabulary';
import type { StandingStatus } from '../claims/claim-enums';

/** Wire structure version of the interoperability *profile document* itself. */
export const SOVEREIGNTY_INTEROPERABILITY_PROFILE_SCHEMA_VERSION =
  'aoc-sovereignty-interoperability-profile/1' as const;

export type SovereigntyInteroperabilityProfileSchemaVersion =
  typeof SOVEREIGNTY_INTEROPERABILITY_PROFILE_SCHEMA_VERSION;

/**
 * Stable identity of the canonical AOC representation profile.
 *
 * A profile id names a *family of semantics*, not a package and not a module.
 * `@aoc/protocol/interoperability#SovereigntyInteroperabilityProfileV1` is a
 * developer-facing fact about where the TypeScript lives; it is deliberately
 * not the wire identity, because a wire contract that depended on a module path
 * would break the moment the code was reorganised and would be meaningless to
 * a consumer that is not written in TypeScript.
 */
export const AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_ID =
  'aoc:interoperability-profile:sovereignty-portability' as const;

export type AocSovereigntyInteroperabilityProfileId =
  typeof AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_ID;

/**
 * Version of the canonical profile's *meaning*.
 *
 * Deliberately not the npm package version. The package version moves whenever
 * any part of `@aoc/protocol` changes; the semantics an external system
 * negotiates against must only move when those semantics do. Tying them
 * together would force every consumer to renegotiate after a documentation
 * release.
 */
export const AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_VERSION = '1.0.0' as const;

/**
 * The media type by which the canonical AOC portability representation
 * identifies itself to another system.
 *
 * This is an **AOC Protocol media-type identifier**. It is not registered with
 * IANA, and this constant makes no claim that it is; if such a registration
 * ever exists it will be recorded where registrations are recorded, not
 * implied by a string here. Its purpose is to let a receiving system name the
 * representation it is holding during negotiation.
 *
 * It is descriptive metadata and nothing more. Protocol performs no HTTP
 * content negotiation, sets no header, reads no header and ships no server.
 */
export const AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE =
  'application/vnd.aoc.sovereignty-portability+json' as const;

export type AocSovereigntyPortabilityMediaType = typeof AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE;

/**
 * The representation family a profile describes, identified by the two
 * constants that actually govern its wire form.
 */
export interface SovereigntyInteroperabilityRepresentationProfile {
  readonly schemaVersion: typeof SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION;
  readonly canonicalizationProfile: typeof CANONICAL_JSON_PROFILE;
}

/**
 * A versioned pointer at a profile, for artifacts that reference one rather
 * than embedding it. Both fields are required: an unversioned profile name
 * would leave a consumer unable to tell which meanings it was being offered.
 */
export interface SovereigntyInteroperabilityProfileRef {
  readonly id: string;
  readonly version: string;
}

/**
 * SovereigntyInteroperabilityProfileV1 — the static, Protocol-owned answer to
 * "what does this family of AOC representations mean?".
 *
 * A *profile* describes possibilities; a *descriptor* describes one concrete
 * bundle. The profile says "representations in this family may contain signed
 * manifests and Derivation claims"; a descriptor says "this bundle contains one
 * unsigned manifest and one Derivation claim". Collapsing the two would leave a
 * consumer unable to distinguish what the format allows from what actually
 * arrived.
 *
 * ## Fields that are deliberately absent, and why
 *
 * - **`implementedCapabilities` / `availableCapabilities`** — a representation
 *   profile describes semantics, never which capsules happen to be constructed
 *   inside some runtime. The canonical capability catalog and a given process's
 *   capability availability are different facts, and a descriptor that conflated
 *   them would let a consumer infer execution readiness from a document that
 *   knows nothing about any runtime.
 * - **`mapToW3C` / `mapToC2PA` / translation tables** — the base profile is
 *   AOC-native. External mappings, if they ever exist, are separate profiles.
 * - **`trustScore` / `confidence` / `verifiedIssuer`** — understanding a
 *   representation is not trusting it, and a profile that scored anything would
 *   be answering a question Verifiability and the consuming application own.
 * - **`labels` / `icons` / `colors`** — semantics, not presentation.
 * - **`billingTier` / `premiumFeature` / `requiredForCommercialUse`** — Protocol
 *   semantics carry no commercial policy.
 * - **`provider` / `endpoint` / `storageUri`** — the media type identifies the
 *   representation, never where a copy of one is kept.
 * - **`generatedAt` / `digest` / `signature`** — the profile is a constant, so a
 *   timestamp would be a lie; integrity or proof over its serialization is
 *   explicit composition with AOC.INTEGRITY or AOC.VERIFIABILITY, not a field
 *   this contract fabricates for itself.
 */
export interface SovereigntyInteroperabilityProfileV1 {
  readonly schemaVersion: SovereigntyInteroperabilityProfileSchemaVersion;
  readonly id: AocSovereigntyInteroperabilityProfileId;
  readonly version: typeof AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_VERSION;
  readonly mediaType: AocSovereigntyPortabilityMediaType;
  readonly representation: SovereigntyInteroperabilityRepresentationProfile;
  /** Every artifact kind a representation in this family may present. */
  readonly artifactKinds: readonly SovereigntyInteroperabilityArtifactKind[];
  readonly manifestArtifactKinds: readonly PortableSovereignManifestArtifactKind[];
  readonly claimArtifactKinds: readonly PortableSovereignClaimArtifactKind[];
  readonly claimTypes: readonly InteroperableClaimType[];
  readonly standingStatuses: readonly StandingStatus[];
  readonly semanticVocabulary: CanonicalSemanticVocabulary;
}

/**
 * The one canonical AOC interoperability profile.
 *
 * A frozen constant rather than something a builder assembles per invocation:
 * the semantics of the representation family do not depend on who is asking,
 * when, or what is installed. There is no clock here, no environment
 * inspection, no capability discovery and no registry — and no
 * `registerProfile` / `findProfile` / profile marketplace either. SM-07 needs
 * exactly one profile; generalising to many before a second one exists would be
 * inventing a lookup problem the Protocol does not have.
 *
 * The representation constants are imported from SM-06 and SM-02's canonical
 * JSON profile rather than re-typed as literals, so the profile cannot describe
 * a bundle schema the bundle no longer uses.
 */
export const AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1: SovereigntyInteroperabilityProfileV1 =
  Object.freeze({
    schemaVersion: SOVEREIGNTY_INTEROPERABILITY_PROFILE_SCHEMA_VERSION,
    id: AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_ID,
    version: AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_VERSION,
    mediaType: AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE,
    representation: Object.freeze({
      schemaVersion: SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION,
      canonicalizationProfile: CANONICAL_JSON_PROFILE,
    }),
    artifactKinds: SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS,
    manifestArtifactKinds: PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS,
    claimArtifactKinds: PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS,
    claimTypes: INTEROPERABLE_CLAIM_TYPES,
    standingStatuses: INTEROPERABLE_STANDING_STATUSES,
    semanticVocabulary: AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY,
  });

/** The canonical profile as a versioned reference. */
export const AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_REF: SovereigntyInteroperabilityProfileRef =
  Object.freeze({
    id: AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_ID,
    version: AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_VERSION,
  });

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Structural check for a profile reference. Both halves are required, because a
 * bare id names a family of meanings across versions rather than one meaning.
 */
export function isValidSovereigntyInteroperabilityProfileRef(
  value: unknown,
): value is SovereigntyInteroperabilityProfileRef {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  return (
    keys.length === 2
    && isNonBlankString(value.id)
    && isNonBlankString(value.version)
  );
}

/**
 * Structural check for a whole profile document.
 *
 * The canonical profile is a constant and needs no validation to be trusted;
 * this exists because a profile document may arrive from *outside* — quoted in
 * a support exchange, cached by an intermediary, or handed over by a system
 * claiming to speak this profile — and a `value as Profile` cast at that
 * boundary would let a malformed document become authoritative by assertion.
 *
 * It validates shape and the closed vocabularies, and deliberately does not
 * attempt to decide whether an unfamiliar profile is "close enough" to the
 * canonical one.
 */
export function isValidSovereigntyInteroperabilityProfileV1(
  value: unknown,
): value is SovereigntyInteroperabilityProfileV1 {
  if (!isPlainObject(value)) return false;
  if (
    value.schemaVersion !== SOVEREIGNTY_INTEROPERABILITY_PROFILE_SCHEMA_VERSION
    || !isNonBlankString(value.id)
    || !isNonBlankString(value.version)
    || !isNonBlankString(value.mediaType)
  ) {
    return false;
  }

  const representation = value.representation;
  if (
    !isPlainObject(representation)
    || !isNonBlankString(representation.schemaVersion)
    || !isNonBlankString(representation.canonicalizationProfile)
  ) {
    return false;
  }

  for (const key of [
    'artifactKinds',
    'manifestArtifactKinds',
    'claimArtifactKinds',
    'claimTypes',
    'standingStatuses',
  ] as const) {
    const entries = value[key];
    if (!Array.isArray(entries) || Array.from(entries).some((entry) => !isNonBlankString(entry))) {
      return false;
    }
  }

  const vocabulary = value.semanticVocabulary;
  return (
    isPlainObject(vocabulary)
    && isNonBlankString(vocabulary.id)
    && isNonBlankString(vocabulary.namespace)
    && Array.isArray(vocabulary.categories)
  );
}
