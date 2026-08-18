import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { ClaimType } from '@aoc/protocol/claims';
import { mintSovereignAssetId, parseSovereignAssetId } from '@aoc/protocol/identity';
import type { SovereignAssetId } from '@aoc/protocol/identity';
import { AuthorityClaimKind, buildAuthorityClaim, isValidAuthorityClaim } from '@aoc/protocol/manifest';
import {
  AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY,
  AOC_LICENSING_ACTION_TERM_IDS,
  AOC_LICENSING_DECLARATION_TERM_IDS,
  AOC_LICENSING_SEMANTIC_CATEGORIES,
  AOC_LICENSING_SEMANTIC_NAMESPACE,
  AOC_LICENSING_SEMANTIC_TERMS,
  LICENSING_TERMS_REASON_CODES,
  SOVEREIGN_LICENSE_TERMS_RULE_EFFECTS,
  SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
  SovereignLicenseTermsRuleEffect,
  buildLicenseTermsClaim,
  getAocLicensingSemanticTerm,
  isAocLicensingActionTermId,
  isValidLicenseTermsClaim,
  isValidSovereignLicenseTermsV1,
  licenseTermsSemanticConcepts,
  validateLicenseTermsClaim,
  validateSovereignLicenseTermsV1,
} from '@aoc/protocol/licensing';
import type {
  BuildLicenseTermsClaimInput,
  LicenseTermsClaim,
  SovereignLicenseTermsRuleV1,
} from '@aoc/protocol/licensing';

const CODES = LICENSING_TERMS_REASON_CODES;
const ACTIONS = AOC_LICENSING_ACTION_TERM_IDS;
const DECLARATION = AOC_LICENSING_DECLARATION_TERM_IDS;

const SUBJECT: SovereignAssetId = parseSovereignAssetId(mintSovereignAssetId());
const ISSUER = 'principal:sm09-issuer';
const ISSUED_AT = '2026-08-18T00:00:00.000Z';

const action = (termRef: string, namespace = AOC_LICENSING_SEMANTIC_NAMESPACE) => ({ namespace, termRef });

const rule = (
  id: string,
  effect: SovereignLicenseTermsRuleEffect,
  termRef: string,
  statement = `clause ${id}`,
  namespace = AOC_LICENSING_SEMANTIC_NAMESPACE,
): SovereignLicenseTermsRuleV1 => ({ id, effect, action: action(termRef, namespace), statement });

const BASE_RULES: readonly SovereignLicenseTermsRuleV1[] = [
  rule('R1', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.use, 'Use is permitted.'),
  rule('R2', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.reproduce, 'Reproduction is permitted.'),
  rule('R3', SovereignLicenseTermsRuleEffect.Restriction, ACTIONS.commercialUse, 'Commercial use is restricted.'),
  rule('R4', SovereignLicenseTermsRuleEffect.Obligation, ACTIONS.attribute, 'Attribution must be retained.'),
];

const build = (overrides: Partial<BuildLicenseTermsClaimInput> = {}): LicenseTermsClaim =>
  buildLicenseTermsClaim({
    id: 'claim:license:001',
    sovereignAssetId: SUBJECT,
    issuer: ISSUER,
    statement: 'Terms declared by the issuer over this subject.',
    audience: { kind: 'Public' },
    rules: BASE_RULES,
    issuedAt: ISSUED_AT,
    ...overrides,
  });

/** A structurally valid claim whose terms are replaced wholesale, for negative cases. */
const withTerms = (terms: unknown): unknown => {
  const claim = build();
  return { ...claim, metadata: { ...claim.metadata, terms } };
};

describe('SM-09 / structured sovereign license terms (CONTRACT)', () => {
  it('CONTRACT 1 — the terms schema version is exact and independent of every other version', () => {
    expect(SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION).toBe('aoc-sovereign-license-terms/1');
    const claim = build();
    expect(claim.metadata.terms.schemaVersion).toBe('aoc-sovereign-license-terms/1');
    // Not the package version, not the capability version, not a manifest
    // version, not the bundle schema and not the claim id.
    expect(SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION).not.toBe('1.0.0');
    expect(SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION).not.toBe(claim.id);
  });

  it('CONTRACT 2 — a LicenseTermsClaim is an AuthorityClaim, not a forked claim model', () => {
    const claim = build();
    expect(isValidAuthorityClaim(claim)).toBe(true);
    expect(claim.assertionRef).toBe('claim:license:001:assertion');
    expect(claim.attestationRefs).toEqual([]);
    expect(claim.evidenceRefs).toEqual([]);
  });

  it('CONTRACT 3 — metadata.kind is AuthorityClaimKind.License', () => {
    expect(build().metadata.kind).toBe(AuthorityClaimKind.License);
    expect(AuthorityClaimKind.License).toBe('License');
  });

  it('CONTRACT 4 — no ClaimType.License was added; the claim keeps ClaimType.Authorship', () => {
    expect(Object.keys(ClaimType)).not.toContain('License');
    expect(Object.values(ClaimType)).not.toContain('License');
    expect(build().type).toBe(ClaimType.Authorship);
  });

  it('CONTRACT 5 — ClaimType.Authorization is not the licensing representation', () => {
    const claim = build();
    expect(claim.type).not.toBe(ClaimType.Authorization);
    // And an Authorization-typed claim is not accepted as a licensing declaration.
    expect(isValidLicenseTermsClaim({ ...claim, type: ClaimType.Authorization })).toBe(false);
  });

  it('CONTRACT 6 — the terms document carries no second identity and no second timestamp', () => {
    const terms = build().metadata.terms as unknown as Record<string, unknown>;
    for (const forbidden of [
      'termsId', 'licenseId', 'agreementId', 'id',
      'createdAt', 'generatedAt', 'declaredAt', 'issuedAt', 'expiresAt',
      'price', 'currency', 'royaltyRate', 'fee', 'revenueShare', 'paymentSchedule',
      'wallet', 'settlementAddress', 'jurisdiction', 'governingLaw',
      'owner', 'legalOwner', 'copyrightOwner', 'titleHolder', 'beneficialOwner',
    ]) {
      expect(Object.prototype.hasOwnProperty.call(terms, forbidden)).toBe(false);
    }
    expect(Object.keys(terms).sort()).toEqual(['audience', 'rules', 'schemaVersion']);
  });

  it('CONTRACT 7 — audience is required', () => {
    expect(validateSovereignLicenseTermsV1({
      schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
      rules: BASE_RULES,
    })).toEqual([CODES.invalidInput]);
  });

  it('CONTRACT 8 — rules are required', () => {
    expect(validateSovereignLicenseTermsV1({
      schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
      audience: { kind: 'Public' },
    })).toEqual([CODES.invalidInput]);
  });

  it('CONTRACT 9 — an empty rules array is invalid', () => {
    expect(validateSovereignLicenseTermsV1({
      schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
      audience: { kind: 'Public' },
      rules: [],
    })).toEqual([CODES.rulesRequired]);
    expect(validateLicenseTermsClaim(withTerms({
      schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
      audience: { kind: 'Public' },
      rules: [],
    })).reasons).toContain(CODES.rulesRequired);
  });

  it.each(SOVEREIGN_LICENSE_TERMS_RULE_EFFECTS)('CONTRACT 10/11/12 — %s is an accepted effect', (effect) => {
    const claim = build({ rules: [rule('only', effect, ACTIONS.use, 'a clause')] });
    expect(claim.metadata.terms.rules[0].effect).toBe(effect);
  });

  it('CONTRACT 13 — an unknown effect is rejected, and Allow/Deny are not effects', () => {
    expect(SOVEREIGN_LICENSE_TERMS_RULE_EFFECTS).toEqual(['Permission', 'Restriction', 'Obligation']);
    for (const effect of ['Allow', 'Deny', 'Grant', 'Block', 'permission', '']) {
      const reasons = validateSovereignLicenseTermsV1({
        schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
        audience: { kind: 'Public' },
        rules: [{ id: 'R1', effect, action: action(ACTIONS.use), statement: 'x' }],
      });
      expect(reasons).toContain(CODES.invalidRuleEffect);
    }
  });

  it('CONTRACT 14 — duplicate rule ids are rejected, never silently deduplicated', () => {
    const rules = [
      rule('R1', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.use),
      rule('R1', SovereignLicenseTermsRuleEffect.Restriction, ACTIONS.distribute),
    ];
    expect(validateSovereignLicenseTermsV1({
      schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
      audience: { kind: 'Public' },
      rules,
    })).toEqual([CODES.duplicateRuleId]);
    expect(() => build({ rules })).toThrow(/DUPLICATE_RULE_ID/);
  });

  it('CONTRACT 15 — the same action may appear many times under different rule ids', () => {
    const claim = build({
      rules: [
        rule('R1', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.use, 'permitted for research'),
        rule('R2', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.use, 'permitted for teaching'),
        rule('R3', SovereignLicenseTermsRuleEffect.Obligation, ACTIONS.use, 'usage must be logged'),
      ],
    });
    expect(claim.metadata.terms.rules).toHaveLength(3);
  });

  it('CONTRACT 16 — contradictory Permission + Restriction over one action is representable', () => {
    const claim = build({
      rules: [
        rule('R1', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.commercialUse, 'commercial use permitted'),
        rule('R2', SovereignLicenseTermsRuleEffect.Restriction, ACTIONS.commercialUse, 'commercial use restricted'),
      ],
    });
    expect(isValidLicenseTermsClaim(claim)).toBe(true);
    // Protocol says "the issuer declared both" and nothing else. No precedence
    // field, no winner, no resolved verdict appears anywhere in the claim.
    const serialized = canonicalizeJSON(claim);
    for (const forbidden of ['precedence', 'winner', 'resolved', 'allow', 'deny', 'effective', 'decision']) {
      expect(serialized.toLowerCase()).not.toContain(`"${forbidden}"`);
    }
    expect(claim.metadata.terms.rules.map((r) => r.effect)).toEqual(['Permission', 'Restriction']);
  });

  it('CONTRACT 17 — caller-authored rule order is preserved exactly', () => {
    const rules = [
      rule('Z-last', SovereignLicenseTermsRuleEffect.Obligation, ACTIONS.attribute),
      rule('A-first', SovereignLicenseTermsRuleEffect.Restriction, ACTIONS.commercialUse),
      rule('M-mid', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.use),
    ];
    const claim = build({ rules });
    expect(claim.metadata.terms.rules.map((r) => r.id)).toEqual(['Z-last', 'A-first', 'M-mid']);
  });

  it('CONTRACT 18 — a sparse rules array is rejected rather than skipped by `every`', () => {
    const sparse = new Array(1) as SovereignLicenseTermsRuleV1[];
    expect(validateSovereignLicenseTermsV1({
      schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
      audience: { kind: 'Public' },
      rules: sparse,
    })).toContain(CODES.invalidRule);
  });

  it('unknown fields fail closed on every SM-09-owned structure', () => {
    expect(validateSovereignLicenseTermsV1({
      schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
      audience: { kind: 'Public' },
      rules: BASE_RULES,
      automaticRoyaltyRate: 0.15,
    })).toEqual([CODES.invalidInput]);

    expect(validateSovereignLicenseTermsV1({
      schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
      audience: { kind: 'Public' },
      rules: [{ ...rule('R1', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.use), priority: 1 }],
    })).toEqual([CODES.invalidRule]);

    expect(validateSovereignLicenseTermsV1({
      schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
      audience: { kind: 'Public' },
      rules: [{
        id: 'R1',
        effect: SovereignLicenseTermsRuleEffect.Permission,
        action: { namespace: AOC_LICENSING_SEMANTIC_NAMESPACE, termRef: ACTIONS.use, uri: 'https://x' },
        statement: 'x',
      }],
    })).toEqual([CODES.invalidActionRef]);
  });

  it('a future terms schema fails closed rather than being read best-effort', () => {
    expect(validateSovereignLicenseTermsV1({
      schemaVersion: 'aoc-sovereign-license-terms/2',
      audience: { kind: 'Public' },
      rules: BASE_RULES,
    })).toEqual([CODES.unsupportedSchema]);
  });

  it('a rule statement is required, non-blank, and never parsed', () => {
    for (const statement of ['', '   ', undefined, 42]) {
      expect(validateSovereignLicenseTermsV1({
        schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
        audience: { kind: 'Public' },
        rules: [{ id: 'R1', effect: 'Permission', action: action(ACTIONS.use), statement }],
      })).toContain(CODES.invalidRule);
    }
    // A statement that looks like a condition stays inert text.
    const claim = build({
      rules: [rule('R1', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.commercialUse,
        'Commercial use permitted if attribution is retained AND revenue < 1000')],
    });
    expect(claim.metadata.terms.rules[0].statement)
      .toBe('Commercial use permitted if attribution is retained AND revenue < 1000');
  });

  it('mutating the caller\'s rule array afterwards cannot change a built claim', () => {
    const rules: SovereignLicenseTermsRuleV1[] = [rule('R1', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.use)];
    const claim = build({ rules });
    rules.push(rule('R2', SovereignLicenseTermsRuleEffect.Restriction, ACTIONS.commercialUse));
    expect(claim.metadata.terms.rules).toHaveLength(1);
  });
});

describe('SM-09 / audience (REQUIRED TESTS)', () => {
  const audienceReasons = (audience: unknown) =>
    validateSovereignLicenseTermsV1({
      schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
      audience,
      rules: BASE_RULES,
    });

  it('Public is valid, and an extra field on it is not', () => {
    expect(audienceReasons({ kind: 'Public' })).toEqual([]);
    expect(audienceReasons({ kind: 'Public', unrestricted: true })).toEqual([CODES.invalidAudience]);
  });

  it('Principal accepts a string and a CanonicalPrincipalRef, and rejects a malformed one', () => {
    expect(audienceReasons({ kind: 'Principal', principal: 'principal:acme' })).toEqual([]);
    expect(audienceReasons({
      kind: 'Principal',
      principal: { id: 'principal:acme', kind: 'Organization' },
    })).toEqual([]);
    for (const principal of ['', '  ', {}, { id: 'x' }, { kind: 'Organization' }, null, 7]) {
      expect(audienceReasons({ kind: 'Principal', principal })).toEqual([CODES.invalidAudience]);
    }
    expect(audienceReasons({ kind: 'Principal' })).toEqual([CODES.invalidAudience]);
  });

  it('Custom is valid, opaque, and rejects blank halves', () => {
    expect(audienceReasons({ kind: 'Custom', namespace: 'example:membership', id: 'premium-members' }))
      .toEqual([]);
    expect(audienceReasons({ kind: 'Custom', namespace: '', id: 'premium-members' }))
      .toEqual([CODES.invalidAudience]);
    expect(audienceReasons({ kind: 'Custom', namespace: 'example:membership', id: '  ' }))
      .toEqual([CODES.invalidAudience]);
    expect(audienceReasons({ kind: 'Custom', namespace: 'x', id: 'y', members: ['a'] }))
      .toEqual([CODES.invalidAudience]);
  });

  it('an unknown audience kind is rejected', () => {
    expect(audienceReasons({ kind: 'Everyone' })).toEqual([CODES.invalidAudience]);
    expect(audienceReasons('Public')).toEqual([CODES.invalidAudience]);
  });

  it('no resolver, lookup or network is reachable from a custom audience', () => {
    const claim = build({ audience: { kind: 'Custom', namespace: 'example:membership', id: 'premium-members' } });
    // The audience is carried verbatim and nothing is expanded into members.
    expect(claim.metadata.terms.audience).toEqual({
      kind: 'Custom',
      namespace: 'example:membership',
      id: 'premium-members',
    });
    // Nothing expands the audience into a membership list.
    for (const key of ['"members"', '"principals"', '"resolvedMembers"', '"memberCount"']) {
      expect(canonicalizeJSON(claim)).not.toContain(key);
    }
  });

  it('Public means a public audience, never public domain', () => {
    // A Public audience carrying a commercial-use restriction is coherent: the
    // audience says who is addressed, never what is permitted.
    const claim = build({
      audience: { kind: 'Public' },
      rules: [rule('R1', SovereignLicenseTermsRuleEffect.Restriction, ACTIONS.commercialUse, 'no commercial use')],
    });
    expect(isValidLicenseTermsClaim(claim)).toBe(true);
    const serialized = canonicalizeJSON(claim).toLowerCase();
    for (const forbidden of ['public domain', 'cc0', 'copyright-free', 'royalty-free', 'unrestricted']) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});

describe('SM-09 / open-world action references (REQUIRED TESTS)', () => {
  const actionReasons = (a: unknown) =>
    validateSovereignLicenseTermsV1({
      schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
      audience: { kind: 'Public' },
      rules: [{ id: 'R1', effect: 'Permission', action: a, statement: 'x' }],
    });

  it.each(Object.values(ACTIONS))('the core action %s is valid', (termRef) => {
    expect(actionReasons({ namespace: AOC_LICENSING_SEMANTIC_NAMESPACE, termRef })).toEqual([]);
    expect(isAocLicensingActionTermId(termRef)).toBe(true);
  });

  it.each([
    ['example.real-estate', 'example.real-estate:lease'],
    ['example.api', 'example.api:invoke'],
    ['example.ai', 'example.ai:fine-tune'],
    ['example.token', 'example.token:transfer'],
    ['future-system', 'future-system:quantum-copy'],
    ['alien-license-system-v89', 'alien-license-system-v89:quantum-fold'],
  ])('an external action in %s is accepted opaquely', (namespace, termRef) => {
    expect(actionReasons({ namespace, termRef })).toEqual([]);
  });

  it('a blank namespace or term is invalid', () => {
    expect(actionReasons({ namespace: '', termRef: 'x:y' })).toEqual([CODES.invalidActionRef]);
    expect(actionReasons({ namespace: 'x', termRef: '   ' })).toEqual([CODES.invalidActionRef]);
    expect(actionReasons({ namespace: 'x' })).toEqual([CODES.invalidActionRef]);
    expect(actionReasons('aoc.licensing:use')).toEqual([CODES.invalidActionRef]);
  });

  it('a misspelled Protocol-owned concept is rejected, an external unknown one is not', () => {
    expect(actionReasons({ namespace: AOC_LICENSING_SEMANTIC_NAMESPACE, termRef: 'aoc.licensing:comercial-use' }))
      .toEqual([CODES.unknownAocAction]);
    expect(actionReasons({ namespace: AOC_LICENSING_SEMANTIC_NAMESPACE, termRef: 'aoc.licensing:teleport' }))
      .toEqual([CODES.unknownAocAction]);
    expect(actionReasons({ namespace: 'example.unknown', termRef: 'example.unknown:teleport' })).toEqual([]);
  });

  it('a declaration/effect concept is not an action concept', () => {
    // They describe the document and its clause kinds; naming one as the action
    // a clause is *about* is a category error the validator catches.
    for (const termRef of Object.values(DECLARATION)) {
      expect(actionReasons({ namespace: AOC_LICENSING_SEMANTIC_NAMESPACE, termRef }))
        .toEqual([CODES.unknownAocAction]);
      expect(isAocLicensingActionTermId(termRef)).toBe(false);
    }
  });

  it('an action reference carries no id, uri or resolution hook', () => {
    const claim = build({
      rules: [rule('R1', SovereignLicenseTermsRuleEffect.Permission, 'example.domain:special-use', 'special', 'example.domain')],
    });
    expect(Object.keys(claim.metadata.terms.rules[0].action).sort()).toEqual(['namespace', 'termRef']);
    for (const forbidden of ['uri', 'url', 'href', 'resolve', 'iri', 'context', '@context']) {
      expect(canonicalizeJSON(claim.metadata.terms.rules[0].action)).not.toContain(forbidden);
    }
  });
});

describe('SM-09 / licensing semantic vocabulary', () => {
  it('is its own Protocol-owned namespace, reusing the canonical semantic contracts', () => {
    expect(AOC_LICENSING_SEMANTIC_NAMESPACE).toBe('aoc.licensing');
    expect(AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY.namespace).toBe('aoc.licensing');
    expect(AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY.categories).toBe(AOC_LICENSING_SEMANTIC_CATEGORIES);
    for (const term of AOC_LICENSING_SEMANTIC_TERMS) {
      expect(term.namespace).toBe('aoc.licensing');
      expect(Object.keys(term).sort()).toEqual(['description', 'id', 'name', 'namespace']);
    }
  });

  it('every categorized term exists, and every term is categorized exactly once', () => {
    const declared = AOC_LICENSING_SEMANTIC_TERMS.map((t) => t.id).sort();
    const categorized = AOC_LICENSING_SEMANTIC_CATEGORIES.flatMap((c) => [...c.termRefs]).sort();
    expect(categorized).toEqual(declared);
    expect(new Set(categorized).size).toBe(categorized.length);
  });

  it('term ids are stable constants with no timestamp and no random value', () => {
    const serialized = canonicalizeJSON(AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY);
    expect(serialized).toBe(canonicalizeJSON(AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY));
    expect(serialized).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect(serialized).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });

  it('lookup is total with undefined and resolves nothing externally', () => {
    expect(getAocLicensingSemanticTerm(ACTIONS.commercialUse)?.name).toBe('Commercial Use');
    expect(getAocLicensingSemanticTerm('https://example.com/terms')).toBeUndefined();
    expect(getAocLicensingSemanticTerm('aoc.sovereignty:sovereign-subject')).toBeUndefined();
  });
});

describe('SM-09 / claim semanticRefs (REQUIRED TESTS)', () => {
  it('always surfaces the licence declaration concept', () => {
    const claim = build();
    expect(claim.semanticRefs.some(
      (ref) => ref.namespace === 'aoc.licensing' && ref.termRef === DECLARATION.licenseTermsDeclaration,
    )).toBe(true);
  });

  it('surfaces one concept per present effect, in canonical order, and none for absent effects', () => {
    const permissionOnly = build({
      rules: [rule('R1', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.use)],
    });
    expect(permissionOnly.semanticRefs.map((r) => r.termRef)).toEqual([
      DECLARATION.licenseTermsDeclaration,
      DECLARATION.permissionRule,
      ACTIONS.use,
    ]);
    expect(permissionOnly.semanticRefs.map((r) => r.termRef)).not.toContain(DECLARATION.restrictionRule);
    expect(permissionOnly.semanticRefs.map((r) => r.termRef)).not.toContain(DECLARATION.obligationRule);

    const all = build();
    expect(all.semanticRefs.map((r) => r.termRef)).toEqual([
      DECLARATION.licenseTermsDeclaration,
      DECLARATION.permissionRule,
      DECLARATION.restrictionRule,
      DECLARATION.obligationRule,
      // Actions, sorted by namespace then term — never by rule order.
      ACTIONS.attribute,
      ACTIONS.commercialUse,
      ACTIONS.reproduce,
      ACTIONS.use,
    ]);
  });

  it('deduplicates by concept identity, not by occurrence', () => {
    const claim = build({
      rules: [
        rule('R1', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.commercialUse, 'a'),
        rule('R2', SovereignLicenseTermsRuleEffect.Restriction, ACTIONS.commercialUse, 'b'),
        rule('R3', SovereignLicenseTermsRuleEffect.Obligation, ACTIONS.commercialUse, 'c'),
      ],
    });
    const commercial = claim.semanticRefs.filter((r) => r.termRef === ACTIONS.commercialUse);
    expect(commercial).toHaveLength(1);
  });

  it('surfaces external action concepts so a consumer is told what it must understand', () => {
    const claim = build({
      rules: [rule('R1', SovereignLicenseTermsRuleEffect.Permission, 'example.real-estate:lease', 'lease permitted', 'example.real-estate')],
    });
    expect(claim.semanticRefs).toContainEqual(
      expect.objectContaining({ namespace: 'example.real-estate', termRef: 'example.real-estate:lease' }),
    );
  });

  it('ref ids are deterministic, claim-derived and never a UUID', () => {
    const first = build();
    const second = build();
    expect(first.semanticRefs).toEqual(second.semanticRefs);
    expect(first.semanticRefs.map((r) => r.id)).toEqual([
      'claim:license:001:semantic:0',
      'claim:license:001:semantic:1',
      'claim:license:001:semantic:2',
      'claim:license:001:semantic:3',
      'claim:license:001:semantic:4',
      'claim:license:001:semantic:5',
      'claim:license:001:semantic:6',
      'claim:license:001:semantic:7',
    ]);
    for (const ref of first.semanticRefs) {
      expect(ref.id).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      expect(Object.keys(ref).sort()).toEqual(['id', 'namespace', 'termRef']);
    }
  });

  it('reordering the rules does not reorder the derived concepts', () => {
    const forwards = licenseTermsSemanticConcepts(build().metadata.terms);
    const backwards = licenseTermsSemanticConcepts(build({ rules: [...BASE_RULES].reverse() }).metadata.terms);
    expect(backwards).toEqual(forwards);
  });

  it('the refs are ordinary CanonicalSemanticRefs, not a parallel vocabulary system', () => {
    // Same three-field shape the SM-07 machinery already collects requirements
    // from — no `licenseRefs`, no second reference model.
    for (const ref of build().semanticRefs) {
      expect(typeof ref.id).toBe('string');
      expect(typeof ref.namespace).toBe('string');
      expect(typeof ref.termRef).toBe('string');
    }
  });

  it('a claim whose semanticRefs do not surface the declaration concept is invalid', () => {
    const claim = build();
    expect(validateLicenseTermsClaim({ ...claim, semanticRefs: [] }).reasons)
      .toContain(CODES.invalidSemanticRefs);
    const { semanticRefs: _dropped, ...withoutRefs } = claim;
    expect(validateLicenseTermsClaim(withoutRefs).reasons).toContain(CODES.invalidSemanticRefs);
  });
});

describe('SM-09 / time semantics (REQUIRED TESTS)', () => {
  it('issuedAt is preserved verbatim', () => {
    expect(build({ issuedAt: '2019-04-01T12:30:00.000Z' }).issuedAt).toBe('2019-04-01T12:30:00.000Z');
  });

  it('effectiveAt is preserved when supplied and absent when not — never defaulted from issuedAt', () => {
    const withEffective = build({ issuedAt: '2026-08-18T00:00:00.000Z', effectiveAt: '2026-09-01T00:00:00.000Z' });
    expect(withEffective.metadata.terms.effectiveAt).toBe('2026-09-01T00:00:00.000Z');
    expect(withEffective.issuedAt).toBe('2026-08-18T00:00:00.000Z');

    const withoutEffective = build();
    expect(Object.prototype.hasOwnProperty.call(withoutEffective.metadata.terms, 'effectiveAt')).toBe(false);
    expect(withoutEffective.metadata.terms.effectiveAt).toBeUndefined();
    expect(canonicalizeJSON(withoutEffective)).not.toContain('effectiveAt');
  });

  it('expiresAt lives on the claim, and there is no second expiration field', () => {
    const claim = build({ expiresAt: '2027-01-01T00:00:00.000Z' });
    expect(claim.expiresAt).toBe('2027-01-01T00:00:00.000Z');
    expect(Object.prototype.hasOwnProperty.call(claim.metadata.terms, 'expiresAt')).toBe(false);
  });

  it('a long-expired declaration and a far-future one are both structurally valid', () => {
    expect(isValidLicenseTermsClaim(build({
      issuedAt: '2001-01-01T00:00:00.000Z',
      expiresAt: '2002-01-01T00:00:00.000Z',
    }))).toBe(true);
    expect(isValidLicenseTermsClaim(build({ effectiveAt: '2099-01-01T00:00:00.000Z' }))).toBe(true);
  });

  it('no ordering between issuedAt, effectiveAt and expiresAt is adjudicated', () => {
    // A backdated correction and a retroactive licence stay expressible.
    expect(isValidLicenseTermsClaim(build({
      issuedAt: '2026-08-18T00:00:00.000Z',
      effectiveAt: '2020-01-01T00:00:00.000Z',
      expiresAt: '2019-01-01T00:00:00.000Z',
    }))).toBe(true);
  });

  it('a malformed or local-offset timestamp is rejected', () => {
    expect(() => build({ effectiveAt: '2026-09-01T00:00:00+02:00' })).toThrow(/INVALID_TIMESTAMP/);
    expect(() => build({ expiresAt: 'soon' as never })).toThrow(/INVALID_TIMESTAMP/);
    expect(validateSovereignLicenseTermsV1({
      schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
      audience: { kind: 'Public' },
      effectiveAt: undefined,
      rules: BASE_RULES,
    })).toEqual([CODES.invalidTimestamp]);
  });
});

describe('SM-09 / claim validation boundaries (REQUIRED TESTS)', () => {
  it('a valid claim validates, and `{}` does not', () => {
    expect(validateLicenseTermsClaim(build())).toEqual({ valid: true, reasons: [] });
    expect(validateLicenseTermsClaim({}).valid).toBe(false);
    expect(validateLicenseTermsClaim(null).valid).toBe(false);
    expect(validateLicenseTermsClaim([]).valid).toBe(false);
  });

  it('a generic Authorship claim is not a licensing declaration', () => {
    const authorship = buildAuthorityClaim({
      id: 'claim:authorship:001',
      sovereignAssetId: SUBJECT,
      issuer: ISSUER,
      kind: AuthorityClaimKind.Authorship,
      statement: 'I wrote this.',
      issuedAt: ISSUED_AT,
    });
    expect(isValidAuthorityClaim(authorship)).toBe(true);
    expect(isValidLicenseTermsClaim(authorship)).toBe(false);
  });

  it('a Rights AuthorityClaim is not a licensing declaration', () => {
    const rights = buildAuthorityClaim({
      id: 'claim:rights:001',
      sovereignAssetId: SUBJECT,
      issuer: ISSUER,
      kind: AuthorityClaimKind.Rights,
      statement: 'I hold distribution rights.',
      issuedAt: ISSUED_AT,
    });
    expect(isValidAuthorityClaim(rights)).toBe(true);
    expect(isValidLicenseTermsClaim(rights)).toBe(false);
  });

  it('a free-text License AuthorityClaim stays valid at the claims layer but is outside the SM-09 contract', () => {
    const freeText = buildAuthorityClaim({
      id: 'claim:license:free-text',
      sovereignAssetId: SUBJECT,
      issuer: ISSUER,
      kind: AuthorityClaimKind.License,
      statement: 'Licensed under our standard agreement.',
      issuedAt: ISSUED_AT,
    });
    expect(isValidAuthorityClaim(freeText)).toBe(true);
    expect(isValidLicenseTermsClaim(freeText)).toBe(false);
    expect(validateLicenseTermsClaim(freeText).reasons).toContain(CODES.invalidInput);
  });

  it('AuthorityClaim.metadata stays extensible; only the licensing keys are constrained', () => {
    const claim = build();
    const extended = { ...claim, metadata: { ...claim.metadata, issuerNote: 'internal reference A-17' } };
    expect(isValidLicenseTermsClaim(extended)).toBe(true);
  });

  it('base claim defects are reported in the licensing vocabulary', () => {
    const claim = build();
    expect(validateLicenseTermsClaim({ ...claim, id: '' }).reasons).toContain(CODES.invalidClaimId);
    expect(validateLicenseTermsClaim({ ...claim, issuer: '' }).reasons).toContain(CODES.invalidIssuer);
    expect(validateLicenseTermsClaim({ ...claim, issuedAt: 'nope' }).reasons).toContain(CODES.invalidTimestamp);
    expect(validateLicenseTermsClaim({ ...claim, evidenceRefs: [''] }).reasons).toContain(CODES.invalidEvidenceRefs);
    expect(validateLicenseTermsClaim({ ...claim, subject: 'not-a-sovereign-id' }).reasons).toContain(CODES.invalidClaim);
    expect(validateLicenseTermsClaim({ ...claim, expiresAt: 'nope' }).reasons).toContain(CODES.invalidTimestamp);
  });

  it('evidence references are preserved verbatim and never fabricated or resolved', () => {
    expect(build().evidenceRefs).toEqual([]);
    const withEvidence = build({ evidenceRefs: ['evidence:contract:A-17', 'evidence:registry:deed-9'] });
    expect(withEvidence.evidenceRefs).toEqual(['evidence:contract:A-17', 'evidence:registry:deed-9']);
  });

  it('isValidSovereignLicenseTermsV1 is the boolean face of the same rules', () => {
    expect(isValidSovereignLicenseTermsV1(build().metadata.terms)).toBe(true);
    expect(isValidSovereignLicenseTermsV1({})).toBe(false);
  });
});
