import type { AOCAdapterRecord, AdapterRecordInput } from './adapter-types';
import {
  ADAPTER_REGISTRY_SOURCES,
  ADAPTER_SCOPE_TYPES,
  ADAPTER_STATUS,
  ADAPTER_TYPES,
} from './adapter-types';
import { AdapterParseError, AdapterValidationError } from './adapter-errors';

const ISO8601_UTC_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/;
const DID_PATTERN = /^did:[a-z0-9]+:[a-zA-Z0-9._:%-]+$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isISOStringUtc(value: string): boolean {
  if (!ISO8601_UTC_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 19) + 'Z' === value;
}

function assertStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new AdapterParseError(`${fieldName} must be a non-empty array.`);
  }

  const normalized = value.map((entry, index) => {
    if (!isNonEmptyString(entry)) {
      throw new AdapterParseError(`${fieldName}[${index}] must be a non-empty string.`);
    }
    return entry.trim();
  });

  return Array.from(new Set(normalized));
}

export function parseAdapterRecord(input: unknown): AOCAdapterRecord {
  if (!isObject(input)) {
    throw new AdapterParseError('Adapter record must be an object.');
  }

  const record = input as AdapterRecordInput;

  if (!isNonEmptyString(record.adapter_id)) {
    throw new AdapterParseError('adapter_id must be a non-empty string.');
  }
  if (!isNonEmptyString(record.display_name)) {
    throw new AdapterParseError('display_name must be a non-empty string.');
  }
  if (!isNonEmptyString(record.adapter_type) || !ADAPTER_TYPES.includes(record.adapter_type)) {
    throw new AdapterParseError('adapter_type is invalid.');
  }

  const supportedOperations = assertStringArray(record.supported_operations, 'supported_operations');

  if (!Array.isArray(record.supported_scope_types) || record.supported_scope_types.length === 0) {
    throw new AdapterParseError('supported_scope_types must be a non-empty array.');
  }

  const supportedScopeTypes = Array.from(new Set(record.supported_scope_types)).map((scopeType, index) => {
    if (typeof scopeType !== 'string' || !ADAPTER_SCOPE_TYPES.includes(scopeType)) {
      throw new AdapterParseError(`supported_scope_types[${index}] is invalid.`);
    }
    return scopeType;
  });

  if (!isNonEmptyString(record.status) || !ADAPTER_STATUS.includes(record.status)) {
    throw new AdapterParseError('status is invalid.');
  }

  if (
    !isNonEmptyString(record.registry_source) ||
    !ADAPTER_REGISTRY_SOURCES.includes(record.registry_source)
  ) {
    throw new AdapterParseError('registry_source is invalid.');
  }

  if (!isNonEmptyString(record.created_at) || !isISOStringUtc(record.created_at)) {
    throw new AdapterParseError('created_at must be ISO8601 UTC with second precision.');
  }

  if (!isNonEmptyString(record.updated_at) || !isISOStringUtc(record.updated_at)) {
    throw new AdapterParseError('updated_at must be ISO8601 UTC with second precision.');
  }

  if (record.owner_did !== undefined) {
    if (!isNonEmptyString(record.owner_did) || !DID_PATTERN.test(record.owner_did.trim())) {
      throw new AdapterParseError('owner_did must be a valid DID.');
    }
  }

  if (record.marketMakerId !== undefined && !isNonEmptyString(record.marketMakerId)) {
    throw new AdapterParseError('marketMakerId must be a non-empty string when provided.');
  }

  if (record.endpoint_url !== undefined && !isNonEmptyString(record.endpoint_url)) {
    throw new AdapterParseError('endpoint_url must be a non-empty string when provided.');
  }

  if (record.documentation_url !== undefined && !isNonEmptyString(record.documentation_url)) {
    throw new AdapterParseError('documentation_url must be a non-empty string when provided.');
  }

  if (record.metadata !== undefined && !isObject(record.metadata)) {
    throw new AdapterParseError('metadata must be an object when provided.');
  }

  return {
    adapter_id: record.adapter_id.trim(),
    display_name: record.display_name.trim(),
    adapter_type: record.adapter_type,
    owner_did: record.owner_did?.trim(),
    marketMakerId: record.marketMakerId?.trim(),
    supported_operations: supportedOperations,
    supported_scope_types: supportedScopeTypes,
    endpoint_url: record.endpoint_url?.trim(),
    documentation_url: record.documentation_url?.trim(),
    status: record.status,
    registry_source: record.registry_source,
    created_at: record.created_at,
    updated_at: record.updated_at,
    metadata: record.metadata,
  };
}

export function normalizeAdapterRecord(record: AOCAdapterRecord): AOCAdapterRecord {
  return {
    ...record,
    adapter_id: record.adapter_id.trim(),
    display_name: record.display_name.trim(),
    owner_did: record.owner_did?.trim(),
    marketMakerId: record.marketMakerId?.trim(),
    endpoint_url: record.endpoint_url?.trim(),
    documentation_url: record.documentation_url?.trim(),
    supported_operations: Array.from(new Set(record.supported_operations.map((op) => op.trim()))),
    supported_scope_types: Array.from(new Set(record.supported_scope_types)),
  };
}

export function validateAdapterRecord(record: AOCAdapterRecord): void {
  const parsed = parseAdapterRecord(record);

  if (parsed.updated_at < parsed.created_at) {
    throw new AdapterValidationError('updated_at must be greater than or equal to created_at.');
  }
}
