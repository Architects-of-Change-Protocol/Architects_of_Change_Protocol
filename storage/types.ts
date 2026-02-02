export type StoragePointer = {
  uri: string; // aoc://storage/<backend>/0x<sha256>
  backend: string; // "local" | "r2"
  hash: string; // lowercase hex without 0x
};
