"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationResolutionStatus = void 0;
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
exports.VerificationResolutionStatus = {
    /** The record was obtained. */
    Resolved: 'Resolved',
    /** The source answered, and holds no such record. */
    NotFound: 'NotFound',
    /** The source could not be consulted. Says nothing about the record. */
    Unavailable: 'Unavailable',
};
