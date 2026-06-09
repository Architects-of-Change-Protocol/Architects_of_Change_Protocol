import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeConsensusGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-consensus-disputes.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('consensus dispute governance',()=>{
 it('validates the repository consensus dispute records',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Consensus disputes scanner passed');});
 it('rejects dispute referencing unknown consensus',()=>{const f=createConstitutionalFixture();try{writeConsensusGovernance(f);f.write('docs/constitution/CONSENSUS-DISPUTE-POLICY.md',`# Consensus Dispute Policy\n\n**Constitution Version:** v1.0\n\n## Dispute registry\n\n| Dispute ID | Consensus ID | Grounds | Evidence | Initiator | Resolution | Decision Reference | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| CDT-0001 | CNS-9999 | Threshold Miscalculation | Evidence A | Protocol | Pending | DEC-0001 | AOC-AMD-0001 | Active |\n`);const r=f.run('check-consensus-disputes.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("CNS-V-010 CDT-0001 references unknown consensus 'CNS-9999'");}finally{f.cleanup();}});
});
