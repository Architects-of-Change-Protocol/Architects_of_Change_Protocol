"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEvidenceIntakeId = isValidEvidenceIntakeId;
exports.isValidEvidenceIntakeCategoryId = isValidEvidenceIntakeCategoryId;
const identifiers_1 = require("../identifiers");
const case_identifiers_1 = require("../case/case-identifiers");
function isValidEvidenceIntakeId(value) {
    return (0, case_identifiers_1.isProtocolizationInstanceIdentifier)(value);
}
function isValidEvidenceIntakeCategoryId(value) {
    return (0, identifiers_1.isDottedToken)(value);
}
