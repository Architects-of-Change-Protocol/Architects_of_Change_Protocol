/**
 * AocVaultAdapter — HRKey's thin integration layer over AOC Vault.
 *
 * Responsibilities:
 *   - Instantiate and hold a reference to an AOC Vault.
 *   - Translate HRKey domain calls into AOC Vault operations.
 *   - Expose ONLY the IHRKeyVaultAdapter interface to HRKey code.
 *
 * Non-responsibilities:
 *   - No business logic (scoring, pricing, matching).
 *   - No persistence (Vault is in-memory; adapter adds nothing).
 *   - No modification of AOC invariants.
 *
 * This module treats createInMemoryVault as a black-box factory.
 */

import { createInMemoryVault } from '../../vault';
import type { Vault } from '../../vault';
import { buildConsentObject } from '../../consent';

import type {
  IHRKeyVaultAdapter,
  RegisterPackInput,
  RegisterPackResult,
  GrantConsentInput,
  GrantConsentResult,
  MintCapabilityInput,
  MintCapabilityResult,
  AccessRequestInput,
} from './types';

import type { VaultAccessResult } from '../../vault';

// ─── Factory ────────────────────────────────────────────────────────

/**
 * Create an HRKey vault adapter backed by an in-memory AOC Vault.
 *
 * Usage:
 *   const adapter = createHRKeyAdapter();
 *   adapter.registerPack({ pack, sdl_mappings });
 *   adapter.grantConsent({ candidate, employer, scope, permissions, expires_at });
 *   // ...
 *
 * For testing, pass an existing Vault instance to share state
 * across test helpers without exposing Vault internals to HRKey code.
 */
export function createHRKeyAdapter(vault?: Vault): IHRKeyVaultAdapter {
  const v: Vault = vault ?? createInMemoryVault();

  // ── registerPack ────────────────────────────────────────────────

  function registerPack(input: RegisterPackInput): RegisterPackResult {
    const { pack, sdl_mappings } = input;

    // Store the pack (Vault verifies hash integrity).
    const pack_hash = v.storePack(pack);

    // Register each SDL path → field_id mapping.
    // Vault validates SDL path format; throws on invalid paths.
    for (const mapping of sdl_mappings) {
      v.registerSdlMapping(mapping.sdl_path, mapping.field_id);
    }

    return {
      pack_hash,
      sdl_paths_registered: sdl_mappings.length,
    };
  }

  // ── grantConsent ────────────────────────────────────────────────

  function grantConsent(
    input: GrantConsentInput,
    opts?: { now?: Date },
  ): GrantConsentResult {
    const { candidate, employer, scope, permissions, expires_at } = input;

    // Build the consent object (AOC validates all invariants).
    const consent = buildConsentObject(
      candidate,
      employer,
      'grant',
      scope,
      permissions,
      {
        now: opts?.now,
        expires_at,
      },
    );

    // Store in Vault (Vault validates structure).
    const consent_hash = v.storeConsent(consent);

    return { consent_hash, consent };
  }

  // ── mintCapability ──────────────────────────────────────────────

  function mintCapability(
    input: MintCapabilityInput,
    opts?: { now?: Date },
  ): MintCapabilityResult {
    const { consent_hash, scope, permissions, expires_at, not_before } = input;

    // Vault looks up parent consent, validates derivation invariants,
    // generates token_id, and stores the token.
    const capability = v.mintCapability(
      consent_hash,
      scope,
      permissions,
      expires_at,
      {
        now: opts?.now,
        not_before: not_before ?? null,
      },
    );

    return {
      capability_hash: capability.capability_hash,
      capability,
    };
  }

  // ── requestAccess ───────────────────────────────────────────────

  function requestAccess(
    input: AccessRequestInput,
    opts?: { now?: Date },
  ): VaultAccessResult {
    const { capability, sdl_paths, pack_hash } = input;

    // Direct pass-through. The Vault enforces:
    //   - Token verification (expiry, replay, revocation, derivation)
    //   - SDL path validation and resolution
    //   - Scope containment checks
    //   - Deterministic ordering of results
    return v.requestAccess(
      {
        capability_token: capability,
        sdl_paths,
        pack_ref: pack_hash,
      },
      opts,
    );
  }

  // ── revokeCapability ────────────────────────────────────────────

  function revokeCapability(capability_hash: string): void {
    v.revokeCapability(capability_hash);
  }

  // ── Public interface ────────────────────────────────────────────

  return {
    registerPack,
    grantConsent,
    mintCapability,
    requestAccess,
    revokeCapability,
  };
}
