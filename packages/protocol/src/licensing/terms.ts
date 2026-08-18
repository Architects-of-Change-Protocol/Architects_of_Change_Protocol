import type { CanonicalPrincipalRef } from '../claims/references';
import type { CanonicalTimestamp } from '../claims/primitives';
import type { CanonicalSemanticNamespace, CanonicalSemanticTermId } from '../claims/vocabulary';

/**
 * `SovereignLicenseTermsV1` — the structured, portable terms document a
 * licensing declaration carries.
 *
 * ## What a terms document is
 *
 * A machine-readable record of what an issuer *declares* over a sovereign
 * subject: whom the declaration addresses, and a list of permission,
 * restriction and obligation clauses over semantic action concepts. That is
 * the whole model.
 *
 * ## What it is not
 *
 *     declared permission   != runtime authorization
 *     declared restriction  != enforced denial
 *     declared obligation   != proof of compliance
 *     signed terms          != legal validity
 *     issuer                != proven rights holder
 *     terms                 != ownership transfer
 *     terms                 != policy decision
 *     terms                 != access grant
 *     terms                 != DRM
 *
 * Nothing in this module evaluates, decides, resolves, enforces, meters,
 * prices or settles anything. There is no condition language, no operator, no
 * expression tree, no precedence rule and no "current terms" resolver: a
 * consuming governance system reads these declarations and reaches its own
 * conclusions, which is precisely the boundary AOC Protocol keeps.
 *
 * ## Why the version is its own field
 *
 * `schemaVersion` versions the *terms document* and nothing else. It is
 * independent of the `@aoc/protocol` package version, the AOC.LICENSING_TERMS
 * capability version, the claim id, the manifest version and the portability
 * bundle schema — those five change for five different reasons, and a
 * consumer reading terms off the wire needs to know which of them it is
 * looking at.
 */
export const SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION = 'aoc-sovereign-license-terms/1' as const;

export type SovereignLicenseTermsSchemaVersion = typeof SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION;

/**
 * Whom a terms document addresses.
 *
 * A closed union for v1. Terms nobody is addressed to are not terms, so the
 * audience is required rather than defaulted — an implicit "everyone" would be
 * Protocol inventing the most consequential clause in the document.
 */
export const SovereignLicenseTermsAudienceKind = {
  /**
   * A general/public audience.
   *
   * This says who the declaration is *addressed to* and nothing more. It does
   * **not** mean public domain, CC0, free, out of copyright, attribution-free
   * or commercially unrestricted. A `Public` audience with a
   * `Restriction`/`CommercialUse` rule is an ordinary, coherent document, and
   * no reader may infer permissions from the audience alone.
   */
  Public: 'Public',
  /** A specific principal, named through the existing canonical issuer/principal conventions. */
  Principal: 'Principal',
  /** An issuer-defined audience, carried opaquely and never resolved. */
  Custom: 'Custom',
} as const;

export type SovereignLicenseTermsAudienceKind =
  (typeof SovereignLicenseTermsAudienceKind)[keyof typeof SovereignLicenseTermsAudienceKind];

/** Every canonical audience kind, in a stable order, for validation and discovery. */
export const SOVEREIGN_LICENSE_TERMS_AUDIENCE_KINDS = Object.freeze(
  Object.values(SovereignLicenseTermsAudienceKind) as readonly SovereignLicenseTermsAudienceKind[],
);

export interface SovereignLicenseTermsPublicAudience {
  readonly kind: typeof SovereignLicenseTermsAudienceKind.Public;
}

/**
 * `principal` reuses the same `string | CanonicalPrincipalRef` shape the
 * claims layer already uses for `CanonicalIssuer` and `CanonicalSubject`.
 * There is deliberately no `LicenseeIdentity`, `LicenseHolderIdentity` or
 * `RightsPrincipal`: a second principal model for licensing is how two
 * descriptions of one party start to disagree, and redesigning
 * `PrincipalKind` is not SM-09's mission.
 *
 * Naming a principal is not authenticating, resolving or authorizing one. No
 * directory, registry, network or membership check is performed here or
 * anywhere downstream in Protocol.
 */
export interface SovereignLicenseTermsPrincipalAudience {
  readonly kind: typeof SovereignLicenseTermsAudienceKind.Principal;
  readonly principal: string | CanonicalPrincipalRef;
}

/**
 * An opaque issuer-defined audience — `{ namespace: 'example:membership', id:
 * 'premium-members' }`.
 *
 * Both halves are preserved verbatim and neither is ever interpreted: no
 * membership lookup, no group expansion, no registry, no network, no
 * inference about who is inside it. Protocol records that the issuer
 * addressed *that* audience; who belongs to it is the consuming system's
 * knowledge, not Protocol's.
 */
export interface SovereignLicenseTermsCustomAudience {
  readonly kind: typeof SovereignLicenseTermsAudienceKind.Custom;
  readonly namespace: string;
  readonly id: string;
}

export type SovereignLicenseTermsAudience =
  | SovereignLicenseTermsPublicAudience
  | SovereignLicenseTermsPrincipalAudience
  | SovereignLicenseTermsCustomAudience;

/**
 * What a clause declares.
 *
 * Closed for v1, and deliberately *not* `Allow`/`Deny`. Those words name the
 * output of a runtime decision, and a vocabulary that used them would invite
 * every reader to treat a stored declaration as an evaluated verdict. A
 * `Permission` rule issues no grant, a `Restriction` rule blocks nothing, and
 * an `Obligation` rule proves no compliance.
 */
export const SovereignLicenseTermsRuleEffect = {
  /** The issuer declares the action permitted under these terms. Not a grant. */
  Permission: 'Permission',
  /** The issuer declares the action restricted under these terms. Not an enforced denial. */
  Restriction: 'Restriction',
  /** The issuer declares the action required under these terms. Not evidence it happened. */
  Obligation: 'Obligation',
} as const;

export type SovereignLicenseTermsRuleEffect =
  (typeof SovereignLicenseTermsRuleEffect)[keyof typeof SovereignLicenseTermsRuleEffect];

/** Every canonical effect, in a stable order, for validation and discovery. */
export const SOVEREIGN_LICENSE_TERMS_RULE_EFFECTS = Object.freeze(
  Object.values(SovereignLicenseTermsRuleEffect) as readonly SovereignLicenseTermsRuleEffect[],
);

/**
 * The action concept a rule is about, named by semantic *concept* identity.
 *
 * ## Why this is not a closed enum
 *
 * A sovereign subject may be a document, a song, a dataset, an API, an AI
 * agent, a parcel of land, an external token or something nobody has modelled
 * yet. A global closed action enum would make every one of those a Protocol
 * change, so the vocabulary is open-world: `aoc.licensing` is the
 * Protocol-owned core, and any other namespace is preserved as an opaque,
 * structurally valid term.
 *
 * ## Why this is not a `CanonicalSemanticRef`
 *
 * `CanonicalSemanticRef` additionally carries an `id`, because it identifies
 * one concrete *occurrence* of a reference sitting on one artifact. Inside a
 * rule only the *concept* is needed, so minting an occurrence id for the
 * action field would create an identifier with no holder and would make two
 * rules about the very same concept look different. Claim-level
 * `semanticRefs` are generated separately, from these concepts.
 *
 * ## Why there is no URL
 *
 * A term is an identifier, never a locator. Nothing here is fetched, resolved
 * or dereferenced: no HTTP, no ontology registry, no DID, no DNS, no JSON-LD
 * context and no semantic resolver exists in this package.
 */
export interface SovereignLicenseActionRef {
  readonly namespace: CanonicalSemanticNamespace;
  readonly termRef: CanonicalSemanticTermId;
}

/**
 * One clause of a terms document.
 *
 * `id` is a caller-supplied local clause identifier, unique within one terms
 * document. Protocol mints nothing here: no UUID, no hash, no counter. It
 * exists so a later conversation ("clause R3 is the problem") can name a
 * clause, and it is deliberately *not* an identity for the declaration —
 * `LicenseTermsClaim.id` already is that, and two competing identities for one
 * assertion is how references start pointing at the wrong thing.
 *
 * `statement` is required and non-blank. It is human-readable data, recorded
 * and transported verbatim: it is never parsed, tokenized, pattern-matched or
 * turned into executable policy. There is no condition DSL in v1 — no `and`,
 * `or`, `not`, comparison operator, expression tree, CEL, Rego, Cedar, JSON
 * Logic or XACML — because a rule language is a decision engine wearing a data
 * model's clothes.
 */
export interface SovereignLicenseTermsRuleV1 {
  readonly id: string;
  readonly effect: SovereignLicenseTermsRuleEffect;
  readonly action: SovereignLicenseActionRef;
  readonly statement: string;
}

/**
 * The structured terms document itself.
 *
 * Fields deliberately absent, and why:
 *
 * - **`termsId` / `licenseId` / `agreementId`** — the assertion already has
 *   `LicenseTermsClaim.id`. A second identity for the same declaration would
 *   let two references disagree about which one is authoritative.
 * - **`createdAt` / `generatedAt` / `declaredAt`** — the claim already has
 *   `issuedAt`, and the SM-03 invocation evidence already records when the
 *   declaration was made. A third timestamp would be a third answer.
 * - **`expiresAt`** — `CanonicalClaim.expiresAt` is the one source of truth
 *   for when a declaration stops applying. A terms-level copy would be free to
 *   contradict it.
 * - **`price` / `currency` / `royaltyRate` / `fee` / `revenueShare` /
 *   `paymentSchedule` / `wallet` / `settlementAddress`** — a first-class money
 *   model carries substantial financial semantics that Protocol does not
 *   implement and must not imply. A payment expectation is expressible today
 *   as an `Obligation` over an external action concept plus a `statement`, with
 *   the instrument referenced through `evidenceRefs`; nothing is calculated,
 *   invoiced, metered or settled.
 * - **`jurisdiction` / `governingLaw`** — Protocol performs no legal
 *   interpretation and no choice-of-law evaluation, so a closed jurisdiction
 *   model would advertise an understanding it does not have.
 * - **`owner` / `copyrightOwner` / `titleHolder`** — the issuer is an
 *   *asserting* principal. Recording who declared terms is not establishing
 *   who owns anything.
 *
 * `effectiveAt` is optional and is **never** defaulted. It is when the issuer
 * says the terms begin applying, which is a different fact from `issuedAt` —
 * when the claim was recorded. Terms issued on 2026-08-18 that take effect on
 * 2026-09-01 are an ordinary case, and quietly setting one from the other
 * would invent a declaration nobody made. Absent means absent.
 *
 * `rules` is required, non-empty and order-preserving. The array is the
 * issuer's authored sequence: nothing sorts, deduplicates or normalizes it.
 * Canonical JSON canonicalizes object keys, not the semantic order of a
 * caller's list.
 */
export interface SovereignLicenseTermsV1 {
  readonly schemaVersion: SovereignLicenseTermsSchemaVersion;
  readonly audience: SovereignLicenseTermsAudience;
  readonly effectiveAt?: CanonicalTimestamp;
  readonly rules: readonly SovereignLicenseTermsRuleV1[];
}
