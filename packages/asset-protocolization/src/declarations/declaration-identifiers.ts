import { isProtocolizationInstanceIdentifier } from '../case/case-identifiers';

/**
 * Identifier vocabulary for the declaration / claim preparation layer.
 *
 * There is exactly **one** identifier here, and the fact that there is only one
 * is the point.
 *
 * `DeclarationId` names one **declaration operation** — one attempt by one
 * participant to record one assertion into one case. It is an *instance*
 * identifier, minted per attempt like a case id, a material id or an evidence
 * intake id, so it carries APV-04's instance grammar rather than a second one
 * that merely resembles it.
 *
 * ### Why there is no `DeclarationKindId`
 *
 * APV-06 deliberately introduces **no** new vocabulary for *what* is being
 * declared, because APV-03 already froze one. An
 * `AssetDeclarationRequirement` states the declaration it requires as
 * Protocol's `ClaimType` plus an optional vertical `claimSubtype` token, and
 * that pair is exactly the machine-readable semantics a declaration needs to
 * carry. A parallel `DeclarationKindId` would be a second claim-requirement
 * language for one concept: a profile would say `claimType: Custom,
 * claimSubtype: 'x.y'` while a submission said `declarationKind: 'x.y'`, and
 * something would then have to decide which of the two a later evaluator
 * believes.
 *
 * So a new *category* of declaration — "I created this work", "I am authorized
 * to act for this entity", "this external entry corresponds to this subject" —
 * is a profile that declares `ClaimType.Custom` with a new `claimSubtype`
 * token. It is a configuration change, not a change to this package, not a
 * change to APV-04, and emphatically not a change to AOC Protocol: no member is
 * ever added to `ClaimType` for an asset category.
 *
 * ### Why there is no assertion identifier either
 *
 * Gate A0 `U-3` gives this vertical ownership of `CanonicalAssertionId` *if it
 * ever needs one*. APV-06 does not. A `CanonicalAssertion` is reachable only
 * through `CanonicalClaim.assertionRef`, and this package constructs no
 * `CanonicalClaim` (see `declaration-submission.ts`), so it mints no assertion
 * identifier and writes no helper for one. `U-3` remains undischarged, which is
 * the honest state to leave it in.
 */

/**
 * Stable identity of one declaration operation.
 *
 * Caller-provided, never generated here — the same split APV-04 made for case
 * ids and APV-05 for intake ids, for the same reason: minting needs a UUID
 * source or a counter, and a pure domain layer that mints its own identifiers
 * cannot be tested by asserting on its output.
 *
 * ### Why this is neither the claim id nor the material id
 *
 * Three identifiers, three layers, deliberately not conflated.
 *
 * ```text
 * DeclarationId        the workflow act — "a declaration was offered at 09:14"
 * CanonicalClaimId     the Protocol record the assertion is carried by
 * ProtocolizationMaterialId
 *                      the association inside the case
 * ```
 *
 * A declaration id exists for an attempt that was refused. A claim id is
 * Protocol's and is minted wherever Protocol records are minted. A material id
 * exists only for a declaration that was recorded, and material can also reach
 * a case through APV-04's own pathway with no declaration behind it at all. A
 * successful declaration produces one of each and records the correspondence on
 * its record.
 */
export type DeclarationId = string;

export function isValidDeclarationId(value: unknown): value is DeclarationId {
  return isProtocolizationInstanceIdentifier(value);
}
