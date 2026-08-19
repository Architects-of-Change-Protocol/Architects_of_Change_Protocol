"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidDeclarationId = isValidDeclarationId;
const case_identifiers_1 = require("../case/case-identifiers");
function isValidDeclarationId(value) {
    return (0, case_identifiers_1.isProtocolizationInstanceIdentifier)(value);
}
