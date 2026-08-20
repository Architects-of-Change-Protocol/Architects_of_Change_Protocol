"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareProfessionalReviewRequests = compareProfessionalReviewRequests;
exports.compareProfessionalReviewDecisions = compareProfessionalReviewDecisions;
exports.createInMemoryProfessionalReviewRequestRepository = createInMemoryProfessionalReviewRequestRepository;
exports.createInMemoryProfessionalReviewDecisionRepository = createInMemoryProfessionalReviewDecisionRepository;
const case_freeze_1 = require("../case/case-freeze");
const case_identifiers_1 = require("../case/case-identifiers");
const review_errors_1 = require("./review-errors");
const review_validation_1 = require("./review-validation");
function storageKey(tenantId, id) {
    // A tenant id cannot contain whitespace or a control character and an
    // instance identifier cannot contain `\n`, so a newline separator is never
    // ambiguous between two distinct pairs.
    return `${tenantId}\n${id}`;
}
function assertTenant(tenantId) {
    if (!(0, case_identifiers_1.isValidProtocolizationTenantId)(tenantId)) {
        throw new review_errors_1.ProfessionalReviewError(review_errors_1.PROFESSIONAL_REVIEW_ERROR_CODES.invalidTenant, 'A non-blank tenantId is required to address professional review history', { reasonCodes: [review_errors_1.PROFESSIONAL_REVIEW_ERROR_CODES.invalidTenant] });
    }
}
/**
 * Total order over requests: request instant, then identifier.
 *
 * Exported for reuse *inside* this package only. Two copies of an ordering rule
 * are two orders waiting to disagree.
 */
function compareProfessionalReviewRequests(left, right) {
    const byInstant = Date.parse(left.requestedAt) - Date.parse(right.requestedAt);
    if (byInstant !== 0)
        return byInstant < 0 ? -1 : 1;
    if (left.reviewRequestId === right.reviewRequestId)
        return 0;
    return left.reviewRequestId < right.reviewRequestId ? -1 : 1;
}
/** Total order over decisions: decision instant, then identifier. Internal. */
function compareProfessionalReviewDecisions(left, right) {
    const byInstant = Date.parse(left.decidedAt) - Date.parse(right.decidedAt);
    if (byInstant !== 0)
        return byInstant < 0 ? -1 : 1;
    if (left.decisionId === right.decisionId)
        return 0;
    return left.decisionId < right.decisionId ? -1 : 1;
}
/**
 * A deterministic, in-process implementation of the request port.
 *
 * It exists to make the contract executable — tenant isolation, duplicate
 * rejection, append-only history and deterministic ordering are behaviours a
 * port can state but only an implementation can demonstrate — and it is the
 * reference a database adapter must match. Requests are validated on the way in
 * and deeply frozen, so a caller cannot mutate stored history by holding on to a
 * reference it saved.
 */
function createInMemoryProfessionalReviewRequestRepository() {
    const entries = new Map();
    return {
        get(tenantId, reviewRequestId) {
            assertTenant(tenantId);
            return entries.get(storageKey(tenantId, reviewRequestId));
        },
        exists(tenantId, reviewRequestId) {
            assertTenant(tenantId);
            return entries.has(storageKey(tenantId, reviewRequestId));
        },
        listByCase(tenantId, caseId) {
            assertTenant(tenantId);
            return [...entries.values()]
                .filter((request) => request.tenantId === tenantId && request.caseId === caseId)
                .sort(compareProfessionalReviewRequests);
        },
        save(request) {
            const validation = (0, review_validation_1.validateProfessionalReviewRequest)(request);
            if (!validation.admitted) {
                throw new review_errors_1.ProfessionalReviewError(review_errors_1.PROFESSIONAL_REVIEW_ERROR_CODES.invalidRequestRecord, `Refusing to store an invalid ProfessionalReviewRequest: ${validation.reasons.join(', ')}`, { reasonCodes: validation.reasons });
            }
            const key = storageKey(request.tenantId, request.reviewRequestId);
            if (entries.has(key)) {
                throw new review_errors_1.ProfessionalReviewError(review_errors_1.PROFESSIONAL_REVIEW_ERROR_CODES.duplicateRequest, 'A ProfessionalReviewRequest with this (tenantId, reviewRequestId) already exists', {
                    reasonCodes: [review_errors_1.PROFESSIONAL_REVIEW_ERROR_CODES.duplicateRequest],
                    reviewRequestId: request.reviewRequestId,
                    tenantId: request.tenantId,
                    caseId: request.caseId,
                });
            }
            entries.set(key, (0, case_freeze_1.deepFreeze)(request));
        },
    };
}
/**
 * A deterministic, in-process implementation of the decision port.
 *
 * This is also where *one terminal decision per request* is enforced. The domain
 * operation is pure and holds no repository — exactly as APV-05, APV-06 and
 * APV-07 hold none — so terminality is enforced where decisions actually live,
 * on the same terms as duplicate rejection. A retry that replays the same
 * decision is refused rather than producing a second position, and a second
 * attestation can therefore never be created by re-running a commit.
 */
function createInMemoryProfessionalReviewDecisionRepository() {
    const entries = new Map();
    const byRequest = new Map();
    return {
        get(tenantId, decisionId) {
            assertTenant(tenantId);
            return entries.get(storageKey(tenantId, decisionId));
        },
        exists(tenantId, decisionId) {
            assertTenant(tenantId);
            return entries.has(storageKey(tenantId, decisionId));
        },
        listByCase(tenantId, caseId) {
            assertTenant(tenantId);
            return [...entries.values()]
                .filter((decision) => decision.tenantId === tenantId && decision.caseId === caseId)
                .sort(compareProfessionalReviewDecisions);
        },
        getByRequest(tenantId, reviewRequestId) {
            assertTenant(tenantId);
            const decisionId = byRequest.get(storageKey(tenantId, reviewRequestId));
            if (decisionId === undefined)
                return undefined;
            return entries.get(storageKey(tenantId, decisionId));
        },
        save(decision) {
            const validation = (0, review_validation_1.validateProfessionalReviewDecision)(decision);
            if (!validation.admitted) {
                throw new review_errors_1.ProfessionalReviewError(review_errors_1.PROFESSIONAL_REVIEW_ERROR_CODES.invalidDecision, `Refusing to store an invalid ProfessionalReviewDecision: ${validation.reasons.join(', ')}`, { reasonCodes: validation.reasons });
            }
            const key = storageKey(decision.tenantId, decision.decisionId);
            if (entries.has(key)) {
                throw new review_errors_1.ProfessionalReviewError(review_errors_1.PROFESSIONAL_REVIEW_ERROR_CODES.duplicateDecision, 'A ProfessionalReviewDecision with this (tenantId, decisionId) already exists', {
                    reasonCodes: [review_errors_1.PROFESSIONAL_REVIEW_ERROR_CODES.duplicateDecision],
                    decisionId: decision.decisionId,
                    tenantId: decision.tenantId,
                    caseId: decision.caseId,
                });
            }
            const requestKey = storageKey(decision.tenantId, decision.reviewRequestId);
            if (byRequest.has(requestKey)) {
                throw new review_errors_1.ProfessionalReviewError(review_errors_1.PROFESSIONAL_REVIEW_ERROR_CODES.alreadyDecided, 'This ProfessionalReviewRequest already has a decision; a further review needs a new request', {
                    reasonCodes: [review_errors_1.PROFESSIONAL_REVIEW_ERROR_CODES.alreadyDecided],
                    decisionId: decision.decisionId,
                    reviewRequestId: decision.reviewRequestId,
                    tenantId: decision.tenantId,
                    caseId: decision.caseId,
                });
            }
            entries.set(key, (0, case_freeze_1.deepFreeze)(decision));
            byRequest.set(requestKey, decision.decisionId);
        },
    };
}
