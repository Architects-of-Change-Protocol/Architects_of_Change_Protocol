# Architects of Change (AOC) + XDNA Integration Specification  
Version: 0.1  
Status: Draft  
Author: Victor Valverde  
Protocol: Architects of Change  

---

# 1. Abstract

Architects of Change (AOC) is a sovereign data ownership protocol that introduces structured ownership, consent, and economic control over personal data.

XDNA provides verifiable identity and compliance infrastructure based on cryptographic credentials and zero-knowledge proofs anchored to XRPL.

This document defines how AOC integrates XDNA credentials as native verification primitives, enabling a full sovereign data stack where:

- XDNA provides identity verification and compliance proofs  
- AOC provides ownership, consent orchestration, and economic control  

This integration enables users to retain sovereign ownership of their data while leveraging trusted identity verification infrastructure.

---

# 2. Problem Statement

Identity protocols solve identity verification.

However, identity verification alone does not provide:

- ownership of data  
- programmable consent  
- economic participation  
- structured permission control  
- revocation tracking  

AOC introduces the ownership layer required to operationalize identity sovereignty.

---

# 3. Architectural Overview

Integration stack:
Application Layer
(HRKey, lending, employment, healthcare, etc)

↑

AOC Ownership Layer
	•	Consent Objects
	•	Field Manifests
	•	Pack Objects
	•	Sovereign Vault

↑

Credential Verification Layer
	•	XDNA zk-credentials
	•	XRPL identity primitives

↑

Settlement / Anchoring Layer
	•	XRPL
	•	Base L2
XDNA serves as the identity verification layer.

AOC serves as the ownership and consent orchestration layer.

---

# 4. XDNA Credential Consumption Model

XDNA credentials are integrated into AOC via Consent Objects.

Example:
ConsentObject {
subjectDID: did:xrpl:abc123
credentialHash: SHA256(XDNA credential)
verificationProvider: "XDNA"
verificationProofRef: zkProofReference
permissions: {
readableBy: [marketMakerIDs]
revocable: true
monetizable: true
}
}
AOC stores only:

- credential hash
- verification reference
- consent rules

AOC does NOT store raw identity credentials.

---

# 5. Credential Verification Flow

Step 1 — Identity creation  
User obtains XDNA credential.

Step 2 — Credential anchoring  
Credential hash is registered in AOC Consent Object.

Step 3 — Consent definition  
User defines access permissions.

Step 4 — Verification request  
Institution requests credential verification via AOC.

Step 5 — Proof validation  
AOC validates credential authenticity via XDNA verification.

Step 6 — Consent enforcement  
AOC enforces ownership and access rules.

---

# 6. Trust Model

XDNA guarantees:

- identity authenticity
- credential validity

AOC guarantees:

- ownership enforcement
- permission enforcement
- access control
- consent management

Trust boundary separation preserves protocol modularity.

---

# 7. Privacy Model

AOC never stores raw credentials.

Only stores:

- hashes
- references
- consent logic

Identity data remains user-controlled.

---

# 8. Economic Layer Integration

AOC enables economic participation around verified identity.

Examples include:

- permissioned identity access
- paid credential verification
- reputation markets
- identity-backed financial services

XDNA provides credential authenticity.

AOC enables credential ownership and economic utility.

---

# 9. Revocation Model

Revocation may occur at two layers:

Identity revocation — XDNA

Ownership revocation — AOC Consent Object

These operate independently.

---

# 10. Security Model

Security assumptions:

XDNA provides cryptographic identity guarantees.

AOC provides ownership and permission guarantees.

Combined architecture prevents:

- unauthorized access
- identity forgery
- consent violations

---

# 11. Interoperability Model

AOC is credential-provider agnostic.

XDNA is one supported provider.

Future supported providers may include:

- XRPL identity primitives
- Polygon ID
- Spruce ID
- other verifiable credential systems

---

# 12. Implementation Requirements

Minimum integration requirements:

- credential hash anchoring
- DID reference support
- verification interface compatibility

Optional enhancements:

- automated credential discovery
- revocation listeners
- zk-proof native validation

---

# 13. Strategic Impact

This integration enables:

- sovereign identity ownership
- programmable identity consent
- institutional-grade identity verification
- secure identity-based economic systems

---

# 14. Conclusion

AOC provides the ownership and consent layer required to operationalize identity sovereignty.

XDNA provides identity verification primitives.

Together they form a complete sovereign identity and data ownership architecture.
