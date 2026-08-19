"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidVerificationExecutionId = isValidVerificationExecutionId;
exports.isValidVerificationReasonCode = isValidVerificationReasonCode;
const identifiers_1 = require("../identifiers");
const case_identifiers_1 = require("../case/case-identifiers");
function isValidVerificationExecutionId(value) {
    return (0, case_identifiers_1.isProtocolizationInstanceIdentifier)(value);
}
function isValidVerificationReasonCode(value) {
    return (0, identifiers_1.isDottedToken)(value);
}
