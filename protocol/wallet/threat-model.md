# AOC Sovereign Wallet — Threat Model

**Version:** 0.1
**Status:** Draft
**Layer:** Security Analysis
**Parent Document:** [architecture.md](./architecture.md)

---

## Table of Contents

1. [Assets & Security Objectives](#1-assets--security-objectives)
2. [Trust Boundaries & Attack Surfaces](#2-trust-boundaries--attack-surfaces)
3. [Threat Enumeration by Module](#3-threat-enumeration-by-module)
4. [Threat Enumeration by Data Flow](#4-threat-enumeration-by-data-flow)
5. [Risk Rating Table](#5-risk-rating-table)
6. [Metadata Leakage Threat Model](#6-metadata-leakage-threat-model)
7. [Security Backlog](#7-security-backlog)
8. [Test Strategy for Security](#8-test-strategy-for-security)

---

## 1. Assets & Security Objectives

### 1.1 Critical Assets

| Asset ID | Asset | Description | Criticality |
|----------|-------|-------------|-------------|
| A-01 | **Master Seed** | BIP-39 mnemonic phrase; root of all key derivation | CRITICAL |
| A-02 | **Private Keys** | secp256k1 private keys derived from seed | CRITICAL |
| A-03 | **DID Document** | Identity document containing verification methods | HIGH |
| A-04 | **Consent Tokens** | Signed authorization objects for field access | HIGH |
| A-05 | **Vault Ciphertext** | Encrypted SDL fields and blobs | HIGH |
| A-06 | **Field Encryption Keys** | Per-field symmetric keys (AES-256) | CRITICAL |
| A-07 | **Consent Registry** | Database of active/historical consents | HIGH |
| A-08 | **Plaintext SDL Fields** | Decrypted sovereign data (in-memory only) | CRITICAL |
| A-09 | **Session Tokens** | Ephemeral tokens for market sessions | MEDIUM |
| A-10 | **Connection Metadata** | Peer, market, issuer relationships | MEDIUM |
| A-11 | **Audit Logs** | Tamper-evident logs of all operations | MEDIUM |
| A-12 | **Revocation Proofs** | On-chain revocation anchors | MEDIUM |

### 1.2 Security Objectives

#### 1.2.1 Confidentiality (C)

| Objective ID | Objective | Assets Protected |
|--------------|-----------|------------------|
| C-01 | Private keys MUST never be exposed outside Key Manager | A-01, A-02 |
| C-02 | Plaintext field data MUST exist only in client memory during authorized operations | A-08 |
| C-03 | Vault ciphertext MUST be indistinguishable from random data to storage backends | A-05 |
| C-04 | Field encryption keys MUST NOT be derivable without master key | A-06 |
| C-05 | Consent token scope MUST NOT be visible to unauthorized parties | A-04 |

#### 1.2.2 Integrity (I)

| Objective ID | Objective | Assets Protected |
|--------------|-----------|------------------|
| I-01 | Consent tokens MUST be tamper-evident via cryptographic signature | A-04 |
| I-02 | Vault ciphertext MUST detect any modification (authenticated encryption) | A-05 |
| I-03 | DID Document MUST be verifiable against on-chain anchor | A-03 |
| I-04 | Audit logs MUST be append-only and tamper-evident | A-11 |
| I-05 | Pack signatures MUST be verifiable by any recipient | All packs |

#### 1.2.3 Availability (A)

| Objective ID | Objective | Assets Protected |
|--------------|-----------|------------------|
| A-01 | Wallet MUST operate fully offline with local storage | All |
| A-02 | Key recovery MUST be possible from seed phrase alone | A-01, A-02 |
| A-03 | Revoked consents MUST fail resolution even if backend unavailable | A-04 |
| A-04 | Storage backend failure MUST NOT cause data loss (local-first) | A-05 |

#### 1.2.4 Non-Repudiation (NR)

| Objective ID | Objective | Assets Protected |
|--------------|-----------|------------------|
| NR-01 | Consent grants MUST be attributable to wallet holder | A-04 |
| NR-02 | Revocations MUST be publicly verifiable via on-chain proof | A-12 |
| NR-03 | Data sharing events MUST be logged with timestamps | A-11 |
| NR-04 | Field provenance (issuer attestations) MUST be verifiable | A-05 |

#### 1.2.5 Privacy (P)

| Objective ID | Objective | Assets Protected |
|--------------|-----------|------------------|
| P-01 | Storage backend MUST NOT learn field contents or structure | A-05 |
| P-02 | Metadata leakage MUST be minimized per architecture spec | All |
| P-03 | Access patterns MUST NOT reveal user behavior to storage provider | A-05 |
| P-04 | Consent tokens MUST support selective disclosure | A-04, A-08 |
| P-05 | On-chain operations MUST NOT link wallet activity to identity | A-03, A-12 |

---

## 2. Trust Boundaries & Attack Surfaces

### 2.1 Trust Boundary Definitions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ BOUNDARY 0: HARDWARE SECURITY                                                │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Secure Enclave / HSM / Hardware Wallet                                   │ │
│ │ Assets: A-01 (seed), A-02 (private keys)                                │ │
│ │ Trust: HIGHEST — hardware-enforced isolation                             │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│ BOUNDARY 1: WALLET RUNTIME                                                   │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Key Manager, Identity Core, Consent Engine, Vault Controller            │ │
│ │ Assets: A-03 through A-08 (in-memory plaintext)                         │ │
│ │ Trust: HIGH — application-level isolation, memory protection            │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│ BOUNDARY 2: LOCAL STORAGE                                                    │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ SQLite / LevelDB on device                                              │ │
│ │ Assets: A-05 (encrypted), A-07 (consent registry), A-11 (logs)          │ │
│ │ Trust: MEDIUM — OS file permissions, full-disk encryption assumed       │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ UNTRUSTED BOUNDARY
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BOUNDARY 3: REMOTE STORAGE (Zero-Knowledge)                                  │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ R2 / S3 / IPFS / Ceramic / Arweave                                      │ │
│ │ Assets: A-05 (encrypted blobs only)                                     │ │
│ │ Trust: NONE — assumes adversarial, sees only ciphertext                 │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ BOUNDARY 4: BLOCKCHAIN (Public)                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Base L2 — DID Registry, Consent Anchors, Revocations                    │ │
│ │ Assets: A-12 (revocation proofs), DID hashes                            │ │
│ │ Trust: VERIFIED — cryptographic verification, public audit              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ BOUNDARY 5: EXTERNAL PARTIES                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Market Makers, Issuers, Peer Wallets                                    │ │
│ │ Assets: A-04 (consent tokens), signed data                              │ │
│ │ Trust: AUTHENTICATED — DID-verified, consent-scoped                     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Attack Surfaces

| Surface ID | Attack Surface | Entry Points | Boundary |
|------------|----------------|--------------|----------|
| AS-01 | **Key Manager API** | `sign()`, `exportSeed()`, `importSeed()` | B1 |
| AS-02 | **Consent Request Handler** | `requestConsent()`, incoming market requests | B1/B5 |
| AS-03 | **Object Resolver** | `aoc://` URI parsing, pack unpacking | B1 |
| AS-04 | **SDL Parser** | JSON/CBOR/MessagePack deserialization | B1 |
| AS-05 | **Storage Adapter I/O** | `put()`, `get()`, `sync()` | B2/B3 |
| AS-06 | **Chain Adapter RPC** | Transaction submission, event monitoring | B4 |
| AS-07 | **Transport Layer** | HTTP endpoints, WebSocket, P2P messages | B5 |
| AS-08 | **QR/NFC Interface** | Offline consent initiation | B5 |
| AS-09 | **Recovery Interface** | Seed phrase input, social recovery | B1 |
| AS-10 | **Local Database** | SQLite queries, file access | B2 |

### 2.3 Trust Assumptions

| Assumption ID | Assumption | Justification |
|---------------|------------|---------------|
| TA-01 | User device OS is not fully compromised | If OS is rooted/jailbroken with kernel-level access, no software protection suffices |
| TA-02 | Hardware security module (if present) is not physically compromised | HSM provides tamper-evident protection |
| TA-03 | Cryptographic primitives (AES-256-GCM, secp256k1, SHA-256) are secure | Industry-standard, well-audited algorithms |
| TA-04 | User does not intentionally leak their seed phrase | Social engineering is out of scope for technical mitigations |
| TA-05 | Base L2 blockchain is live and has honest majority | Standard blockchain assumption |
| TA-06 | TLS certificates are valid and CA system is not compromised | Standard web PKI assumption |
| TA-07 | System clock is approximately correct (±5 minutes) | Required for consent expiration |

### 2.4 Explicitly Untrusted

| Entity | Why Untrusted | Implications |
|--------|---------------|--------------|
| Storage backends | Third-party infrastructure | Zero-knowledge design required |
| Market Makers | External services | Consent-scoped access only |
| Network ISPs | Can observe traffic | TLS + padding + timing jitter |
| Chain observers | Public blockchain | No PII on-chain |
| Other wallets | Potentially malicious | Verify all signatures |
| Recovery contacts | Social recovery | Threshold schemes only |

---

## 3. Threat Enumeration by Module

### 3.1 IKeyManager Threats

| Threat ID | Threat | Attack Vector | Impact |
|-----------|--------|---------------|--------|
| KM-01 | **Seed phrase extraction** | Memory dump, cold boot attack, swap file analysis | Complete wallet compromise |
| KM-02 | **Side-channel key leakage** | Timing attack on `sign()`, power analysis | Private key recovery |
| KM-03 | **Weak entropy in key generation** | PRNG state compromise, low-entropy seed | Predictable keys |
| KM-04 | **Unauthorized signing** | Missing authentication on `sign()`, UI spoofing | Fraudulent transactions/consents |
| KM-05 | **Key derivation path confusion** | Incorrect BIP-44 path, key reuse | Cross-account key collision |
| KM-06 | **Seed phrase brute force** | Weak passphrase, dictionary attack | Seed recovery by attacker |
| KM-07 | **Hardware wallet bypass** | Software fallback to software keys | Reduced security |
| KM-08 | **Recovery phrase phishing** | Fake recovery UI, clipboard hijack | Seed theft |
| KM-09 | **Key rotation failure** | Old keys remain valid after rotation | Continued access with compromised key |
| KM-10 | **Signature malleability** | ECDSA malleability not handled | Replay/modification attacks |

---

### 3.2 IIdentityCore Threats

| Threat ID | Threat | Attack Vector | Impact |
|-----------|--------|---------------|--------|
| IC-01 | **DID hijacking** | Compromise key bound to DID, no on-chain anchor | Identity theft |
| IC-02 | **DID document tampering** | Man-in-the-middle on resolution | Redirect verifications |
| IC-03 | **Stale DID resolution** | Cache poisoning, outdated document | Use of revoked keys |
| IC-04 | **Verification method confusion** | Wrong key type in document | Signature verification bypass |
| IC-05 | **DID correlation** | Same DID used across contexts | Cross-context tracking |
| IC-06 | **Key rotation race condition** | Old key signs during rotation | Split-brain identity |
| IC-07 | **Service endpoint spoofing** | Attacker registers similar endpoint | Redirect consent requests |

---

### 3.3 IConsentEngine Threats

| Threat ID | Threat | Attack Vector | Impact |
|-----------|--------|---------------|--------|
| CE-01 | **Consent token forgery** | Signature bypass, weak validation | Unauthorized data access |
| CE-02 | **Scope escalation** | Modify token to add fields | Access beyond consent |
| CE-03 | **Consent replay** | Reuse expired/revoked token | Continued access after revocation |
| CE-04 | **Time manipulation** | System clock skew, NTP attack | Extend expired consent |
| CE-05 | **Purpose drift** | Data used for undeclared purpose | Privacy violation |
| CE-06 | **Revocation bypass** | Ignore on-chain revocation status | Access after revocation |
| CE-07 | **UI consent confusion** | Misleading consent prompt | User grants unintended access |
| CE-08 | **Consent flooding** | DoS via excessive consent requests | User fatigue, accidental approval |
| CE-09 | **Empty scope consent** | Token with no fields passes validation | Violates invariant CE-INV-2 |
| CE-10 | **Constraint bypass** | Ignore max_access_count, geo_fence | Exceed consent limitations |
| CE-11 | **Delegation attack** | Recipient shares token with third party | Non-transferability violation |

---

### 3.4 IVaultController Threats

| Threat ID | Threat | Attack Vector | Impact |
|-----------|--------|---------------|--------|
| VC-01 | **Encryption key leakage** | Memory dump, key in logs | Vault decryption |
| VC-02 | **Ciphertext tampering** | Modify encrypted blob | Data corruption, crash |
| VC-03 | **Nonce reuse** | AES-GCM nonce collision | Plaintext recovery |
| VC-04 | **Metadata exposure** | Field IDs stored unencrypted | Reveal data categories |
| VC-05 | **Unauthorized decryption** | Bypass consent check on `getField()` | Data theft |
| VC-06 | **Field deletion failure** | Logical delete leaves data | Data persists after deletion |
| VC-07 | **Proof detachment** | Separate proof from field | Credential misattribution |
| VC-08 | **Blob size inference** | Unpadded blobs reveal content type | Privacy leak |
| VC-09 | **Cross-field correlation** | Shared encryption key for related fields | Linkage attack |
| VC-10 | **Tombstone enumeration** | Deleted fields still indexed | Reveal historical data existence |

---

### 3.5 ISDLEngine Threats

| Threat ID | Threat | Attack Vector | Impact |
|-----------|--------|---------------|--------|
| SDL-01 | **Parser DoS** | Deeply nested JSON, huge arrays | CPU exhaustion |
| SDL-02 | **Type confusion** | Unexpected type coercion | Logic errors, bypass |
| SDL-03 | **Namespace injection** | Malicious field IDs like `../../../secret` | Path traversal equivalent |
| SDL-04 | **Schema poisoning** | Malicious schematic from market | Accept invalid data |
| SDL-05 | **Serialization divergence** | JSON vs CBOR produce different hashes | Signature mismatch |
| SDL-06 | **Unicode normalization** | Homoglyph attacks in field labels | User confusion |
| SDL-07 | **Integer overflow** | Large numbers in `number` type fields | Arithmetic errors |

---

### 3.6 IObjectResolver Threats

| Threat ID | Threat | Attack Vector | Impact |
|-----------|--------|---------------|--------|
| OR-01 | **URI injection** | Malformed `aoc://` URI | Code injection, path traversal |
| OR-02 | **Reference loop** | Circular field references | Infinite loop, DoS |
| OR-03 | **Pack signature stripping** | Remove signature, re-sign with attacker key | Pack forgery |
| OR-04 | **Proof substitution** | Replace proof with attacker's credential | False attestation |
| OR-05 | **Reference resolution SSRF** | URI points to internal resource | Information disclosure |
| OR-06 | **Pack bomb** | Highly compressed pack expands to huge size | Memory exhaustion |
| OR-07 | **Stale reference** | Reference points to deleted/updated field | Inconsistent data |

---

### 3.7 IStorageAdapter Threats

| Threat ID | Threat | Attack Vector | Impact |
|-----------|--------|---------------|--------|
| SA-01 | **Storage backend compromise** | Attacker gains access to R2/IPFS | Access to encrypted blobs |
| SA-02 | **Blob deletion** | Malicious deletion of user data | Availability loss |
| SA-03 | **Blob substitution** | Replace blob with different ciphertext | Data corruption on decrypt |
| SA-04 | **Content ID collision** | Hash collision in content addressing | Wrong data returned |
| SA-05 | **Sync conflict** | Concurrent writes from multiple devices | Data loss or corruption |
| SA-06 | **Access pattern analysis** | Storage provider monitors get/put timing | Behavioral inference |
| SA-07 | **Storage quota exhaustion** | Attacker fills user's storage | Denial of service |
| SA-08 | **Retention policy bypass** | Data persists after user deletion | GDPR compliance failure |

---

### 3.8 IChainAdapter Threats

| Threat ID | Threat | Attack Vector | Impact |
|-----------|--------|---------------|--------|
| CA-01 | **Transaction malleability** | Modify tx before mining | Double-spend, confusion |
| CA-02 | **Gas price manipulation** | Front-running, sandwich attack | Failed transactions, MEV loss |
| CA-03 | **Smart wallet upgrade attack** | Malicious implementation upgrade | Complete wallet takeover |
| CA-04 | **Paymaster manipulation** | Malicious gas sponsor adds conditions | Conditional transaction execution |
| CA-05 | **Chain reorganization** | Reorg removes anchor transaction | False revocation status |
| CA-06 | **RPC endpoint compromise** | Malicious RPC returns false data | Wrong chain state |
| CA-07 | **Nonce desync** | Transaction stuck, nonce gap | Temporary DoS |
| CA-08 | **DID registry poisoning** | Attacker registers conflicting DID | Identity confusion |
| CA-09 | **Revocation race** | Access data before revocation confirms | Brief window of unauthorized access |
| CA-10 | **Gas exhaustion attack** | Drain wallet ETH via dust transactions | Unable to anchor/revoke |

---

### 3.9 ITransportAdapter Threats

| Threat ID | Threat | Attack Vector | Impact |
|-----------|--------|---------------|--------|
| TA-01 | **Man-in-the-middle** | TLS stripping, certificate pinning bypass | Intercept/modify messages |
| TA-02 | **Replay attack** | Capture and resend signed request | Duplicate actions |
| TA-03 | **Request flooding** | DoS via high volume of requests | Service unavailability |
| TA-04 | **WebSocket hijacking** | Session token theft, cross-site | Impersonate wallet |
| TA-05 | **P2P eclipse attack** | Isolate wallet from honest peers | Denial of service |
| TA-06 | **QR code manipulation** | Display tampered QR code | Redirect consent to attacker |
| TA-07 | **NFC relay attack** | Relay NFC signal to remote attacker | Proximity bypass |
| TA-08 | **DNS rebinding** | Redirect API calls to local resources | Information disclosure |
| TA-09 | **Traffic analysis** | Observe timing, size, endpoints | Behavioral profiling |
| TA-10 | **Endpoint enumeration** | Discover wallet's market connections | Privacy leak |

---

## 4. Threat Enumeration by Data Flow

### 4.1 Store Object Flow

```
Input → SDL Engine → Vault Controller → Storage Adapter → Backend
```

| Step | Threats | Mitigations |
|------|---------|-------------|
| **1. Input Reception** | SDL-01 (parser DoS), SDL-06 (unicode) | Input size limits, normalization |
| **2. SDL Validation** | SDL-02 (type confusion), SDL-03 (namespace injection) | Strict schema validation, allowlist namespaces |
| **3. Key Derivation** | VC-01 (key leakage), KM-05 (path confusion) | Secure memory, deterministic derivation |
| **4. Encryption** | VC-03 (nonce reuse), VC-02 (no auth) | Counter-based nonce, AES-GCM auth tag |
| **5. Metadata Attachment** | VC-04 (metadata exposure) | Encrypt metadata separately |
| **6. Storage Write** | SA-03 (substitution), SA-05 (sync conflict) | Content-addressed storage, vector clocks |
| **7. Index Update** | VC-10 (tombstone enumeration) | Encrypted index entries |

**Flow-Level Threats:**

| Threat ID | Threat | Impact | Mitigation |
|-----------|--------|--------|------------|
| SF-01 | Attacker injects malicious field during import | Data corruption, potential XSS if displayed | Sanitize all imported data |
| SF-02 | Storage write fails silently | Data loss | Verify write success, local-first fallback |
| SF-03 | Concurrent store operations corrupt index | Data inconsistency | Transactional writes |

---

### 4.2 Create Pack Flow

```
Field Selection → Object Resolver → Vault Controller → Proof Bundler → Key Manager → Pack Output
```

| Step | Threats | Mitigations |
|------|---------|-------------|
| **1. Field Selection** | CE-02 (scope escalation) | Validate against active consent |
| **2. Reference Resolution** | OR-02 (loop), OR-07 (stale ref) | Depth limit, freshness check |
| **3. Decryption** | VC-05 (unauthorized decrypt), VC-01 (key leak) | Consent check, secure memory |
| **4. Proof Attachment** | OR-04 (proof substitution) | Verify proof-field binding |
| **5. Pack Assembly** | OR-06 (pack bomb) | Output size limits |
| **6. Signing** | KM-04 (unauthorized sign), KM-10 (malleability) | User confirmation, canonical signing |
| **7. Pack Output** | OR-03 (signature stripping) | Include signature in hash |

**Flow-Level Threats:**

| Threat ID | Threat | Impact | Mitigation |
|-----------|--------|--------|------------|
| CP-01 | Pack contains more fields than user approved | Privacy violation | Double-check scope before signing |
| CP-02 | Proof from revoked issuer included | Invalid attestation | Check issuer revocation status |
| CP-03 | Pack transmitted over insecure channel | Data exposure | Encrypt pack to recipient |

---

### 4.3 Request Consent Flow

```
Market Request → Transport → Connection Manager → Consent Engine → User Prompt
```

| Step | Threats | Mitigations |
|------|---------|-------------|
| **1. Request Reception** | TA-01 (MITM), TA-03 (flooding) | TLS, rate limiting |
| **2. Signature Verification** | CE-01 (forgery) | Verify market DID signature |
| **3. Market Validation** | IC-02 (DID tampering), IC-03 (stale) | Fresh DID resolution |
| **4. Schematic Parsing** | SDL-04 (schema poisoning) | Validate schematic structure |
| **5. Field Availability Check** | VC-04 (metadata exposure) | Return generic "unavailable" |
| **6. Policy Evaluation** | CE-07 (UI confusion), CE-08 (flooding) | Clear UI, request queuing |
| **7. User Prompt** | KM-08 (phishing) | Trusted UI indicator |

**Flow-Level Threats:**

| Threat ID | Threat | Impact | Mitigation |
|-----------|--------|--------|------------|
| RC-01 | Malicious market requests excessive fields | Over-sharing | Highlight unusual requests |
| RC-02 | Request appears from trusted market but is spoofed | Misdirected consent | Verify full DID chain |
| RC-03 | User cannot understand requested fields | Uninformed consent | Human-readable field labels |

---

### 4.4 Grant Consent Flow

```
User Approval → Consent Engine → Key Manager → Chain Adapter → Transport → Market
```

| Step | Threats | Mitigations |
|------|---------|-------------|
| **1. User Confirmation** | CE-07 (confusion), KM-04 (unauthorized) | Explicit confirmation, biometric |
| **2. Token Generation** | CE-09 (empty scope), CE-04 (time manip) | Validate invariants, trusted time |
| **3. Signing** | KM-02 (side-channel), KM-04 (unauthorized) | Constant-time signing, user auth |
| **4. Registry Update** | SA-05 (sync conflict) | Atomic write |
| **5. Chain Anchoring** | CA-05 (reorg), CA-09 (race) | Wait for confirmations |
| **6. Token Transmission** | TA-01 (MITM), TA-02 (replay) | TLS, nonces |
| **7. Audit Logging** | I-04 (tamper) | Append-only log with hash chain |

**Flow-Level Threats:**

| Threat ID | Threat | Impact | Mitigation |
|-----------|--------|--------|------------|
| GC-01 | Token delivered to wrong recipient | Data exposure to attacker | Verify recipient DID before send |
| GC-02 | User grants consent while impaired/coerced | Unwanted data sharing | Cooling-off period option |
| GC-03 | Anchor transaction fails but token already sent | Weak non-repudiation | Await anchor before token delivery |

---

### 4.5 Resolve Object Flow

```
URI + Token → Object Resolver → Consent Engine → Vault Controller → Decrypted Data
```

| Step | Threats | Mitigations |
|------|---------|-------------|
| **1. URI Parsing** | OR-01 (injection), OR-05 (SSRF) | Strict URI validation |
| **2. Token Validation** | CE-01 (forgery), CE-03 (replay) | Signature + expiry + scope check |
| **3. Revocation Check** | CE-06 (bypass) | On-chain revocation query |
| **4. Scope Verification** | CE-02 (escalation), CE-10 (constraint bypass) | Match URI to token scope |
| **5. Access Count Check** | CE-10 (constraint bypass) | Atomic increment + check |
| **6. Decryption** | VC-01 (key leak), VC-05 (unauthorized) | Scoped decryption keys |
| **7. Response Assembly** | OR-04 (proof substitution) | Verify proof binding |
| **8. Audit Logging** | I-04 (tamper) | Tamper-evident log |

**Flow-Level Threats:**

| Threat ID | Threat | Impact | Mitigation |
|-----------|--------|--------|------------|
| RO-01 | Resolver returns cached stale data | Incorrect information shared | Cache invalidation on update |
| RO-02 | Partial resolution leaks existence of other fields | Metadata leak | Generic error responses |
| RO-03 | Resolution timing reveals data characteristics | Side-channel | Constant-time operations |

---

## 5. Risk Rating Table

### 5.1 Risk Scoring Methodology

- **Likelihood (L):** 1=Rare, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain
- **Impact (I):** 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Catastrophic
- **Risk Score:** L × I (1-25)
- **Priority:** P0 (20-25), P1 (12-19), P2 (6-11), P3 (1-5)

### 5.2 Risk Rating Table

> **P0 Classification Note:** P0 threats represent catastrophic failure modes for a sovereign wallet where compromise results in irreversible loss of user control, privacy, or funds. These include: seed/key exfiltration, consent bypass (forgery, replay, scope escalation), catastrophic cryptographic misuse (nonce reuse, weak entropy), undetectable data substitution, and RPC-based validation spoofing. All P0 threats MUST be mitigated before MVP.

| Threat ID | Module/Flow | Description | L | I | Risk | Mitigation | Priority |
|-----------|-------------|-------------|---|---|------|------------|----------|
| KM-01 | KeyManager | Seed phrase extraction via memory dump | 4 | 5 | 20 | Secure enclave, memory encryption | P0 |
| KM-02 | KeyManager | Side-channel timing attack on signing | 2 | 5 | 10 | Constant-time implementation | P1 |
| KM-03 | KeyManager | Weak PRNG entropy | 4 | 5 | 20 | Hardware RNG, entropy pool | P0 |
| KM-04 | KeyManager | Unauthorized signing (no user auth) | 4 | 5 | 20 | Biometric/PIN before sign | P0 |
| KM-06 | KeyManager | Seed brute force (weak passphrase) | 3 | 5 | 15 | Enforce strong passphrase | P0 |
| KM-08 | KeyManager | Recovery phrase phishing | 4 | 5 | 20 | Security education, trusted UI | P0 |
| KM-10 | KeyManager | Signature malleability exploitation | 3 | 5 | 15 | Canonical signatures (low-s), strict validation | P0 |
| CE-01 | ConsentEngine | Consent token forgery | 4 | 5 | 20 | Strong signature validation | P0 |
| CE-02 | ConsentEngine | Consent scope escalation | 3 | 5 | 15 | Strict scope validation, immutable tokens | P0 |
| CE-03 | ConsentEngine | Consent replay after revocation | 4 | 5 | 20 | On-chain revocation check, nonce binding | P0 |
| CE-04 | ConsentEngine | Time manipulation extends expiry | 3 | 4 | 12 | Trusted time source, grace period | P1 |
| CE-06 | ConsentEngine | Revocation bypass | 3 | 5 | 15 | Mandatory revocation check | P0 |
| CE-07 | ConsentEngine | UI consent confusion | 4 | 4 | 16 | Clear, standardized consent UI | P1 |
| CE-08 | ConsentEngine | Consent request flooding | 4 | 2 | 8 | Rate limiting, queue | P2 |
| CE-09 | ConsentEngine | Empty scope consent passes validation | 3 | 5 | 15 | Validate scope ≠ ∅ invariant | P0 |
| VC-01 | VaultController | Encryption key leakage | 4 | 5 | 20 | Secure memory, no logging, zeroization | P0 |
| VC-03 | VaultController | AES-GCM nonce reuse | 3 | 5 | 15 | Counter-based nonces, atomic persistence | P0 |
| VC-04 | VaultController | Metadata exposure (field IDs) | 4 | 3 | 12 | Encrypt field identifiers | P1 |
| VC-05 | VaultController | Unauthorized decryption bypasses consent | 3 | 5 | 15 | Mandatory consent token on getField() | P0 |
| VC-08 | VaultController | Blob size inference | 4 | 3 | 12 | Fixed-size padding | P1 |
| SDL-01 | SDLEngine | Parser denial of service | 3 | 2 | 6 | Input limits, timeouts | P2 |
| SDL-03 | SDLEngine | Namespace injection | 3 | 4 | 12 | Strict namespace validation | P1 |
| OR-01 | ObjectResolver | URI injection | 3 | 4 | 12 | Strict URI parsing | P1 |
| OR-02 | ObjectResolver | Reference loop DoS | 3 | 2 | 6 | Depth limit, cycle detection | P2 |
| OR-03 | ObjectResolver | Pack signature stripping/re-signing | 3 | 5 | 15 | Signature in content hash, verify before use | P0 |
| SA-01 | StorageAdapter | Storage backend compromise | 3 | 3 | 9 | Zero-knowledge encryption | P2 |
| SA-03 | StorageAdapter | Blob substitution (undetected tampering) | 3 | 5 | 15 | Content-addressed storage, auth tags | P0 |
| SA-06 | StorageAdapter | Access pattern analysis | 4 | 3 | 12 | Access obfuscation, dummy reads | P1 |
| CA-03 | ChainAdapter | Smart wallet upgrade attack | 2 | 5 | 10 | Timelock on upgrades | P1 |
| CA-05 | ChainAdapter | Chain reorg removes anchor | 2 | 4 | 8 | Wait for finality | P2 |
| CA-06 | ChainAdapter | Malicious RPC endpoint returns false data | 4 | 5 | 20 | Multiple RPC sources, consensus validation | P0 |
| TA-01 | TransportAdapter | Man-in-the-middle attack | 3 | 4 | 12 | TLS required, certificate pinning | P1 |
| TA-09 | TransportAdapter | Traffic analysis | 4 | 3 | 12 | Padding, timing jitter | P1 |
| IC-01 | IdentityCore | DID hijacking via key compromise | 2 | 5 | 10 | On-chain anchor, rotation | P1 |
| IC-05 | IdentityCore | DID correlation across contexts | 4 | 3 | 12 | Context-specific DIDs | P1 |
| SF-01 | StoreObject | Malicious field injection | 3 | 3 | 9 | Input sanitization | P2 |
| CP-01 | CreatePack | Pack contains extra fields | 2 | 4 | 8 | Scope verification | P2 |
| RC-01 | RequestConsent | Excessive field request | 4 | 3 | 12 | Request anomaly detection | P1 |
| GC-01 | GrantConsent | Token to wrong recipient | 3 | 5 | 15 | DID verification before transmission | P0 |
| RO-03 | ResolveObject | Timing side-channel | 3 | 3 | 9 | Constant-time resolution | P2 |

---

## 6. Metadata Leakage Threat Model

### 6.1 Adversary Model

**Adversary Capabilities:**

| Adversary | Access | Capabilities |
|-----------|--------|--------------|
| **Storage Provider** | All encrypted blobs | Count, size, timestamps, access patterns |
| **Network ISP** | All network traffic | Endpoints, timing, volume, IP addresses |
| **Chain Observer** | All on-chain data | Transaction timing, addresses, gas usage |
| **Malicious Market** | Consent tokens received | Token metadata, request patterns |
| **Colluding Adversaries** | Combined data | Cross-correlation attacks |

### 6.2 Correlation Attacks

#### 6.2.1 Storage-Network Correlation

**Attack:** Storage provider and ISP collude to correlate storage writes with network activity.

```
Storage: Write blob_123 at T1
Network: Request to market.example.com at T1+50ms
Inference: User shared data with market.example.com
```

**Mitigation:**
- Batched writes (P1)
- Random delays between network activity and storage (P2)
- Dummy storage operations (P2)

#### 6.2.2 Chain-Storage Correlation

**Attack:** Correlate on-chain consent anchors with storage access patterns.

```
Chain: Consent anchor at block 12345
Storage: Read blob_456, blob_789 at T1
Inference: blob_456 and blob_789 are fields in consented scope
```

**Mitigation:**
- Delayed anchoring (P1)
- Read all blobs not just consented ones (P2)
- Merkle tree anchoring (P1)

#### 6.2.3 Temporal Pattern Analysis

**Attack:** Analyze timing patterns to infer user behavior.

```
Pattern: Storage writes every Monday 9 AM
Inference: User updates work-related fields weekly
Pattern: Consent grants spike during job search season
Inference: User is job hunting
```

**Mitigation:**
- Timestamp quantization (P0)
- Background sync noise (P2)
- Randomized consent anchor timing (P2)

#### 6.2.4 Size-Based Inference

**Attack:** Blob sizes reveal content types.

```
Observation: Blob is 50KB
Inference: Likely an image (resume photo?)
Observation: Blob is 200 bytes
Inference: Likely a simple text field
```

**Mitigation:**
- Fixed-size padding buckets: 1KB, 4KB, 16KB, 64KB, 256KB (P0)

#### 6.2.5 Consent Token Scope Analysis

**Attack:** Token metadata reveals data categories even without values.

```
Token scope: ["person.health.*", "person.medical.*"]
Inference: User is sharing health information
Token purpose: "insurance_quote"
Inference: User is shopping for health insurance
```

**Mitigation:**
- Encrypted scope (P2)
- Generic purpose codes (P1)
- Fixed-size tokens (P1)

### 6.3 Linkage Risks

| Linkage Type | Data Points | Inference | Risk Level |
|--------------|-------------|-----------|------------|
| **Wallet-to-DID** | On-chain txs, DID anchors | Link wallet address to identity | High |
| **DID-to-Markets** | Consent tokens | Which services user interacts with | High |
| **Fields-to-Activity** | Access patterns | What data user cares about | Medium |
| **Time-to-Behavior** | Timestamps | User's daily/weekly routine | Medium |
| **Device-to-Wallet** | IP, User-Agent | Geographic/device profiling | Medium |

### 6.4 What Can Be Inferred

| Observable | Inference | Confidence |
|------------|-----------|------------|
| Number of blobs | Amount of sovereign data | High |
| Blob size distribution | Types of data stored | Medium |
| Write frequency | User activity level | High |
| Consent frequency | Service engagement level | High |
| Revocation frequency | Privacy consciousness or disputes | Medium |
| Chain transaction count | On-chain activity level | High |
| Market diversity | Breadth of service usage | High |
| Schematic requests | Industries user engages with | High |

### 6.5 Mitigation Mapping

| Mitigation | Threats Addressed | Priority | Implementation Phase |
|------------|-------------------|----------|---------------------|
| **Blob padding to size classes** | Size inference | P0 | MVP |
| **Timestamp quantization** | Temporal analysis | P0 | MVP |
| **Nonce-based request IDs** | Replay, correlation | P0 | MVP |
| **Batched storage operations** | Access pattern analysis | P1 | v1.0 |
| **Merkle tree anchoring** | Consent-storage correlation | P1 | v1.0 |
| **Delayed chain anchoring** | Temporal correlation | P1 | v1.0 |
| **Generic purpose codes** | Scope inference | P1 | v1.0 |
| **Fixed-size consent tokens** | Token metadata inference | P1 | v1.0 |
| **Multiple RPC endpoints** | Chain observation | P1 | v1.0 |
| **Dummy storage operations** | Access pattern obfuscation | P2 | v1.1 |
| **Encrypted consent scope** | Scope inference | P2 | v1.1 |
| **Stealth addresses** | Wallet-DID linkage | P2 | v1.1 |
| **Tor transport option** | Network observation | P2 | v1.1 |
| **Timing jitter** | Temporal correlation | P2 | v1.1 |
| **P2P relay network** | Direct endpoint observation | P3 | Future |
| **Decoy traffic** | Traffic analysis | P3 | Future |
| **Mix networks** | Full anonymity | P3 | Research |

### 6.6 Unsolved in Early Phases

| Issue | Why Unsolved | Planned Resolution |
|-------|--------------|-------------------|
| Full traffic analysis resistance | Requires Tor/mixnet integration | P2 (v1.1) |
| Complete access pattern obfuscation | Performance cost of dummy operations | P2 (v1.1) |
| Wallet-DID unlinkability | Requires stealth addresses | P2 (v1.1) |
| Consent scope privacy | Requires encrypted token design | P2 (v1.1) |
| Cross-market correlation | Fundamental to consent model | Accepted risk |
| Chain transaction linkage | Public blockchain nature | P2 stealth addresses |

---

## 7. Security Backlog

### 7.1 P0 — Must-Have Before MVP

| Item ID | Description | Threat IDs | Module(s) | Acceptance Criteria |
|---------|-------------|------------|-----------|---------------------|
| P0-01 | Secure key generation with hardware RNG | KM-03 | KeyManager | Uses `crypto.getRandomValues()` or equivalent; entropy verified |
| P0-02 | AES-256-GCM encryption with counter nonces | VC-03 | VaultController | Nonce never reused; counter persisted atomically |
| P0-03 | Consent signature validation | CE-01 | ConsentEngine | All tokens verified against issuer DID; invalid tokens rejected |
| P0-04 | Consent replay prevention | CE-03, CE-06 | ConsentEngine | Revocation checked; nonce binding prevents replay |
| P0-05 | Blob integrity verification | SA-03, VC-03 | StorageAdapter, VaultController | Content-addressed storage; auth tags verified on read |
| P0-06 | Memory protection for keys/seeds | KM-01, VC-01 | KeyManager, VaultController | Secure memory allocation; zeroization after use |
| P0-07 | TLS for all network communication | TA-01 | TransportAdapter | No plaintext HTTP; certificate validation enabled |
| P0-08 | User authentication before signing | KM-04 | KeyManager | Biometric or PIN required for `sign()` |
| P0-09 | Input validation for SDL parsing | SDL-03 | SDLEngine | Max depth 10, max array 1000, namespace allowlist |
| P0-10 | URI validation for object resolver | OR-01, OR-03 | ObjectResolver | Strict `aoc://` format; signature verified |
| P0-11 | Consent scope validation | CE-02, CE-09 | ConsentEngine | Non-empty scope; fields must exist; scope immutable |
| P0-12 | Canonical signature enforcement | KM-10 | KeyManager | Low-S normalization; malleability prevented |
| P0-13 | Consent-gated decryption | VC-05 | VaultController | `getField()` requires valid consent token |
| P0-14 | RPC response validation | CA-06 | ChainAdapter | Multiple RPC sources; consensus on critical data |
| P0-15 | Passphrase strength requirement | KM-06 | KeyManager | Minimum entropy enforced; weak passphrases rejected |
| P0-16 | Token delivery verification | GC-01 | ConsentEngine | DID verified before token transmission |

---

### 7.2 P1 — Post-MVP Hardening

| Item ID | Description | Threat IDs | Module(s) | Acceptance Criteria |
|---------|-------------|------------|-----------|---------------------|
| P1-01 | Constant-time signing implementation | KM-02 | KeyManager | Signing time independent of key/message |
| P1-02 | Secure enclave integration (enhanced) | KM-01 | KeyManager | Private keys stored in hardware enclave when available |
| P1-03 | Encrypted field identifiers | VC-04 | VaultController | Field IDs encrypted in storage index |
| P1-04 | Batched storage operations | SA-06 | StorageAdapter | Minimum 5 operations per batch; random timing |
| P1-05 | Merkle tree consent anchoring | CA-05 | ChainAdapter | Batch consents into daily Merkle root |
| P1-06 | Rate limiting on consent requests | CE-08 | ConsentEngine | Max 10 requests/minute per market |
| P1-07 | Clear consent UI with field descriptions | CE-07, RC-03 | ConsentEngine | Human-readable labels; risk indicators |
| P1-08 | Reference depth limit | OR-02 | ObjectResolver | Max depth 5; cycle detection |
| P1-09 | Request deduplication | TA-02 | TransportAdapter | Nonce-based; 5-minute replay window |
| P1-10 | Access pattern obfuscation (basic) | SA-06, TA-09 | StorageAdapter | Read decoy blobs with real requests |
| P1-11 | Smart wallet upgrade timelock | CA-03 | ChainAdapter | 48-hour delay on implementation changes |
| P1-12 | DID rotation support | IC-01, KM-09 | IdentityCore, KeyManager | Key rotation updates DID document atomically |
| P1-13 | Consent expiration with trusted time | CE-04 | ConsentEngine | Server time validation; grace period handling |
| P1-14 | Blob padding to size classes | VC-08 | VaultController | All blobs padded to 1KB/4KB/16KB/64KB/256KB |
| P1-15 | Timestamp quantization | SA-06 | StorageAdapter | Timestamps rounded to 15-minute intervals |

---

### 7.3 P2 — Advanced Privacy

| Item ID | Description | Threat IDs | Module(s) | Acceptance Criteria |
|---------|-------------|------------|-----------|---------------------|
| P2-01 | Stealth addresses for chain operations | IC-05, P-05 | ChainAdapter | One-time addresses derived per transaction |
| P2-02 | Dummy storage operations | SA-06 | StorageAdapter | Background dummy writes; indistinguishable |
| P2-03 | Encrypted consent scope | CE-02 | ConsentEngine | Scope encrypted to recipient; commitment only visible |
| P2-04 | Timing jitter on all operations | TA-09, RO-03 | All | Random 0-500ms delay on responses |
| P2-05 | Tor transport option | TA-09 | TransportAdapter | Optional Tor SOCKS proxy support |
| P2-06 | Delayed consent anchoring | CA-05 | ChainAdapter | Random 1-24 hour delay before anchoring |
| P2-07 | Generic purpose code taxonomy | CE-05 | ConsentEngine | Coarse categories only (e.g., "employment", "finance") |
| P2-08 | Fixed-size consent tokens | VC-08 | ConsentEngine | All tokens padded to 2KB |
| P2-09 | Context-specific DIDs | IC-05 | IdentityCore | Different DID per market category |
| P2-10 | Memory encryption | KM-01 | KeyManager | Encrypt sensitive data in RAM |

---

### 7.4 P3 — Research / Optional

| Item ID | Description | Threat IDs | Module(s) | Acceptance Criteria |
|---------|-------------|------------|-----------|---------------------|
| P3-01 | Mix network integration | TA-09 | TransportAdapter | Route through anonymity network |
| P3-02 | Decoy traffic generation | TA-09 | TransportAdapter | Constant-rate background traffic |
| P3-03 | Zero-knowledge consent proofs | CE-02, P-04 | ConsentEngine | ZKP for scope membership |
| P3-04 | Threshold signature recovery | KM-01 | KeyManager | n-of-m recovery without single point |
| P3-05 | Homomorphic field operations | P-04 | VaultController | Compute on encrypted data |
| P3-06 | TEE-based wallet runtime | KM-01 | All | Run wallet in trusted execution environment |
| P3-07 | Post-quantum key backup | KM-03 | KeyManager | Quantum-resistant seed encryption |
| P3-08 | Verifiable delay functions for anchoring | CA-05 | ChainAdapter | Enforce minimum anchor delay |

---

## 8. Test Strategy for Security

### 8.1 Unit Tests

#### 8.1.1 KeyManager Unit Tests

| Test ID | Test Case | Threat Mitigated |
|---------|-----------|------------------|
| KM-U01 | `generateKeyPair()` produces valid secp256k1 keys | KM-03 |
| KM-U02 | `sign()` requires authentication | KM-04 |
| KM-U03 | Private key never appears in return values | KM-01 |
| KM-U04 | `deriveChild()` follows BIP-44 path correctly | KM-05 |
| KM-U05 | Seed phrase validates against BIP-39 wordlist | KM-06 |
| KM-U06 | Key rotation invalidates old key ID | KM-09 |
| KM-U07 | `exportSeed()` requires elevated authentication | KM-08 |

#### 8.1.2 ConsentEngine Unit Tests

| Test ID | Test Case | Threat Mitigated |
|---------|-----------|------------------|
| CE-U01 | Token with invalid signature rejected | CE-01 |
| CE-U02 | Expired token rejected | CE-04 |
| CE-U03 | Token with empty scope rejected | CE-09 |
| CE-U04 | Revoked token rejected | CE-03 |
| CE-U05 | Scope escalation attempt detected | CE-02 |
| CE-U06 | `max_access_count` enforced | CE-10 |
| CE-U07 | Token cannot be delegated (non-transferable) | CE-11 |

#### 8.1.3 VaultController Unit Tests

| Test ID | Test Case | Threat Mitigated |
|---------|-----------|------------------|
| VC-U01 | Encryption produces authenticated ciphertext | VC-02 |
| VC-U02 | Nonce never reused across encryptions | VC-03 |
| VC-U03 | `getField()` requires valid consent token | VC-05 |
| VC-U04 | Blob padding produces correct size class | VC-08 |
| VC-U05 | Deleted fields return tombstone | VC-06 |
| VC-U06 | Metadata encrypted separately | VC-04 |

### 8.2 Property / Invariant Tests

Based on formal consent invariants from architecture.md:

| Test ID | Invariant | Property Test |
|---------|-----------|---------------|
| INV-01 | `∀ consent: expires_at > issued_at` | Generate 10000 random consents; all must satisfy |
| INV-02 | `∀ consent: scope ≠ ∅` | Attempt to create consent with empty scope; must fail |
| INV-03 | `∀ consent: verify(signature, subject) = true` | All generated tokens must have valid signatures |
| INV-04 | `∀ field_access: ∃ active_consent` | No field access succeeds without consent |
| INV-05 | `serialize(parse(x)) = x` | SDL round-trip for all valid inputs |
| INV-06 | State machine transitions are valid | No EXPIRED → ACTIVE transition |
| INV-07 | Revocation is immediate | Access fails within 100ms of revocation |

**Property Test Framework:** Use property-based testing (e.g., fast-check, Hypothesis) with:
- Random consent generation
- Random field generation
- Random state transitions
- Shrinking for minimal failing cases

### 8.3 Fuzzing Targets

| Target ID | Target | Input Type | Goal |
|-----------|--------|------------|------|
| FUZZ-01 | `SDLEngine.parse()` | Random bytes, malformed JSON | Find parser crashes |
| FUZZ-02 | `ObjectResolver.parseURI()` | Random URI strings | Find injection vulnerabilities |
| FUZZ-03 | `ConsentEngine.validateToken()` | Mutated valid tokens | Find validation bypasses |
| FUZZ-04 | `VaultController.decrypt()` | Corrupted ciphertext | Find decryption errors |
| FUZZ-05 | `TransportAdapter.deserialize()` | Random network payloads | Find deserialization bugs |
| FUZZ-06 | Schematic validation | Malformed schematics | Find schema bypass |

**Fuzzing Tools:**
- AFL++ for binary targets
- libFuzzer for Rust/C++ components
- Jazzer for JVM components
- Atheris for Python components

**Corpus:**
- Valid SDL documents
- Valid consent tokens
- Valid AOC URIs
- Edge cases from unit tests

### 8.4 Adversarial Test Cases

| Test ID | Scenario | Attacker Goal | Expected Result |
|---------|----------|---------------|-----------------|
| ADV-01 | Replay expired consent token | Access data after expiry | Token rejected |
| ADV-02 | Modify token scope and re-sign with attacker key | Scope escalation | Signature invalid |
| ADV-03 | Send consent request from spoofed market DID | Trick user into consenting | DID verification fails |
| ADV-04 | Submit URI with path traversal (`aoc://field/../../../etc/passwd`) | Read system files | URI validation rejects |
| ADV-05 | Create circular field references (A→B→C→A) | DoS via infinite loop | Depth limit triggers |
| ADV-06 | Submit 1000 consent requests per second | DoS via request flooding | Rate limit triggers |
| ADV-07 | Provide malicious schematic with deeply nested structure | Parser DoS | Depth limit triggers |
| ADV-08 | Attempt to derive field encryption key from public data | Key extraction | Derivation requires master key |
| ADV-09 | Access revoked consent before chain confirmation | Race condition access | Local revocation immediate |
| ADV-10 | Tamper with stored ciphertext | Data corruption | Authentication tag fails |
| ADV-11 | Inject malicious field during import | XSS or data corruption | Input sanitization blocks |
| ADV-12 | Clock skew attack to extend consent validity | Access after expiry | Server time validation |

### 8.5 Integration Tests

#### 8.5.1 Consent Lifecycle Tests

| Test ID | Test Case | Components Involved |
|---------|-----------|---------------------|
| INT-01 | Full consent flow: request → approve → resolve → revoke | All modules |
| INT-02 | Consent expiration triggers automatic invalidation | ConsentEngine, scheduler |
| INT-03 | On-chain revocation propagates to resolver | ChainAdapter, ConsentEngine |
| INT-04 | Multi-field consent resolves all fields | ObjectResolver, VaultController |
| INT-05 | Consent with constraints enforces all constraints | ConsentEngine |

#### 8.5.2 Object Resolver Integration Tests

| Test ID | Test Case | Components Involved |
|---------|-----------|---------------------|
| INT-06 | Pack creation includes all referenced fields | ObjectResolver, VaultController |
| INT-07 | Pack signature verifiable by external party | KeyManager, ObjectResolver |
| INT-08 | Pack with proofs maintains proof-field binding | ObjectResolver, VaultController |
| INT-09 | Invalid consent token fails resolution | ConsentEngine, ObjectResolver |
| INT-10 | Partial resolution returns available fields only | ObjectResolver |

#### 8.5.3 Storage Integration Tests

| Test ID | Test Case | Components Involved |
|---------|-----------|---------------------|
| INT-11 | Field stored and retrieved correctly | VaultController, StorageAdapter |
| INT-12 | Sync conflict resolution works | StorageAdapter |
| INT-13 | Local storage works offline | StorageAdapter (local) |
| INT-14 | Remote storage recovers from network failure | StorageAdapter (R2) |
| INT-15 | Blob padding consistent across storage backends | VaultController, StorageAdapter |

#### 8.5.4 Chain Integration Tests

| Test ID | Test Case | Components Involved |
|---------|-----------|---------------------|
| INT-16 | DID registration anchors correctly | IdentityCore, ChainAdapter |
| INT-17 | Consent anchor verifiable on-chain | ConsentEngine, ChainAdapter |
| INT-18 | Revocation visible to verifiers | ConsentEngine, ChainAdapter |
| INT-19 | Smart wallet operations succeed | KeyManager, ChainAdapter |
| INT-20 | Paymaster integration works | ChainAdapter |

### 8.6 Penetration Testing Scope

**In Scope:**
- All wallet interfaces (IKeyManager through ITransportAdapter)
- Consent flow security
- Cryptographic implementation
- Storage encryption
- Chain interactions
- Transport security

**Out of Scope:**
- Physical device security
- Social engineering
- Third-party dependencies (unless integrated)
- DoS attacks on infrastructure (chain, storage backend)

**Test Types:**
- Black-box API testing
- Gray-box with architecture knowledge
- White-box code review for critical paths
- Cryptographic review by specialist

---

## 9. Document History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02 | Initial threat model |

---

## Appendix A: Threat ID Index

| Prefix | Module |
|--------|--------|
| KM-* | IKeyManager |
| IC-* | IIdentityCore |
| CE-* | IConsentEngine |
| VC-* | IVaultController |
| SDL-* | ISDLEngine |
| OR-* | IObjectResolver |
| SA-* | IStorageAdapter |
| CA-* | IChainAdapter |
| TA-* | ITransportAdapter |
| SF-* | Store Object Flow |
| CP-* | Create Pack Flow |
| RC-* | Request Consent Flow |
| GC-* | Grant Consent Flow |
| RO-* | Resolve Object Flow |

---

*This document defines the threat model. Implementation must address all P0 items before MVP release.*
