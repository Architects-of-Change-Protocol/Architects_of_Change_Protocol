import type { AdapterResult } from '@aoc/protocol/adapters';
import type { CanonicalClaim, CanonicalClaimId } from '@aoc/protocol/claims';
import type { SovereignSubjectRef } from '@aoc/protocol/identity';
/**
 * The outside world a check may consult, expressed as ports.
 *
 * ### Why ports at all
 *
 * Some checks are pure — everything they need is already on the case, the
 * pinned profile and the receipts and records the caller supplied. Others
 * genuinely cannot be: deciding whether a `CanonicalClaim` really is of the type
 * a declaration said it was requires *reading that claim*, and comparing a
 * digest to bytes requires *having the bytes*. Neither is something this package
 * may do itself.
 *
 * So the engine takes ports and never an implementation. Nothing under `src/`
 * opens a socket, reads a file, contacts a registry, talks to a blob store or
 * constructs a client, and the vertical's boundary test asserts that
 * mechanically rather than by convention. APV-07 ships **no** production
 * adapter — no HTTP registry connector, no object store, no content-addressed
 * network, no identity provider, no database. Binding a port to something real
 * is an infrastructure decision with its own owner and its own review.
 *
 * ### Why every port is optional
 *
 * A check that needs a port it was not given must not fail loudly and must not
 * fail *falsely*: it did not discover a problem, it was unable to look. That is
 * precisely `VerificationCheckOutcome.Unavailable`, and it is why an absent
 * resolver is an ordinary, well-defined execution outcome rather than an error.
 *
 * ### Why resolution is a three-member status and not `undefined`
 *
 * Because "there is no such record" and "I could not reach the place records
 * live" are different facts, and a port that returned `undefined` for both would
 * throw away the difference at the boundary — after which no check could
 * recover it. Both currently lead to `Unavailable`, with different reason codes,
 * so an operator can tell a missing record from an outage without reading prose.
 */
export declare const VerificationResolutionStatus: {
    /** The record was obtained. */
    readonly Resolved: "Resolved";
    /** The source answered, and holds no such record. */
    readonly NotFound: "NotFound";
    /** The source could not be consulted. Says nothing about the record. */
    readonly Unavailable: "Unavailable";
};
export type VerificationResolutionStatus = (typeof VerificationResolutionStatus)[keyof typeof VerificationResolutionStatus];
/** What a claim resolver answers. `claim` is present if and only if `Resolved`. */
export interface VerificationClaimResolution {
    readonly status: VerificationResolutionStatus;
    readonly claim?: CanonicalClaim;
}
/** What a content resolver answers. `bytes` is present if and only if `Resolved`. */
export interface VerificationContentResolution {
    readonly status: VerificationResolutionStatus;
    readonly bytes?: Uint8Array;
}
/**
 * Reads a `CanonicalClaim` the vertical only holds an identifier for.
 *
 * This is what closes APV-06's open item. A `Reference`-pathway declaration
 * records the `ClaimType` the *caller stated* about a claim it named, and APV-06
 * had no way to check that statement against the record itself. With this port
 * bound, a check can compare the two; without it, the check reports
 * `Unavailable` and the caller's word is never silently promoted to a verified
 * fact.
 *
 * Reading a claim is not endorsing it. Resolving `C1` and finding it is of type
 * `X` establishes that the record says `X` — never that the proposition `X`
 * asserts is true.
 */
export interface VerificationClaimResolver {
    resolveClaim(claimRef: CanonicalClaimId): AdapterResult<VerificationClaimResolution>;
}
/**
 * Reads the exact content bytes of a subject the case pinned a
 * `ContentIdentity` for.
 *
 * Declared as a port rather than implemented, because APV-05 deliberately
 * stores references and never bytes: this package has no blob store, no
 * filesystem access and no content network, and acquiring one to make a digest
 * check convenient would be the storage infrastructure the whole slice is
 * forbidden to add.
 *
 * The digest comparison itself reuses Protocol's `verifyContentIdentity` and
 * `ContentDigestAlgorithm`. No hashing algorithm, key model, signature format or
 * proof format is invented anywhere in this package.
 */
export interface VerificationContentResolver {
    readContent(subjectRef: SovereignSubjectRef): AdapterResult<VerificationContentResolution>;
}
/**
 * Every port a check may be handed, all optional.
 *
 * Deliberately small. A port is added when a check in this package genuinely
 * needs it, never in anticipation: an unimplemented, unused port is a promise
 * the code does not keep, and a check that could have been written against it
 * does not exist yet. Identity resolution, external registry observation,
 * credential status and signature verification are all legitimate future ports —
 * and each arrives with the check that needs it, through the same registry, with
 * no change to Protocol and no change to this engine.
 */
export interface VerificationResolvers {
    readonly claim?: VerificationClaimResolver;
    readonly content?: VerificationContentResolver;
}
//# sourceMappingURL=verification-ports.d.ts.map