"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidProfessionalReviewRequestId = isValidProfessionalReviewRequestId;
exports.isValidProfessionalReviewDecisionId = isValidProfessionalReviewDecisionId;
exports.isValidProfessionalReviewReasonCode = isValidProfessionalReviewReasonCode;
const identifiers_1 = require("../identifiers");
const case_identifiers_1 = require("../case/case-identifiers");
function isValidProfessionalReviewRequestId(value) {
    return (0, case_identifiers_1.isProtocolizationInstanceIdentifier)(value);
}
function isValidProfessionalReviewDecisionId(value) {
    return (0, case_identifiers_1.isProtocolizationInstanceIdentifier)(value);
}
function isValidProfessionalReviewReasonCode(value) {
    return (0, identifiers_1.isDottedToken)(value);
}
