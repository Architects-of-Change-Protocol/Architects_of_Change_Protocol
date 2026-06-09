import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeReputationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-reputation-disputes.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('reputation dispute governance',()=>{
 it('validates the repository reputation disputes',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Reputation disputes scanner passed');});
 it('rejects disputes referencing unknown reputations',()=>{const f=createConstitutionalFixture();try{writeReputationGovernance(f);f.write('docs/constitution/REPUTATION-DISPUTE-POLICY.md',`# Reputation Dispute Policy\n\n**Constitution Version:** v1.0\n\n## Reputation dispute registry\n\n| Dispute ID | Reputation ID | Grounds | Evidence | Initiator | Decision Reference | Resolution | Status |\n|---|---|---|---|---|---|---|---|\n| RDI-0001 | REP-9999 | Incorrect Source | Filed evidence | Protocol | DEC-0001 | Pending | Open |\n`);const r=f.run('check-reputation-disputes.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('REP-V-008');}finally{f.cleanup();}});
});
