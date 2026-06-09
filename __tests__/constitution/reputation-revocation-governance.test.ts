import { spawnSync } from 'node:child_process';
import { repositoryRoot } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-reputation-revocation.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('reputation revocation governance',()=>{
 it('validates the repository reputation revocation authorities',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Reputation revocation scanner passed');});
});
