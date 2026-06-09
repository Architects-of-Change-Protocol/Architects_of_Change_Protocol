import { EnforcementRequestParseError } from './enforcement-errors';
const VALID_SCOPE_TYPES = new Set(['field', 'content', 'pack']);
function asRecord(input) {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
        throw new EnforcementRequestParseError('Enforcement request must be a non-null JSON object.');
    }
    return input;
}
function parseNonEmptyString(value, field) {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new EnforcementRequestParseError(`Enforcement field "${field}" must be a non-empty string.`);
    }
    return value.trim();
}
function parseScopeEntry(input, index) {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
        throw new EnforcementRequestParseError(`Enforcement scope entry ${index} must be a JSON object.`);
    }
    const record = input;
    const type = parseNonEmptyString(record.type, `requested_scope[${index}].type`);
    const ref = parseNonEmptyString(record.ref, `requested_scope[${index}].ref`).toLowerCase();
    if (!VALID_SCOPE_TYPES.has(type)) {
        throw new EnforcementRequestParseError(`Enforcement scope entry ${index} has invalid type.`);
    }
    return {
        type: type,
        ref,
    };
}
function parseRequestedScope(value) {
    if (!Array.isArray(value) || value.length === 0) {
        throw new EnforcementRequestParseError('Enforcement field "requested_scope" must be a non-empty array.');
    }
    return value.map((entry, index) => parseScopeEntry(entry, index));
}
function parseRequestedPermissions(value) {
    if (!Array.isArray(value) || value.length === 0) {
        throw new EnforcementRequestParseError('Enforcement field "requested_permissions" must be a non-empty array.');
    }
    return value.map((permission, index) => {
        if (typeof permission !== 'string' || permission.trim() === '') {
            throw new EnforcementRequestParseError(`Enforcement permission ${index} must be a non-empty string.`);
        }
        return permission.trim().toLowerCase();
    });
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
        throw new EnforcementRequestParseError('Enforcement field "resource" must be an object or null when provided.');
    }
    const record = value;
    const type = parseNonEmptyString(record.type, 'resource.type');
    if (!VALID_SCOPE_TYPES.has(type)) {
        throw new EnforcementRequestParseError('Enforcement resource.type is invalid.');
    }
    return {
        type: type,
        ref: parseNonEmptyString(record.ref, 'resource.ref').toLowerCase(),
    };
}
function parseNow(value) {
    if (value === undefined) {
        return undefined;
    }
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new EnforcementRequestParseError('Enforcement field "now" must be a valid Date when provided.');
    }
    return value;
}
function parseActionContext(value) {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new EnforcementRequestParseError('Enforcement field "action_context" must be a JSON object when provided.');
    }
    return value;
}
export function parseEnforcementRequest(input) {
    const record = asRecord(input);
    if (!('capability' in record)) {
        throw new EnforcementRequestParseError('Enforcement field "capability" is required.');
    }
    return {
        capability: record.capability,
        requested_scope: parseRequestedScope(record.requested_scope),
        requested_permissions: parseRequestedPermissions(record.requested_permissions),
        subject: parseOptionalBinding(record, 'subject'),
        grantee: parseOptionalBinding(record, 'grantee'),
        marketMakerId: parseOptionalBinding(record, 'marketMakerId'),
        resource: parseResource(record.resource),
        action_context: parseActionContext(record.action_context),
        now: parseNow(record.now),
        isRevoked: typeof record.isRevoked === 'function'
            ? record.isRevoked
            : undefined,
    };
}
function dedupeScope(scope) {
    const deduped = new Map();
    for (const entry of scope) {
        deduped.set(`${entry.type}:${entry.ref}`, entry);
    }
    return [...deduped.values()].sort((a, b) => {
        const typeCmp = a.type.localeCompare(b.type);
        if (typeCmp !== 0) {
            return typeCmp;
        }
        return a.ref.localeCompare(b.ref);
    });
}
export function normalizeEnforcementRequest(input) {
    return {
        ...input,
        requested_scope: dedupeScope(input.requested_scope),
        requested_permissions: [...new Set(input.requested_permissions.map((permission) => permission.trim().toLowerCase()))].sort(),
    };
}
