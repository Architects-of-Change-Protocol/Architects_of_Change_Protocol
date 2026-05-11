"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGrantActive = isGrantActive;
exports.isDelegatedGrant = isDelegatedGrant;
exports.isMachineConsent = isMachineConsent;
function isGrantActive(grant, atIso) {
    if (grant.revokedAt && grant.revokedAt <= atIso)
        return false;
    if (grant.expiresAt && grant.expiresAt < atIso)
        return false;
    return grant.issuedAt <= atIso;
}
function isDelegatedGrant(grant) {
    return Boolean(grant.delegateActorId);
}
function isMachineConsent(grant) {
    return grant.subjectActorId.startsWith("machine:") || (grant.delegateActorId?.startsWith("machine:") ?? false);
}
