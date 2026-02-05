import { promises as fs } from 'fs';
import path from 'path';
import { buildStoragePointer } from '../pointer';
import { LocalFilesystemAdapter } from '../localFsAdapter';

const STORAGE_DIR = '.aoc_storage';

describe('LocalFilesystemAdapter', () => {
  const baseDir = process.cwd();
  const adapter = new LocalFilesystemAdapter(baseDir);

  beforeEach(async () => {
    await fs.rm(path.join(baseDir, STORAGE_DIR), { recursive: true, force: true });
  });

  it('stores and retrieves a blob with matching hash', async () => {
    const blob = new TextEncoder().encode('hello world');
    const pointer = await adapter.put(blob);
    const retrieved = await adapter.get(pointer);

    expect(Buffer.from(retrieved)).toEqual(Buffer.from(blob));
  });

  it('throws when stored data hash mismatches', async () => {
    const blob = new TextEncoder().encode('original');
    const pointer = await adapter.put(blob);
    const tamperedPath = path.join(baseDir, STORAGE_DIR, pointer.hash);

    await fs.writeFile(tamperedPath, new TextEncoder().encode('tampered'));

    await expect(adapter.get(pointer)).rejects.toThrow('Storage hash mismatch');
  });

  it('builds pointer with expected format', () => {
    const hash = 'abcdef'.padEnd(64, '0');
    const pointer = buildStoragePointer('local', hash);

    expect(pointer).toEqual({
      backend: 'local',
      hash,
      uri: `aoc://storage/local/0x${hash}`
    });
  });

  it('rejects invalid hash inputs', () => {
    expect(() => buildStoragePointer('local', 'ABCDEF')).toThrow(
      'Storage pointer hash must be 64 lowercase hex characters.'
    );
  });

  it('deletes stored blobs', async () => {
    const blob = new TextEncoder().encode('delete me');
    const pointer = await adapter.put(blob);
    const filePath = path.join(baseDir, STORAGE_DIR, pointer.hash);

    await adapter.delete(pointer);

    await expect(fs.stat(filePath)).rejects.toThrow();
  });
});
