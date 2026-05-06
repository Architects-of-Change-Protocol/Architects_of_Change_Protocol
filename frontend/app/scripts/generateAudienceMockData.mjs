import { randomUUID, createHash } from 'node:crypto';

const now = Date.now();

function buildMockAudience(size = 50) {
  return Array.from({ length: size }).map((_, i) => {
    const trust = Number((0.45 + Math.random() * 0.55).toFixed(4));
    const bucket = i % 10;
    const revoked = bucket === 0;
    const expired = bucket === 1;
    const expiresAt = expired ? new Date(now - 86400000 * (1 + (i % 7))).toISOString() : new Date(now + 86400000 * (7 + (i % 90))).toISOString();
    const revokedAt = revoked ? new Date(now - 86400000 * (i % 20)).toISOString() : null;
    return { subjectId: randomUUID(), trustScore: trust, consentStatus: revoked ? 'revoked' : expired ? 'expired' : 'granted', expiresAt, revokedAt };
  });
}

function toSql(records) {
  const tenantId = '00000000-0000-0000-0000-000000000001';
  const scopeId = '30000000-0000-0000-0000-000000000001';
  return records.map((r) => {
    const consentId = randomUUID();
    const proofHash = createHash('sha256').update(`${r.subjectId}:${r.consentStatus}:${r.expiresAt}`).digest('hex');
    const revocationSql = r.revokedAt ? `insert into public.consent_revocations (tenant_id, user_consent_id, revoked_at, reason, initiated_by_type, metadata) values ('${tenantId}','${consentId}','${r.revokedAt}','user_request','user','{"source":"mock-seed"}');` : '';
    const expirationSql = r.expiresAt ? `insert into public.consent_expirations (tenant_id, user_consent_id, expires_at, expiration_policy) values ('${tenantId}','${consentId}','${r.expiresAt}','rolling_90_day');` : '';
    return `insert into public.user_consents (id, tenant_id, subject_type, subject_id, scope_id, scope_version, status, granted_at, source_channel, proof_hash, policy_snapshot, metadata) values ('${consentId}','${tenantId}','user','${r.subjectId}','${scopeId}',1,'${r.consentStatus}',now(),'seed','${proofHash}','{}','{"trust_score":${r.trustScore}}');${expirationSql}${revocationSql}`;
  }).join('\n');
}

if (process.argv[1]?.includes('generateAudienceMockData.mjs')) {
  process.stdout.write(toSql(buildMockAudience(120)));
}
