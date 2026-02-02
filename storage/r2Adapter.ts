import { sha256Hex } from './hash';
import { IStorageAdapter } from './adapter';
import { buildStoragePointer } from './pointer';
import { StoragePointer } from './types';

type R2Env = {
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucket?: string;
};

export class CloudflareR2Adapter implements IStorageAdapter {
  private env: R2Env;

  constructor(env: R2Env = {}) {
    this.env = {
      accountId: env.accountId ?? process.env.R2_ACCOUNT_ID,
      accessKeyId: env.accessKeyId ?? process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.secretAccessKey ?? process.env.R2_SECRET_ACCESS_KEY,
      bucket: env.bucket ?? process.env.R2_BUCKET
    };
  }

  async put(blob: Uint8Array): Promise<StoragePointer> {
    const hashHex = sha256Hex(blob);
    const pointer = buildStoragePointer('r2', hashHex);

    throw new Error(
      `CloudflareR2Adapter not implemented for ${pointer.uri}. Provide @aws-sdk/client-s3 and wire up put().` // TODO
    );

  }

  async get(_pointer: StoragePointer): Promise<Uint8Array> {
    throw new Error(
      'CloudflareR2Adapter not implemented. Provide @aws-sdk/client-s3 and wire up get().' // TODO
    );
  }

  async delete(_pointer: StoragePointer): Promise<void> {
    throw new Error(
      'CloudflareR2Adapter not implemented. Provide @aws-sdk/client-s3 and wire up delete().' // TODO
    );
  }
}
