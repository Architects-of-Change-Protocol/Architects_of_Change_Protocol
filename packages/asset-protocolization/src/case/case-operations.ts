import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';

import { isValidUtcDateTime } from '../freshness';
import type { AssetRequirementId } from '../identifiers';
import type { AssetProfile } from '../profile';
import type { AssetProfileCatalog } from '../profile-catalog';
import type { ProtocolizationClock } from './case-clock';
import { PROTOCOLIZATION_CASE_ERROR_CODES, ProtocolizationCaseError } from './case-errors';
import { PROTOCOLIZATION_CASE_EVENT_TYPES } from './case-events';
import type { ProtocolizationCaseEvent } from './case-events';
import { deepFreeze } from './case-freeze';
import {
  isValidProtocolizationCaseId,
  isValidProtocolizationProfileRef,
  isValidProtocolizationTenantId,
} from './case-identifiers';
import type {
  ProtocolizationCaseId,
  ProtocolizationMaterialId,
  ProtocolizationProfileRef,
  ProtocolizationTenantId,
} from './case-identifiers';
import { isValidProtocolizationCaseMaterial } from './case-material';
import type { ProtocolizationCaseMaterial } from './case-material';
import {
  INITIAL_PROTOCOLIZATION_CASE_STATE,
  ProtocolizationCaseState,
  ProtocolizationRequirementMaterialStatus,
  acceptsProtocolizationMaterial,
  isAllowedProtocolizationCaseTransition,
} from './case-state';
import { isValidProtocolizationCaseSubject } from './case-subject';
import { PROTOCOLIZATION_CASE_VALIDATION_CODES, validateProtocolizationCase } from './case-validation';
import type { ProtocolizationCaseSubject } from './case-subject';
import { PROTOCOLIZATION_CASE_SCHEMA_VERSION } from './protocolization-case';
import type { ProtocolizationCase, ProtocolizationCaseRequirementState } from './protocolization-case';

/**
 * Every deterministic operation a `ProtocolizationCase` supports.
 *
 * Pure functions over an immutable aggregate: each takes a case, returns a new
 * case plus the one event the transition produced, and mutates nothing. There is
 * no `case.state = ...` anywhere, no setter and no method, so an illegal
 * transition is not something a caller can express — it is something an
 * operation refuses.
 *
 * Nothing here performs I/O. No network call, no database call, no registry
 * lookup, no credential check, no policy evaluation and no tokenizer
 * invocation: the only outside world these functions touch is the clock and the
 * profile catalogue, both injected. That is what keeps the aggregate testable
 * and what keeps infrastructure behind ports where the ADR put it.
 */

/**
 * What an operation needs beyond the case itself.
 *
 * `tenantId` is the *acting* tenant, and it is a parameter rather than a
 * property of the case for a reason: an operation that read the tenant off the
 * case it was handed could never detect a cross-tenant call, because the answer
 * would always agree with itself. Passing the caller's tenant separately is what
 * makes `tenant B mutates tenant A's case` a rejectable event rather than an
 * invisible one.
 */
export interface ProtocolizationCaseContext {
  /** Resolves the exact pinned profile version. Never asked for a latest version. */
  readonly catalog: AssetProfileCatalog;
  readonly clock: ProtocolizationClock;
  readonly tenantId: ProtocolizationTenantId;
}

/** A successful operation: the new aggregate, and the fact it produced. */
export interface ProtocolizationCaseTransition {
  readonly protocolizationCase: ProtocolizationCase;
  readonly event: ProtocolizationCaseEvent;
}

export interface CreateProtocolizationCaseInput {
  readonly caseId: ProtocolizationCaseId;
  /** The exact profile version to pin. Resolved at creation; never re-resolved. */
  readonly profile: ProtocolizationProfileRef;
  readonly subject: ProtocolizationCaseSubject;
  readonly correlationId?: CanonicalId;
}

/** A material association without its `addedAt`, which the clock supplies. */
type WithoutAddedAt<T> = T extends unknown ? Omit<T, 'addedAt'> : never;
export type ProtocolizationCaseMaterialInput = WithoutAddedAt<ProtocolizationCaseMaterial>;

export interface AssociateProtocolizationMaterialInput {
  readonly materialId: ProtocolizationMaterialId;
  /** Requirements to add. Every one must be new for this material. */
  readonly requirementIds: readonly AssetRequirementId[];
}

export interface CancelProtocolizationCaseInput {
  /** Presentation only. Never read by machine semantics. */
  readonly reason?: string;
}

const MAX_CANCELLATION_REASON_LENGTH = 1024;

function fail(
  code: (typeof PROTOCOLIZATION_CASE_ERROR_CODES)[keyof typeof PROTOCOLIZATION_CASE_ERROR_CODES],
  message: string,
  details: ConstructorParameters<typeof ProtocolizationCaseError>[2],
): never {
  throw new ProtocolizationCaseError(code, message, details);
}

function assertActingTenant(context: ProtocolizationCaseContext): ProtocolizationTenantId {
  if (!isValidProtocolizationTenantId(context.tenantId)) {
    fail(PROTOCOLIZATION_CASE_ERROR_CODES.invalidTenant, 'A non-blank acting tenantId is required', {
      reasonCodes: [PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidTenantId],
    });
  }
  return context.tenantId;
}

/**
 * Re-validates the aggregate before touching it, then checks the tenant.
 *
 * The aggregate is re-validated on every operation because it may have arrived
 * from a store, from a network boundary, or from a caller that built it by
 * hand. Operating on a case whose invariants are already broken would produce a
 * new case that is broken in a different way, and the error would surface far
 * from its cause.
 */
function assertOperableCase(
  context: ProtocolizationCaseContext,
  protocolizationCase: ProtocolizationCase,
): ProtocolizationCase {
  const validation = validateProtocolizationCase(protocolizationCase);
  if (!validation.valid) {
    fail(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase,
      `Invalid ProtocolizationCase: ${validation.reasons.join(', ')}`,
      { reasonCodes: validation.reasons },
    );
  }

  const actingTenant = assertActingTenant(context);
  if (protocolizationCase.tenantId !== actingTenant) {
    fail(
      PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch,
      'The acting tenant does not own this ProtocolizationCase',
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch],
        caseId: protocolizationCase.caseId,
        tenantId: actingTenant,
      },
    );
  }
  return protocolizationCase;
}

/**
 * Resolves the exact pinned version and nothing else.
 *
 * There is no fallback to a latest, current or nearest version anywhere in this
 * package. A profile that has been withdrawn from a catalogue makes its cases
 * fail loudly rather than quietly reassessing them under different rules.
 */
function resolvePinnedProfile(
  context: ProtocolizationCaseContext,
  ref: ProtocolizationProfileRef,
  caseId?: ProtocolizationCaseId,
): AssetProfile {
  const resolved = context.catalog.get(ref.profileId, ref.profileVersion);
  if (resolved === undefined) {
    fail(
      PROTOCOLIZATION_CASE_ERROR_CODES.profileNotFound,
      `No AssetProfile ${ref.profileId}@${ref.profileVersion} is catalogued`,
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.profileNotFound],
        profile: ref,
        ...(caseId === undefined ? {} : { caseId }),
      },
    );
  }
  return resolved;
}

/**
 * Reads the clock and refuses anything that is not a canonical UTC instant, or
 * that would move the case backwards in time. A monotonicity break is a
 * misconfigured clock, and accepting one would produce an aggregate whose own
 * history contradicts itself.
 */
function readClock(context: ProtocolizationCaseContext, notBefore?: UtcDateTime): UtcDateTime {
  const now = context.clock.now();
  if (!isValidUtcDateTime(now)) {
    fail(PROTOCOLIZATION_CASE_ERROR_CODES.invalidTimestamp, 'The clock returned a non-canonical instant', {
      reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.invalidTimestamp],
    });
  }
  if (notBefore !== undefined && Date.parse(now) < Date.parse(notBefore)) {
    fail(PROTOCOLIZATION_CASE_ERROR_CODES.invalidTimestamp, 'The clock moved backwards', {
      reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.invalidTimestamp],
    });
  }
  return now;
}

function assertKnownRequirements(
  requirementIds: readonly AssetRequirementId[],
  profile: AssetProfile,
  protocolizationCase: ProtocolizationCase,
): void {
  if (requirementIds.length === 0) {
    fail(
      PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement,
      'At least one requirement id is required',
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement],
        caseId: protocolizationCase.caseId,
        requirementIds,
      },
    );
  }
  if (new Set(requirementIds).size !== requirementIds.length) {
    fail(PROTOCOLIZATION_CASE_ERROR_CODES.duplicateAssociation, 'Duplicate requirement id', {
      reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.duplicateAssociation],
      caseId: protocolizationCase.caseId,
      requirementIds,
    });
  }
  // Checked against the pinned profile *and* the case's own projection. The two
  // agree by construction, and checking both is what makes a requirement id
  // borrowed from a different profile version fail rather than accumulate.
  const declared = new Set(profile.requirements.map((requirement) => requirement.id));
  const projected = new Set(protocolizationCase.requirementStates.map((state) => state.requirementId));
  const unknown = requirementIds.filter((id) => !declared.has(id) || !projected.has(id));
  if (unknown.length > 0) {
    fail(
      PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement,
      `Requirement not declared by ${protocolizationCase.profile.profileId}@${protocolizationCase.profile.profileVersion}: ${unknown.join(', ')}`,
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement],
        caseId: protocolizationCase.caseId,
        profile: protocolizationCase.profile,
        requirementIds: unknown,
      },
    );
  }
}

/** Adds one material id to each named requirement's state, in association order. */
function correlate(
  requirementStates: readonly ProtocolizationCaseRequirementState[],
  requirementIds: readonly AssetRequirementId[],
  materialId: ProtocolizationMaterialId,
  at: UtcDateTime,
): readonly ProtocolizationCaseRequirementState[] {
  const targeted = new Set(requirementIds);
  return requirementStates.map((state) => {
    if (!targeted.has(state.requirementId)) return state;
    const materialIds = [...state.materialIds, materialId];
    return {
      requirementId: state.requirementId,
      materialStatus: ProtocolizationRequirementMaterialStatus.MaterialPresent,
      materialIds,
      firstMaterialAt: state.firstMaterialAt ?? at,
      updatedAt: at,
    };
  });
}

/**
 * The last gate before an aggregate leaves this module.
 *
 * An operation either returns a valid case or throws. It never returns a
 * partially valid one, so a caller that receives a case never has to ask
 * whether it is trustworthy.
 */
function sealed(protocolizationCase: ProtocolizationCase): ProtocolizationCase {
  const validation = validateProtocolizationCase(protocolizationCase);
  if (!validation.valid) {
    fail(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase,
      `Refusing to produce an invalid ProtocolizationCase: ${validation.reasons.join(', ')}`,
      { reasonCodes: validation.reasons },
    );
  }
  return deepFreeze(protocolizationCase);
}

/**
 * Creates a case, or fails.
 *
 * Centralized deliberately: a case built from an object literal somewhere else
 * could carry an unpinned profile, an absent tenant, a requirement projection
 * that does not match the profile, or a state that no transition can produce.
 * This is the only way to obtain a case that has never been persisted.
 *
 * Resolution of the exact `(profileId, profileVersion)` pair is a precondition,
 * not a convenience: a case whose rules cannot be read is a case nobody can
 * assess, and discovering that at readiness time rather than at intake is the
 * expensive order to discover it in.
 */
export function createProtocolizationCase(
  context: ProtocolizationCaseContext,
  input: CreateProtocolizationCaseInput,
): ProtocolizationCaseTransition {
  const tenantId = assertActingTenant(context);

  const reasons: string[] = [];
  if (!isValidProtocolizationCaseId(input.caseId)) {
    reasons.push(PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidCaseId);
  }
  if (!isValidProtocolizationProfileRef(input.profile)) {
    reasons.push(PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidProfileRef);
  }
  if (!isValidProtocolizationCaseSubject(input.subject)) {
    reasons.push(PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidSubject);
  }
  if (
    input.correlationId !== undefined &&
    (typeof input.correlationId !== 'string' || input.correlationId.trim() === '')
  ) {
    reasons.push(PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidCorrelationId);
  }
  if (reasons.length > 0) {
    fail(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase,
      `Cannot create ProtocolizationCase: ${reasons.join(', ')}`,
      { reasonCodes: reasons, tenantId },
    );
  }

  const profile = resolvePinnedProfile(context, input.profile, input.caseId);
  const createdAt = readClock(context);

  const requirementStates: readonly ProtocolizationCaseRequirementState[] = profile.requirements.map(
    (requirement) => ({
      requirementId: requirement.id,
      materialStatus: ProtocolizationRequirementMaterialStatus.Pending,
      materialIds: [],
      updatedAt: createdAt,
    }),
  );

  const protocolizationCase: ProtocolizationCase = {
    schemaVersion: PROTOCOLIZATION_CASE_SCHEMA_VERSION,
    caseId: input.caseId,
    tenantId,
    // Copied field by field rather than spread, so the pin is exactly the two
    // frozen fields and a caller cannot smuggle a third one onto the case.
    profile: { profileId: input.profile.profileId, profileVersion: input.profile.profileVersion },
    subject: input.subject,
    state: INITIAL_PROTOCOLIZATION_CASE_STATE,
    revision: 1,
    requirementStates,
    materials: [],
    createdAt,
    updatedAt: createdAt,
    ...(input.correlationId === undefined ? {} : { correlationId: input.correlationId }),
  };

  return {
    protocolizationCase: sealed(protocolizationCase),
    event: deepFreeze({
      eventType: PROTOCOLIZATION_CASE_EVENT_TYPES.created,
      caseId: protocolizationCase.caseId,
      tenantId,
      profile: protocolizationCase.profile,
      caseRevision: protocolizationCase.revision,
      occurredAt: createdAt,
      subjectRef: input.subject.subjectRef,
      requirementIds: requirementStates.map((state) => state.requirementId),
      ...(input.correlationId === undefined ? {} : { correlationId: input.correlationId }),
    }),
  };
}

/**
 * `Draft -> Active`. The case has been taken up for processing.
 *
 * Activation says nothing about completeness. It does not assert that the
 * subject is identified, that required material has arrived, or that anything
 * has been checked — it records that work on this case has begun.
 */
export function activateProtocolizationCase(
  context: ProtocolizationCaseContext,
  protocolizationCase: ProtocolizationCase,
): ProtocolizationCaseTransition {
  const current = assertOperableCase(context, protocolizationCase);
  assertTransition(current, ProtocolizationCaseState.Active);

  const occurredAt = readClock(context, current.updatedAt);
  const next: ProtocolizationCase = {
    ...current,
    state: ProtocolizationCaseState.Active,
    revision: current.revision + 1,
    updatedAt: occurredAt,
    activatedAt: occurredAt,
  };

  return {
    protocolizationCase: sealed(next),
    event: deepFreeze({
      eventType: PROTOCOLIZATION_CASE_EVENT_TYPES.activated,
      caseId: next.caseId,
      tenantId: next.tenantId,
      profile: next.profile,
      caseRevision: next.revision,
      occurredAt,
      ...(next.correlationId === undefined ? {} : { correlationId: next.correlationId }),
    }),
  };
}

function assertTransition(current: ProtocolizationCase, to: ProtocolizationCaseState): void {
  if (!isAllowedProtocolizationCaseTransition(current.state, to)) {
    fail(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition,
      `A ProtocolizationCase cannot move from ${current.state} to ${to}`,
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition],
        caseId: current.caseId,
        fromState: current.state,
        toState: to,
      },
    );
  }
}

/**
 * Records that the case was told about a reference, against one or more
 * requirements of its pinned profile.
 *
 * This is an association, not an assertion. A case that has been given an
 * attestation reference is not attested; a case that has been given a
 * verification reference has not been verified; a case whose every required
 * requirement has material is not ready. Deciding any of those needs the
 * referenced records themselves and an evaluator that does not exist in this
 * slice.
 */
export function addProtocolizationCaseMaterial(
  context: ProtocolizationCaseContext,
  protocolizationCase: ProtocolizationCase,
  input: ProtocolizationCaseMaterialInput,
): ProtocolizationCaseTransition {
  const current = assertOperableCase(context, protocolizationCase);
  if (!acceptsProtocolizationMaterial(current.state)) {
    fail(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition,
      `A ${current.state} ProtocolizationCase does not accept material`,
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition],
        caseId: current.caseId,
        fromState: current.state,
      },
    );
  }

  const profile = resolvePinnedProfile(context, current.profile, current.caseId);
  if (current.materials.some((material) => material.materialId === input.materialId)) {
    fail(
      PROTOCOLIZATION_CASE_ERROR_CODES.duplicateMaterial,
      `Material ${String(input.materialId)} already exists in this case`,
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.duplicateMaterial],
        caseId: current.caseId,
        materialId: input.materialId,
      },
    );
  }
  assertKnownRequirements(input.requirementIds, profile, current);

  const addedAt = readClock(context, current.updatedAt);
  const material = { ...input, addedAt } as ProtocolizationCaseMaterial;
  if (!isValidProtocolizationCaseMaterial(material)) {
    fail(PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase, 'Malformed case material', {
      reasonCodes: [PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidMaterial],
      caseId: current.caseId,
      materialId: input.materialId,
    });
  }

  const next: ProtocolizationCase = {
    ...current,
    revision: current.revision + 1,
    updatedAt: addedAt,
    materials: [...current.materials, material],
    requirementStates: correlate(
      current.requirementStates,
      material.requirementIds,
      material.materialId,
      addedAt,
    ),
  };

  return {
    protocolizationCase: sealed(next),
    event: deepFreeze({
      eventType: PROTOCOLIZATION_CASE_EVENT_TYPES.materialAdded,
      caseId: next.caseId,
      tenantId: next.tenantId,
      profile: next.profile,
      caseRevision: next.revision,
      occurredAt: addedAt,
      materialId: material.materialId,
      materialKind: material.kind,
      requirementIds: material.requirementIds,
      ...(material.correlationId === undefined ? {} : { correlationId: material.correlationId }),
    }),
  };
}

/**
 * Correlates an existing material with further requirements of the pinned
 * profile — one document that answers two requirements, recorded once and
 * pointed at both.
 *
 * Re-associating a material with a requirement it already answers is rejected
 * rather than ignored. A silent no-op would either emit an event describing an
 * association that did not happen or report success while emitting nothing, and
 * both leave an audit reader with a false account of the case.
 */
export function associateProtocolizationCaseMaterial(
  context: ProtocolizationCaseContext,
  protocolizationCase: ProtocolizationCase,
  input: AssociateProtocolizationMaterialInput,
): ProtocolizationCaseTransition {
  const current = assertOperableCase(context, protocolizationCase);
  if (!acceptsProtocolizationMaterial(current.state)) {
    fail(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition,
      `A ${current.state} ProtocolizationCase does not accept material`,
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition],
        caseId: current.caseId,
        fromState: current.state,
      },
    );
  }

  const profile = resolvePinnedProfile(context, current.profile, current.caseId);
  const existing = current.materials.find((material) => material.materialId === input.materialId);
  if (existing === undefined) {
    fail(
      PROTOCOLIZATION_CASE_ERROR_CODES.unknownMaterial,
      `No material ${String(input.materialId)} exists in this case`,
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.unknownMaterial],
        caseId: current.caseId,
        materialId: input.materialId,
      },
    );
  }
  assertKnownRequirements(input.requirementIds, profile, current);

  const alreadyAssociated = input.requirementIds.filter((id) => existing.requirementIds.includes(id));
  if (alreadyAssociated.length > 0) {
    fail(
      PROTOCOLIZATION_CASE_ERROR_CODES.duplicateAssociation,
      `Material ${String(input.materialId)} is already associated with: ${alreadyAssociated.join(', ')}`,
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.duplicateAssociation],
        caseId: current.caseId,
        materialId: input.materialId,
        requirementIds: alreadyAssociated,
      },
    );
  }

  const occurredAt = readClock(context, current.updatedAt);
  const next: ProtocolizationCase = {
    ...current,
    revision: current.revision + 1,
    updatedAt: occurredAt,
    materials: current.materials.map((material) =>
      material.materialId === input.materialId
        ? ({ ...material, requirementIds: [...material.requirementIds, ...input.requirementIds] } as ProtocolizationCaseMaterial)
        : material,
    ),
    requirementStates: correlate(
      current.requirementStates,
      input.requirementIds,
      input.materialId,
      occurredAt,
    ),
  };

  return {
    protocolizationCase: sealed(next),
    event: deepFreeze({
      eventType: PROTOCOLIZATION_CASE_EVENT_TYPES.materialAssociated,
      caseId: next.caseId,
      tenantId: next.tenantId,
      profile: next.profile,
      caseRevision: next.revision,
      occurredAt,
      materialId: input.materialId,
      requirementIds: input.requirementIds,
      ...(existing.correlationId === undefined ? {} : { correlationId: existing.correlationId }),
    }),
  };
}

/**
 * `Draft | Active -> Cancelled`. Terminal.
 *
 * Cancellation is a state, not a deletion. The case keeps its profile pin, its
 * subject, every material association it accumulated and every timestamp,
 * because the auditable question "what was attempted, and what was supplied,
 * before this was abandoned?" has to stay answerable. Erasure is a data-lifecycle
 * concern with its own authority and retention questions; it is not what
 * cancelling a case means.
 *
 * Cancelling a cancelled case fails rather than succeeding idempotently: the
 * second call would either invent a second cancellation event or claim success
 * with nothing to show for it.
 */
export function cancelProtocolizationCase(
  context: ProtocolizationCaseContext,
  protocolizationCase: ProtocolizationCase,
  input: CancelProtocolizationCaseInput = {},
): ProtocolizationCaseTransition {
  const current = assertOperableCase(context, protocolizationCase);
  assertTransition(current, ProtocolizationCaseState.Cancelled);

  if (
    input.reason !== undefined &&
    (typeof input.reason !== 'string' ||
      input.reason.trim() === '' ||
      input.reason.length > MAX_CANCELLATION_REASON_LENGTH)
  ) {
    fail(PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase, 'Malformed cancellation reason', {
      reasonCodes: [PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidCancellationReason],
      caseId: current.caseId,
    });
  }

  const occurredAt = readClock(context, current.updatedAt);
  const next: ProtocolizationCase = {
    ...current,
    state: ProtocolizationCaseState.Cancelled,
    revision: current.revision + 1,
    updatedAt: occurredAt,
    cancelledAt: occurredAt,
    ...(input.reason === undefined ? {} : { cancellationReason: input.reason }),
  };

  return {
    protocolizationCase: sealed(next),
    event: deepFreeze({
      eventType: PROTOCOLIZATION_CASE_EVENT_TYPES.cancelled,
      caseId: next.caseId,
      tenantId: next.tenantId,
      profile: next.profile,
      caseRevision: next.revision,
      occurredAt,
      ...(input.reason === undefined ? {} : { reason: input.reason }),
      ...(next.correlationId === undefined ? {} : { correlationId: next.correlationId }),
    }),
  };
}

/**
 * Turns an untrusted, persisted value back into a case, or fails.
 *
 * The single supported way to bring a case back across a persistence or
 * network boundary. It validates before it trusts — including, when a profile
 * is supplied, that every projected requirement is declared by the exact pinned
 * version — and freezes what it returns, so a store cannot hand a caller an
 * aggregate the operations above would have refused to produce.
 */
export function reconstituteProtocolizationCase(
  value: unknown,
  options: { readonly profile?: AssetProfile } = {},
): ProtocolizationCase {
  const validation = validateProtocolizationCase(value, options);
  if (!validation.valid) {
    fail(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase,
      `Refusing to reconstitute an invalid ProtocolizationCase: ${validation.reasons.join(', ')}`,
      { reasonCodes: validation.reasons },
    );
  }
  return deepFreeze(value as ProtocolizationCase);
}
