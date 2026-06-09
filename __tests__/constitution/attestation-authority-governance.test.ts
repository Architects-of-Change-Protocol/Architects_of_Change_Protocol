import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeAttestationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-attestation-authorities.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('attestation authority governance',()=>{
 it('validates the repository attestation catalog',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Attestation authority scanner passed');});
 it('rejects unauthorized attestation creation',()=>{const f=createConstitutionalFixture();try{writeAttestationGovernance(f);const p=`${f.root}/docs/constitution/ATTESTATION-AUTHORITIES.md`;f.write('docs/constitution/ATTESTATION-AUTHORITIES.md',readFileSync(p,'utf8').replace('AOC-AMD-0001 | Not scheduled | Canonical |','AOC-AMD-9999 | Not scheduled | Canonical |'));const r=f.run('check-attestation-authorities.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("ATT-V-010 ATT-0001 creation amendment 'AOC-AMD-9999'");}finally{f.cleanup();}});
});
