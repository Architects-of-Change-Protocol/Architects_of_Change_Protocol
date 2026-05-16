# AOC Release Readiness Checklist

- [ ] Clean install passes (`npm ci`).
- [ ] `npm run validate:release` passes.
- [ ] Semantic ownership lint passes (`npm run lint:semantic-ownership`).
- [ ] Publishability validation passes (`npm run validate:publishability`).
- [ ] Version graph validation passes (`npm run check:version-graph`).
- [ ] Changesets included for package-affecting PR changes.
- [ ] Generated changelog reviewed.
- [ ] Package tarball inspected (`npm pack ./packages/protocol` and peers as needed).
- [ ] Target registry/channel confirmed (alpha, beta, stable, internal).
- [ ] No secrets committed.
- [ ] CI status is green.
