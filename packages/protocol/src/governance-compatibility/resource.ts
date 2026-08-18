import type { CanonicalId, ResourceRef } from '../contracts';
import { isValidSovereignSubjectRef, type SovereignSubjectRef } from '../identity';

/**
 * The one generic resource kind every sovereign subject projects onto when it
 * is addressed by an external governance system.
 *
 * ## Why a single kind
 *
 * A governance engine has to be able to say "this policy is about *that*
 * thing". It needs a stable handle, not a taxonomy. Emitting
 * `real-estate`, `music`, `token`, `api` or `agent` as the resource kind would
 * push AOC's asset taxonomy across the governance boundary and make every
 * consumer branch on a vocabulary the Protocol has no business owning — and
 * would break the moment somebody protocolizes a subject nobody has named yet.
 * A byte document, a physical painting, a plot of land, an external token, an
 * autonomous agent, an API resource and a subject from a system that does not
 * exist today all project to exactly this kind, and differ only in their data.
 *
 * ## Why Protocol owns it now
 *
 * The Asset Protocolization vertical froze `PROTOCOLIZED_RESOURCE_KIND =
 * 'aoc:sovereign-asset'` in APV-02 as vertical-owned *temporarily*, stating
 * that promotion to Protocol becomes appropriate as soon as a second, generic
 * producer of sovereign-resource references appears. Governance Compatibility
 * is that producer: it projects an arbitrary sovereign subject — with no
 * vertical, no asset profile and no protocolization case in sight — onto a
 * governance `ResourceRef`. Two authoritative definitions of one wire value is
 * precisely how two systems start disagreeing about what they are addressing,
 * so there is now one, and it lives here. The dependency direction is
 * unchanged: Asset Protocolization may consume Protocol, never the reverse.
 *
 * The value is deliberately identical to the `SovereignAssetId` prefix
 * (`aoc:sovereign-asset:<uuid>`), because a governance resource *is* a
 * sovereign subject addressed from outside — not a second kind of thing that
 * happens to be named similarly.
 */
export const SOVEREIGN_GOVERNED_RESOURCE_KIND = 'aoc:sovereign-asset' as const;

export type SovereignGovernedResourceKind = typeof SOVEREIGN_GOVERNED_RESOURCE_KIND;

/**
 * The only thing a caller may contribute to a governance resource reference.
 *
 * Deliberately not `kind`, not `id` and not `attributes`. A caller that could
 * choose the kind or the id could point governance at something other than the
 * sovereign subject, which is the one property this projection exists to
 * guarantee.
 */
export interface BuildSovereignGovernanceResourceRefOptions {
  /**
   * Explicit governance context supplied by the caller, preserved verbatim.
   *
   * Optional, because not every governance consumer is multi-tenant. It is
   * never inferred, never defaulted to `'default'`, `'public'`, a subject
   * namespace, a registrant, an issuer, an environment variable or an
   * Enterprise tenant, and never read from anywhere: the Protocol has no way to
   * know whose tenancy a subject belongs to, and guessing would silently attach
   * a sovereign subject to an organisation nobody named.
   *
   * A specialized consumer may of course *require* one — Asset Protocolization
   * does — and narrowing a generic Protocol contract is exactly the right place
   * for that constraint to live.
   */
  readonly tenantId?: CanonicalId;
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Projects a sovereign subject onto the canonical governance `ResourceRef`.
 *
 * ## The projection
 *
 *     resource.kind       = SOVEREIGN_GOVERNED_RESOURCE_KIND
 *     resource.id         = subject.sovereignAssetId
 *     resource.tenantId   = the caller's explicit governance context, if any
 *     resource.attributes = structurally absent
 *
 * ## Why the id is the sovereign identity and nothing else
 *
 * A subject can change provider, change locator, receive new bytes, receive a
 * new manifest version and move storage without ceasing to be the same
 * sovereign subject. A grant or policy keyed to a `manifestDigest`, a
 * `ContentIdentity.digest`, an `externalReference.id`, a locator, a CID, a URL,
 * a provider id, a database id, a token contract address or a registry record
 * id would bind governance to one transient representation and silently detach
 * the moment that representation changed. Governance has to address the
 * sovereignty anchor, so `resource.id` is the `SovereignAssetId` — always, for
 * every subject, with no fallback.
 *
 * ## Why there are no attributes
 *
 * `ResourceRef.attributes` is structurally absent in v1, not empty. It is the
 * obvious place to smuggle `assetType`, `propertyType`, `mimeType`,
 * `jurisdiction`, `tokenStandard`, `classification`, `owner`, `license`,
 * `riskScore` or a professional role into governance, and every one of those
 * facts already belongs to some other mineral's contract, where it is
 * validated, attributable and portable. Copying it here would create a second,
 * unvalidated home for it that is free to drift.
 *
 * ## Fail closed
 *
 * A malformed subject and a blank tenant are refused rather than repaired: no
 * trimming, no normalisation, no defaulting. This is a construction helper in
 * the manner of `buildSovereigntyPortabilityBundleV1`, so it throws; the
 * handoff builder validates before calling it and reports stable reasons
 * instead.
 */
export function buildSovereignGovernanceResourceRef(
  subject: SovereignSubjectRef,
  options?: BuildSovereignGovernanceResourceRefOptions,
): ResourceRef {
  if (!isValidSovereignSubjectRef(subject)) {
    throw new Error('Invalid SovereignSubjectRef: cannot project a governance ResourceRef');
  }
  if (options !== undefined && Object.prototype.hasOwnProperty.call(options, 'tenantId')) {
    if (!isNonBlankString(options.tenantId)) {
      throw new Error('Invalid governance tenantId: expected a non-blank canonical id');
    }
  }
  const tenantId = options?.tenantId;

  return Object.freeze({
    kind: SOVEREIGN_GOVERNED_RESOURCE_KIND,
    id: subject.sovereignAssetId,
    // Omitted structurally when absent. `tenantId: undefined` is not the same
    // value: `aoc-canonical-json/1` refuses `undefined` outright rather than
    // dropping the property, so an absent tenant has to have no key at all.
    ...(tenantId === undefined ? {} : { tenantId }),
  });
}
