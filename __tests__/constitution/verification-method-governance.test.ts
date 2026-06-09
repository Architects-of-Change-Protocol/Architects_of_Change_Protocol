import { spawnSync } from 'node:child_process';
import { repositoryRoot } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-verification-methods.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('verification method governance',()=>{
 it('validates the repository verification methods',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Verification method scanner passed');});
});
