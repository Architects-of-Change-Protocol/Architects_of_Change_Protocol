/**
 * Legacy content-manifest identity stability (AOC Protocol Slice 0).
 *
 * This is the CURRENT/legacy content-manifest identity behavior — it is
 * NOT the future `SovereignAssetId`. The audit that preceded this slice
 * (SAP-GAP readiness audit) found that this identity incorporates storage
 * metadata (backend/hash/uri) into the content hash, which will be
 * corrected by a future sovereign-identity slice that separates content
 * identity from storage location. That redesign is explicitly out of
 * scope here.
 *
 * These fixtures pin exact hash/id output for fixed inputs (including a
 * fixed `now`) so that Slice 0's canonicalization consolidation
 * (SAP-GAP-010: crypto/engine.ts now delegates to the same
 * crypto/canonicalize.ts implementation as this content/pack/field layer)
 * is proven not to have silently changed any existing legacy identifier.
 * If any of these values ever need to change, that must be a deliberate,
 * documented, versioned migration — never a silent side effect of a
 * canonicalization or hashing refactor.
 */
import { buildContentManifest } from '../contentManifest';
import { buildContentId } from '../contentId';
import { buildPackManifest } from '../../pack/packManifest';
import { buildPackId } from '../../pack/packId';
import { buildFieldManifest } from '../../field/fieldManifest';
import { buildFieldId } from '../../field/fieldId';
import { StoragePointer } from '../../storage/types';

const FIXED_DATE = new Date('2024-01-01T00:00:00.000Z');

const storage: StoragePointer = {
  backend: 'local',
  hash: 'a'.repeat(64),
  uri: `aoc://storage/local/0x${'a'.repeat(64)}`
};

describe('legacy content-manifest identity (pre-SovereignAssetId)', () => {
  it('reproduces the exact pinned content_hash and content id for a fixed input', () => {
    const manifest = buildContentManifest(
      'sovereign-asset-slice-0-fixture',
      'text/plain',
      128,
      storage,
      { now: FIXED_DATE }
    );

    expect(manifest.content_hash).toBe(
      '83ea6c5628303c6bf5b479a832697151f88be76658661602a0fd6bd3fef24b14'
    );
    expect(buildContentId(manifest)).toBe(
      'aoc://content/object/v1/0/0x8c861b2efdd830959c754527a4658ad44254a8dcf3b29ccdd6efaa0e8fc5968b'
    );
  });
});

describe('legacy field-manifest identity (pre-SovereignAssetId)', () => {
  it('reproduces the exact pinned field_hash and field id for a fixed input', () => {
    const manifest = buildFieldManifest(
      'legal-full-name',
      'string',
      "A person's full legal name.",
      { now: FIXED_DATE }
    );

    expect(manifest.field_hash).toBe(
      '500495521ec2037c00f5713fcfc22a495b28f2ba6c4307842eb77c7a65fa57e9'
    );
    expect(buildFieldId(manifest)).toBe(
      'aoc://field/definition/v1/0/0xf49f53d04ea0c514b878f5122c14c0c915a3add8c37df89cd30a285f86b6eb65'
    );
  });
});

describe('legacy pack-manifest identity (pre-SovereignAssetId)', () => {
  it('reproduces the exact pinned pack_hash and pack id for a fixed input', () => {
    const contentManifest = buildContentManifest(
      'sovereign-asset-slice-0-fixture',
      'text/plain',
      128,
      storage,
      { now: FIXED_DATE }
    );

    const packManifest = buildPackManifest(
      'sovereign-asset-slice-0-fixture',
      [
        {
          field_id: 'legal-full-name',
          content_id: contentManifest.content_hash,
          storage,
          bytes: 128
        }
      ],
      { now: FIXED_DATE }
    );

    expect(packManifest.pack_hash).toBe(
      '4afc4fb2c1c92813f55d0622745fe70c3dc0c779df63f816c5be132429958624'
    );
    expect(buildPackId(packManifest)).toBe(
      'aoc://pack/object/v1/0/0xed2ff9582df87c634e4c83a3d242658df2a08f8d24c2c5fbbba38997202c9bdd'
    );
  });
});
