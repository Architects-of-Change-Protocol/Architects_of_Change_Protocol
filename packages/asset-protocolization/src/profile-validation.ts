import { AttestationType, ClaimType, EvidenceType } from '@aoc/protocol/claims';

import {
  isNonEmptyUniqueJurisdictionList,
  isNonEmptyUniqueMemberList,
  isNonEmptyUniqueTokenList,
  isValidAssetAttesterConstraint,
  isValidAssetCredentialConstraint,
  isValidAssetRegistryConstraint,
} from './constraints';
import { isValidAssetFreshnessConstraint } from './freshness';
import {
  isValidAssetCategoryId,
  isValidAssetProfileId,
  isValidAssetProfileVersion,
  isValidAssetRequirementConditionId,
  isValidAssetRequirementId,
  isValidAssetVerificationCheckId,
} from './identifiers';
import { GLOBAL_JURISDICTION_CODE } from './jurisdiction';
import { isValidAssetProfileMetadata } from './metadata';
import { ASSET_PROFILE_SCHEMA_VERSION, AssetProfileScope } from './profile';
import type { AssetProfile } from './profile';
import {
  AssetIdentityStrategy,
  AssetRequirementKind,
  AssetRequirementObligation,
  AssetRequirementSatisfaction,
} from './requirements';
import type { AssetRequirement } from './requirements';

/**
 * Structural and cross-field validation for an `AssetProfile`.
 *
 * Follows the repository's established validator contract — `{ valid, reasons }`
 * with stable SCREAMING_SNAKE codes, shape only, fail-closed, and a
 * present-but-`undefined` optional treated as invalid rather than absent
 * (`validateSovereignManifestV1`, `validateCanonicalStanding`,
 * `validateSovereignExternalReference`). `issues` is an additive projection that
 * pairs each reason with the path it was raised at, because a profile is a
 * composite document and a bare code cannot say *which* requirement is wrong.
 *
 * It validates a profile as a *document*. It never decides whether the
 * requirements it describes are legally sufficient, sensible for the asset
 * category, or satisfied by any particular case — the first two are a human
 * judgement made when a profile is authored, and the third belongs to APV-04.
 */
export const ASSET_PROFILE_VALIDATION_CODES = Object.freeze({
  invalidStructure: 'INVALID_PROFILE_STRUCTURE',
  unsupportedSchemaVersion: 'UNSUPPORTED_PROFILE_SCHEMA_VERSION',
  unknownProfileField: 'UNKNOWN_PROFILE_FIELD',
  invalidProfileId: 'INVALID_PROFILE_ID',
  invalidProfileVersion: 'INVALID_PROFILE_VERSION',
  invalidAssetCategory: 'INVALID_ASSET_CATEGORY',
  invalidProfileScope: 'INVALID_PROFILE_SCOPE',
  invalidProfileJurisdictions: 'INVALID_PROFILE_JURISDICTIONS',
  invalidProfileMetadata: 'INVALID_PROFILE_METADATA',
  emptyRequirementSet: 'EMPTY_REQUIREMENT_SET',
  invalidRequirementStructure: 'INVALID_REQUIREMENT_STRUCTURE',
  unknownRequirementField: 'UNKNOWN_REQUIREMENT_FIELD',
  invalidRequirementId: 'INVALID_REQUIREMENT_ID',
  duplicateRequirementId: 'DUPLICATE_REQUIREMENT_ID',
  unsupportedRequirementKind: 'UNSUPPORTED_REQUIREMENT_KIND',
  invalidRequirementObligation: 'INVALID_REQUIREMENT_OBLIGATION',
  missingRequirementCondition: 'MISSING_REQUIREMENT_CONDITION',
  unexpectedRequirementCondition: 'UNEXPECTED_REQUIREMENT_CONDITION',
  invalidRequirementCondition: 'INVALID_REQUIREMENT_CONDITION',
  unknownRequirementReference: 'UNKNOWN_REQUIREMENT_REFERENCE',
  selfReferentialCondition: 'SELF_REFERENTIAL_REQUIREMENT_CONDITION',
  invalidRequirementJurisdictions: 'INVALID_REQUIREMENT_JURISDICTIONS',
  jurisdictionOutsideProfileScope: 'REQUIREMENT_JURISDICTION_OUTSIDE_PROFILE_SCOPE',
  invalidRequirementMetadata: 'INVALID_REQUIREMENT_METADATA',
  invalidIdentityStrategies: 'INVALID_IDENTITY_STRATEGIES',
  invalidRequirementSatisfaction: 'INVALID_REQUIREMENT_SATISFACTION',
  invalidRegistryConstraint: 'INVALID_REGISTRY_CONSTRAINT',
  unexpectedRegistryConstraint: 'UNEXPECTED_REGISTRY_CONSTRAINT',
  invalidClaimType: 'INVALID_CLAIM_TYPE',
  missingClaimSubtype: 'MISSING_CLAIM_SUBTYPE',
  invalidClaimSubtype: 'INVALID_CLAIM_SUBTYPE',
  invalidMinimumCount: 'INVALID_MINIMUM_COUNT',
  invalidEvidenceTypes: 'INVALID_EVIDENCE_TYPES',
  invalidEvidenceSubtypes: 'INVALID_EVIDENCE_SUBTYPES',
  missingEvidenceSubtypes: 'MISSING_EVIDENCE_SUBTYPES',
  invalidCredentialConstraint: 'INVALID_CREDENTIAL_CONSTRAINT',
  invalidFreshnessConstraint: 'INVALID_FRESHNESS_CONSTRAINT',
  invalidVerificationCheckIds: 'INVALID_VERIFICATION_CHECK_IDS',
  invalidAttestationTypes: 'INVALID_ATTESTATION_TYPES',
  invalidAttesterConstraint: 'INVALID_ATTESTER_CONSTRAINT',
  contradictoryIdentityStrategy: 'CONTRADICTORY_IDENTITY_STRATEGY',
  contradictoryMinimumCount: 'CONTRADICTORY_OBLIGATION_MINIMUM_COUNT',
  contradictoryConditionDependency: 'CONTRADICTORY_CONDITION_DEPENDENCY',
} as const);

export type AssetProfileValidationCode =
  (typeof ASSET_PROFILE_VALIDATION_CODES)[keyof typeof ASSET_PROFILE_VALIDATION_CODES];

export interface AssetProfileValidationIssue {
  readonly code: AssetProfileValidationCode;
  /** Where in the profile document the issue was raised, e.g. `requirements[2].id`. */
  readonly path: string;
}

export interface AssetProfileValidationResult {
  readonly valid: boolean;
  /** Repository-standard reason projection — exactly `issues.map((issue) => issue.code)`. */
  readonly reasons: readonly string[];
  readonly issues: readonly AssetProfileValidationIssue[];
}

const PROFILE_KEYS: readonly string[] = [
  'schemaVersion',
  'profileId',
  'version',
  'assetCategory',
  'scope',
  'jurisdictions',
  'requirements',
  'metadata',
];

const REQUIREMENT_BASE_KEYS: readonly string[] = [
  'id',
  'kind',
  'obligation',
  'condition',
  'jurisdictions',
  'metadata',
];

const REQUIREMENT_KEYS_BY_KIND: Readonly<Record<AssetRequirementKind, readonly string[]>> = Object.freeze({
  [AssetRequirementKind.Identity]: [...REQUIREMENT_BASE_KEYS, 'acceptedStrategies', 'satisfaction', 'registry', 'freshness'],
  [AssetRequirementKind.Declaration]: [...REQUIREMENT_BASE_KEYS, 'claimType', 'claimSubtype', 'minimumCount'],
  [AssetRequirementKind.Evidence]: [
    ...REQUIREMENT_BASE_KEYS,
    'acceptedTypes',
    'acceptedSubtypes',
    'minimumCount',
    'registry',
    'credential',
    'freshness',
  ],
  [AssetRequirementKind.Verification]: [...REQUIREMENT_BASE_KEYS, 'checkIds', 'satisfaction', 'freshness'],
  [AssetRequirementKind.Attestation]: [
    ...REQUIREMENT_BASE_KEYS,
    'acceptedTypes',
    'attester',
    'minimumCount',
    'freshness',
  ],
});

const CONDITION_KEYS: readonly string[] = ['conditionId', 'dependsOn'];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

class IssueCollector {
  private readonly collected: AssetProfileValidationIssue[] = [];

  add(code: AssetProfileValidationCode, path: string): void {
    this.collected.push({ code, path });
  }

  result(): AssetProfileValidationResult {
    const issues: readonly AssetProfileValidationIssue[] = [...this.collected];
    return {
      valid: issues.length === 0,
      reasons: issues.map((issue) => issue.code),
      issues,
    };
  }
}

function validateFreshness(
  candidate: Record<string, unknown>,
  path: string,
  issues: IssueCollector,
): void {
  if (hasOwn(candidate, 'freshness') && !isValidAssetFreshnessConstraint(candidate.freshness)) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidFreshnessConstraint, `${path}.freshness`);
  }
}

function validateMinimumCount(
  candidate: Record<string, unknown>,
  obligation: unknown,
  path: string,
  issues: IssueCollector,
): void {
  if (!hasOwn(candidate, 'minimumCount')) return;
  if (!isPositiveInteger(candidate.minimumCount)) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidMinimumCount, `${path}.minimumCount`);
    return;
  }
  // A requirement the profile declares as not required cannot simultaneously
  // demand a minimum number of records.
  if (obligation === AssetRequirementObligation.NotRequired) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.contradictoryMinimumCount, `${path}.minimumCount`);
  }
}

function validateSatisfaction(
  candidate: Record<string, unknown>,
  path: string,
  issues: IssueCollector,
): void {
  if (!Object.values(AssetRequirementSatisfaction).includes(candidate.satisfaction as AssetRequirementSatisfaction)) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidRequirementSatisfaction, `${path}.satisfaction`);
  }
}

function validateRequirementShape(
  candidate: Record<string, unknown>,
  path: string,
  issues: IssueCollector,
): void {
  const kind = candidate.kind as AssetRequirementKind;
  const obligation = candidate.obligation;

  switch (kind) {
    case AssetRequirementKind.Identity: {
      if (!isNonEmptyUniqueMemberList(candidate.acceptedStrategies, AssetIdentityStrategy)) {
        issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidIdentityStrategies, `${path}.acceptedStrategies`);
      }
      validateSatisfaction(candidate, path, issues);
      if (hasOwn(candidate, 'registry')) {
        if (!isValidAssetRegistryConstraint(candidate.registry)) {
          issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidRegistryConstraint, `${path}.registry`);
        } else if (
          !Array.isArray(candidate.acceptedStrategies) ||
          !candidate.acceptedStrategies.includes(AssetIdentityStrategy.RegistryEntry)
        ) {
          // Constraining a registry the requirement never accepts is dead
          // configuration that would silently never be applied.
          issues.add(ASSET_PROFILE_VALIDATION_CODES.unexpectedRegistryConstraint, `${path}.registry`);
        }
      }
      validateFreshness(candidate, path, issues);
      return;
    }

    case AssetRequirementKind.Declaration: {
      const claimType = candidate.claimType;
      const claimTypeValid = Object.values(ClaimType).includes(claimType as ClaimType);
      if (!claimTypeValid) {
        issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidClaimType, `${path}.claimType`);
      }
      if (hasOwn(candidate, 'claimSubtype')) {
        if (typeof candidate.claimSubtype !== 'string' || candidate.claimSubtype.trim() === '') {
          issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidClaimSubtype, `${path}.claimSubtype`);
        }
      } else if (claimTypeValid && claimType === ClaimType.Custom) {
        // `ClaimType.Custom` on its own names nothing a later slice could match
        // a supplied claim against.
        issues.add(ASSET_PROFILE_VALIDATION_CODES.missingClaimSubtype, `${path}.claimSubtype`);
      }
      validateMinimumCount(candidate, obligation, path, issues);
      return;
    }

    case AssetRequirementKind.Evidence: {
      const typesValid = isNonEmptyUniqueMemberList(candidate.acceptedTypes, EvidenceType);
      if (!typesValid) {
        issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidEvidenceTypes, `${path}.acceptedTypes`);
      }
      if (hasOwn(candidate, 'acceptedSubtypes')) {
        if (!isNonEmptyUniqueTokenList(candidate.acceptedSubtypes)) {
          issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidEvidenceSubtypes, `${path}.acceptedSubtypes`);
        }
      } else if (typesValid && (candidate.acceptedTypes as readonly EvidenceType[]).includes(EvidenceType.Custom)) {
        issues.add(ASSET_PROFILE_VALIDATION_CODES.missingEvidenceSubtypes, `${path}.acceptedSubtypes`);
      }
      validateMinimumCount(candidate, obligation, path, issues);
      if (hasOwn(candidate, 'registry') && !isValidAssetRegistryConstraint(candidate.registry)) {
        issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidRegistryConstraint, `${path}.registry`);
      }
      if (hasOwn(candidate, 'credential') && !isValidAssetCredentialConstraint(candidate.credential)) {
        issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidCredentialConstraint, `${path}.credential`);
      }
      validateFreshness(candidate, path, issues);
      return;
    }

    case AssetRequirementKind.Verification: {
      const checkIds = candidate.checkIds;
      const checkIdsValid =
        Array.isArray(checkIds) &&
        checkIds.length > 0 &&
        checkIds.every((checkId) => isValidAssetVerificationCheckId(checkId)) &&
        new Set(checkIds).size === checkIds.length;
      if (!checkIdsValid) {
        issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidVerificationCheckIds, `${path}.checkIds`);
      }
      validateSatisfaction(candidate, path, issues);
      validateFreshness(candidate, path, issues);
      return;
    }

    case AssetRequirementKind.Attestation: {
      if (!isNonEmptyUniqueMemberList(candidate.acceptedTypes, AttestationType)) {
        issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidAttestationTypes, `${path}.acceptedTypes`);
      }
      if (hasOwn(candidate, 'attester') && !isValidAssetAttesterConstraint(candidate.attester)) {
        issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidAttesterConstraint, `${path}.attester`);
      }
      validateMinimumCount(candidate, obligation, path, issues);
      validateFreshness(candidate, path, issues);
      return;
    }

    default:
      // Unreachable: `kind` was checked against the closed set before dispatch.
      return;
  }
}

function validateRequirement(
  value: unknown,
  index: number,
  issues: IssueCollector,
  seenIds: Set<string>,
): void {
  const path = `requirements[${index}]`;
  if (!isPlainObject(value)) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidRequirementStructure, path);
    return;
  }

  const kindValid = Object.values(AssetRequirementKind).includes(value.kind as AssetRequirementKind);
  if (!kindValid) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.unsupportedRequirementKind, `${path}.kind`);
  }

  const allowedKeys = kindValid
    ? REQUIREMENT_KEYS_BY_KIND[value.kind as AssetRequirementKind]
    : REQUIREMENT_BASE_KEYS;
  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) {
      issues.add(ASSET_PROFILE_VALIDATION_CODES.unknownRequirementField, `${path}.${key}`);
    }
  }

  if (!isValidAssetRequirementId(value.id)) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidRequirementId, `${path}.id`);
  } else if (seenIds.has(value.id)) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.duplicateRequirementId, `${path}.id`);
  } else {
    seenIds.add(value.id);
  }

  const obligationValid = Object.values(AssetRequirementObligation).includes(
    value.obligation as AssetRequirementObligation,
  );
  if (!obligationValid) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidRequirementObligation, `${path}.obligation`);
  }

  if (hasOwn(value, 'condition')) {
    if (obligationValid && value.obligation !== AssetRequirementObligation.Conditional) {
      issues.add(ASSET_PROFILE_VALIDATION_CODES.unexpectedRequirementCondition, `${path}.condition`);
    }
    const condition = value.condition;
    if (!isPlainObject(condition) || !Object.keys(condition).every((key) => CONDITION_KEYS.includes(key))) {
      issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidRequirementCondition, `${path}.condition`);
    } else {
      if (!isValidAssetRequirementConditionId(condition.conditionId)) {
        issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidRequirementCondition, `${path}.condition.conditionId`);
      }
      if (hasOwn(condition, 'dependsOn')) {
        const dependsOn = condition.dependsOn;
        const dependsOnValid =
          Array.isArray(dependsOn) &&
          dependsOn.length > 0 &&
          dependsOn.every((entry) => isValidAssetRequirementId(entry)) &&
          new Set(dependsOn).size === dependsOn.length;
        if (!dependsOnValid) {
          issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidRequirementCondition, `${path}.condition.dependsOn`);
        }
      }
    }
  } else if (obligationValid && value.obligation === AssetRequirementObligation.Conditional) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.missingRequirementCondition, `${path}.condition`);
  }

  if (hasOwn(value, 'jurisdictions') && !isNonEmptyUniqueJurisdictionList(value.jurisdictions)) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidRequirementJurisdictions, `${path}.jurisdictions`);
  }

  if (hasOwn(value, 'metadata') && !isValidAssetProfileMetadata(value.metadata)) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidRequirementMetadata, `${path}.metadata`);
  }

  if (kindValid) {
    validateRequirementShape(value, path, issues);
  }
}

/**
 * Cross-requirement rules. These are the contradictions that are *mechanically*
 * detectable from the document alone; a profile can still be substantively wrong
 * in ways only a human author can see, and this validator never pretends
 * otherwise.
 */
function validateCrossRequirementRules(
  requirements: readonly Record<string, unknown>[],
  issues: IssueCollector,
): void {
  const declaredIds = new Set<string>();
  for (const requirement of requirements) {
    if (typeof requirement.id === 'string') declaredIds.add(requirement.id);
  }

  const notRequiredIds = new Set<string>();
  for (const requirement of requirements) {
    if (typeof requirement.id === 'string' && requirement.obligation === AssetRequirementObligation.NotRequired) {
      notRequiredIds.add(requirement.id);
    }
  }

  const mandatedStrategies = new Set<string>();

  requirements.forEach((requirement, index) => {
    const path = `requirements[${index}]`;

    const condition = requirement.condition;
    if (isPlainObject(condition) && Array.isArray(condition.dependsOn)) {
      condition.dependsOn.forEach((reference, referenceIndex) => {
        const referencePath = `${path}.condition.dependsOn[${referenceIndex}]`;
        if (typeof reference !== 'string') return;
        if (reference === requirement.id) {
          issues.add(ASSET_PROFILE_VALIDATION_CODES.selfReferentialCondition, referencePath);
          return;
        }
        if (!declaredIds.has(reference)) {
          issues.add(ASSET_PROFILE_VALIDATION_CODES.unknownRequirementReference, referencePath);
          return;
        }
        if (notRequiredIds.has(reference)) {
          // A condition expressed over material the same profile declares will
          // never be required can never become true.
          issues.add(ASSET_PROFILE_VALIDATION_CODES.contradictoryConditionDependency, referencePath);
        }
      });
    }

    if (requirement.kind !== AssetRequirementKind.Identity) return;
    const strategies = requirement.acceptedStrategies;
    if (!Array.isArray(strategies)) return;

    if (requirement.obligation !== AssetRequirementObligation.Required) return;
    // A strategy is *mandated* only when satisfying the requirement is
    // impossible without it: either every listed strategy is demanded, or there
    // is exactly one to choose from.
    const mandated =
      requirement.satisfaction === AssetRequirementSatisfaction.All || strategies.length === 1;
    if (!mandated) return;
    for (const strategy of strategies) {
      if (typeof strategy === 'string') mandatedStrategies.add(strategy);
    }
  });

  requirements.forEach((requirement, index) => {
    if (requirement.kind !== AssetRequirementKind.Identity) return;
    if (requirement.obligation !== AssetRequirementObligation.NotRequired) return;
    const strategies = requirement.acceptedStrategies;
    if (!Array.isArray(strategies)) return;
    for (const strategy of strategies) {
      if (typeof strategy === 'string' && mandatedStrategies.has(strategy)) {
        issues.add(
          ASSET_PROFILE_VALIDATION_CODES.contradictoryIdentityStrategy,
          `requirements[${index}].acceptedStrategies`,
        );
        return;
      }
    }
  });
}

function validateJurisdictionScope(
  profileJurisdictions: unknown,
  requirements: readonly Record<string, unknown>[],
  issues: IssueCollector,
): void {
  if (!isNonEmptyUniqueJurisdictionList(profileJurisdictions)) return;
  const codes = new Set(profileJurisdictions.map((jurisdiction) => jurisdiction.code));
  // `GLOBAL` is the conventional wildcard: a globally-scoped profile places no
  // jurisdictional restriction on its requirements. This is the only place the
  // framework reads a jurisdiction *value*, and it reads it as scope, never as
  // a legal fact.
  if (codes.has(GLOBAL_JURISDICTION_CODE)) return;

  requirements.forEach((requirement, index) => {
    const jurisdictions = requirement.jurisdictions;
    if (!isNonEmptyUniqueJurisdictionList(jurisdictions)) return;
    jurisdictions.forEach((jurisdiction, jurisdictionIndex) => {
      if (codes.has(jurisdiction.code)) return;
      issues.add(
        ASSET_PROFILE_VALIDATION_CODES.jurisdictionOutsideProfileScope,
        `requirements[${index}].jurisdictions[${jurisdictionIndex}]`,
      );
    });
  });
}

export function validateAssetProfile(value: unknown): AssetProfileValidationResult {
  const issues = new IssueCollector();

  if (!isPlainObject(value)) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidStructure, '');
    return issues.result();
  }

  for (const key of Object.keys(value)) {
    if (!PROFILE_KEYS.includes(key)) {
      issues.add(ASSET_PROFILE_VALIDATION_CODES.unknownProfileField, key);
    }
  }

  if (value.schemaVersion !== ASSET_PROFILE_SCHEMA_VERSION) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.unsupportedSchemaVersion, 'schemaVersion');
  }
  if (!isValidAssetProfileId(value.profileId)) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidProfileId, 'profileId');
  }
  if (!isValidAssetProfileVersion(value.version)) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidProfileVersion, 'version');
  }
  if (!isValidAssetCategoryId(value.assetCategory)) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidAssetCategory, 'assetCategory');
  }
  if (!Object.values(AssetProfileScope).includes(value.scope as AssetProfileScope)) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidProfileScope, 'scope');
  }
  if (hasOwn(value, 'jurisdictions') && !isNonEmptyUniqueJurisdictionList(value.jurisdictions)) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidProfileJurisdictions, 'jurisdictions');
  }
  if (hasOwn(value, 'metadata') && !isValidAssetProfileMetadata(value.metadata)) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.invalidProfileMetadata, 'metadata');
  }

  const requirements = value.requirements;
  if (!Array.isArray(requirements) || requirements.length === 0) {
    issues.add(ASSET_PROFILE_VALIDATION_CODES.emptyRequirementSet, 'requirements');
    return issues.result();
  }

  const seenIds = new Set<string>();
  requirements.forEach((requirement, index) => validateRequirement(requirement, index, issues, seenIds));

  const objectRequirements = requirements.filter(isPlainObject);
  validateCrossRequirementRules(objectRequirements, issues);
  validateJurisdictionScope(value.jurisdictions, objectRequirements, issues);

  return issues.result();
}

export function isValidAssetProfile(value: unknown): value is AssetProfile {
  return validateAssetProfile(value).valid;
}

/** Narrowing helper for consumers that already hold a validated profile. */
export function isAssetRequirementOfKind<TKind extends AssetRequirementKind>(
  requirement: AssetRequirement,
  kind: TKind,
): requirement is Extract<AssetRequirement, { readonly kind: TKind }> {
  return requirement.kind === kind;
}
