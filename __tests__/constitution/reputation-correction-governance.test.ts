import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeReputationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-reputation-corrections.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('reputation correction governance',()=>{
 it('validates the repository reputation corrections',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Reputation corrections scanner passed');});
 it('rejects corrections referencing unknown reputations',()=>{const f=createConstitutionalFixture();try{writeReputationGovernance(f);f.write('docs/constitution/REPUTATION-CORRECTION-POLICY.md',`# Reputation Correction Policy\n\n**Constitution Version:** v1.0\n\n## Reputation correction registry\n\n| Correction ID | Reputation ID | Correction Cause | Prior Value | Corrected Value | Reason | Evidence | Decision Reference | Amendment | Effective Date | Status |\n|---|---|---|---|---|---|---|---|---|---|---|\n| RCO-0001 | REP-9999 | Source Correction | 0.8 | 0.5 | Corrected source | Filed | DEC-0001 | AOC-AMD-0001 | 2026-06-09 | Active |\n`);const r=f.run('check-reputation-corrections.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('REP-V-009');}finally{f.cleanup();}});
});
