import { signPayload, stableHash, verifyPayloadSignature } from '@aoc-runtime/crypto';
export class AuditRuntime {
    finalizeDecision(decision) {
        return {
            ...decision,
            provenance: {
                runtimeAttribution: 'aoc-runtime',
                policySourceAttribution: decision.provenance.policySource,
                machineAttribution: decision.explainability.governance?.effectiveActor?.actorType === 'machine',
                ...decision.provenance,
            },
        };
    }
    createSignedEvent(event, chainId, signature, previous) {
        const previousEventHash = previous?.eventHash;
        const chainPosition = previous ? previous.chainPosition + 1 : 0;
        const eventHash = stableHash({ chainId, chainPosition, previousEventHash, event });
        return { event, eventHash, previousEventHash, chainPosition, chainId, signature };
    }
    verifyChain(events) {
        for (let i = 0; i < events.length; i += 1) {
            const current = events[i];
            const expectedPrev = i === 0 ? undefined : events[i - 1].eventHash;
            if (current.previousEventHash !== expectedPrev || current.chainPosition !== i)
                return false;
            const hash = stableHash({ chainId: current.chainId, chainPosition: current.chainPosition, previousEventHash: current.previousEventHash, event: current.event });
            if (hash !== current.eventHash)
                return false;
            if (!verifyPayloadSignature({ eventHash: current.eventHash, event: current.event }, current.signature))
                return false;
        }
        return true;
    }
}
export const signAuditEvent = (payload, privateKey, signer, provenance) => signPayload(payload, privateKey, signer, provenance);
