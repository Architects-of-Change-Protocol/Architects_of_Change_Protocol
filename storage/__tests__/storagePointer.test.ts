import { buildStoragePointer, parseStorageUri } from '../pointer';
import { canonicalizeStoragePointerPayload } from '../canonical';
import { sha256Hex } from '../hash';

describe('storage pointer', () => {
  const validHash = 'a'.repeat(64);

  it('produces deterministic storage pointers for identical inputs', () => {
    const pointerA = buildStoragePointer('local', validHash);
    const pointerB = buildStoragePointer('local', validHash);

    expect(pointerA.backend).toBe(pointerB.backend);
    expect(pointerA.hash).toBe(pointerB.hash);
    expect(pointerA.uri).toBe(pointerB.uri);
  });

  it('derives URI correctly from backend and hash', () => {
    const pointer = buildStoragePointer('ipfs', validHash);
    const expectedUri = `aoc://storage/ipfs/0x${validHash}`;

    expect(pointer.uri).toBe(expectedUri);
  });

  it('accepts valid backends', () => {
    expect(() => buildStoragePointer('local', validHash)).not.toThrow();
    expect(() => buildStoragePointer('s3', validHash)).not.toThrow();
    expect(() => buildStoragePointer('ipfs', validHash)).not.toThrow();
    expect(() => buildStoragePointer('arweave', validHash)).not.toThrow();
    expect(() => buildStoragePointer('http', validHash)).not.toThrow();
    expect(() => buildStoragePointer('x-vendor', validHash)).not.toThrow();
    expect(() => buildStoragePointer('x-acme-cold', validHash)).not.toThrow();
    expect(() => buildStoragePointer('my-storage-backend', validHash)).not.toThrow();
  });

  it('accepts maximum backend length (64 chars)', () => {
    const maxBackend = 'a'.repeat(64);
    expect(() => buildStoragePointer(maxBackend, validHash)).not.toThrow();
  });

  it('rejects invalid backend patterns', () => {
    expect(() => buildStoragePointer('', validHash)).toThrow(
      'Storage backend must match pattern'
    );
    expect(() => buildStoragePointer('Local', validHash)).toThrow(
      'Storage backend must match pattern'
    );
    expect(() => buildStoragePointer('IPFS', validHash)).toThrow(
      'Storage backend must match pattern'
    );
    expect(() => buildStoragePointer('my_backend', validHash)).toThrow(
      'Storage backend must match pattern'
    );
    expect(() => buildStoragePointer('123backend', validHash)).toThrow(
      'Storage backend must match pattern'
    );
    expect(() => buildStoragePointer('-hyphen', validHash)).toThrow(
      'Storage backend must match pattern'
    );
  });

  it('rejects backend exceeding 64 characters', () => {
    const tooLong = 'a'.repeat(65);
    expect(() => buildStoragePointer(tooLong, validHash)).toThrow(
      'Storage backend must be at most 64 characters'
    );
  });

  it('rejects invalid hash formats', () => {
    expect(() => buildStoragePointer('local', 'abc')).toThrow(
      'Storage pointer hash must be 64 lowercase hex characters.'
    );
    expect(() => buildStoragePointer('local', 'A'.repeat(64))).toThrow(
      'Storage pointer hash must be 64 lowercase hex characters.'
    );
    expect(() => buildStoragePointer('local', 'g'.repeat(64))).toThrow(
      'Storage pointer hash must be 64 lowercase hex characters.'
    );
    expect(() => buildStoragePointer('local', '')).toThrow(
      'Storage pointer hash must be 64 lowercase hex characters.'
    );
  });
});

describe('parseStorageUri', () => {
  const validHash = 'b'.repeat(64);

  it('parses valid storage URIs', () => {
    const uri = `aoc://storage/local/0x${validHash}`;
    const result = parseStorageUri(uri);

    expect(result.backend).toBe('local');
    expect(result.hash).toBe(validHash);
  });

  it('round-trips with buildStoragePointer', () => {
    const original = buildStoragePointer('s3', validHash);
    const parsed = parseStorageUri(original.uri);

    expect(parsed.backend).toBe(original.backend);
    expect(parsed.hash).toBe(original.hash);
  });

  it('parses vendor extension URIs', () => {
    const uri = `aoc://storage/x-acme-archive/0x${validHash}`;
    const result = parseStorageUri(uri);

    expect(result.backend).toBe('x-acme-archive');
    expect(result.hash).toBe(validHash);
  });

  it('rejects invalid URIs', () => {
    expect(() => parseStorageUri('invalid')).toThrow(
      'Storage URI must match pattern'
    );
    expect(() => parseStorageUri(`aoc://storage/Local/0x${validHash}`)).toThrow(
      'Storage URI must match pattern'
    );
    expect(() => parseStorageUri(`aoc://storage/local/${validHash}`)).toThrow(
      'Storage URI must match pattern'
    );
    expect(() => parseStorageUri(`AOC://storage/local/0x${validHash}`)).toThrow(
      'Storage URI must match pattern'
    );
  });
});

describe('canonicalizeStoragePointerPayload', () => {
  const validHash = 'c'.repeat(64);

  it('produces identical canonical bytes for identical inputs', () => {
    const bytesA = canonicalizeStoragePointerPayload({ backend: 'local', hash: validHash });
    const bytesB = canonicalizeStoragePointerPayload({ backend: 'local', hash: validHash });

    expect(Buffer.from(bytesA).toString()).toBe(Buffer.from(bytesB).toString());
  });

  it('produces different canonical bytes for different inputs', () => {
    const bytesA = canonicalizeStoragePointerPayload({ backend: 'local', hash: validHash });
    const bytesB = canonicalizeStoragePointerPayload({ backend: 's3', hash: validHash });

    expect(Buffer.from(bytesA).toString()).not.toBe(Buffer.from(bytesB).toString());
  });

  it('canonical form has correct key order (backend, hash)', () => {
    const bytes = canonicalizeStoragePointerPayload({ backend: 'local', hash: validHash });
    const json = Buffer.from(bytes).toString();

    expect(json).toBe(`{"backend":"local","hash":"${validHash}"}`);
  });

  it('canonical form has no whitespace', () => {
    const bytes = canonicalizeStoragePointerPayload({ backend: 'local', hash: validHash });
    const json = Buffer.from(bytes).toString();

    expect(json).not.toContain(' ');
    expect(json).not.toContain('\n');
    expect(json).not.toContain('\t');
  });
});

describe('sha256Hex', () => {
  it('produces deterministic hashes for identical bytes', () => {
    const data = new TextEncoder().encode('test data');
    const hashA = sha256Hex(data);
    const hashB = sha256Hex(data);

    expect(hashA).toBe(hashB);
  });

  it('produces 64-character lowercase hex strings', () => {
    const data = new TextEncoder().encode('test');
    const hash = sha256Hex(data);

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('produces different hashes for different inputs', () => {
    const hashA = sha256Hex(new TextEncoder().encode('a'));
    const hashB = sha256Hex(new TextEncoder().encode('b'));

    expect(hashA).not.toBe(hashB);
  });
});
