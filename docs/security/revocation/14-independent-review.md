# 14 — Independent Security Review of commit `cc0ca97`

Scope: **independent security review and PR hardening only.** No new feature work, no persistent
datastore, no repeat of the AOC-REVOCATION-00 sprint. Every claim in the prior sprint's own report
was treated as unverified until checked against actual code, actual test runs, and git history.

## Branch identity check

```
$ git branch --show-current
claude/aoc-revocation-safety-hdavmu
$ git rev-parse HEAD   # before this review's corrective commits
cc0ca9741ddbba8907ea99f1f27aab3632d980e4
$ git diff --stat 71191de..cc0ca97~0 | tail -1
55 files changed, 2942 insertions(+), 336 deletions(-)
```

Confirmed: the branch HEAD matched the reported commit exactly, and `cc0ca97` is a single, clean
commit on top of `71191de`. **One discrepancy noted, not a defect**: `origin/main` is at `f7c7dc6`,
three commits behind `71191de` (`71191de`, `ab2ac6e`, `7049fad` — an ADR and protocol-export
changes, none authored in the sprint under review, all predating it). The branch's true
merge-base with `main` is therefore `f7c7dc6`, not `71191de`. This review audited the sprint's own
diff (`71191de..cc0ca97`), which is the relevant scope for "was AOC-REVOCATION-00 done correctly."

## 1. Empirical reproduction of the original vulnerability

Rather than trust the prior report's claim, the pre-fix commit was checked out into an isolated
git worktree (`git worktree add /tmp/pre-fix-audit 71191de`) and a reproduction test was run
against the actual pre-fix code:

```ts
revokeCapabilityToken(capability.capability_hash); // revoke via the codebase's own registry
const decision = evaluateEnforcement({ capability, requested_scope, requested_permissions, now } as any);
// no isRevoked passed — exactly what runtime/api/routes.ts actually did
expect(decision.allowed).toBe(true); // reproduces the bug
```

Result: **`{"allowed":true,"decision":"allow","reason_code":"ENFORCEMENT_ALLOW",...}`** — a
capability revoked through the codebase's own revocation registry was still allowed by
`evaluateEnforcement` called the way the real route called it. **The original P0 bug is
confirmed real, not merely asserted.** Worktree removed after verification.

## 2. Caller and fail-closed-path audit

An independent, adversarial sub-review (fresh context, no access to the prior report's reasoning)
read every changed file in `protocol/revocation/`, `protocol/capability/`, `protocol/consent/`,
`protocol/enforcement/`, `protocol/execution/`, `runtime/api/routes.ts`, `runtime/controlPlane.ts`,
and `aoc/capabilities/core/evaluateCapabilityAccess.ts` line by line, and independently grepped the
whole repository for parallel/duplicate revocation implementations. Verdicts:

**Confirmed sound** (no changes needed): the `protocol/revocation/` policy module itself; the
capability and consent state machines (every path to `'active'` genuinely passes through a
`verified_not_revoked` check; every thrown exception or malformed `checkRevocation` return is
caught and converted to blocking `unknown`); `evaluateEnforcement`/`authorizeExecution`'s mandatory
second parameter and the wire types' genuine absence of any revocation-related field;
`runtime/api/routes.ts`'s single call sites for `/enforcement/evaluate` and `/execution/authorize`
(each passes `capabilityRevocationCheck`, verified individually, not assumed representative); the
`DEFAULT_PRICING_RULES`/`CONTAINMENT_ENDPOINTS` billing-safety split; `ControlPlaneService`'s zero
coupling to billing/usage code; the "already revoked" branch's non-mutation of `revoked_at`;
`evaluateMarketMakerTrust`'s new deny-on-no-registry behavior and its correct legacy-bridge
mapping.

**Confirmed defects, now fixed** (see §3 below): `/capability/mint` never wired a
`checkConsentRevocation` port; `ControlPlaneService`'s idempotency fingerprint excluded
`subject_id`/`requester_id`.

**Confirmed defect, NOT fixed — flagged as the top remaining risk**: `protocol/consent/
capability-authorize.ts` (`authorizeWithCapability`) has no revocation check of any kind, and gates
two live, HTTP-reachable, monetized endpoints (`POST /data/access`, `POST /payout/execute`) via
`runtime/enforcement/enforceCapability.ts` → `runtime/api/server.ts`, which is exported from
`runtime/index.ts` — the package's own header comment labels this "Public Runtime Surface
(stable)... intended for SDK/application consumers." Full detail in §4.

Packages under `packages/*-runtime` (`capability-runtime`, `consent-runtime`,
`authorization-runtime`) were independently re-confirmed as unreachable from any live code path in
`runtime/`, `protocol/`, `capability/`, or `aoc/` (grepped for the workspace package names across
every `package.json` — no consumers outside their own package). `packages/capability-runtime`'s
`CapabilityRef` still has no `revokedAt` field, consistent with the prior report; this is dormant,
not live.

## 3. Corrective commits made in this review

Both fixes are minimal, scoped exactly to the confirmed defect, and covered by a new regression
test each.

| File | Defect | Fix | Test |
|---|---|---|---|
| `runtime/api/routes.ts` | `/capability/mint` relied on an uncaught `TypeError` (calling `undefined` as `checkConsentRevocation`) to fail closed, which the sprint's own "wired end-to-end" claim did not disclose | Explicitly wires `checkConsentRevocation: ALWAYS_UNKNOWN_REVOCATION_CHECK` (from `protocol/revocation`) with a comment explaining why (no consent-revocation registry exists yet) | `runtime/api/__tests__/routesRevocation.test.ts` — "/capability/mint deterministically denies" + "client-supplied checkConsentRevocation field cannot force an allow" |
| `runtime/controlPlane.ts` | `fingerprintRevokeInput` only hashed `{grant_id, reason}`; a cache hit on a reused `idempotency_key` returned the prior result without re-running the `subject_id` mismatch check, since that check only runs on the non-cached path | `fingerprintRevokeInput` now includes `subject_id`/`requester_id` | `runtime/__tests__/controlPlaneRevocation.test.ts` — "REGRESSION FIX: same idempotency_key ... mismatched subject_id is a conflict" |

Behavior confirmed unchanged for every other path: `npm test` went from 810 to 813 passing tests
(the 3 new ones), 0 regressions, 0 failures.

## 4. The top remaining risk, precisely

**Finding**: `protocol/consent/capability-authorize.ts`'s `authorizeWithCapability` validates a
signed capability token's shape, hash, HMAC signature, and expiry — and nothing else. No
`checkRevocation` parameter exists anywhere in that file, and grepping `capability-issue.ts`,
`capability-authorize.ts`, `capability-validate.ts`, and `capability-types.ts` for `revoke` returns
zero matches. Its only caller, `runtime/enforcement/enforceCapability.ts`, adds no revocation check
of its own. `runtime/api/server.ts` calls it to gate `POST /data/access` and `POST /payout/execute`
for every request carrying an `x-aoc-capability` header or `payload.capability`, returning HTTP 403
on deny and otherwise proceeding to execute the (monetized) route.

**Why this wasn't just "safely unreachable" as the prior report implied**: `runtime/index.ts`
literally exports `createRuntimeServer` from `./api/server` and re-exports `enforceCapabilityAccess`
via `export * from './enforcement'`, under a module docstring reading *"Public Runtime Surface
(stable) ... intended for SDK/application consumers."* This is not dead code by design — it is a
documented public entry point.

**Why it is not exploitable in this exact repository state today**: isolated `tsc` compilation of
`runtime/index.ts` (`npx tsc -p <config extending tsconfig.test.json> --files runtime/index.ts`)
fails with real, pre-existing, unrelated errors:

```
protocol/audit/builders.ts(40,5): error TS2322: ...
protocol/audit/builders.ts(45,26): error TS2345: ...  [×4 similar]
runtime/api/server.ts(101,29): error TS2367: comparison ... no overlap
runtime/api/server.ts(117,29): error TS2367: comparison ... no overlap
runtime/enforcement/enforceCapability.ts(87,58): error TS2345: ... not assignable to AuditEventBuilderInput
runtime/index.ts(57,10): error TS2459: 'RUNTIME_TRANSPORT_VERSION' ... not exported
```

None of these are revocation-related; all predate this sprint and this review. **The important
part**: `scripts/check-runtime-export-governance.mjs` and `scripts/check-runtime-boundaries.mjs`
— the two CI checks that touch `runtime/index.ts` — are read-the-file-as-text checks (string
matching and `fs.existsSync` path resolution). Neither invokes `tsc`. `npm run typecheck` (`tsc -b`)
never covers `runtime/`, `protocol/`, `capability/`, or `aoc/` at all — its project references are
`packages/*`, `enterprise`, `crypto`, `examples/pmfreak-adapter` only (see `runtime/index.ts`'s
absence from `tsconfig.json`). **So the only thing currently standing between this bug and a live,
deployable, revocation-blind HTTP endpoint is an accident of unrelated breakage that no automated
check in this repository would notice being fixed.**

**Disposition**: not fixed in this review, deliberately. Building a revocation mechanism for a
token format that has none, and reasoning about its interaction with `/data/access` and
`/payout/execute`'s monetization/audit flow, is genuine new design work — exactly the kind of
scope expansion this review was explicitly told not to do ("do not repeat the prior sprint," "do
not implement the persistent datastore sprint"). It is documented here, in `01-current-state.md`,
and in `02-threat-model.md` with corrected severity, and is the review's top next-sprint
recommendation, ahead of the persistent-datastore work if resourcing allows a choice.

## 5. Mutation testing (controlled, all reverted)

Five deliberate mutations were introduced one at a time, tested, and reverted via `git checkout --`
before the next mutation (final `git status --porcelain` after all mutation testing: clean except
for the two corrective fixes in §3, confirmed below).

| # | Mutation | Result |
|---|---|---|
| 1 | `resolveMaterialActionDecision` always returns `'allow'` | 17 tests failed across 2 suites |
| 2 | `createRegistryRevocationCheck`'s catch block returns `verifiedNotRevokedStatus` instead of `unknown` on a thrown exception | 2 tests failed, precisely targeting this path (not a broad, vacuous failure) |
| 3 | `ControlPlaneService`'s idempotency-conflict fingerprint comparison inverted (`===` instead of `!==`) | 7 tests failed across 2 suites |
| 4 | `runtime/api/routes.ts`'s `/enforcement/evaluate` handler drops the `capabilityRevocationCheck` argument | `npm run typecheck` (tsc -b) **did not catch this** (routes.ts isn't in its project references) — but `ts-jest` compiling `routesRevocation.test.ts` failed with `TS2554: Expected 2 arguments, but got 1`, and that test file is enabled in `jest.config.js`, so `npm test` (part of CI) does catch it |
| 5 | `runtime/sdk/client.ts`'s local-mode `evaluateEnforcement` call drops the `capabilityRevocationCheck` argument | **Neither `npm run typecheck` nor `npm test` caught this.** No test file in the enabled `testMatch` imports `runtime/sdk/client.ts`. This mutation was left in place by mistake for one review step and caught only by a manual `git diff` review before commit — see the correction note below. |

**Process note, disclosed rather than hidden**: mutation #5 was applied via a Bash/python script
(not the Edit tool) and was not reverted immediately after its test run, unlike mutations 1–4. It
was caught by running `git status --porcelain` before committing and inspecting every modified
file's diff, which surfaced the leftover mutation in `runtime/sdk/client.ts`. It was reverted
before any commit was made — `git diff runtime/sdk/client.ts` against `cc0ca97` is empty in the
final pushed state. This is disclosed here because it is itself the concrete, first-hand
demonstration of finding #2 in `11-migration-and-compatibility.md`: this file has zero regression
coverage in CI, so a real mistake in it went undetected by tooling and was only caught by manual
diff review. That is a process risk worth naming plainly, not just a hypothetical one.

## 6. Test discovery / CI configuration audit

`npx jest --listTests | wc -l` → **181**, matching the prior report's count exactly (independently
re-verified, not assumed). Confirmed `npm run check:aoc-boundaries && npm test` — the literal
commands `.github/workflows/ci.yml` runs — both pass cleanly after this review's two corrective
commits. Confirmed `npm run typecheck` and `npm run build` (`tsc -b`) also pass, though as
established in §4 and mutation #4/#5, they provide **no coverage at all** for `runtime/`,
`protocol/`, `capability/`, or `aoc/` — only `packages/*`, `enterprise`, `crypto`, and
`examples/pmfreak-adapter` are in `tsc -b`'s project reference graph. All type-safety for the
revocation fix depends entirely on `ts-jest` compiling files reachable from tests actually listed
in `jest.config.js`'s `testMatch`. This is a real, structural fragility of the fix's safety
guarantee that the prior report did not call out, and is worth escalating: **any file this sprint
touched that isn't imported by an enabled test (confirmed: `runtime/sdk/client.ts` is the one
example) has zero compile-time or run-time regression protection in CI.**

## 7. Final readiness verdict

**READY WITH CONDITIONS**

Rationale:
- The core claim — the P0 fail-open bug at `/enforcement/evaluate` and `/execution/authorize` was
  real and is now fixed — is independently, empirically confirmed (§1), and the fix's mechanism
  (mandatory `checkRevocation`, try/catch-to-`unknown` on every failure mode, no client-controllable
  revocation signal) held up under adversarial line-by-line review and five rounds of mutation
  testing (§2, §5).
- Two genuine defects were found in the original commit and are now fixed, tested, and verified not
  to regress anything (§3): `npm test` is at 813/813 passing, `npm run typecheck`/`build`/
  `check:aoc-boundaries` all pass.
- **Condition**: `docs/security/revocation/13-final-verdict.md`'s "Ready for an independent PR"
  claim is superseded by this document. The PR should be reviewed and can merge, but the reviewer
  must be made aware of, and should explicitly accept or route-to-next-sprint, the finding in §4 —
  a live, HTTP-wired capability-authorization path with zero revocation checking, currently inert
  only by accident. This was not introduced by, and is not in scope for, this sprint's diff, but it
  directly undercuts any claim that revocation is fail-closed "end-to-end" across the repository,
  and should not be merged into institutional memory as a solved problem.
- **Condition**: the structural fragility in §6 (type-safety for this fix depends entirely on
  `testMatch` inclusion, with zero coverage from `tsc -b`) should be acknowledged by reviewers as
  an accepted trade-off, not silently assumed away. `runtime/sdk/client.ts` is a concrete example
  of a file this sprint modified with no regression protection.

No condition found during this review requires blocking the merge outright (NOT READY), and the
findings are not so clean as to warrant an unqualified pass (READY TO MERGE). Nothing further is
required before a human reviews the PR (READY FOR REVIEW would understate that the adversarial
pass already happened) — hence **READY WITH CONDITIONS**, with the two conditions above to be
explicitly acknowledged at merge time.
