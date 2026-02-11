import type { StoragePointer } from '../storage/types';

export type FieldReference = {
  field_id: string;
  content_id: string;
  storage: StoragePointer;
  bytes: number;
};

export type PackManifestV1 = {
  version: string;
  subject: string;
  created_at: number;
  fields: FieldReference[];
  pack_hash: string;
};

export type BuildPackOptions = {
  now?: Date;
};
