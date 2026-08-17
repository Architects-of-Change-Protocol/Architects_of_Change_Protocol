---
'@aoc/protocol': minor
---

Add the common Sovereignty Capability invocation and evidence spine to
`@aoc/protocol/sovereignty-capabilities`. SM-01 defined *what* the eight
sovereignty minerals are and SM-02 defined *what* can receive sovereignty;
Protocol can now also express *how one is consumed*, through a single generic
contract that carries any of the eight from request to result to portable
evidence.

New: `SovereigntyCapabilityRef` (a portable canonical id + explicit capability
version, derived from the SM-01 registry via `toSovereigntyCapabilityRef` /
`getSovereigntyCapabilityRef` / `getSovereigntyCapabilityRefByKey`);
`SovereigntyCapabilityInvocationId` and `mintSovereigntyCapabilityInvocationId`
(`aoc:sovereignty-capability-invocation:<uuid>`, independent of capability,
subject, correlation, input and timestamp);
`SovereigntyCapabilityInvocation<TInput>` with its builder and validator;
`SovereigntyCapabilityImplementation<TInput, TOutput>` and the explicit
success/failure `SovereigntyCapabilityExecutionOutcome<TOutput>`;
`SovereigntyCapabilityResult<TOutput>`;
`SovereigntyCapabilityInvocationEvidenceV1`; `invokeSovereigntyCapability`; and
the typed `SovereigntyCapabilityInvocationError`.

The subject is deliberately optional at the common layer, so an
Identity-shaped invocation can begin before any `SovereignAssetId` exists and
return the one it creates, an Integrity-shaped invocation can consume raw bytes
with no sovereign identity at all, and an existing `SovereignSubjectRef` —
including an open-world external reference from a namespace Protocol has never
heard of — travels through unchanged. Capability input is never canonicalized,
copied or inspected by this layer, so binary and non-JSON payloads remain
legitimate.

Evidence is portable, canonicalizes under `aoc-canonical-json/1`, and carries
the exact capability id and version, the invocation id, timestamps, optional
correlation id and subject, the outcome and any stable reason codes — and never
the raw input, the raw output, bytes, credentials, exception text or stack
traces. It is a statement that an invocation occurred, not proof that the
implementation was trustworthy or that any claim it made is true; unsigned
invocation evidence is not cryptographic proof. Persistence reuses the existing
Protocol-owned `AuditEventSink`/`AuditEventEnvelope` rather than adding a second
logging architecture, and is genuinely optional: with no sink configured the
result still carries the full evidence record.

Additive only: no existing export changed, the canonical inventory remains eight
and read-only, no global implementation registry is introduced, and no
production implementation of any capability ships in this change — SM-04 owns
the first real Identity and Integrity capsules. No Enterprise policy, grant,
authorization, enforcement or billing semantics enter the invocation path.
