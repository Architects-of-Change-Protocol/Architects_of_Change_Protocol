"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyDecisionSchemaExample = exports.consentGrantSchemaExample = void 0;
exports.consentGrantSchemaExample = {
    $id: 'https://aoc.protocol/schemas/consent-grant/1-0-0',
    type: 'object',
    required: ['schemaVersion', 'grantId', 'grantor', 'grantee', 'purpose', 'allowedOperations', 'legalBasis', 'issuedAt'],
};
exports.policyDecisionSchemaExample = {
    $id: 'https://aoc.protocol/schemas/policy-decision/1-0-0',
    type: 'object',
    required: ['schemaVersion', 'decisionId', 'outcome', 'reasoningMetadata', 'policyRevisionIds', 'evaluatedAt'],
};
