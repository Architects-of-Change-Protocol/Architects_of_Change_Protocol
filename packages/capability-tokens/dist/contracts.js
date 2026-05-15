"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capabilityTokenSchemaExample = void 0;
exports.capabilityTokenSchemaExample = {
    $id: 'https://aoc.protocol/schemas/capability-token/1-0-0',
    type: 'object',
    additionalProperties: false,
    required: ['schemaVersion', 'tokenId', 'issuer', 'subject', 'resource', 'scope', 'expiresAt', 'proof'],
    properties: {
        schemaVersion: { const: '1.0.0' },
        tokenId: { type: 'string' },
        scope: { type: 'array', items: { type: 'string', minLength: 3 } },
        constraints: { type: 'array', items: { type: 'object' } },
        attenuationOf: { type: 'string' },
    },
};
