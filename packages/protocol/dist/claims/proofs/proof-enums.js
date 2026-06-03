"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProofStatus = exports.ProofFormat = exports.ProofType = void 0;
exports.ProofType = {
    HashProof: 'HashProof',
    SignatureProof: 'SignatureProof',
    AttestationProof: 'AttestationProof',
    IntegrityProof: 'IntegrityProof',
    ChainProof: 'ChainProof',
    CredentialProof: 'CredentialProof',
    AuditProof: 'AuditProof',
    TraceProof: 'TraceProof',
    Custom: 'Custom',
};
exports.ProofFormat = {
    JSON: 'JSON',
    JWT: 'JWT',
    JWS: 'JWS',
    VC: 'VC',
    Hash: 'Hash',
    URI: 'URI',
    Custom: 'Custom',
};
exports.ProofStatus = {
    Declared: 'Declared',
    Observed: 'Observed',
    Verified: 'Verified',
    Invalid: 'Invalid',
    Unknown: 'Unknown',
};
