"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOVEREIGNTY_CAPABILITY_RESULT_SCHEMA_VERSION = void 0;
exports.resolveSovereigntyCapabilitySubject = resolveSovereigntyCapabilitySubject;
exports.SOVEREIGNTY_CAPABILITY_RESULT_SCHEMA_VERSION = 'aoc-sovereignty-capability-result/1';
/**
 * The subject-precedence rule, in one place so the result and its evidence
 * can never disagree about which subject an invocation concerned:
 *
 *   1. the subject the implementation returned, if it returned one
 *      — Identity creating a brand new `SovereignAssetId` is exactly this case;
 *   2. otherwise the subject the invocation carried, if it carried one
 *      — the ordinary "operate on an existing subject" case;
 *   3. otherwise no subject at all
 *      — standalone Integrity over loose bytes is exactly this case.
 *
 * Note that (1) does not have to equal (2): an implementation that returns a
 * subject is stating the affected or resulting subject, and the invoker takes
 * it at its word rather than asserting the request's subject over it.
 */
function resolveSovereigntyCapabilitySubject(invocation, outcome) {
    return outcome.subject ?? invocation.subject;
}
