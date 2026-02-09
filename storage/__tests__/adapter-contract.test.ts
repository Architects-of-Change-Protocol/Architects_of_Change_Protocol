import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { IStorageAdapter } from '../adapter';
import { sha256Hex } from '../hash';
import { LocalFilesystemAdapter } from '../localFsAdapter';

const STORAGE_DIR = '.aoc_storage';

type AdapterFixture = {
  name: string;
  backend: string;
  make: () => Promise<{ adapter: IStorageAdapter; baseDir?: string }>;
};

function runAdapterContract(fixture: AdapterFixture): void {
  describe(`${fixture.name} adapter contract`, () => {
    let adapter: IStorageAdapter;
    let baseDir: string | undefined;

    beforeEach(async () => {
      const created = await fixture.make();
      adapter = created.adapter;
      baseDir = created.baseDir;
    });

    it('put() stores bytes and returns a valid pointer', async () => {
      const blob = new TextEncoder().encode('adapter-contract-put');
      const pointer = await adapter.put(blob);

      expect(pointer.backend).toBe(fixture.backend);
      expect(pointer.hash).toBe(sha256Hex(blob));
      expect(pointer.uri).toBe(`aoc://storage/${fixture.backend}/0x${pointer.hash}`);
    });

    it('get() returns the exact bytes previously stored by put()', async () => {
      const blob = new TextEncoder().encode('adapter-contract-get');
      const pointer = await adapter.put(blob);
      const retrieved = await adapter.get(pointer);

      expect(Buffer.from(retrieved)).toEqual(Buffer.from(blob));
    });

    it('delete() removes stored bytes', async () => {
      const blob = new TextEncoder().encode('adapter-contract-delete');
      const pointer = await adapter.put(blob);

      await adapter.delete(pointer);

      await expect(adapter.get(pointer)).rejects.toThrow();
    });

    it('enforces hash integrity on retrieval', async () => {
      if (!baseDir) return;

      const blob = new TextEncoder().encode('adapter-contract-integrity');
      const pointer = await adapter.put(blob);
      const filePath = path.join(baseDir, STORAGE_DIR, pointer.hash);

      await fs.writeFile(filePath, new TextEncoder().encode('tampered'));

      await expect(adapter.get(pointer)).rejects.toThrow(
        `Storage hash mismatch for ${pointer.uri}`
      );
    });
  });
}

runAdapterContract({
  name: 'LocalFilesystemAdapter',
  backend: 'local',
  make: async () => {
    const baseDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aoc-local-adapter-contract-'));
    await fs.rm(path.join(baseDir, STORAGE_DIR), { recursive: true, force: true });

    return {
      adapter: new LocalFilesystemAdapter(baseDir),
      baseDir
    };
  }
});
