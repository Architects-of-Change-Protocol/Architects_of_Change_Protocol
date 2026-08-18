/**
 * `@aoc/protocol/licensing` — the structured, portable sovereign license terms
 * model: what an issuer declares over a sovereign subject, expressed so a
 * machine can read it, carry it and describe it.
 *
 * SM-08 answered "can an independent party check the proof?". This subpath
 * answers a different question: what does the issuer actually *say* about this
 * subject, in a form that survives transport and advertises the semantics a
 * receiving system needs in order to understand it?
 *
 * The licensing *data contracts* live here; the production AOC.LICENSING_TERMS
 * capsule that runs `declare-license-terms`, `validate-license-terms` and
 * `contest-license-terms-claim` through the common SM-03 invocation and
 * evidence spine lives in `@aoc/protocol/sovereignty-capabilities`. This mirrors
 * the existing split between `@aoc/protocol/portability`,
 * `@aoc/protocol/interoperability` and their capsules, so the terms model,
 * builder and validators stay usable on their own and no contract is defined
 * twice across two surfaces.
 *
 * ## The boundary this module exists to hold
 *
 *     declared permission   != runtime authorization
 *     declared restriction  != enforced denial
 *     declared obligation   != proof of compliance
 *     signed license claim  != legal validity
 *     issuer declares rights!= issuer proven to hold rights
 *     license terms         != ownership transfer
 *     license terms         != policy decision
 *     license terms         != access grant
 *     license terms         != DRM
 *
 * AOC Protocol records what someone declares. It does not decide whether an
 * action is allowed, grant access, enforce a restriction, determine legal
 * ownership, calculate royalties or resolve conflicting declarations. AOC
 * Enterprise or another external governance system may later *consume* these
 * terms and reach its own decisions; that consumption is outside Protocol.
 *
 * Importing this module has no side effects: nothing is minted, no clock is
 * read, no file is opened, no connection is made, nothing is registered and
 * nothing is written. The canonical vocabulary is a frozen constant evaluated
 * once, from other constants.
 */
export {
  SOVEREIGN_LICENSE_TERMS_AUDIENCE_KINDS,
  SOVEREIGN_LICENSE_TERMS_RULE_EFFECTS,
  SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
  SovereignLicenseTermsAudienceKind,
  SovereignLicenseTermsRuleEffect,
} from './terms';
export type {
  SovereignLicenseActionRef,
  SovereignLicenseTermsAudience,
  SovereignLicenseTermsCustomAudience,
  SovereignLicenseTermsPrincipalAudience,
  SovereignLicenseTermsPublicAudience,
  SovereignLicenseTermsRuleV1,
  SovereignLicenseTermsSchemaVersion,
  SovereignLicenseTermsV1,
} from './terms';

export {
  AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY,
  AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY_ID,
  AOC_LICENSING_ACTION_TERM_IDS,
  AOC_LICENSING_DECLARATION_TERM_IDS,
  AOC_LICENSING_SEMANTIC_CATEGORIES,
  AOC_LICENSING_SEMANTIC_CATEGORY_IDS,
  AOC_LICENSING_SEMANTIC_NAMESPACE,
  AOC_LICENSING_SEMANTIC_TERM_IDS,
  AOC_LICENSING_SEMANTIC_TERMS,
  getAocLicensingSemanticTerm,
  isAocLicensingActionTermId,
} from './vocabulary';
export type {
  AocLicensingActionTermId,
  AocLicensingDeclarationTermId,
  AocLicensingSemanticTermId,
} from './vocabulary';

export {
  isValidSovereignLicenseActionRef,
  isValidSovereignLicenseTermsAudience,
  isValidSovereignLicenseTermsRuleEffect,
  isValidSovereignLicenseTermsRuleV1,
  isValidSovereignLicenseTermsV1,
  validateSovereignLicenseActionRef,
  validateSovereignLicenseTermsAudience,
  validateSovereignLicenseTermsRuleV1,
  validateSovereignLicenseTermsV1,
} from './validation';

export {
  buildLicenseTermsClaim,
  buildLicenseTermsSemanticRefs,
  isValidLicenseTermsClaim,
  licenseTermsSemanticConcepts,
  validateLicenseTermsClaim,
} from './claim';
export type { BuildLicenseTermsClaimInput, LicenseTermsClaim } from './claim';

export { LICENSING_TERMS_REASON_CODES } from './reason-codes';
export type { LicensingTermsReasonCode, LicensingTermsValidationResult } from './reason-codes';
