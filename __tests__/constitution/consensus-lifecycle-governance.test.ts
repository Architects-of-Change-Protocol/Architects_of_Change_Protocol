import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeConsensusGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-consensus-lifecycle.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('consensus lifecycle governance',()=>{
 it('validates the repository consensus lifecycle',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Consensus lifecycle scanner passed');});
 it('rejects invalid lifecycle transitions',()=>{const f=createConstitutionalFixture();try{writeConsensusGovernance(f);f.write('docs/constitution/CONSENSUS-LIFECYCLE.md',`# Consensus Lifecycle\n\n**Constitution Version:** v1.0\n\n## Consensus lifecycle transition ledger\n\n| Transition ID | Consensus ID | From | To | Authorized By | Evidence | Amendment | Effective Date |\n|---|---|---|---|---|---|---|---|\n| CLT-0001 | CNS-0001 | Proposed | Established | Constitution | Test | AOC-AMD-0001 | 2026-06-09 |\n`);const r=f.run('check-consensus-lifecycle.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("CNS-V-006 CLT-0001 invalid transition 'Proposed' → 'Established'");}finally{f.cleanup();}});
});
