import { canonicalizePackManifestPayload } from './canonical';
import { computePackHash } from './hash';
import { BuildPackOptions, FieldReference, PackManifestV1 } from './types';

const VERSION_PATTERN = /^[0-9]+\.[0-9]+$/;
const FIELD_ID_PATTERN = /^[a-z][a-z0-9_-]*$/;
const HASH_HEX_PATTERN = /^[0-9a-f]{64}$/;
const BACKEND_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

const MAX_SUBJECT_BYTES = 512;
const MAX_FIELDS = 65535;
const MAX_FIELD_ID_LENGTH = 128;
const CLOCK_SKEW_TOLERANCE_SECONDS = 300;

function validateVersion(version: string): void {
  if (typeof version !== 'string' || !VERSION_PATTERN.test(version)) {
    throw new Error('Pack version must match pattern MAJOR.MINOR (e.g., "1.0").');
  }
}

function validateSubject(subject: string): void {
  if (typeof subject !== 'string' || subject.trim() === '') {
    throw new Error('Pack subject must be non-empty.');
  }
  const subjectBytes = new TextEncoder().encode(subject);
  if (subjectBytes.length > MAX_SUBJECT_BYTES) {
    throw new Error(`Pack subject must be at most ${MAX_SUBJECT_BYTES} bytes.`);
  }
}

function validateCreatedAt(created_at: number, nowSeconds: number): void {
  if (!Number.isInteger(created_at) || created_at <= 0) {
    throw new Error('Pack created_at must be a positive integer (Unix timestamp).');
  }
  if (created_at > nowSeconds + CLOCK_SKEW_TOLERANCE_SECONDS) {
    throw new Error('Pack created_at must not be in the future.');
  }
}

function validateFieldId(field_id: string, index: number): void {
  if (typeof field_id !== 'string' || field_id === '') {
    throw new Error(`Field reference ${index}: field_id must be non-empty.`);
  }
  if (field_id.length > MAX_FIELD_ID_LENGTH) {
    throw new Error(`Field reference ${index}: field_id must be at most ${MAX_FIELD_ID_LENGTH} characters.`);
  }
  if (!FIELD_ID_PATTERN.test(field_id)) {
    throw new Error(`Field reference ${index}: field_id must match pattern ^[a-z][a-z0-9_-]*$.`);
  }
}

function validateContentId(content_id: string, index: number): void {
  if (typeof content_id !== 'string' || !HASH_HEX_PATTERN.test(content_id)) {
    throw new Error(`Field reference ${index}: content_id must be 64 lowercase hex characters.`);
  }
}

function validateBytes(bytes: number, index: number): void {
  if (!Number.isInteger(bytes) || bytes <= 0) {
    throw new Error(`Field reference ${index}: bytes must be a positive integer.`);
  }
}

function validateStoragePointer(storage: FieldReference['storage'], index: number): void {
  if (typeof storage !== 'object' || storage === null) {
    throw new Error(`Field reference ${index}: storage must be an object.`);
  }

  if (typeof storage.backend !== 'string' || !BACKEND_PATTERN.test(storage.backend)) {
    throw new Error(`Field reference ${index}: storage backend must match pattern.`);
  }

  if (typeof storage.hash !== 'string' || !HASH_HEX_PATTERN.test(storage.hash)) {
    throw new Error(`Field reference ${index}: storage hash must be 64 lowercase hex characters.`);
  }

  const expectedUri = `aoc://storage/${storage.backend}/0x${storage.hash}`;
  if (storage.uri !== expectedUri) {
    throw new Error(`Field reference ${index}: storage uri must match backend and hash.`);
  }
}

function validateFieldReference(ref: FieldReference, index: number): void {
  validateFieldId(ref.field_id, index);
  validateContentId(ref.content_id, index);
  validateBytes(ref.bytes, index);
  validateStoragePointer(ref.storage, index);
}

function validateFields(fields: FieldReference[]): void {
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new Error('Pack fields must be a non-empty array.');
  }
  if (fields.length > MAX_FIELDS) {
    throw new Error(`Pack fields must not exceed ${MAX_FIELDS} elements.`);
  }

  const seenFieldIds = new Set<string>();
  for (let i = 0; i < fields.length; i++) {
    validateFieldReference(fields[i], i);

    if (seenFieldIds.has(fields[i].field_id)) {
      throw new Error(`Pack fields contain duplicate field_id: ${fields[i].field_id}.`);
    }
    seenFieldIds.add(fields[i].field_id);
  }
}

export function buildPackManifest(
  subject: string,
  fields: FieldReference[],
  opts: BuildPackOptions = {}
): PackManifestV1 {
  const version = '1.0';
  const now = opts.now ?? new Date();
  const created_at = Math.floor(now.getTime() / 1000);
  const nowSeconds = Math.floor(Date.now() / 1000);

  validateVersion(version);
  validateSubject(subject);
  validateCreatedAt(created_at, nowSeconds);
  validateFields(fields);

  const trimmedSubject = subject.trim();

  const payloadBytes = canonicalizePackManifestPayload({
    version,
    subject: trimmedSubject,
    created_at,
    fields
  });

  const pack_hash = computePackHash(payloadBytes);

  return {
    version,
    subject: trimmedSubject,
    created_at,
    fields,
    pack_hash
  };
}
