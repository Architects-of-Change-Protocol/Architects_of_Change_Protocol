import { StoragePointer } from '../storage/types';

export type ContentManifestV1 = {
  version: 1;
  subject: string;
  content_type: string;
  bytes: number;
  storage: StoragePointer;
  created_at: string;
  content_hash: string;
};

export type BuildContentOptions = {
  now?: Date;
};
