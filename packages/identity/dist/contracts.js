"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identityContractSchemaExample = void 0;
exports.identityContractSchemaExample = {
    $id: 'https://aoc.protocol/schemas/identity-contract/1-0-0',
    type: 'object',
    additionalProperties: false,
    required: ['schemaVersion', 'id', 'principalType', 'status', 'createdAt', 'updatedAt', 'claims', 'trust', 'tenant'],
};
