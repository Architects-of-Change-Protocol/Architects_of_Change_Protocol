/**
 * Identifier vocabulary for the verification pipeline.
 *
 * Two identifiers, and — following APV-05's split exactly — they are
 * deliberately different kinds of thing.
 *
 * `VerificationExecutionId` names one **execution**: one run of one check
 * against one case at one instant. It is an *instance* identifier, minted per
 * execution like a case id, a material id, an intake id or a declaration id, so
 * it carries APV-04's instance grammar rather than a second one that merely
 * resembles it.
 *
 * `VerificationReasonCode` names a **stable machine reason**: why a check
 * reached the outcome it reached. It is a *definition* identifier, authored and
 * reviewed like a check id, so it carries APV-03's dotted-token grammar.
 *
 * `AssetVerificationCheckId` is deliberately **not** redeclared here. APV-03
 * froze it, profiles already reference it, and a second spelling in this slice
 * would be a copy free to drift from the one profiles are written against.
 */
/**
 * Stable identity of one verification check execution.
 *
 * Caller-provided, never generated here — the same split APV-04 made for case
 * ids and APV-05 made for intake ids, for the same reason: minting needs a UUID
 * source or a counter, and a pure domain layer that mints its own identifiers
 * cannot be tested by asserting on its output.
 *
 * ### Uniqueness scope
 *
 * `(tenantId, executionId)`, exactly like an intake id and a declaration id.
 * Execution ids are minted by tenants, so a globally unique constraint would
 * let one tenant's choice of identifier collide with another's — which both
 * leaks the existence of an execution across a tenant boundary and makes a
 * legitimate `save` fail for a reason its caller can neither see nor fix.
 *
 * ### Why there is exactly one identity here
 *
 * A run id was considered and rejected. Grouping several executions would need
 * to earn its own entity, and everything a run would carry — which case, which
 * profile, which revision was evaluated, which instant, which request — is
 * already on every execution result, and identical across the executions of one
 * batch. `runProtocolizationVerification` therefore produces a set of
 * independently addressable results that share `evaluatedCaseRevision`,
 * `executedAt` and `correlationId`, and no aggregate exists whose only content
 * would be the join key those three already provide.
 */
export type VerificationExecutionId = string;
/**
 * Why a check reached its outcome, as a stable machine-readable token.
 *
 * ### Why an outcome is not enough
 *
 * `Fail` alone tells a reader that something did not hold, not *what*. Two
 * failures of the same check for entirely different reasons — material missing
 * versus a digest mismatch — would be indistinguishable, and a later slice
 * building a professional review package would have to parse prose to tell them
 * apart. A reason code is what makes the finding actionable without reading the
 * message.
 *
 * ### Why it is an opaque token and not an enum
 *
 * A closed union here would mean every new check that needs a new reason is a
 * change to this package's core, reviewed and released as such — the same
 * argument APV-05 made for its intake category id. An opaque dotted token means
 * a new check ships with its own reasons and needs no change here.
 *
 * ### What it must never be
 *
 * A product or legal conclusion. `material.missing`, `digest.mismatch` and
 * `dependency.unavailable` describe what the check observed;
 * `owner.not.legal.titleholder` would be a conclusion no automated check in
 * this vertical is entitled to reach. It is likewise never free text: the
 * human-readable half is `summary`, and nothing may derive machine meaning
 * from that.
 */
export type VerificationReasonCode = string;
export declare function isValidVerificationExecutionId(value: unknown): value is VerificationExecutionId;
export declare function isValidVerificationReasonCode(value: unknown): value is VerificationReasonCode;
//# sourceMappingURL=verification-identifiers.d.ts.map