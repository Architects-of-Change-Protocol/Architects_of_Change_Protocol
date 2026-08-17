import {
  SOVEREIGNTY_CAPABILITY_IDS,
  SOVEREIGNTY_CAPABILITY_NAMESPACE,
  type SovereigntyCapabilityKey,
} from './ids';
import type { SovereigntyCapabilityDefinition, SovereigntyCapabilityVersion } from './types';

/**
 * Initial semantic contract version shared by all eight capabilities.
 *
 * `1.0.0` describes the capability contract, not the release maturity of the
 * `@aoc/protocol` package (`0.1.0`) — the same distinction the repository
 * already makes for `CapabilityToken.schemaVersion` ('1.0.0') and
 * `AdapterToken.contractVersion` ('1.0'). The eight share one version because
 * they are being defined together, for the first time, by this work package;
 * they version independently from here on.
 */
const INITIAL_CAPABILITY_VERSION: SovereigntyCapabilityVersion = '1.0.0';

const define = (
  key: SovereigntyCapabilityKey,
  name: string,
  description: string,
): SovereigntyCapabilityDefinition =>
  Object.freeze({
    id: SOVEREIGNTY_CAPABILITY_IDS[key],
    key,
    namespace: SOVEREIGNTY_CAPABILITY_NAMESPACE,
    version: INITIAL_CAPABILITY_VERSION,
    name,
    description,
  });

/**
 * The canonical eight. This inventory is closed: membership changes only by
 * deliberate Protocol evolution, never at runtime and never by a consumer.
 *
 * Order is the canonical enumeration order and is load-bearing — it is
 * asserted by `SOVEREIGNTY_CAPABILITY_KEYS` rather than left to incidental
 * object or Map iteration behaviour.
 */
export const SOVEREIGNTY_CAPABILITIES: readonly SovereigntyCapabilityDefinition[] = Object.freeze([
  define(
    'identity',
    'Identity',
    'Persistent sovereign reference to an arbitrary subject, independent of storage, provider, or application identity.',
  ),
  define(
    'integrity',
    'Integrity',
    'Establish and verify the integrity of the relevant content or state representation of a subject.',
  ),
  define(
    'provenance',
    'Provenance',
    'Represent and verify attributable origin, authorship, authority, lineage and related historical assertions, without the Protocol adjudicating whether those assertions are true.',
  ),
  define(
    'portability',
    'Portability',
    'Allow a sovereign representation or state to survive movement across systems or providers without losing what it is.',
  ),
  define(
    'interoperability',
    'Interoperability',
    'Allow external systems to understand and consume Protocol representations through stable contracts and semantics.',
  ),
  define(
    'verifiability',
    'Verifiability',
    'Allow independent parties to verify Protocol artifacts, assertions and results without trusting whoever presents them.',
  ),
  define(
    'licensing_terms',
    'Licensing & Terms',
    'Represent attributable, portable declarations of permissions, restrictions and terms. Protocol declaration is distinct from enforcement, which belongs to AOC Enterprise.',
  ),
  define(
    'governance_compatibility',
    'Governance Compatibility',
    'Provide structured sovereignty information sufficient for an external governance system to govern the subject, without the Protocol itself becoming that governance system.',
  ),
]);
