import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeAttestationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-attestation-disputes.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('attestation dispute governance',()=>{
 it('validates the repository attestation dispute policy',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Attestation disputes scanner passed');});
 it('rejects disputes missing grounds',()=>{const f=createConstitutionalFixture();try{writeAttestationGovernance(f);f.write('docs/constitution/ATTESTATION-DISPUTE-POLICY.md',`# Attestation Dispute Policy\n\n**Constitution Version:** v1.0\n\n## Dispute registry\n\n| Dispute ID | Attestation ID | Grounds | Evidence | Initiator | Resolution | Decision Reference | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| ADT-0001 | ATT-0001 | | Present evidence | Actor | Pending | None | AOC-AMD-0001 | Active |\n`);const r=f.run('check-attestation-disputes.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('ATT-V-008 ADT-0001 is missing Grounds');}finally{f.cleanup();}});
});
