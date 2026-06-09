import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeConsensusGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-consensus-recomputation.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('consensus recomputation governance',()=>{
 it('validates the repository consensus recomputation triggers',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Consensus recomputation scanner passed');});
 it('rejects recomputation trigger with invalid class',()=>{const f=createConstitutionalFixture();try{writeConsensusGovernance(f);f.write('docs/constitution/CONSENSUS-RECOMPUTATION-POLICY.md',`# Consensus Recomputation Policy\n\n**Constitution Version:** v1.0\n\n## Recomputation trigger catalog\n\n| Trigger ID | Trigger Name | Trigger Class | Description | Required Action | Amendment | Status |\n|---|---|---|---|---|---|---|\n| CRC-0001 | Attestation Change | InvalidClass | An attestation changed | Recompute | AOC-AMD-0001 | Active |\n`);const r=f.run('check-consensus-recomputation.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("CNS-V-007 CRC-0001 has invalid trigger class 'InvalidClass'");}finally{f.cleanup();}});
});
