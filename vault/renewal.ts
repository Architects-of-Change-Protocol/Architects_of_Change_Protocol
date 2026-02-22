import type { ConsentObjectV2, ScopeEntry } from '../consent/types';
import { buildConsentObjectV2 } from '../consent/consentObject';
import type { RenewalRequest, RenewalResponse } from '../temporal/types';
import { appendLedgerEntry } from './accessLedger';

const ISO8601_UTC_PATTERN =
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/;

const DUMMY_CAPABILITY_HASH =
  '0000000000000000000000000000000000000000000000000000000000000000';

// ---------------------------------------------------------------------------
// Renewal Mechanism
// ---------------------------------------------------------------------------

/**
 * Processes a renewal request for a ConsentObjectV2.
 *
 * Protocol rules enforced here:
 *  - Default: manual renewal required (requires_user_signature = true)
 *    unless renewal_signature is already provided in the request.
 *  - If consent.renewable = false, renewal is denied.
 *  - If consent.max_renewals is set and consent.renewal_count >= max_renewals,
 *    renewal is denied.
 *  - The requesting_grantee must match the consent's grantee.
 *  - The proposed_expiration must be after the current expiration.
 *  - Auto-renewal is NOT allowed by default; this function implements the
 *    manual-first model (returns PENDING_SUBJECT_SIGNATURE when no sig present).
 *
 * On APPROVED, a new ConsentObjectV2 is returned with:
 *  - prior_consent = existing consent.consent_hash
 *  - renewal_count = existing consent.renewal_count + 1
 *  - access_expiration_timestamp = request.proposed_expiration
 *  - access_start_timestamp = existing consent.access_expiration_timestamp
 *    (the new window opens exactly where the old one closed)
 *  - expires_at = proposed_expiration
 *
 * The renewed consent is a new immutable object; it does NOT modify the original.
 */
export function processRenewalRequest(
  existing_consent: ConsentObjectV2,
  request: RenewalRequest,
  opts: { now?: Date; auto_renewal?: boolean } = {}
): { response: RenewalResponse; new_consent: ConsentObjectV2 | null } {
  const auto_renewal = opts.auto_renewal ?? false;

  // Grantee must match
  if (request.requesting_grantee !== existing_consent.grantee) {
    return {
      response: {
        status: 'DENIED',
        new_consent_hash: null,
        denial_reason: 'requesting_grantee does not match consent grantee.',
        signature_request_id: null,
      },
      new_consent: null,
    };
  }

  // Consent must be renewable
  if (!existing_consent.renewable) {
    return {
      response: {
        status: 'DENIED',
        new_consent_hash: null,
        denial_reason: 'Consent is not renewable.',
        signature_request_id: null,
      },
      new_consent: null,
    };
  }

  // Check renewal cap
  if (
    existing_consent.max_renewals !== null &&
    existing_consent.renewal_count >= existing_consent.max_renewals
  ) {
    return {
      response: {
        status: 'DENIED',
        new_consent_hash: null,
        denial_reason: `Renewal cap reached (max_renewals=${existing_consent.max_renewals}).`,
        signature_request_id: null,
      },
      new_consent: null,
    };
  }

  // Validate proposed expiration
  if (
    typeof request.proposed_expiration !== 'string' ||
    !ISO8601_UTC_PATTERN.test(request.proposed_expiration)
  ) {
    return {
      response: {
        status: 'DENIED',
        new_consent_hash: null,
        denial_reason: 'proposed_expiration must be ISO 8601 UTC format.',
        signature_request_id: null,
      },
      new_consent: null,
    };
  }

  if (
    request.proposed_expiration <= existing_consent.access_expiration_timestamp
  ) {
    return {
      response: {
        status: 'DENIED',
        new_consent_hash: null,
        denial_reason:
          'proposed_expiration must be after the current access_expiration_timestamp.',
        signature_request_id: null,
      },
      new_consent: null,
    };
  }

  // Manual renewal: if subject signature not present and auto_renewal is off,
  // return PENDING_SUBJECT_SIGNATURE
  if (
    request.requires_user_signature &&
    request.renewal_signature === null &&
    !auto_renewal
  ) {
    // Derive a deterministic tracking id from the consent hash and proposed expiration
    const raw = `renewal:${existing_consent.consent_hash}:${request.proposed_expiration}`;
    let signature_request_id = '';
    for (let i = 0; i < raw.length && signature_request_id.length < 64; i++) {
      signature_request_id += raw.charCodeAt(i).toString(16).padStart(2, '0');
    }
    signature_request_id = signature_request_id.padEnd(64, '0').slice(0, 64);

    return {
      response: {
        status: 'PENDING_SUBJECT_SIGNATURE',
        new_consent_hash: null,
        denial_reason: null,
        signature_request_id,
      },
      new_consent: null,
    };
  }

  // Build the renewed consent
  const new_access_start = existing_consent.access_expiration_timestamp;
  const new_consent = buildConsentObjectV2(
    existing_consent.subject,
    existing_consent.grantee,
    'grant',
    existing_consent.scope,
    existing_consent.permissions,
    request.proposed_expiration,
    {
      now: opts.now,
      prior_consent: existing_consent.consent_hash,
      access_start_timestamp: new_access_start,
      renewable: existing_consent.renewable,
      max_renewals: existing_consent.max_renewals,
      renewal_count: existing_consent.renewal_count + 1,
      consent_mode: existing_consent.consent_mode,
      affiliation: existing_consent.affiliation,
    }
  );

  // Log to Access Ledger
  appendLedgerEntry(
    'RENEWED',
    DUMMY_CAPABILITY_HASH,
    new_consent.consent_hash,
    existing_consent.subject,
    existing_consent.grantee,
    null,
    {
      prior_consent_hash: existing_consent.consent_hash,
      renewal_count: String(new_consent.renewal_count),
    },
    opts.now
  );

  return {
    response: {
      status: 'APPROVED',
      new_consent_hash: new_consent.consent_hash,
      denial_reason: null,
      signature_request_id: null,
    },
    new_consent,
  };
}

/**
 * Processes affiliation-based revocation.
 *
 * When an institution's affiliation credential is invalidated (e.g. membership
 * lapses), this function revokes any 'institutional-affiliation' consents bound
 * to that credential, logging an AFFILIATION_REVOKED event per consent.
 *
 * Returns the set of consent_hashes that were revoked.
 */
export function revokeByAffiliationCredential(
  affiliation_credential_ref: string,
  consents: Map<string, ConsentObjectV2>,
  opts: { now?: Date } = {}
): string[] {
  const revoked: string[] = [];

  for (const [hash, consent] of consents.entries()) {
    if (
      consent.consent_mode === 'institutional-affiliation' &&
      consent.affiliation !== null &&
      consent.affiliation.affiliation_credential_ref === affiliation_credential_ref &&
      consent.affiliation.auto_expires_on_affiliation_change
    ) {
      appendLedgerEntry(
        'AFFILIATION_REVOKED',
        DUMMY_CAPABILITY_HASH,
        hash,
        consent.subject,
        consent.grantee,
        'AFFILIATION_CREDENTIAL_INVALIDATED',
        { affiliation_credential_ref },
        opts.now
      );
      revoked.push(hash);
    }
  }

  return revoked;
}
