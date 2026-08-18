"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVIDENCE_SUBMISSION_BASE_KEYS = exports.EvidenceIntakePathway = void 0;
exports.evidenceIntakePayloadKey = evidenceIntakePayloadKey;
exports.isEvidenceIntakePathway = isEvidenceIntakePathway;
exports.submittedEvidenceRef = submittedEvidenceRef;
/**
 * `ProtocolizationEvidenceSubmission` — an *attempt* to introduce evidence into
 * a `ProtocolizationCase`.
 *
 * This is the vertical's intake envelope. It is **not** Protocol's evidence
 * primitive, it does not extend one, and it never becomes one: a submission
 * describes a workflow act — who is offering what, against which requirements,
 * through which pathway, correlated to which request — and it stops existing
 * the moment intake resolves. What survives is an `EvidenceIntakeReceipt` and,
 * for an accepted submission, an APV-04 material association.
 *
 * A submission carries no bytes. There is no file, no blob, no upload, no
 * storage handle and no PII by construction — the same exclusion APV-04 froze
 * for case material and APV-02 §2.3 froze for the result envelope. Evidence
 * whose substance is a document reaches this layer as a *reference* to a
 * Protocol record that already describes it.
 *
 * ### Why there is no `tenantId` field
 *
 * The acting tenant travels in the operation context, exactly as it does for
 * every APV-04 case operation, and for the same reason: a tenant read off the
 * value being operated on can never disagree with itself, so a cross-tenant
 * call would be invisible. A second spelling of the tenant on the submission
 * could also disagree with the context's — and then something would have to
 * decide which one is authoritative. The receipt records the tenant that
 * actually acted.
 */
/**
 * How the caller supplies the canonical evidence this submission is about.
 *
 * Both pathways end at the same place — a `CanonicalEvidenceId` naming a
 * Protocol record — and differ only in what the caller already holds.
 *
 * There is deliberately no third pathway in which this package *constructs* a
 * `CanonicalEvidence`. Constructing one requires an `id`, and minting a
 * canonical record identifier is neither deterministic nor this vertical's to
 * perform; it also requires an `issuer`, a `source` and a `description` that
 * intake frequently does not legitimately know. Faking any of them to make
 * intake convenient would put a fabricated Protocol record into circulation,
 * which is precisely the failure the whole boundary exists to prevent.
 */
exports.EvidenceIntakePathway = {
    /**
     * The caller names an already-recorded `CanonicalEvidence` by its id. Nothing
     * here dereferences it: this package has no way to resolve a Protocol record
     * and must not pretend otherwise, so naming one asserts that it exists no
     * more than naming a file asserts that it is readable.
     */
    Reference: 'Reference',
    /**
     * The caller supplies the `CanonicalEvidence` document it constructed
     * elsewhere. Intake reads its `id` — which becomes the recorded reference —
     * checks that the fields it actually reads are structurally admissible, and
     * then **discards the document**. It is not copied onto the receipt and not
     * copied into the case: a second copy of a Protocol record living in vertical
     * workflow state is a copy that can go stale, and storing evidence records is
     * not this layer's job.
     */
    Canonical: 'Canonical',
};
/** The payload key one pathway carries, so a reader needs no per-pathway branch. */
const PATHWAY_PAYLOAD_KEY = Object.freeze({
    [exports.EvidenceIntakePathway.Reference]: 'evidenceRef',
    [exports.EvidenceIntakePathway.Canonical]: 'evidence',
});
function evidenceIntakePayloadKey(pathway) {
    return PATHWAY_PAYLOAD_KEY[pathway];
}
function isEvidenceIntakePathway(value) {
    return typeof value === 'string' && Object.values(exports.EvidenceIntakePathway).includes(value);
}
exports.EVIDENCE_SUBMISSION_BASE_KEYS = [
    'intakeId',
    'caseId',
    'materialId',
    'categoryId',
    'pathway',
    'requirementIds',
    'observedAt',
    'sourceRef',
    'correlationId',
];
/**
 * The `CanonicalEvidenceId` a submission resolves to, whichever pathway it used.
 *
 * Total over *structurally admitted* submissions only — validation runs first,
 * so by the time this is called a `Canonical` submission is known to carry an
 * evidence document with an admissible `id`.
 */
function submittedEvidenceRef(submission) {
    return submission.pathway === exports.EvidenceIntakePathway.Canonical
        ? submission.evidence.id
        : submission.evidenceRef;
}
