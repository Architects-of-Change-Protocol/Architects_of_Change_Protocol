import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeAttestationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-attestation-weight.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('attestation weight governance',()=>{
 it('validates the repository attestation weight policy',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Attestation weight scanner passed');});
 it('rejects invalid weight levels',()=>{const f=createConstitutionalFixture();try{writeAttestationGovernance(f);f.write('docs/constitution/ATTESTATION-WEIGHT-POLICY.md',`# Attestation Weight Policy\n\n**Constitution Version:** v1.0\n\n## Weight policy registry\n\n| Weight Policy ID | Attestation Class | Default Weight Level | Maximum Weight Level | Aggregation Rule | Decision Influence Rule | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n| AWP-0001 | Constitutional | Unlimited Weight | Unlimited Weight | Single | Required | AOC-AMD-0001 | Active |\n| AWP-0002 | Governance | Governance Weight | Governance Weight | Multiple | Required | AOC-AMD-0001 | Active |\n`);const r=f.run('check-attestation-weight.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("ATT-V-011 AWP-0001 has invalid default weight level 'Unlimited Weight'");}finally{f.cleanup();}});
});
