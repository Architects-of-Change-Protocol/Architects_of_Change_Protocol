import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import {
  EVIDENCE_INTAKE_ERROR_CODES,
  EVIDENCE_INTAKE_VALIDATION_CODES,
  EvidenceIntakePathway,
  PROTOCOLIZATION_EVIDENCE_EVENT_TYPES,
} from '@aoc/asset-protocolization';

/**
 * The APV-05 truth boundary, asserted over the production source itself.
 *
 * The rest of this package's suites prove that intake *behaves* honestly. This
 * one proves the vocabulary cannot drift: that no name introduced by APV-05
 * asserts a conclusion the slice cannot reach, and that none of the later
 * slices' concepts leaked in early.
 *
 * Same method as APV-03's and APV-04's boundary tests, restricted to the
 * evidence module so it never fails for something another slice wrote.
 */
const packageRoot = join(__dirname, '..');
const sourceRoot = join(packageRoot, 'src');
const evidenceRoot = join(sourceRoot, 'evidence');

const collectTypeScriptFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectTypeScriptFiles(path);
    return entry.isFile() && entry.name.endsWith('.ts') ? [path] : [];
  });

/** Strips comments so a vocabulary scan reads *code*, not prose that explains what code must not do. */
const stripComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');

const sources = (root: string): readonly { readonly file: string; readonly source: string }[] =>
  collectTypeScriptFiles(root).map((path) => ({
    file: relative(packageRoot, path),
    source: readFileSync(path, 'utf8'),
  }));

describe('APV-05 manufactures no truth', () => {
  it('declares no property or accessor that asserts a conclusion', () => {
    const forbidden = [
      'isVerified',
      'isAuthentic',
      'isOwner',
      'isAuthoritative',
      'isApproved',
      'isReady',
      'isTrusted',
      'isSatisfied',
      'claimProven',
      'ownershipEstablished',
      'verifiedAt',
      'approvedAt',
      'trustLevel',
    ];

    const hits = sources(evidenceRoot).flatMap(({ file, source }) => {
      const code = stripComments(source);
      return forbidden
        .filter((name) => new RegExp(`\\b${name}\\b`).test(code))
        .map((name) => `${file}: ${name}`);
    });

    expect(hits).toEqual([]);
  });

  it('names its own result field `admitted`, never `valid`', () => {
    // `valid` is the word that quietly slides from "conforms to a schema" to
    // "is legitimate". The intake layer only ever means the first, so it does
    // not use the ambiguous word at all for its own result.
    const hits = sources(evidenceRoot).flatMap(({ file, source }) =>
      [...stripComments(source).matchAll(/\breadonly\s+(valid|verified|trusted|approved)\s*:/g)].map(
        (match) => `${file}: ${match[1]}`,
      ),
    );

    expect(hits).toEqual([]);
  });

  it('introduces exactly one event, and it is named for receipt', () => {
    expect(Object.values(PROTOCOLIZATION_EVIDENCE_EVENT_TYPES)).toEqual([
      'ProtocolizationEvidenceReceived',
    ]);
  });

  it('declares no APV-07 verification outcome vocabulary', () => {
    const forbidden = ['PASS', 'FAIL', 'WARNING', 'MANUAL_REVIEW', 'UNAVAILABLE'];
    const hits = sources(evidenceRoot).flatMap(({ file, source }) => {
      const code = stripComments(source);
      return forbidden
        .filter((token) => new RegExp(`['"\`]${token}['"\`]|\\b${token}\\s*[:=]`).test(code))
        .map((token) => `${file}: ${token}`);
    });

    expect(hits).toEqual([]);
  });

  it('declares no APV-08 attestation action vocabulary', () => {
    const forbidden = ['ATTEST', 'REQUEST_MORE_EVIDENCE', 'ABSTAIN', 'reviewQueue', 'reviewPacket'];
    const hits = sources(evidenceRoot).flatMap(({ file, source }) => {
      const code = stripComments(source);
      return forbidden.filter((token) => code.includes(token)).map((token) => `${file}: ${token}`);
    });

    expect(hits).toEqual([]);
  });

  it('declares no APV-09 lifecycle state and no APV-10 protocolization result', () => {
    const forbidden = [
      'EVIDENCE_PENDING',
      'VERIFICATION_PENDING',
      'MORE_EVIDENCE_REQUIRED',
      'PROTOCOLIZED',
      'SUPERSEDED',
      'ProtocolizationResult',
      'ProtocolizedAsset',
      'GovernableResourceRef',
    ];
    const hits = sources(evidenceRoot).flatMap(({ file, source }) => {
      const code = stripComments(source);
      return forbidden.filter((token) => code.includes(token)).map((token) => `${file}: ${token}`);
    });

    expect(hits).toEqual([]);
  });

  it('mints no claim and implements no declaration', () => {
    const hits = sources(evidenceRoot).flatMap(({ file, source }) => {
      const code = stripComments(source);
      return ['CanonicalClaim', 'claimRef', 'mintClaim', 'CanonicalAssertionId']
        .filter((token) => code.includes(token))
        .map((token) => `${file}: ${token}`);
    });

    expect(hits).toEqual([]);
  });

  it('names every error and reason code for a structural condition', () => {
    // A code is a machine contract. None of these may read as a verdict about
    // the evidence — they describe the shape of a submission or the state of a
    // workflow, and nothing else.
    const codes = [
      ...Object.values(EVIDENCE_INTAKE_ERROR_CODES),
      ...Object.values(EVIDENCE_INTAKE_VALIDATION_CODES),
    ];

    for (const code of codes) {
      expect(code).toMatch(/^EVIDENCE_INTAKE_[A-Z0-9_]+$/);
      expect(code).not.toMatch(/AUTHENTIC|UNTRUE|FORGED|FRAUD|UNTRUSTED|NOT_VERIFIED|OWNERSHIP/);
    }

    // Stability: these are published machine semantics, so the exact set is
    // pinned rather than merely pattern-checked.
    expect(Object.values(EVIDENCE_INTAKE_ERROR_CODES).sort()).toEqual([
      'EVIDENCE_INTAKE_CASE_MISMATCH',
      'EVIDENCE_INTAKE_DUPLICATE',
      'EVIDENCE_INTAKE_DUPLICATE_EVIDENCE',
      'EVIDENCE_INTAKE_RECEIPT_INVALID',
      'EVIDENCE_INTAKE_SUBMISSION_INVALID',
      'EVIDENCE_INTAKE_TENANT_MISMATCH',
      'EVIDENCE_INTAKE_TENANT_REQUIRED',
    ]);
  });

  it('names its pathways for what the caller supplies, not for an outcome', () => {
    // Neither pathway name could be read as "this evidence checked out".
    expect(Object.values(EvidenceIntakePathway).sort()).toEqual(['Canonical', 'Reference']);
  });

  it('evaluates no freshness, computes no digest and verifies no signature', () => {
    const hits = sources(evidenceRoot).flatMap(({ file, source }) => {
      const code = stripComments(source);
      const found: string[] = [];
      for (const pattern of [
        /\bmaxAgeSeconds\b/g,
        /\bobservedAfter\b/g,
        /\bmustNotBeExpired\b/g,
        /\bisExpired\b/g,
        /\bcreateHash\b/g,
        /\bverifySignature\b/g,
        /\bverifyContentIdentity\b/g,
        /\bcomputeContentIdentity\b/g,
      ]) {
        for (const match of code.matchAll(pattern)) found.push(`${file}: ${match[0]}`);
      }
      return found;
    });

    expect(hits).toEqual([]);
  });
});
