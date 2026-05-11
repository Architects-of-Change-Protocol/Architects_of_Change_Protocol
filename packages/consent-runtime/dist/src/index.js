"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentRuntime = void 0;
exports.isGrantActive = isGrantActive;
exports.isDelegatedGrant = isDelegatedGrant;
exports.isMachineConsent = isMachineConsent;
function isGrantActive(grant, atIso) {
    if (grant.revokedAt && grant.revokedAt <= atIso)
        return false;
    if (grant.expiresAt && grant.expiresAt <= atIso)
        return false;
    return grant.issuedAt <= atIso;
}
function isDelegatedGrant(grant) {
    return Boolean(grant.delegateActorId);
}
function isMachineConsent(grant) {
    return grant.subjectActorId.startsWith("machine:") || (grant.delegateActorId?.startsWith("machine:") ?? false);
}
class ConsentRuntime {
    constructor(provider) {
        this.provider = provider;
    }
    async evaluate(query) {
        const at = query.at ?? new Date().toISOString();
        const grants = await this.provider.getActiveGrants(query.actorId, query.capability);
        if (grants.length === 0)
            return { allowed: false, reason: "no_grant", reasons: ["No consent grants found."] };
        const revoked = grants.find((grant) => grant.revokedAt && grant.revokedAt <= at);
        if (revoked)
            return { allowed: false, reason: "revoked", grant: revoked, reasons: ["Consent was revoked."] };
        const expired = grants.find((grant) => grant.expiresAt && grant.expiresAt <= at);
        if (expired)
            return { allowed: false, reason: "expired", grant: expired, reasons: ["Consent is expired."] };
        const active = grants.find((grant) => isGrantActive(grant, at));
        if (!active)
            return { allowed: false, reason: "denied", reasons: ["No active consent grant at evaluation time."] };
        if (query.machineActorId && !(active.subjectActorId === query.machineActorId || active.delegateActorId === query.machineActorId)) {
            return { allowed: false, reason: "denied", grant: active, reasons: ["Machine consent binding mismatch."] };
        }
        return { allowed: true, reason: "allowed", grant: active, reasons: ["Active consent grant validated."] };
    }
}
exports.ConsentRuntime = ConsentRuntime;
