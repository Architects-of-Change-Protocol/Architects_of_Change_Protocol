import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeStandingGovernance } from './fixture';
const run = () => spawnSync(process.execPath, ['scripts/check-standing-authorities.mjs'], { cwd: repositoryRoot, encoding: 'utf8' });
describe('standing authority governance', () => {
  it('validates the repository standing authority catalog', () => { const result=run(); expect(result.status).toBe(0); expect(result.stderr).toBe(''); expect(result.stdout).toContain('Standing authority scanner passed'); });
  it('rejects unauthorized standing creation', () => { const fixture=createConstitutionalFixture(); try { writeStandingGovernance(fixture); const path=`${fixture.root}/docs/constitution/STANDING-AUTHORITIES.md`; fixture.write('docs/constitution/STANDING-AUTHORITIES.md',readFileSync(path,'utf8').replace('AOC-AMD-0001 | Not scheduled | Canonical |','AOC-AMD-9999 | Not scheduled | Canonical |')); const result=fixture.run('check-standing-authorities.mjs'); expect(result.status).toBe(1); expect(result.stderr).toContain("STD-V-001 STD-0001 creation amendment 'AOC-AMD-9999' is not a ratified Type B or Type C amendment"); } finally { fixture.cleanup(); } });
});
