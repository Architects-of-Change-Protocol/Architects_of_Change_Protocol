"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditEventSchemaExample = void 0;
exports.auditEventSchemaExample = {
    $id: 'https://aoc.protocol/schemas/audit-event-envelope/1-1-0',
    type: 'object',
    required: ['eventId', 'eventType', 'emittedAt', 'payload'],
};
