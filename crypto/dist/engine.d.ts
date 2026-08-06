import type { EncryptedObject, GovernanceSignature, RuntimeAuthorityIdentity } from './types';
/**
 * The crypto engine's serialization step for hashing and signing. Delegates
 * entirely to the single authoritative AOC Canonical JSON implementation
 * (see ./canonicalize.ts) — this engine must never carry its own inline
 * canonicalization logic, since any divergence here is directly
 * security-relevant (it would let the same logical payload hash/sign
 * differently depending on call path).
 */
export declare const canonicalSerialize: (value: unknown) => string;
export declare const stableHash: (value: unknown) => string;
export declare const encryptObject: (key: Uint8Array, plaintext: Uint8Array) => EncryptedObject;
export declare const decryptObject: (key: Uint8Array, encrypted: EncryptedObject) => Uint8Array;
export declare const createRuntimeAuthority: (runtimeId: string, issuerId: string, authorityId?: string) => {
    identity: RuntimeAuthorityIdentity;
    privateKey: string;
};
export declare const signPayload: (payload: unknown, privateKeyPem: string, signer: RuntimeAuthorityIdentity, provenance: GovernanceSignature["provenance"]) => GovernanceSignature;
export declare const verifyPayloadSignature: (payload: unknown, signatureEnvelope: GovernanceSignature) => boolean;
//# sourceMappingURL=engine.d.ts.map