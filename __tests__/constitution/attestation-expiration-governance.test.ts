import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeAttestationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-attestation-expiration.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('attestation expiration governance',()=>{
 it('validates the repository attestation expiration policy',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Attestation expiration scanner passed');});
 it('rejects expiration policy missing expiration triggers',()=>{const f=createConstitutionalFixture();try{writeAttestationGovernance(f);f.write('docs/constitution/ATTESTATION-EXPIRATION-POLICY.md',`# Attestation Expiration Policy\n\n**Constitution Version:** v1.0\n\n## Expiration policy catalog\n\n| Expiration Policy ID | Attestation Class | Valid Expiration Triggers | Expiration Semantics | Re-attestation Permitted | Historical Preservation | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n| AXP-0001 | Constitutional | | Expires | Yes | Yes | AOC-AMD-0001 | Active |\n| AXP-0002 | Governance | Time Limit | Expires | Yes | Yes | AOC-AMD-0001 | Active |\n`);const r=f.run('check-attestation-expiration.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('ATT-V-007 AXP-0001 is missing Valid Expiration Triggers');}finally{f.cleanup();}});
});
