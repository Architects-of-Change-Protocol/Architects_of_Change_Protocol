import { parseEnforcementRequest, normalizeEnforcementRequest } from '../enforcement/enforcement-request';
import { ExecutionRequestParseError } from './execution-errors';
const VALID_SCOPE_TYPES = new Set(['field', 'content', 'pack']);
function asRecord(input) {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
        throw new ExecutionRequestParseError('Execution request must be a non-null JSON object.');
    }
    return input;
}
function parseNonEmptyString(value, field) {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new ExecutionRequestParseError(`Execution field "${field}" must be a non-empty string.`);
    }
    return value.trim();
}
function parseOptionalBinding(record, field) {
    if (!(field in record) || record[field] === undefined) {
        return undefined;
    }
    return parseNonEmptyString(record[field], field);
}
function parseResource(value) {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new ExecutionRequestParseError('Execution field "resource" must be an object or null when provided.');
    }
    const record = value;
    const type = parseNonEmptyString(record.type, 'resource.type');
    if (!VALID_SCOPE_TYPES.has(type)) {
        throw new ExecutionRequestParseError('Execution resource.type is invalid.');
    }
    return {
        type: type,
        ref: parseNonEmptyString(record.ref, 'resource.ref').toLowerCase(),
    };
}
function parseExecutionTarget(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new ExecutionRequestParseError('Execution field "execution_target" must be a JSON object.');
    }
    const record = value;
    return {
        adapter: parseNonEmptyString(record.adapter, 'execution_target.adapter'),
        operation: parseNonEmptyString(record.operation, 'execution_target.operation'),
    };
}
function parseActionContext(value) {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new ExecutionRequestParseError('Execution field "action_context" must be a JSON object when provided.');
    }
    return value;
}
function parsePayload(value) {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
        throw new ExecutionRequestParseError('Execution field "payload" must be a JSON object or null when provided.');
    }
    return value;
}
function parseNow(value) {
    if (value === undefined) {
        return undefined;
    }
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new ExecutionRequestParseError('Execution field "now" must be a valid Date when provided.');
    }
    return value;
}
export function parseExecutionRequest(input) {
    const record = asRecord(input);
    if (!('capability' in record)) {
        throw new ExecutionRequestParseError('Execution field "capability" is required.');
    }
    const parsedEnforcement = parseEnforcementRequest({
        capability: record.capability,
        requested_scope: record.requested_scope,
        requested_permissions: record.requested_permissions,
        subject: parseOptionalBinding(record, 'subject'),
        grantee: parseOptionalBinding(record, 'grantee'),
        marketMakerId: parseOptionalBinding(record, 'marketMakerId'),
        resource: parseResource(record.resource),
        action_context: parseActionContext(record.action_context),
        now: parseNow(record.now),
        isRevoked: typeof record.isRevoked === 'function'
            ? record.isRevoked
            : undefined,
    });
    return {
        ...parsedEnforcement,
        execution_target: parseExecutionTarget(record.execution_target),
        payload: parsePayload(record.payload),
    };
}
export function normalizeExecutionRequest(input) {
    const normalizedEnforcement = normalizeEnforcementRequest(input);
    return {
        ...normalizedEnforcement,
        execution_target: {
            adapter: input.execution_target.adapter.trim(),
            operation: input.execution_target.operation.trim(),
        },
        payload: input.payload,
    };
}
